import { HttpServer } from 'http'
import WebApp from 'webapp'
import iosched from 'iosched'

import { bodyParser } from 'middleware'
import MediaDecoder from 'mediadecoder'
import WebMedia from 'webmedia'
import { WsServer } from 'websocket'

import permission from 'async/permission'
import socket from 'socket'
import deviceRoute from './routes/device'
import debugRoute from './routes/debug'

import { checkPermission, getIfnames } from './lib/utils'

// import { log } from 'edgeros:console'

import { CameraManager } from './lib/media/cam_media'

// console.inspectEnable = true

// import SocketIO from 'socket.io'

// const server = new SocketIO(app, {
//   path: "/socket/"
// })

import { DeviceStatePush } from './routes/push'

const app = WebApp.createApp()

// * routes
// app.use('/api/device', deviceRoute)
app.use('/api/debug', debugRoute)

console.inspectEnable = true

// * middlewares
app.use(WebApp.static('./public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

const pusher = new DeviceStatePush(app, {
  path: '/socket/device-push',
  allowUpgrades: true,
})
pusher.socketServer.sockets.on('connection', () => {
  pusher.report({ msg: 'connect' })
})

// pusher.send('camera:stream', { msg: 'haha' })

const camMan = new CameraManager()

getIfnames().then(res => camMan.createOnvifDiscovery(Object.values(res)))
camMan.on('ready', (urn) => {
  camMan.loginCamera(urn, 'admin', '123456')
})

camMan.on('login', async (urn) => {
  const ps = camMan.getCamProfiles(urn)
  console.log(ps)
  const res = await camMan.createStreamServer(urn, ps[0].uri, app)
  pusher.send('camera:stream', res)
  pusher.report(res)
  console.log(res)
})

pusher.socketServer.sockets.on('stream:get', (cb) => {
  cb({ msg: 'ok' })
})

// import { DeviceManager } from './lib/device/device-manager'
// import { toDevice } from "./lib/device/device-enhance";
// const deviceManager = new DeviceManager()
// deviceManager.init()
// deviceManager.push(pusher)

// * start app
app.start()

// * event loop
iosched.forever()
