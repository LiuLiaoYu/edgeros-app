const socket = require('socket')
const iosched = require('iosched')
const WebApp = require('webapp')
const WsServer = require('websocket').WsServer
const MediaDecoder = require('mediadecoder')
const WebMedia = require('webmedia')

// const app = WebApp.create('media', 0, socket.sockaddr(socket.INADDR_ANY, 8000))
const app = WebApp.createApp()
const wsSer = WsServer.createServer('/stream', app)

const opts = {
  mode: 1,
  path: '/stream',
  mediaSource: {
    source: 'flv',
  },
  streamChannel: {
    protocol: 'ws',
    server: wsSer,
  },
}
const server = WebMedia.createServer(opts, app)

server.on('start', () => {
  const netcam = new MediaDecoder().open('rtsp://admin:123456@192.168.128.105:554/stream2', { proto: 'tcp' }, 10000)

  netcam.destVideoFormat({ width: 640, height: 360, fps: 15, pixelFormat: MediaDecoder.PIX_FMT_RGB24, noDrop: false, disable: false })
  netcam.destAudioFormat({ disable: true })
  netcam.remuxFormat({ enable: true, enableAudio: false, format: 'flv' })
  netcam.on('remux', (frame) => {
    const buf = Buffer.from(frame.arrayBuffer)
    server.pushStream(buf)
  })
  netcam.on('header', (frame) => {
    const buf = Buffer.from(frame.arrayBuffer)
    server.pushStream(buf)
  })
  netcam.start()
})

// app.get('/', function (req, res) {
//   res.sendFile('./flv_ws.html')
// })
app.use(WebApp.static('./public/'))

// app.get('/stream', server.streamPipe)

app.start()

iosched.forever()
