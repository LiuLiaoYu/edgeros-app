'use strict';

var WebApp = require('webapp');
var iosched = require('iosched');
var middleware = require('middleware');
var advnwc = require('async/advnwc');
require('async/permission');
var URL = require('url');
var EventEmitter = require('events');
var jsreOnvif = require('@edgeros/jsre-onvif');
var MediaDecoder = require('mediadecoder');
var WebMedia = require('webmedia');
var websocket = require('websocket');
var SigSlot = require('sigslot');
var SocketServer = require('socket.io');
var LightKV = require('lightkv');
var Device = require('async/device');

// 网络接口名称
async function getIfnames() {
    return {
        lan: (await advnwc.netifs(true))[0],
        wan: (await advnwc.netifs(false))[0],
    };
}

// import facenn from 'facenn'
// const WsServer = require('websocket').WsServer
// import { checkPerm, getIfnames } from '../utils'
// import * as handTrack from '../handtrack.min'
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
                this.emit('login-error', cam.urn);
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
    async createStreamServer(urn, uri, app, socket) {
        const { protocol, host, pathname } = new URL(uri);
        const { username, password } = this.cameraMap.get(urn);
        const rtspUri = `${protocol}://${username}:${password}@${host}${pathname}`;
        console.info(`[CameraManager]: create stream server ${rtspUri}`);
        const streamSocket = websocket.WsServer.createServer('/stream', app);
        const opts = {
            mode: 1, // `compound` mode failed in this project
            mediaSource: { source: 'flv' },
            streamChannel: { protocol: 'ws', server: streamSocket },
            // dataChannel: { protocol: 'ws', server: dataSocket },
        };
        const server = WebMedia.createServer(opts, app);
        const netcam = new MediaDecoder();
        server.on('start', () => {
            // open rtsp stream
            netcam.open(rtspUri, { proto: 'tcp', name: 'camera' }, 10000);
            // set dest format
            netcam.destVideoFormat({ width: 640, height: 360, fps: 15, pixelFormat: MediaDecoder.PIX_FMT_BGR24, disable: false });
            netcam.destAudioFormat({ disable: true });
            // set flv stream
            netcam.remuxFormat({ enable: true, enableAudio: false, format: 'flv' });
            // flv stream
            netcam.on('remux', (frame) => { server.pushStream(Buffer.from(frame.arrayBuffer)); });
            netcam.on('header', (frame) => { server.pushStream(Buffer.from(frame.arrayBuffer)); });
            netcam.start();
            this.task = new Task('./lib/hand-detect.js', {
                netcamName: 'camera',
                sigSlotName: 'hand-detect',
            }, { directory: module.directory });
            this.sigslot = new SigSlot('hand-detect');
            this.sigslot.on('camera:detect', (msg) => {
                socket.send('camera:data', msg);
                const { pattern } = msg;
                if (pattern == 1 || pattern == 2)
                    this.emit('action', msg);
            });
        });
        server.start();
        return {
            protocol: 'wss',
            path: '/stream',
            // stream: "wss://"
        };
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

// socketio 2.2; jsre builtin
class StatePusher {
    constructor(app, options) {
        this.socketServer = SocketServer(app, options);
    }
    send(event, data) {
        this.socketServer.sockets.emit(event, data);
    }
    report(report) {
        this.socketServer.sockets.emit('device:report', report);
    }
    listenAll(event, callbackFn) {
        this.socketServer.sockets.on(event, callbackFn);
    }
}

const kvdb = new LightKV('./camera.db', 'c+', LightKV.OBJECT);
if (!kvdb.has('cameras'))
    kvdb.set('cameras', {});

// instruction wrapper
class InstructionWrapper {
    constructor(devid) {
        this.value = {};
        if (devid)
            this.value.devid = devid;
    }
    static to(devid) {
        return new InstructionWrapper(devid);
    }
    set(data) {
        this.value.pack = { method: 'set', data };
        return this;
    }
    get(data) {
        this.value.pack = { method: 'get', data };
        return this;
    }
    unwrap() {
        return this.value;
    }
}
function toDevice(devid) {
    return new InstructionWrapper(devid);
}
function filterDeviceInfo(devid, info) {
    return {
        devid,
        label: info.alias || info.report.name,
        type: info.report.type,
        brand: info.report.vendor,
        model: info.report.model,
    };
}

// import type { DeviceInfo } from 'async/device' // * not export
const deviceGetState = {
    'plug': ['state', 'initial'],
    'light.belt': ['state', 'bright', 'color'],
};
const deviceDefaultState = {
    'plug': {
        state: 'off',
        initial: 'on',
    },
    'light.belt': {
        state: 'off',
        bright: 128,
        color: [0, 232, 33],
        start: 0,
        end: 150,
    },
};
class DeviceManager extends EventEmitter {
    constructor() {
        super();
        this.deviceInfo = new Map();
        this.deviceControl = new Map();
        this.deviceState = new Map();
    }
    async init() {
        const deviceList = await Device.list(false);
        const deviceInfoList = await Promise.all(deviceList.map(async ({ devid }) => {
            return [devid, await Device.info(devid)];
        }));
        deviceInfoList.forEach(([devid, info]) => {
            this.deviceInfo.set(devid, info);
            const type = info.report.type;
            this.deviceState.set(devid, { online: true, ...deviceDefaultState[type] });
        });
        Device.on('join', (devid, info) => {
            console.info('[DeviceManager] new device join: ', JSON.stringify({ devid, info }));
            this.deviceInfo.set(devid, info);
            const type = info.report.type;
            this.deviceState.set(devid, { online: true, ...deviceDefaultState[type] });
            this.emit('device:join', devid);
        });
        Device.on('lost', (devid) => {
            // `Device` instance will be automatically released
            console.info('[DeviceManager] device lost: ', devid);
            // this.deviceInfo.delete(devid)
            this.deviceState.get(devid).online = false;
            this.deviceControl.delete(devid);
            this.emit('device:lost', devid);
        });
        console.info('[DeviceManager] initialized', deviceInfoList);
        this.emit('init');
    }
    getDeviceList() {
        return [...this.deviceInfo.entries()].map(([devid, info]) => filterDeviceInfo(devid, info));
    }
    getDeviceState() {
        return Object.fromEntries(this.deviceState);
    }
    async createDeviceControl(devid) {
        const device = new Device();
        try {
            const res = await device.request(devid);
            this.deviceControl.set(devid, device);
            device.on('message', (msg) => {
                this.emit('device:message', devid, msg);
                if (msg.method === 'get')
                    this.deviceState.set(devid, { ...this.deviceState.get(devid), ...msg.data });
            });
            // init device state
            const type = this.deviceInfo.get(devid).report.type;
            const inst = toDevice(devid).get(deviceGetState[type]);
            await this.deviceSend(inst);
        }
        catch (err) {
            console.info('[DeviceManager] failed to request control', devid);
        }
    }
    updateState(inst) {
        const { devid, pack } = inst.value;
        this.deviceState.set(devid, { ...this.deviceState.get(devid), ...pack.data });
        console.log(this.deviceState.get(devid));
    }
    async getDeviceControl(devid) {
        if (!this.deviceControl.has(devid))
            await this.createDeviceControl(devid);
        return this.deviceControl.get(devid);
    }
    async deviceSend(devicePack) {
        const { devid, pack } = devicePack.value;
        const control = this.deviceControl.get(devid);
        return await control.send(pack);
    }
}
// getControlOf(devid: string) {
//   if (this.deviceControl.has(devid)) { return this.deviceControl.get(devid) }
//   else {
//     const dev = new Device()
//     dev.request(devid)
//     this.deviceControl.set(devid, dev)
//     return dev
//   }
// }
// }
// import type { InstructionWrapper } from './device-enhance'
// import { Device, filterDeviceInfo, getDeviceInfo, getDeviceList } from './device-enhance'
// export class DeviceManager extends EventEmitter {
//   private deviceInfoMap = new Map()
//   private deviceControllerMap = new Map()
//   constructor() {
//     super()
//   }
//   async init() {
//     const deviceList = await getDeviceList(false)
//     const deviceInfo = await Promise.all(deviceList.map(async ({ devid }) => {
//       const info = await   getDeviceInfo(devid)
//       return filterDeviceInfo(devid, info)
//     }))
//     for (const device of deviceInfo)
//       this.deviceInfoMap.set(device.devid, device)
//     console.log(deviceInfo)
//     this.initEmit()
//   }
//   private initEmit() {
//     Device.on('join', (devid, info) => {
//       const device = filterDeviceInfo(devid, info)
//       this.handleDeviceJoin(device)
//       console.log('[device:join]', device)
//       this.emit('device:join', device)
//     })
//     Device.on('lost', (devid) => {
//       this.handleDeviceLost({ devid })
//       console.log('[device:lost]', devid)
//       this.emit('device:lost', { devid })
//     })
//   }
//   handleDeviceJoin(device) {
//   }
//   handleDeviceLost(device) {
//   }
//   push(socketServer) {
//     this.on('device:join', () => {
//       socketServer.report({ msg: 'on' })
//     })
//     this.on('device:lost', () => {
//       socketServer.report({ msg: 'off' })
//     })
//   }
//   get deviceList() {
//     return [...this.deviceInfoMap.values()]
//   }
//   async controllerOf(devid: string): Promise<Device> {
//     if (this.deviceControllerMap.has(devid))
//       return this.deviceControllerMap.get(devid)
//     const controller = this.requestController(devid)
//     this.deviceControllerMap.set(devid, controller)
//     return controller
//   }
//   private async requestController(devid: string): Promise<Device> {
//     return new Promise((resolve, reject) => {
//       const controller = new Device()
//       controller.request(devid, (err) => {
//         if (err)
//           reject(err)
//         controller.on('message', (msg) => {
//           this.emit('device:report', msg)
//         })
//         resolve(controller)
//       })
//     })
//   }
//   private releaseController(devid) {
//     if (this.deviceControllerMap.has(devid)) {
//       this.deviceControllerMap.get(devid).release()
//       this.deviceControllerMap.delete(devid)
//     }
//   }
//   async control(devicePack: InstructionWrapper) {
//     const { devid, pack } = devicePack.value
//     const controller = await this.controllerOf(devid)
//     return controller.wrapSend(pack)
//   }
// }

console.inspectEnable = true;
const app = WebApp.createApp();
// * middlewares
app.use(WebApp.static('./public'));
app.use(middleware.bodyParser.json());
app.use(middleware.bodyParser.urlencoded());
const pusher = new StatePusher(app, {
    path: '/socket/device-push',
    allowUpgrades: true,
});
pusher.listenAll('connection', () => {
    pusher.send('hello-test', { msg: 'connected' });
});
// *****************************************************
const camMan = new CameraManager();
// create onvif discovery server
getIfnames().then(res => camMan.createOnvifDiscovery(Object.values(res)));
camMan.on('ready', (urn) => {
    const cameraAuth = kvdb.get('cameras')[urn];
    if (cameraAuth) {
        const { username, password } = cameraAuth;
        console.info('[CameraManager] try login with', cameraAuth);
        camMan.loginCamera(urn, username, password);
    }
});
camMan.on('login-error', (urn) => {
    pusher.send('camera:login-error', urn);
});
camMan.on('login', async (urn) => {
    const ps = camMan.getCamProfiles(urn);
    console.log(ps);
    const res = await camMan.createStreamServer(urn, ps[1].uri, app, pusher);
    pusher.send('camera:stream', res);
    pusher.report(res);
    console.log(res);
});
app.get('/api/camera/list', (req, res) => {
    res.json({ list: camMan.getCamList() });
});
app.post('/api/camera/login', (req, res) => {
    const { username, password, urn } = req.body;
    console.info('[CameraManager] try login with', { username, password });
    camMan.loginCamera(urn, username, password);
    res.json({ msg: 'yes' });
});
// *****************************************************
const devMan = new DeviceManager();
devMan.init();
devMan.on('init', async () => {
    const info = devMan.getDeviceList();
    for (const dev of info) {
        devMan.createDeviceControl(dev.devid);
    }
    //   const devid = info[0].devid
    //   // const { pack } = toDevice().set({ state: 'on', initial: 'on' }).value
    //   const { pack } = toDevice().get(['state', 'initial']).value
    //   console.log(pack)
    //   const res = await control.send(pack, 0)
    //   console.log(res)
});
devMan.on('device:message', (devid, msg) => {
    // console.log(devid, msg)
    pusher.report({ devid, msg });
});
// * debug logger
app.use(function (req, res, next) {
    console.info(`[${req.path}] ${req.method}`);
    next();
});
app.get('/api/device/list', (req, res) => {
    const devInfo = devMan.getDeviceList();
    const devState = devMan.getDeviceState();
    const list = devInfo.map((dev) => {
        const { online, ...state } = devState[dev.devid];
        return {
            ...dev,
            state,
            online,
        };
    });
    res.json({ list });
});
app.post('/api/device/control', (req, res) => {
    const inst = req.body;
    devMan.updateState(inst);
    // console.log(inst)
    // {value:{devid:'nw.247886fe80b004e7',pack:{method:'set',data:{...}}}}
    devMan.deviceSend(inst);
    // if (inst.value.method === 'set')
    // devMan.emit('client:update', inst)
    res.json({ msg: 'ok' });
});
app.get('/api/device/state', (req, res) => {
    const state = devMan.getDeviceState();
    console.log(state);
    res.json(state);
});
// ******** 动作部分并没有完整做好，以下对第3个设置进行控制
camMan.on('action', ({ pattern }) => {
    console.log('detect pattern', pattern);
    const devInfo = devMan.getDeviceList();
    const devState = devMan.getDeviceState();
    const dev = devInfo[2];
    devState[dev.devid].state = (devState[dev.devid].state === 'on' ? 'off' : 'on');
    const inst = toDevice(dev.devid).set(devState[dev.devid]);
    devMan.updateState(inst);
    devMan.deviceSend(inst);
});
// * start app
app.start();
// * event loop
iosched.forever();
