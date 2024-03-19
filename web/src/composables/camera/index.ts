import flvjs from 'flv.js'
import { socketClient } from '../sockets/'

export class CanvasFlvMedia {
  sourceId: string
  canvasId: string
  source?: HTMLVideoElement
  canvas?: HTMLCanvasElement
  canvasContext?: CanvasRenderingContext2D
  timer?: number
  player?: flvjs.Player
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

    if (flvjs.isSupported()) {
      this.player = flvjs.createPlayer({ type: 'flv', isLive: true, url }, {
        // enableWorker: true, // 启用分离的线程进行转换
        enableStashBuffer: false, // 关闭IO隐藏缓冲区
        stashInitialSize: 128, // 减少首帧显示等待时长
      })
      this.player.attachMediaElement(this.source!)
      this.player.load()
      this.player.play()
      this.player.on(flvjs.Events.ERROR, (e) => {
        // console.log(e)
        err.value = e
        // destroy

        // 进行重建的逻辑，这里不再展开
        // this.init()
      })
    }
  }

  play(intervals: number) {
    // this.player!.on('play', () => {
    // this.timer = setInterval(() => {
    // this.callback()
    // }, intervals)

    socketClient.client.on('camera:data', ({ hands, fingers }) => {
      this.canvasContext!.drawImage(this.source!, 0, 0, 640, 360)

      // hands = hands.map((hand, idx) => ({ ...hand, curlNum: fingers[idx].reduce((res, cur) => res += cur ? 1 : 0, 0) }))
      // const isOpen = fingers.map((f)=>f.curl.all())

      for (const i in hands) {
        this.canvasContext.strokeStyle = 'green'
        console.log(fingers[i].curlNum)
        const h = hands[i].y1 - hands[i].y0
        const w = hands[i].x1 - hands[i].x0
        this.canvasContext.strokeRect(hands[i].x0, hands[i].y0, w, h)
        this.canvasContext.strokeText(`hand[${i}]`, hands[i].x0, hands[i].y0)
        // console.log(hand)
      }
      // console.log(fingers)

      // this.canvasContext.strokeStyle = 'red'
      // for (const face of faces) {
      //   const h = face.y1 - face.y0
      //   const w = face.x1 - face.x0
      //   this.canvasContext.strokeRect(face.x0, face.y0, w, h)
      // }
    })
  }

  pause() {
    this.player!.pause()
    clearInterval(this.timer)
  }

  callback() {
    this.canvasContext!.drawImage(this.source!, 0, 0, 640, 360)
  }
}
