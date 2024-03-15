'use strict';

var WebApp = require('webapp');
var iosched = require('iosched');
var middleware = require('middleware');
var socket = require('socket');
var advnwc = require('async/advnwc');
require('async/permission');
var URL = require('url');
var EventEmitter = require('events');
var jsreOnvif = require('@edgeros/jsre-onvif');
var MediaDecoder = require('mediadecoder');
var WebMedia = require('webmedia');

// 网络接口名称
async function getIfnames() {
    return {
        lan: (await advnwc.netifs(true))[0],
        wan: (await advnwc.netifs(false))[0],
    };
}

// import { WsServer } from 'websocket'
const WsServer = require('websocket').WsServer;
// import { checkPerm, getIfnames } from '../utils'
console.inspectEnable = true;
class CameraManager extends EventEmitter {
    constructor() {
        super();
        this.cameraMap = new Map();
        this.streamMap = new Map();
        this.profileMap = new Map();
    }
    createOnvifDiscovery(ifnames) {
        const nets = ifnames.map(item => ({ ifname: item, localPort: 0 }));
        this.onvifDiscovery = new jsreOnvif.Discovery(nets, { resolve: false }); // 不自动创建 Cam 对象
        this.onvifDiscovery.on('find', this.onFind.bind(this));
        this.onvifDiscovery.on('lost', this.onLost.bind(this));
        this.onvifDiscovery.on('start', () => {
            console.info('[CameraManager] onvif discovery start');
            this.onvifDiscovery.discovery(); // 仅允许调用一次，会间隔一段时间调用 search()
            Task.nextTick(() => { this.onvifDiscovery.search(); }); // 创建后立即调用一下 search()
        });
        this.onvifDiscovery.start();
    }
    onFind(camInfo) {
        console.info('[CameraManager] find new camera:', camInfo.hostname);
        /* {
          hostname: '192.168.128.105',
          port: 2020,
          path: '/onvif/device_service',
          urn: 'uuid:3fa1fe68-b915-4053-a3e1-f46d2fb9ca76',
          _valid: true,
          _invalids: 0
        } */
        if (this.cameraMap.has(camInfo.urn))
            return;
        this.cameraMap.set(camInfo.urn, camInfo);
        this.emit('ready', camInfo.urn);
    }
    onLost(camera) {
        console.info('[CameraManager] find new camera:', camera);
        this.cameraMap.delete(camera.urn);
        this.cameraMap.get(camera.urn);
        // this.emitDevMap()
        // this.emitDevLost(dev)
        // const server = this._serverMap.get(dev.urn)
        // if (server) {
        // server.ser.stop()
        // }
    }
    // 传入username和password获得cam和profile
    loginCamera(urn, username, password) {
        const camInfo = this.cameraMap.get(urn);
        camInfo.username = username;
        camInfo.password = password;
        const cam = new jsreOnvif.Cam(camInfo);
        cam.on('connect', async (err, data) => {
            if (err) {
                console.error(`[camera:${cam.hostname}] connect failed`, err);
            }
            else {
                console.info(`[camera:${cam.hostname}] connect success`);
                const profiles = await Promise.all(cam.profiles.map(async (profile) => ({
                    token: profile.$.token,
                    name: profile.name,
                    video: {
                        resolution: profile.videoEncoderConfiguration.resolution,
                    },
                    uri: await new Promise((resolve, reject) => {
                        cam.getStreamUri({ protocol: 'RTSP', profileToken: profile.$.token }, (err, stream) => {
                            if (err)
                                reject(err);
                            resolve(stream.uri);
                        });
                    }),
                })));
                this.profileMap.set(cam.urn, profiles);
                console.info(`[camera:${cam.hostname}] profiles:`, JSON.stringify(profiles));
                this.emit('login', cam.urn);
            }
        });
    }
    getCamList() {
        return Array.from(this.cameraMap.values()).map(({ hostname, port, path, urn }) => ({ hostname, port, path, urn }));
    }
    isCamLogin(urn) {
        return this.cameraMap.get(urn) instanceof jsreOnvif.Cam;
    }
    getCamProfiles(urn) {
        return this.profileMap.get(urn);
    }
    createStreamServer(urn, uri, app) {
        const { protocol, host, pathname } = new URL(uri);
        const { username, password } = this.cameraMap.get(urn);
        const rtspUri = `${protocol}://${username}:${password}@${host}${pathname}`;
        console.log(rtspUri);
        // const dateSocket = WsServer.createServer(`/data`, app)
        const streamSocket = WsServer.createServer('/stream', app);
        const opts = {
            mode: 1,
            mediaSource: { source: 'flv' },
            streamChannel: { protocol: 'ws', server: streamSocket },
            // dataChannel: { protocol: 'ws', server: dataSocket },
        };
        const handnn = require('handnn');
        const server = WebMedia.createServer(opts, app);
        const netcam = new MediaDecoder();
        server.on('start', () => {
            console.log('this');
            netcam.open(rtspUri, { proto: 'tcp' }, 10000);
            // netcam.destVideoFormat({ width: 640, height: 360, fps: 15, pixelFormat: MediaDecoder.PIX_FMT_RGB24, noDrop: false, disable: false })
            // netcam.destAudioFormat({ disable: true })
            netcam.destVideoFormat({ width: 640, height: 360, fps: 1, pixelFormat: MediaDecoder.PIX_FMT_BGR24, noDrop: false, disable: false });
            netcam.destAudioFormat({ disable: true });
            netcam.remuxFormat({ enable: true, enableAudio: false, format: 'flv' });
            netcam.previewFormat({ enable: true, fb: 0, fps: 25, fullscreen: false });
            const ol = netcam.overlay();
            // const colors = [MediaDecoder.C_GREEN, MediaDecoder.C_BLUE, MediaDecoder.C_YELLOW, MediaDecoder.C_WHITE, MediaDecoder.C_MAGENTA]
            netcam.on('video', (video) => {
                const buf = new Buffer(video.arrayBuffer);
                const hands = handnn.detect(buf, { width: 640, height: 360, pixelFormat: handnn.PIX_FMT_BGR24 });
                console.log(hands);
                ol.clear();
                if (hands.length) {
                    for (let i = 0; i < hands.length; i++) {
                        const info = hands[i];
                        if (info.prob > 0.5) {
                            // draw rectangle
                            ol.rect(info.x0, info.y0, info.x1, info.y1, MediaDecoder.C_RED, 2, 0, false);
                        }
                    }
                }
            });
            netcam.on('remux', (frame) => {
                const buf = Buffer.from(frame.arrayBuffer);
                console.log(buf.length);
                server.pushStream(buf);
            });
            netcam.on('header', (frame) => {
                const buf = Buffer.from(frame.arrayBuffer);
                server.pushStream(buf);
            });
            netcam.on('eof', () => {
            });
            netcam.start();
        });
        console.log('here');
        server.start();
        // server.start()
        // console.log(streamSocket)
        // const dataServer = WsServer.createServer(`/${videoUrl}.media`, app)
        // const streamServer = WsServer.createServer(`/stream`, app)
        // const mediaOpts = {
        //   mode: 1,
        //   path: '/stream',
        //   mediaSource: { source: 'flv' },
        //   streamChannel: { protocol: 'ws', server: streamServer },
        //   // dataChannel: { protocol: 'ws', server: dataServer },
        // }
        // console.info(`[camera:${cam.hostname}][uri:${uri}]`)
        // const urlObj = new URL(uri)
        // const { username, password } = cam
        // const rtspUrl = `${urlObj.protocol}://${username}:${password}@${urlObj.host}${urlObj.pathname}`
        // console.log(rtspUrl)
        // try {
        //   const mediaServer = WebMedia.createServer(mediaOpts, app)
        //   mediaServer.on('start', (server) => {
        //     const netcam = new MediaDecoder().open(rtspUrl, { proto: 'tcp' }, 10000)
        //     const videoFormat = netcam.srcVideoFormat()
        //     const audioFormat = netcam.srcAudioFormat()
        //     console.log('[video format]:', JSON.stringify(videoFormat))
        //     console.log('[audio format]:', JSON.stringify(audioFormat))
        //     // netcam.destVideoFormat({ width: videoFormat.width / 2, height: videoFormat.height / 2, fps: 4, pixelFormat: MediaDecoder.PIX_FMT_RGB24, disable: false })
        //     // netcam.destAudioFormat({ disable: true })
        //     // netcam.remuxFormat({ enable: true, enableAudio: false, format: 'flv' })
        //     netcam.destVideoFormat({ width: 640, height: 360, fps: 15, pixelFormat: MediaDecoder.PIX_FMT_RGB24, noDrop: false, disable: false })
        //     netcam.destAudioFormat({ disable: true })
        //     netcam.remuxFormat({ enable: true, enableAudio: false, format: 'flv' })
        //     // netcam.destVideoFormat({ width: info.width, height: info.height, fps: 1, disable: false });
        //     // netcam.on('video', (frame) => {
        //     // console.log(frame);
        //     // console.log(Buffer.from(frame.arrayBuffer))
        //     // })
        //     netcam.on('remux', (frame) => {
        //       const buf = Buffer.from(frame.arrayBuffer)
        //       // console.log(Buffer.from(frame.arrayBuffer).length)
        //       server.pushStream(buf)
        //     })
        //     netcam.on('header', (frame) => {
        //       const buf = Buffer.from(frame.arrayBuffer)
        //       // console.log(frame);
        //       server.pushStream(buf)
        //     })
        //     netcam.start()
        //     this.streamMap.set(uri, mediaServer)
        //   })
        //   mediaServer.on('stop', () => {
        //     console.warn('[webmedia on stop]')
        //     // netcam && netcam.stop()
        //     // setTimeout(() => {
        //     //   netcam && netcam.close()
        //     // }, 0)
        //     this.streamMap.delete(uri)
        //   })
        //   mediaServer.on('open', () => {
        //     /* 客户端与服务端连接成功触发 */
        //     console.info('[webmedia on open]')
        //   })
        //   mediaServer.on('close', () => {
        //     /* 客户端与服务端连接关闭触发 */
        //     console.warn('[webmedia on close]')
        //   })
        //   mediaServer.on('end', () => {
        //     console.warn('[webmedia on end]')
        //   })
        //   mediaServer.start()
        //   console.info('create webMedia server success!')
        //   return { result: true, message: '首次打开服务，请耐心等待...', data: videoUrl }
        // }
        // catch (error) {
        //   console.error('create webMedia server failed!', error)
        //   return { result: false, message: '打开摄像头失败，请检查配置正常后重试！', data: error }
        // }
    }
}

// var WsServer = require('websocket').WsServer
// wsc.start()
const app = WebApp.createApp();
console.inspectEnable = true;
socket.sockaddr(socket.INADDR_LOOPBACK, 8000);
const camMan = new CameraManager();
// const res = await
getIfnames().then(res => camMan.createOnvifDiscovery(Object.values(res)));
camMan.on('ready', (urn) => {
    camMan.loginCamera(urn, 'admin', '123456');
});
camMan.on('login', (urn) => {
    const ps = camMan.getCamProfiles(urn);
    console.log(ps);
    camMan.createStreamServer(urn, ps[0].uri, app);
});
// * middlewares
app.use(WebApp.static('./public'));
app.use(middleware.bodyParser.json());
app.use(middleware.bodyParser.urlencoded());
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
app.start();
// * event loop
iosched.forever();
