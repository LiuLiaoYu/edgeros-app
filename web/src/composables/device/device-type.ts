export type PowerState = "on" | "off"

export interface Device {
  devid: string
  isOnline: boolean
  // isPermin
}

export type Color = [number, number, number]


export interface LightState extends Device {
  isActive: boolean
  bright: number
  color: [number, number, number]
  num: number
}

export interface LightPack {
  state?: PowerState
  start?: number
  end?: number
  bright?: number
  color?: [number, number, number]
}



export interface JackState extends Device { }