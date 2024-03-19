/*
import { defineStore } from 'pinia'
import { LightState } from '..'
import { useFetchDevice, toDevice } from '../device/edger-device'

export const useLightStore = defineStore('light', {
  state: (): LightState => {
    return {
      devid: '',
      isOnline: false,
      isActive: false,
      bright: 0,
      color: [0, 0, 0],
      num: 0
    }
  },
  getters: {
    state: (state) => state.isActive ? 'on' : 'off'
  },
  actions: {
    online(devid: string) {
      this.devid = devid
      this.isOnline = true
    },
    async swithPower() {
      this.isActive = !this.isActive
      return await useFetchDevice("/control").post(toDevice(this.devid).set({ state: this.state }).value)
    },
  }
}
)
*/

// state: (): LightState => {
//   return {
//     devid: '',
//     state: "off",
//     bright: 0,
//     color: [0, 0, 0]
//   }
// },
// actions: {
//   async online() {

//   },
//   async offline() {

//   }
//   // async sync(devid: string) {

//   // },
//   // async swithPower() {
//   //   this.state = this.state === 'on' ? "off" : "on"
//   //   return await useFetchDevice("/control").post(toDevice(this.devid).set({ state: this.state }))
//   // },
//   // async turnOn() { },
//   // async turnOff() { },

//   // async control() { },
//   // async setBrightness() { },
// }
