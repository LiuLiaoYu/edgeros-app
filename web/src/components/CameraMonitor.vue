<script lang="ts" setup>
import mpegts from 'mpegts.js'
import { showToast } from 'vant'

// import textVideo from '~/assets/video.mp4'

const props = defineProps<{
  url: string
}>()

const err = ref('')

class CanvasFlvMedia {
  sourceId: string
  canvasId: string
  source?: HTMLVideoElement
  canvas?: HTMLCanvasElement
  canvasContext?: CanvasRenderingContext2D
  timer?: number
  player?: mpegts.Player
  constructor(sourceId: string, canvasId: string) {
    this.sourceId = sourceId
    this.canvasId = canvasId
  }

  init() {
    this.source = document.getElementById(this.sourceId) as HTMLVideoElement
    this.canvas = document.getElementById(this.canvasId) as HTMLCanvasElement
    this.canvasContext = this.canvas.getContext('2d') as CanvasRenderingContext2D
  }

  destroyPlayer() {
    if (this.player) {
      this.player.pause()
      this.player.unload()
      this.player.detachMediaElement()
      this.player.destroy()
    }
  }

  connect(url: string) {
    // 清理上一个
    if (this.player)
      this.destroyPlayer()
    if (mpegts.getFeatureList().mseLivePlayback) {
      // showToast('here!')
      showToast(mpegts.isSupported())
      // err.value = ''
      this.player = mpegts.createPlayer({ type: 'flv', isLive: true, url }, {
        // enableWorker: true, // 启用分离的线程进行转换
        // enableStashBuffer: false, // 关闭IO隐藏缓冲区
        // stashInitialSize: 128, // 减少首帧显示等待时长
      })
      this.player.attachMediaElement(this.source!)
      this.player.load()
      this.player.play()
      this.player.on(mpegts.Events.ERROR, (e) => {
        // console.log(e)
        err.value = e
        // destroy

        // 进行重建的逻辑，这里不再展开
        // this.init()
      })
    }
    console.log(this.player!.currentTime)
  }

  play(intervals: number) {
    // this.player!.on('play', () => {
    this.timer = setInterval(() => {
      this.callback()
    }, intervals)
    // })
  }

  pause() {
    this.player!.pause()
    clearInterval(this.timer)
  }

  callback() {
    this.canvasContext!.drawImage(this.source!, 0, 0, 200, 300)
  }
}

const url = `wss://${document.domain}:${window.location.port}/stream?${authTokenQuery.value}`
const dataSocket = `wss://${document.domain}:${window.location.port}/data?${authTokenQuery.value}`

// const socket = new WebSocket("ws://localhost:8080");
const socket = new WebSocket(dataSocket)

const monitor = new CanvasFlvMedia('source', 'canvas')

onMounted(() => {
  monitor.init()
})
</script>

<template>
  <div>
    <div>
      <video id="source" />
      <div border="1 gray solid" bg-gray-200>
        <canvas id="canvas" />
      </div>
    </div>
    <div>{{ err }}</div>
    <van-button type="primary" @click="monitor.connect(url)">
      连接
    </van-button>
    <van-button type="primary" @click="monitor.play()">
      play
    </van-button>
  </div>
</template>

<style scope></style>
