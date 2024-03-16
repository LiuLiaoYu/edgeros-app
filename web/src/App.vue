<script setup lang="ts">
import { useLightStore } from './composables/store/light'

let devid = ''

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

// 预设动作：减少状态汇报，
// 动态减少状态汇报？
// 设置无响应状态

const active = ref('actions')
const showDebugPage = true

function func() {
  socket.emit('stream:get', (res) => {
    console.log(res)
  })
}

// page switch animation
const router = useRouter()
const tabNames = ['/action', '/camera', '/recognition', '/test/debug']
router.afterEach((to, from) => {
  if (from.name === undefined) {
    to.meta.transition = 'scale'
  }
  else {
    const toIdx = tabNames.indexOf(to.name as string)
    const fromIdx = tabNames.indexOf(from.name as string)
    to.meta.transition = toIdx < fromIdx ? 'slide-right' : 'slide-left'
  }
})
</script>

<template>
  <edger-safe-area>
    <van-config-provider theme="light">
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition">
          <component :is="Component" />
        </transition>
      </router-view>
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

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.5s ease-in-out;
}

.slide-left-enter-to {
  position: absolute;
  right: 0;
}

.slide-left-enter-from {
  position: absolute;
  right: -100%;
}

.slide-left-leave-to {
  position: absolute;
  left: -100%;
  opacity: 0;
}

.slide-left-leave-from {
  position: absolute;
  left: 0;
  opacity: 100%;
}

.slide-right-enter-to {
  position: absolute;
  left: 0;
}

.slide-right-enter-from {
  position: absolute;
  left: -100%;
}

.slide-right-leave-to {
  position: absolute;
  right: -100%;
  opacity: 0;
}

.slide-right-leave-from {
  position: absolute;
  right: 0;
  opacity: 100%;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.5s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
