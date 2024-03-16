<script lang="ts" setup>
const s = `wss://${document.domain}:${window.location.port}/stream`
</script>

<template>
  <div mt-2em w-100vw>
    <van-cell-group inset>
      <van-cell title="192.168.128.34" />
      <van-cell>
        <CameraMonitor :url="s" />
      </van-cell>
    </van-cell-group>
    <van-divider />

    <van-cell-group inset>
      <van-cell title="添加视频流" value=">" />
    </van-cell-group>
  </div>
</template>

<style scope></style>
