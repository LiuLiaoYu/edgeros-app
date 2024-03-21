import WebApp from 'webapp'
import iosched from 'iosched'

import { bodyParser } from 'middleware'
import MediaDecoder from 'mediadecoder'
import WebMedia from 'webmedia'
import { WsServer } from 'websocket'

import permission from 'async/permission'
import socket from 'socket'

import SigSlot from 'sigslot'
import { checkPermission, getIfnames } from './lib/utils'

import { CameraManager } from './lib/media/camera-manager'
import { StatePusher } from './lib/socket'
import { kvdb } from './lib/db'

// import { deviceRoute, mediaRoute } from './routes'

import { DeviceManager } from './lib/device/device-manager'
import type { InstructionWrapper } from './lib/device/device-enhance'
import { toDevice } from './lib/device/device-enhance'

console.inspectEnable = true

const app = WebApp.createApp()

// * middlewares
app.use(WebApp.static('./public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

const pusher = new StatePusher(app, {
  path: '/socket/device-push',
  allowUpgrades: true,
})
pusher.listenAll('connection', () => {
  pusher.send('hello-test', { msg: 'connected' })
})

// *****************************************************
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
  const res = await camMan.createStreamServer(urn, ps[1].uri, app, pusher)
  pusher.send('camera:stream', res)
  pusher.report(res)
  console.log(res)
})

app.get('/api/camera/list', (req, res) => {
  res.json({ list: camMan.getCamList() })
})

app.post('/api/camera/login', (req, res) => {
  const { username, password, urn } = req.body
  console.info('[CameraManager] try login with', { username, password })
  camMan.loginCamera(urn, username, password)
  res.json({ msg: 'yes' })
})

// *****************************************************
const devMan = new DeviceManager()

devMan.init()

devMan.on('init', async () => {
  const info = devMan.getDeviceList()
  for (const dev of info) {
    const control = devMan.createDeviceControl(dev.devid)
  }
//   const devid = info[0].devid
//   // const { pack } = toDevice().set({ state: 'on', initial: 'on' }).value
//   const { pack } = toDevice().get(['state', 'initial']).value
//   console.log(pack)
//   const res = await control.send(pack, 0)
//   console.log(res)
})

devMan.on('device:message', (devid, msg) => {
  // console.log(devid, msg)
  pusher.report({ devid, msg })
})

// * debug logger
app.use(function (req, res, next) {
  console.info(`[${req.path}] ${req.method}`)
  next()
})

app.get('/api/device/list', (req, res) => {
  const devInfo = devMan.getDeviceList()
  const devState = devMan.getDeviceState()

  const list = devInfo.map((dev) => {
    const { online, ...state } = devState[dev.devid]
    return {
      ...dev,
      state,
      online,
    }
  })

  res.json({ list })
})

app.post('/api/device/control', (req, res) => {
  const inst = req.body
  devMan.updateState(inst as InstructionWrapper)
  // console.log(inst)
  // {value:{devid:'nw.247886fe80b004e7',pack:{method:'set',data:{...}}}}
  devMan.deviceSend(inst as InstructionWrapper)

  // if (inst.value.method === 'set')
  // devMan.emit('client:update', inst)

  res.json({ msg: 'ok' })
})

app.get('/api/device/state', (req, res) => {
  const state = devMan.getDeviceState()
  console.log(state)
  res.json(state)
})

// ******** 动作部分并没有完整做好，以下对第3个设置进行控制
camMan.on('action', ({ pattern }) => {
  console.log('detect pattern', pattern)

  const devInfo = devMan.getDeviceList()
  const devState = devMan.getDeviceState()

  const dev = devInfo[2]

  devState[dev.devid].state = (devState[dev.devid].state === 'on' ? 'off' : 'on')
  const inst = toDevice(dev.devid).set(devState[dev.devid])

  devMan.updateState(inst as InstructionWrapper)
  devMan.deviceSend(inst as InstructionWrapper)
})

// * start app
app.start()

// * event loop
iosched.forever()
