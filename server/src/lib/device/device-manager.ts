import EventEmitter from 'events'
import Device from 'async/device'
import permission from 'async/permission'
import { filterDeviceInfo, toDevice } from './device-enhance'
import type { InstructionWrapper } from './device-enhance'

// import type { DeviceInfo } from 'async/device' // * not export

const deviceGetState = {
  'plug': ['state', 'initial'],
  'light.belt': ['state', 'bright', 'color'],
}

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
}

export class DeviceManager extends EventEmitter {
  private deviceInfo: Map<string, any>
  private deviceControl: Map<string, Device>
  private deviceState: Map<string, any>
  constructor() {
    super()
    this.deviceInfo = new Map()
    this.deviceControl = new Map()
    this.deviceState = new Map()
  }

  async init() {
    const deviceList = await Device.list(false)
    const deviceInfoList = await Promise.all(deviceList.map(async ({ devid }) => {
      return [devid, await Device.info(devid)] as [string, any]
    }))
    deviceInfoList.forEach(([devid, info]) => {
      this.deviceInfo.set(devid, info)

      const type = info.report.type
      this.deviceState.set(devid, { online: true, ...deviceDefaultState[type] })
    })

    Device.on('join', (devid, info) => {
      console.info('[DeviceManager] new device join: ', JSON.stringify({ devid, info }))
      this.deviceInfo.set(devid, info)
      const type = info.report.type
      this.deviceState.set(devid, { online: true, ...deviceDefaultState[type] })
      this.emit('device:join', devid)
    })
    Device.on('lost', (devid) => {
      // `Device` instance will be automatically released
      console.info('[DeviceManager] device lost: ', devid)
      // this.deviceInfo.delete(devid)
      this.deviceState.get(devid).online = false
      this.deviceControl.delete(devid)
      this.emit('device:lost', devid)
    })

    console.info('[DeviceManager] initialized', deviceInfoList)
    this.emit('init')
  }

  getDeviceList() {
    return [...this.deviceInfo.entries()].map(([devid, info]) => filterDeviceInfo(devid, info))
  }

  getDeviceState() {
    return Object.fromEntries(this.deviceState)
  }

  async createDeviceControl(devid: string) {
    const device = new Device()
    try {
      const res = await device.request(devid)
      this.deviceControl.set(devid, device)

      device.on('message', (msg) => {
        this.emit('device:message', devid, msg)
        if (msg.method === 'get')
          this.deviceState.set(devid, { ...this.deviceState.get(devid), ...msg.data })
      })
      // init device state
      const type = this.deviceInfo.get(devid).report.type
      const inst = toDevice(devid).get(deviceGetState[type])
      await this.deviceSend(inst)
    }
    catch (err) {
      console.info('[DeviceManager] failed to request control', devid)
    }
  }

  updateState(inst: InstructionWrapper) {
    const { devid, pack } = inst.value
    this.deviceState.set(devid, { ...this.deviceState.get(devid), ...pack.data })
    console.log(this.deviceState.get(devid))
  }

  async getDeviceControl(devid: string) {
    if (!this.deviceControl.has(devid))
      await this.createDeviceControl(devid)
    return this.deviceControl.get(devid)
  }

  async deviceSend(devicePack: InstructionWrapper) {
    const { devid, pack } = devicePack.value
    const control = this.deviceControl.get(devid)
    return await control.send(pack)
  }

  // async getDeviceState(devid: string) {
  // const perm = await permission.device(devid)
  // const type = this.deviceInfo.get(devid).report.type
  // }

  // async control(devicePack: InstructionWrapper) {
  //   const { devid, pack } = devicePack.value
  //   // const controller = await this.controllerOf(devid)
  //   // return controller.wrapSend(pack)
  // }
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
