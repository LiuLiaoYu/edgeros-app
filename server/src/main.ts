import WebApp from 'webapp'
import iosched from 'iosched'

import { bodyParser } from 'middleware'

import permission from 'async/permission'
import deviceRoute from './routes/device'
import debugRoute from './routes/debug'

import { checkPermission, getIfnames } from './lib/utils'

// * routes
// app.use('/api/device', deviceRoute)
// app.use('/api/debug', debugRoute)
// import { log } from 'edgeros:console'

import { CameraManager } from './lib/media/cam_media'

const app = WebApp.createApp()

// * middlewares
app.use(WebApp.static('./public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

// ; (async () => {
//   const res = await checkPermission(['network'])
//   console.log(res)
//   if (!res)
//     permission.update({ network: true })
// })()

// if (!res)
// await permission.update({ network: true })

/*
const cam = new CameraManager()

getIfnames().then((res) => {
  // console.log(res)
  cam.createOnvifDiscovery(Object.values(res))
})
*/

// console.inspectEnable = true

// import SocketIO from 'socket.io'

// const server = new SocketIO(app, {
//   path: "/socket/"
// })

/*
import { DeviceStatePush } from "./routes/push";
const pusher = new DeviceStatePush(app, {
  path: "/socket/device-push",
  allowUpgrades: true,
})
pusher.socketServer.sockets.on('connection', () => {
  pusher.report({ a: 123 })
})

import { DeviceManager } from './lib/device/device-manager'
import { toDevice } from "./lib/device/device-enhance";
const deviceManager = new DeviceManager()
deviceManager.init()
deviceManager.push(pusher)

import { fetchPermission } from "./lib/permission.wrap";

fetchPermission().then(res => {
  console.log(res)
}).catch(err => {
  console.log(err)
})
*/

// import MediaDecoder from "mediadecoder";

// /*
// rtsp://admin:123456@192.168.128.105:554/stream1
// const MediaDecoder = require('mediadecoder');
// var mediadecoder = new MediaDecoder();
// mediadecoder.open('rtsp://admin:123456@192.168.128.105:554/stream2', {
//   name: 'camera', proto: 'tcp'
//   }, 5000, function(error) {
//   if (error) {
//     console.error('Open file', error);
//   } else {
//     console.info('Opened!');
//   }
// });
// */

// MediaDecoder.open = function (url, opts, timeout, callback) {
// try {
// var mediadecoder = new MediaDecoder().open(url, opts, timeout, callback);
// } catch (error) {
// var mediadecoder = undefined;
// }
// return mediadecoder;
// }
//
//
// let netcam = MediaDecoder.open('rtsp://admin:123456@192.168.128.105:554/stream2', { proto: 'tcp' }, 10000, (err) => {
// if (err)  console.log(err)
// })
// var netcam = (new MediaDecoder()).open('rtsp://admin:123456@192.168.128.105:554/stream1', { proto: 'tcp' }, 10000);

/*
var netcam = (new MediaDecoder()).open('rtsp://admin:123456@192.168.128.105:554/stream1', { proto: 'tcp' }, 10000, (err) => {
  console.log(err)
});

console.log(netcam)

if (netcam == undefined) {
  console.error('Can not connect camera!');
}

netcam.destVideoFormat({ width: 640, height: 360, fps: 1, pixelFormat: MediaDecoder.PIX_FMT_RGB24, noDrop: false, disable: false });
netcam.destAudioFormat({ disable: true });
netcam.previewFormat({ enable: true, fb: 0, fps: 25 });

console.log(netcam.info())

var quited = false;

netcam.on('video', (video) => {
  // do something
});

netcam.on('eof', () => {
  quited = true;
});

netcam.start();

// while (!quited) {
//   iosched.poll(); // Event poll.
// }

// netcam.close();
*/

// * start app
app.start()

// * event loop
iosched.forever()
