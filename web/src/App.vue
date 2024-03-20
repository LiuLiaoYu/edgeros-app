<script setup lang="ts">
import { socketClient } from './composables/sockets'

socketClient.init({
  path: '/socket/device-push',
  query: authTokenHeader.value,
  transports: ['websocket'],
})
</script>

<template>
  <edger-safe-area>
    <van-config-provider theme="light">
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>

      <TabbarWrap />

      <van-number-keyboard safe-area-inset-bottom />
    </van-config-provider>
  </edger-safe-area>
</template>

<style scoped>
</style>
