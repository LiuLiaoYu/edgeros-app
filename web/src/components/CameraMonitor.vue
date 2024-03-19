<script lang="ts" setup>
import { showToast } from 'vant'

const err = ref('')

const url = `wss://${document.domain}:${window.location.port}/stream?${authTokenQuery.value}`
// const dataSocketUrl = `wss://${document.domain}:${window.location.port}/data?${authTokenQuery.value}`

const monitor = new CanvasFlvMedia('source', 'canvas')

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

onMounted(() => {
  monitor.init()
})
</script>

<template>
  <div>
    <div>
      <video id="source" h-0 />
      <div bg-gray-200>
        <canvas id="canvas" width="640" height="360" />
      </div>
    </div>
    <div>{{ err }}</div>
    <van-button type="primary" @click="monitor.connect(url)">
      连接
    </van-button>
    <van-button type="primary" @click="monitor.play()">
      play
    </van-button>

    <div>error: {{ err }}</div>
  </div>
</template>

<style scope></style>
