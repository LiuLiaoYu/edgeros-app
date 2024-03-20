import handnn from 'handnn'
import facenn from 'facenn'
import MediaDecoder from 'mediadecoder'
import SigSlot from 'sigslot'

const args = ARGUMENT as {
  name: string // the `master` decoder name, see the `opts` parameter of MediaDecoder.open()
  sigSlotName: string
}

console.log(args.sigSlotName)

class SeqDetect {
  // lockList: [number, number][]
  lockFrameThreshold: number = 10

  // pattern1 : lock + close
  lockCloseFrameThreshold: number = 20
  // pattern2 : lock + close + open

  isLock: boolean

  lastState: [boolean, boolean]
  // isOpen
  // isStay

  stateFrameNum: number

  lastPos: [number, number]
  stayThreshold: number = 50
  // |x - x1| + |y - y1| <= stayThreshold

  constructor() {
    this.isLock = false
    this.lastState = [false, false]
    this.stateFrameNum = 0
    this.lastPos = [-1, -1]
  }

  clear() {
    this.isLock = false
    this.lastState = [false, false]
    this.stateFrameNum = 0
    this.lastPos = [-1, -1]
  }

  isOpen(fingers) {
    return fingers.curlNum <= 2
  }

  isStay(fingers) {
    const dist = (this.lastPos[0] - fingers.base.x) + (this.lastPos[1] - fingers.base.y)
    return this.lastPos[0] == -1 || dist <= this.stayThreshold
  }

  isClose(fingers) {
    return !this.isOpen(fingers)
  }

  isMove(fingers) {
    return !this.isStay(fingers)
  }

  push(fingers) {
    const pattern = this.detect(fingers)
    this.lastPos[0] = fingers.base.x
    this.lastPos[1] = fingers.base.y
    return pattern
  }

  getState(fingers) {
    return [this.isOpen(fingers), this.isStay(fingers)]
  }

  detect(fingers) {
    let pattern = -1
    const lastStateFrameNum = this.stateFrameNum
    // Open + Stay >= 10 frames
    if (this.isOpen(fingers) && this.isStay(fingers) && this.stateFrameNum >= this.lockFrameThreshold) {
      if (!this.isLock)
        console.log('lock')

      this.isLock = true
      this.stateFrameNum = 0
    }
    if (this.isOpen(fingers) && this.isMove(fingers)) {
      this.isLock = false
      this.stateFrameNum = 0
      // console.log('free');
    }

    // Pattern 1 : Lock + Close >= 20 frames

    if (this.isLock && this.isClose(fingers) && this.stateFrameNum == this.lockCloseFrameThreshold)
      pattern = 1

    // Pattern 2 : Lock + Close + Open, Close <= 20 frames
    if (this.isLock && this.isOpen(fingers) && this.lastState[0] == false && lastStateFrameNum < this.lockCloseFrameThreshold)
      pattern = 2

    const state = this.getState(fingers)
    if (state[0] === this.lastState[0] && state[1] === this.lastState[1]) {
      this.stateFrameNum++
    }
    else {
      this.stateFrameNum = 0
      this.lastState = [state[0], state[1]]
    }

    return pattern
  }
}

class HandDetect {
  sigslot: SigSlot
  netcam: MediaDecoder
  netcamName: string
  constructor(sigSlotName: string, netcamName: string) {
    this.sigslot = new SigSlot(sigSlotName)
    this.netcamName = netcamName
  }

  start() {
    this.netcam = new MediaDecoder()
    this.netcam.open(this.netcamName) // `slave` mode

    this.netcam.on('video', (frame) => { //
      const buf = Buffer.from(frame.arrayBuffer)

      const hands = handnn.detect(buf, { width: 640, height: 360, pixelFormat: handnn.PIX_FMT_BGR24 })
      // const faces = facenn.detect(buf, { width: 640, height: 360, pixelFormat: facenn.PIX_FMT_BGR2RGB24 })

      const fingers = hands.map((hand) => {
        const f = handnn.identify(buf, { width: 640, height: 360, pixelFormat: handnn.PIX_FMT_BGR24 }, hand)
        const { base, fingers } = f
        return { base, curlNum: fingers.map(finger => finger.curl).filter(x => x).length }
      })

      if (fingers.length == 0) {
        this.detector.clear()
      }
      else {
        // console.log(fingers[0].base)
        // console.log(this.detector.lastState, this.detector.getState(fingers[0]), this.detector.lastState === this.detector.getState(fingers[0]), this.detector.stateFrameNum)
        const pattern = this.detector.push(fingers[0])
        if (pattern != -1) {
          console.log('detect pattern = ', pattern)
          this.emit('action', pattern)
        }
      }

      // handnn.identify()
      // console.log('vide')
      // const da = Buffer.from(JSON.stringify({ hands }))

      // handnn.identify()
      // console.log('vide')
      // const da = Buffer.from(JSON.stringify({ hands }))

      // server.sendData(da)
      // server.
      // const fingers = {}
      // socket.send('camera:data', { hands, fingers, isLock: this.detector.isLock })
    })
  }
}

// sigslot.emit('data', { msg: 'heloo ' })

// class HandDetect {
// constructor() {
//
// }
// }
//
// const task = new Task('./task.js', undefined, { directory: module.directory })
