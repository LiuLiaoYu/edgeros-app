import { edger } from '@edgeros/web-sdk'
import { getEdgerToken } from "../edger-token"
import { createFetch } from "@vueuse/core"

export class DevicePack {
  value: any = {}
  constructor(devid: string) {
    this.value.devid = devid
  }
  static to(devid: string) {
    return new DevicePack(devid)
  }
  set(data: any) {
    this.value.data = { method: 'set', data }
    return this
  }
  get(data: any) {
    this.value.data = { method: 'get', data }
    return this
  }
  unwrap() {
    return this.value
  }
}
export function toDevice(devid: string) {
  return new DevicePack(devid)
}

export const useFetchDevice = createFetch({
  baseUrl: '/api/device/',
  combination: 'overwrite',
  options: {
    async beforeFetch({ options, cancel }) {
      const { token, srand } = await getEdgerToken()
      if (!(token && srand))
        cancel()
      options.headers = {
        ...options.headers,
        'edger-token': token,
        'edger-srand': srand,
      }
      return { options }
    }
  }
})

export async function getDeviceList() {
  const { data } = await useFetchDevice("/list").get().json()
  return data
}


export async function requestDevicePermission(deviceIds: string[]) {
  const { success } = await edger.permission.request({ code: deviceIds, type: 'devices' })
  return success
}

// export interface DevicePack {
//   method: "get" | "set" | "report" | "pair",
//   data: any
// }

// type DeviceMethod = "get" | "set" | "report" | "pair"


