<script lang="ts" setup>
import { edger } from '@edgeros/web-sdk'
import { showToast } from 'vant'

async function orientationLock(orientation) {
  const ret = await edger.orientation.lock(orientation)
  return ret.success
}

async function orientationUnlock() {
  const ret = await edger.orientation.unlock()
  return ret.success
}

function func() {
  showToast('你好')
}
</script>

<template>
  <div>
    <div>orientation: {{ edgerOrientation }}</div>
    <div>safeAreaInsets: {{ edgerSafeAreaInsets }}</div>
    <div>env: {{ edgerEnvInfo }}</div>
    <div>theme: {{ edgerTheme }}</div>
    <div>token: {{ authTokenHeader }}</div>

    <van-grid square>
      <van-grid-item text="其他页面" to="/other-page" />
      <van-grid-item text="WebRTC请求" to="/test/webrtc" />
      <van-grid-item text="横屏锁定" @click="orientationLock('landscape')" />
      <van-grid-item text="竖屏锁定" @click="orientationLock('portrait')" />
      <van-grid-item text="解除屏幕锁定" @click="orientationUnlock()" />
      <van-grid-item text="显示Toast" @click="func('hello')" />
    </van-grid>
  </div>
</template>

<style scope></style>
