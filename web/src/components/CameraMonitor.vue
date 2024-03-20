<script lang="ts" setup>
import { showToast } from 'vant'

const err = ref('')

const url = `wss://${document.domain}:${window.location.port}/stream?${authTokenQuery.value}`
// const dataSocketUrl = `wss://${document.domain}:${window.location.port}/data?${authTokenQuery.value}`

const monitor = new CanvasFlvMedia('source', 'canvas', 300)

/*
const dataSocket = new WebSocket(dataSocketUrl)

// Connection opened
dataSocket.addEventListener('open', (event) => {
  console.log(event)
  // dataSocket.send("Hello Server!");
})

// Listen for messages
dataSocket.addEventListener('message', (event) => {
  console.log('Message from server ', event.data)
})
*/
const container = ref()
const { width, height } = useElementSize(container)

onMounted(() => {
  monitor.init()
  monitor.play()
})
</script>

<template>
  <div>
    <div>
      <div ref="container" bg-gray-200>
        <canvas id="canvas" />
        <video id="source" h-0 />
      </div>
      {{ width }} {{ height }}
    </div>
    <div>{{ err }}</div>
    <van-button type="primary" @click="monitor.connect(url)">
      连接
    </van-button>
    <!-- <van-button type="primary" @click="monitor.play()"> -->
    <!-- 播放 -->
    <!-- </van-button> -->

    <!-- <div>error: {{ err }}</div> -->
  </div>
</template>

<style scope></style>
