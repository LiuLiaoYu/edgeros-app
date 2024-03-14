// instruction type
export interface Instruction {
  method: 'set' | 'get' | 'pair' | 'report'
  data: any
}

// instruction wrapper
export class InstructionWrapper {
  value: {
    devid?: string
    pack?: Instruction
  } = {}

  constructor(devid?: string) {
    if (devid)
      this.value.devid = devid
  }

  static to(devid: string) {
    return new InstructionWrapper(devid)
  }

  set(data: any) {
    this.value.pack = { method: 'set', data }
    return this
  }

  get(data: any) {
    this.value.pack = { method: 'get', data }
    return this
  }

  unwrap() {
    return this.value
  }
}

export function toDevice(devid?: string) {
  return new InstructionWrapper(devid)
}

export interface DeviceBriefInfo {
  devid: string
  label: string
  type: string
  brand: string
  model: string
}

export function filterDeviceInfo(devid: string, info): DeviceBriefInfo {
  return {
    devid,
    label: info.alias || info.report.name,
    type: info.report.type,
    brand: info.report.vendor,
    model: info.report.model,
  }
}
