import WebApp from 'webapp'
import iosched from 'iosched'

import { bodyParser } from 'middleware'
import MediaDecoder from 'mediadecoder'
import WebMedia from 'webmedia'
import { WsServer } from 'websocket'

import permission from 'async/permission'
import socket from 'socket'

import { checkPermission, getIfnames } from './lib/utils'

import { CameraManager } from './lib/media/camera-manager'
import { StatePusher } from './lib/socket'
import { kvdb } from './lib/db'

import { deviceRoute, mediaRoute } from './routes'

import { DeviceManager } from './lib/device/device-manager'
import { toDevice } from './lib/device/device-enhance'

console.inspectEnable = true

const app = WebApp.createApp()

// * middlewares
app.use(WebApp.static('./public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

// * routes
// app.use('/api/device', deviceRoute)
// app.use('/api/media', mediaRoute)

const pusher = new StatePusher(app, {
  path: '/socket/device-push',
  allowUpgrades: true,
})
pusher.listenAll('connection', () => {
  pusher.send('hello-test', { msg: 'connected' })
})

const camMan = new CameraManager()

// create onvif discovery server
getIfnames().then(res => camMan.createOnvifDiscovery(Object.values(res)))

camMan.on('ready', (urn) => {
  const cameraAuth = kvdb.get('cameras')[urn]
  if (cameraAuth) {
    const { username, password } = cameraAuth
    console.info('[CameraManager] try login with', cameraAuth)
    camMan.loginCamera(urn, username, password)
  }
})
camMan.on('login-error', (urn) => {
  pusher.send('camera:login-error', urn)
})

camMan.on('login', async (urn) => {
  const ps = camMan.getCamProfiles(urn)
  console.log(ps)
  const res = await camMan.createStreamServer(urn, ps[0].uri, app)
  pusher.send('camera:stream', res)
  pusher.report(res)
  console.log(res)
})

app.get('/camera/list', (req, res) => {
  res.json({ cameras: camMan.getCamList() })
})

const devMan = new DeviceManager()

devMan.init()

devMan.on('init', async () => {
  const info = devMan.getDeviceList()
  const devid = info[0].devid
  const control = await devMan.getDeviceControl(devid)
  // const { pack } = toDevice().set({ state: 'on', initial: 'on' }).value
  const { pack } = toDevice().get(['state', 'initial']).value
  console.log(pack)
  const res = await control.send(pack, 0)
  console.log(res)
})

devMan.on('device:message', (devid, msg) => {
  console.log(devid, msg)
  pusher.report({ devid, msg })
})

// import { DeviceManager } from './lib/device/device-manager'
// import { toDevice } from "./lib/device/device-enhance";
// const deviceManager = new DeviceManager()
// deviceManager.init()
// deviceManager.push(pusher)

// * debug logger
app.use(function (req, res, next) {
  console.info(`[${req.path}] ${req.method}`)
  next()
})

app.get('/api/device/list', (req, res) => {
  res.json({ list: devMan.getDeviceList() })
})

// app.get('/api/device/state/list',(req,res)=>{
// console.info('[/api/device/state/list] get')
//
// })

app.post('/api/device/control', (req, res) => {
  console.log(req.body)
  res.json({ msg: 'ok' })
})

app.get('/api/camera/list', (req, res) => {
  res.json({ list: camMan.getCamList() })
})

app.post('/api/camera/login', (req, res) => {
  // console.log(req.body)
  const { username, password, urn } = req.body
  console.info('[CameraManager] try login with', { username, password })
  camMan.loginCamera(urn, username, password)
  //
  res.json({ msg: 'yes' })
})

// * start app
app.start()

// * event loop
iosched.forever()
