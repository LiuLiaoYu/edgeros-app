import URL from 'url'
import EventEmitter from 'events'
import { Cam, Discovery } from '@edgeros/jsre-onvif'
import MediaDecoder from 'mediadecoder'
import { WsServer } from 'websocket'
import WebMedia from 'webmedia'

// import { checkPerm, getIfnames } from '../utils'

console.inspectEnable = true

export class CameraManager extends EventEmitter {
  private onvifDiscovery: Discovery
  constructor() {
    super()
    // this.onvifDiscovery = new Discovery()
  }

  requestPermission() {

  }

  createOnvifDiscovery(ifnames: string[]) {
    const nets = ifnames.map(item => ({ ifname: item, localPort: 0 }))

    this.onvifDiscovery = new Discovery(nets, { resolve: false })
    this.onvifDiscovery.on('find', this.onFind)
    this.onvifDiscovery.on('lost', this.onLost)
    this.onvifDiscovery.on('start', () => {
      console.info('[CameraManager] onvif discovery start')
      this.onvifDiscovery.discovery()
      Task.nextTick(() => { this.onvifDiscovery.search() })
    })
    this.onvifDiscovery.start()
  }

  private onFind(camera) {
    console.info("[CameraManager] find new camera:", camera.href)
    camera.on('connect', (err, data) => {
      if (err) {
        console.error(`[camera:${camera.hostname}] connect failed`, err)
      }
      else {
        console.info(`[camera:${camera.hostname}] connect success`)
      }
    })
    //   const _this = this
    //   cam.on('connect', (err, data) => {
    //     console.log('cam connect: ', err)
    //     if (err) {
    //       console.error('cam connect error!')
    //     }
    //     else {
    //       console.info('connect:', data)
    //       new Promise((resolve, reject) => {
    //         cam.getStreamUri({ protocol: 'RTSP' }, (err, stream, xml) => {
    //           if (err) {
    //             reject(err)
    //           }
    //           else {
    //             console.info(`[cam.getStreamUri]:${JSON.stringify(stream, null, 2)}`)
    //             // [cam.getStreamUri]:{
    //             //   "uri": "rtsp://192.168.128.102:554/11",
    //             //   "invalidAfterConnect": true,
    //             //   "invalidAfterReboot": true,
    //             //   "timeout": "PT5S"
    //             // }
    //             resolve(stream.uri)
    //           }
    //         })
    //       }).then((uri) => {
    //         _this.addCamera(uri, cam)
    //       }, (err) => { console.error(err) })
    //     }
    //   })
    // }
  }

  private onLost(device) {

  }
}