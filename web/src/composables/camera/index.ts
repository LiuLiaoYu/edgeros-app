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
  width: number
  height: number
  rate: number
  constructor(sourceId: string, canvasId: string, width: number) {
    this.sourceId = sourceId
    this.canvasId = canvasId
    this.width = width
    this.rate = width / 640
    this.height = Math.round(360 * this.rate)
  }

  init() {
    this.source = document.getElementById(this.sourceId) as HTMLVideoElement
    this.canvas = document.getElementById(this.canvasId) as HTMLCanvasElement
    this.canvasContext = this.canvas.getContext('2d') as CanvasRenderingContext2D

    this.canvas.setAttribute('width', this.width.toString())
    this.canvas.setAttribute('height', this.height.toString())
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
    }
  }

  pointTrans(x: number) {
    return Math.round(x * this.rate)
  }

  play() {
    // this.player!.on('play', () => {
    // this.timer = setInterval(() => {
    // this.callback()
    // }, intervals)

    socketClient.client.on('camera:data', ({ hands, fingers, isLock }) => {
      this.canvasContext!.drawImage(this.source!, 0, 0, this.width, this.height)
      for (const i in hands) {
        let { x0, x1, y0, y1 } = hands[i]
        x0 = Math.round(x0 * this.rate)
        x1 = Math.round(x1 * this.rate)
        y0 = Math.round(y0 * this.rate)
        y1 = Math.round(y1 * this.rate)
        const h = y1 - y0
        const w = x1 - x0

        this.canvasContext!.strokeStyle = isLock ? 'red' : 'green'

        this.canvasContext!.lineWidth = 3
        this.canvasContext!.strokeRect(x0, y0, w, h)

        this.canvasContext!.lineWidth = 1
        this.canvasContext!.strokeText(isLock ? `hand[${i}] locked` : `hand[${i}]`, x0, y0)
      }
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
