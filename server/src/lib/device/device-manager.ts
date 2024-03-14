import EventEmitter from 'node:events'

import type { InstructionWrapper } from './device-enhance'
import { Device, filterDeviceInfo, getDeviceInfo, getDeviceList } from './device-enhance'

export class DeviceManager extends EventEmitter {
  private deviceInfoMap = new Map()
  private deviceControllerMap = new Map()
  constructor() {
    super()
  }

  async init() {
    const deviceList = await getDeviceList(false)
    const deviceInfo = await Promise.all(deviceList.map(async ({ devid }) => {
      const info = await getDeviceInfo(devid)
      return filterDeviceInfo(devid, info)
    }))
    for (const device of deviceInfo)
      this.deviceInfoMap.set(device.devid, device)

    console.log(deviceInfo)
    this.initEmit()
  }

  private initEmit() {
    Device.on('join', (devid, info) => {
      const device = filterDeviceInfo(devid, info)
      this.handleDeviceJoin(device)
      console.log('[device:join]', device)
      this.emit('device:join', device)
    })
    Device.on('lost', (devid) => {
      this.handleDeviceLost({ devid })
      console.log('[device:lost]', devid)
      this.emit('device:lost', { devid })
    })
  }

  handleDeviceJoin(device) {

  }

  handleDeviceLost(device) {

  }

  push(socketServer) {
    this.on('device:join', () => {
      socketServer.report({ msg: 'on' })
    })
    this.on('device:lost', () => {
      socketServer.report({ msg: 'off' })
    })
  }

  get deviceList() {
    return [...this.deviceInfoMap.values()]
  }

  async controllerOf(devid: string): Promise<Device> {
    if (this.deviceControllerMap.has(devid))
      return this.deviceControllerMap.get(devid)
    const controller = this.requestController(devid)
    this.deviceControllerMap.set(devid, controller)
    return controller
  }

  private async requestController(devid: string): Promise<Device> {
    return new Promise((resolve, reject) => {
      const controller = new Device()
      controller.request(devid, (err) => {
        if (err)
          reject(err)
        controller.on('message', (msg) => {
          this.emit('device:report', msg)
        })
        resolve(controller)
      })
    })
  }

  private releaseController(devid) {
    if (this.deviceControllerMap.has(devid)) {
      this.deviceControllerMap.get(devid).release()
      this.deviceControllerMap.delete(devid)
    }
  }

  async control(devicePack: InstructionWrapper) {
    const { devid, pack } = devicePack.value
    const controller = await this.controllerOf(devid)
    return controller.wrapSend(pack)
  }
}
