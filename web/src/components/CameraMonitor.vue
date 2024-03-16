<script lang="ts" setup>
import mpegts from 'mpegts.js'
import textVideo from '~/assets/video.mp4'

const props = defineProps<{
  url: string
}>()

const source = ref()
const canvas = ref()

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

  callback() {
    this.canvasContext!.drawImage(this.source!, 0, 0, 200, 300)
  }

  connect(url: string) {
    if (mpegts.getFeatureList().mseLivePlayback) {
      this.player = mpegts.createPlayer({
        type: 'flv',
        isLive: true,
        url,
      })
      this.player.attachMediaElement(this.source!)
      this.player.load()
    }
  }

  play(intervals: number) {
    this.player!.play()
    // this.player!.on('play', () => {
    this.timer = setInterval(this.callback, intervals)
    // })
  }

  pause() {
    this.player!.pause()
    clearInterval(this.timer)
  }
}

// class Media

// function func() {
//   const ctx = canvas.value.getContext('2d')

//   const width = source.value.videoWidth
//   const height = source.value.videoHeight

//   function callback() {

//     setTimeout(() => {
//       callback()
//     }, 0)
//   }
//   callback()
// }

// onMounted(() => {
// const width = source.value.videoWidth
// const height = source.value.videoHeight
// console.log(ctx)
// console.log(width, height)
// function callback() {

// }
// callback()
// })

const url = `wss://${document.domain}:${window.location.port}/stream?${authTokenQuery.value}`

let ctx

function play() {
  source.value.play()
  ctx = canvas.value.getContext('2d')
  // console.log(ctx)
  function callback() {
    // if (source.value.)
    // ctx.fillStyle = 'green'
    ctx.drawImage(source.value, 0, 0, 200, 300)
    setTimeout(() => {
      callback()
    }, 0)
  }
  callback()
}

const monitor = new CanvasFlvMedia('source', 'canvas')

onMounted(() => {
  monitor.init()
})
</script>

<template>
  <div>
    <div>
      <video id="source" h-0 />
      <canvas id="canvas" />
    </div>
    <button @click="monitor.connect(url)">
      connect
    </button>
    <button @click="monitor.play()">
      play
    </button>
  </div>
</template>

<style scope></style>
