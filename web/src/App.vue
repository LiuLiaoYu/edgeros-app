<script setup lang="ts">
import { socketClient } from './composables/sockets'

// let devid = ''

// let data
// async function fun() {
//   data = await getDeviceList()
//   console.log(data)
//   devid = data.value.data[0].devid as string
//   await requestDevicePermission([devid])
// }

// function sleep(delay: number) {
//   return new Promise(resolve => setTimeout(resolve, delay))
// }
// const light = useLightStore()
</script>

<template>
  <edger-safe-area>
    <van-config-provider theme="light">
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition">
          <component :is="Component" />
        </transition>
      </router-view>

      <TabbarWrap show-debug-page />

      <van-number-keyboard safe-area-inset-bottom />
    </van-config-provider>
  </edger-safe-area>
</template>

<style scoped>
</style>
