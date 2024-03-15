import URL from 'url'
import EventEmitter from 'events'
import util from 'util'
import { Cam, Discovery } from '@edgeros/jsre-onvif'

// import type { WebMediaServerOption } from 'webmedia'
import MediaDecoder from 'mediadecoder'
import WebMedia from 'webmedia'
import { log } from 'edgeros:console'

// import { WsServer } from 'websocket'
const WsServer = require('websocket').WsServer

// import { checkPerm, getIfnames } from '../utils'

console.inspectEnable = true

// Discovery: start stop find lost error
// Cam: connect rawResponse rawRequest

export interface CameraInfo {
  hostname: string
  port: number
  path: string
  urn: string
  _valid: boolean
  _invalids: number
  username?: string
  password?: string
}

export class CameraManager extends EventEmitter {
  private onvifDiscovery: Discovery
  cameraMap: Map<string, CameraInfo | Cam> // key: urn
  profileMap: Map<string, any> // key: urn, value: profile
  streamMap: Map<string, any> // key: url
  constructor() {
    super()
    this.cameraMap = new Map()
    this.streamMap = new Map()
    this.profileMap = new Map()
  }

  createOnvifDiscovery(ifnames: string[]) {
    const nets = ifnames.map(item => ({ ifname: item, localPort: 0 }))
    this.onvifDiscovery = new Discovery(nets, { resolve: false }) // 不自动创建 Cam 对象
    this.onvifDiscovery.on('find', this.onFind.bind(this))
    this.onvifDiscovery.on('lost', this.onLost.bind(this))
    this.onvifDiscovery.on('start', () => {
      console.info('[CameraManager] onvif discovery start')
      this.onvifDiscovery.discovery() // 仅允许调用一次，会间隔一段时间调用 search()
      Task.nextTick(() => { this.onvifDiscovery.search() }) // 创建后立即调用一下 search()
    })
    this.onvifDiscovery.start()
  }

  onFind(camInfo: CameraInfo) {
    console.info('[CameraManager] find new camera:', camInfo.hostname)
    /* {
      hostname: '192.168.128.105',
      port: 2020,
      path: '/onvif/device_service',
      urn: 'uuid:3fa1fe68-b915-4053-a3e1-f46d2fb9ca76',
      _valid: true,
      _invalids: 0
    } */
    if (this.cameraMap.has(camInfo.urn))
      return
    this.cameraMap.set(camInfo.urn, camInfo)
    this.emit('ready', camInfo.urn)
  }

  onLost(camera) {
    console.info('[CameraManager] find new camera:', camera)
    this.cameraMap.delete(camera.urn)
    const cam = this.cameraMap.get(camera.urn)
    // this.emitDevMap()
    // this.emitDevLost(dev)
    // const server = this._serverMap.get(dev.urn)
    // if (server) {
    // server.ser.stop()
    // }
  }

  // 传入username和password获得cam和profile
  loginCamera(urn: string, username: string, password: string) {
    const camInfo = this.cameraMap.get(urn)
    camInfo.username = username
    camInfo.password = password
    const cam = new Cam(camInfo)
    cam.on('connect', async (err, data) => {
      if (err) {
        console.error(`[camera:${cam.hostname}] connect failed`, err)
      }
      else {
        console.info(`[camera:${cam.hostname}] connect success`)
        const profiles = await Promise.all(
          cam.profiles.map(
            async profile => ({
              token: profile.$.token,
              name: profile.name,
              video: {
                resolution: profile.videoEncoderConfiguration.resolution,
              },
              uri: await new Promise((resolve, reject) => {
                cam.getStreamUri({ protocol: 'RTSP', profileToken: profile.$.token }, (err, stream) => {
                  if (err)
                    reject(err)
                  resolve(stream.uri)
                })
              }),
            }),
          ),
        )
        this.profileMap.set(cam.urn, profiles)
        console.info(`[camera:${cam.hostname}] profiles:`, JSON.stringify(profiles))
        this.emit('login', cam.urn)
      }
    })
  }

  getCamList() {
    return Array.from(this.cameraMap.values()).map(({ hostname, port, path, urn }) => ({ hostname, port, path, urn }))
  }

  isCamLogin(urn: string) {
    return this.cameraMap.get(urn) instanceof Cam
  }

  getCamProfiles(urn: string) {
    return this.profileMap.get(urn)
  }

  createStreamServer(urn: string, uri: string, app) {
    const { protocol, host, pathname } = new URL(uri)
    const { username, password } = this.cameraMap.get(urn)
    const rtspUri = `${protocol}://${username}:${password}@${host}${pathname}`

    console.log(rtspUri)

    // const dateSocket = WsServer.createServer(`/data`, app)
    const streamSocket = WsServer.createServer('/stream', app)
    const opts = {
      mode: 1,
      mediaSource: { source: 'flv' },
      streamChannel: { protocol: 'ws', server: streamSocket },
      // dataChannel: { protocol: 'ws', server: dataSocket },
    }
    const handnn = require('handnn')
    const server = WebMedia.createServer(opts, app)
    const netcam = new MediaDecoder()
    server.on('start', () => {
      console.log('this')
      netcam.open(rtspUri, { proto: 'tcp' }, 10000)

      // netcam.destVideoFormat({ width: 640, height: 360, fps: 15, pixelFormat: MediaDecoder.PIX_FMT_RGB24, noDrop: false, disable: false })
      // netcam.destAudioFormat({ disable: true })
      netcam.destVideoFormat({ width: 640, height: 360, fps: 1, pixelFormat: MediaDecoder.PIX_FMT_BGR24, noDrop: false, disable: false })
      netcam.destAudioFormat({ disable: true })
      netcam.remuxFormat({ enable: true, enableAudio: false, format: 'flv' })
      netcam.previewFormat({ enable: true, fb: 0, fps: 25, fullscreen: false })

      const ol = netcam.overlay()
      let quited = false
      // const colors = [MediaDecoder.C_GREEN, MediaDecoder.C_BLUE, MediaDecoder.C_YELLOW, MediaDecoder.C_WHITE, MediaDecoder.C_MAGENTA]

      netcam.on('video', (video) => {
        const buf = new Buffer(video.arrayBuffer)
        const hands = handnn.detect(buf, { width: 640, height: 360, pixelFormat: handnn.PIX_FMT_BGR24 })
        console.log(hands)
        ol.clear()
        if (hands.length) {
          for (let i = 0; i < hands.length; i++) {
            const info = hands[i]
            if (info.prob > 0.5) {
              // draw rectangle
              ol.rect(info.x0, info.y0, info.x1, info.y1, MediaDecoder.C_RED, 2, 0, false)
            }
          }
        }
      })

      netcam.on('remux', (frame) => {
        const buf = Buffer.from(frame.arrayBuffer)
        console.log(buf.length)
        server.pushStream(buf)
      })
      netcam.on('header', (frame) => {
        const buf = Buffer.from(frame.arrayBuffer)
        server.pushStream(buf)
      })
      netcam.on('eof', () => {
        quited = true
      })

      netcam.start()
    })

    console.log('here')
    server.start()

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
