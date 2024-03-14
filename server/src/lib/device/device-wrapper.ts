// edgeros:device
// doc: https://www.edgeros.com/edgeros/api/EDGEROS%20EXTENSION/Basic/device
import Device from 'device'
import util from 'util'
import type { InstructionWrapper } from './device-enhance'

export const getDeviceList = util.promisify(Device.list)
export const getDeviceInfo = util.promisify(Device.info)
export const getDeviceCount = util.promisify(Device.count)

// export class DeviceWrapper extends Device {
//   constructor() {
//     super()
//   }
//   send(msg: object, callback?: (error: Error) => void, retries?: number, urgent?: boolean, mark?: boolean): void {
//   }

//   request(devid: string, callback: (error: Error) => void): void {
//   }
// }

// declare Device{

// }

// Device.prototype.wrapRequest = function (devid: string) {
//   return new Promise((resolve, reject) => {
//     this.request(devid, (err) => {
//       if (err)
//         reject(err)
//       resolve(true)
//     })
//   })
// }

// Device.prototype.wrapSend = function (pack: InstructionWrapper) {
//   return new Promise((resolve, reject) => {
//     this.send(pack, (err) => {
//       if (err)
//         reject(err)
//       resolve(true)
//     })
//   })
// }

export { Device }
