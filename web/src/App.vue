<script setup lang="ts">
import { useLightStore } from './composables/store/light'

let devid = ''
const s = true

let data

async function fun() {
  data = await getDeviceList()
  console.log(data)
  devid = data.value.data[0].devid as string
  await requestDevicePermission([devid])
}

function sleep(delay: number) {
  return new Promise(resolve => setTimeout(resolve, delay))
}
const light = useLightStore()

/*
  ; (async () => {
  await fun()
  light.online(devid)
  light.num = 150
})()
*/

// 预设动作：减少状态汇报，
// 动态减少状态汇报？
// 设置无响应状态

const active = ref('cameras')
const showDebugPage = true
</script>

<template>
  <edger-safe-area>
    <van-config-provider theme="light">
      <router-view h-full />

      <van-tabbar v-model="active" route safe-area-inset-bottom>
        <van-tabbar-item name="actions" replace to="/action">
          <span>动作</span>
          <template #icon>
            <div i-ri:home-gear-line />
          </template>
        </van-tabbar-item>
        <van-tabbar-item name="cameras" replace to="/camera">
          <span>摄像头</span>
          <template #icon>
            <div i-icon-park-outline:camera-one />
          </template>
        </van-tabbar-item>
        <van-tabbar-item name="recognition" replace to="/recognition">
          <span>识别</span>
          <template #icon>
            <div i-mdi:face-recognition />
          </template>
        </van-tabbar-item>
        <van-tabbar-item v-if="showDebugPage" name="debug" replace to="/test/debug">
          <span>调试</span>
          <template #icon>
            <div i-carbon:debug />
          </template>
        </van-tabbar-item>
      </van-tabbar>

      <!-- <van-number-keyboard safe-area-inset-bottom /> -->
    </van-config-provider>
  </edger-safe-area>
</template>

<style scoped></style>
