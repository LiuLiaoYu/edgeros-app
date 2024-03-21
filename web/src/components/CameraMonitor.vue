<script lang="ts" setup>
const url = computed(() => {
  return `wss://${document.domain}:${window.location.port}/stream?${authTokenQuery.value}`
})

const monitor = new CanvasFlvMedia('source', 'canvas', 300)

onMounted(() => {
  monitor.init()
  monitor.play()
})
</script>

<template>
  <div>
    <div>
      <div bg-gray-200>
        <canvas id="canvas" />
        <video id="source" h-0 />
      </div>
    </div>
    <van-button type="primary" @click="monitor.connect(url)">
      连接
    </van-button>
  </div>
</template>

<style scope></style>
