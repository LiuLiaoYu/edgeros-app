<script lang="ts" setup>
const msg = ref('')

onMounted(() => {
  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  }).then((mediaStream) => {
    const video = document.getElementById('video') as HTMLVideoElement
    video.srcObject = mediaStream
    msg.value = 'ok'
    // showNotify({ type: 'success', message: '成功' })
  }).catch((err) => {
    msg.value = err
  })
})
</script>

<template>
  <div>WebRTC 请求测试</div>
  <div>
    <video id="video" controls autoplay h-30vh w-80vw />
  </div>
  <div>状态：{{ msg }}</div>
</template>

<style scope></style>
