import { edger } from '@edgeros/web-sdk'

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
