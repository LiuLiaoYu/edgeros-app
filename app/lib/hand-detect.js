'use strict';

var handnn = require('handnn');
var iosched = require('iosched');
var MediaDecoder = require('mediadecoder');
var SigSlot = require('sigslot');

const args = ARGUMENT;
console.log(args);
class SeqDetect {
    // |x - x1| + |y - y1| <= stayThreshold
    constructor() {
        this.lockFrameThreshold = 10;
        this.lockCloseFrameThreshold = 20;
        this.stayThreshold = 50;
        this.isLock = false;
        this.lastState = [false, false];
        this.stateFrameNum = 0;
        this.lastPos = [-1, -1];
    }
    clear() {
        this.isLock = false;
        this.lastState = [false, false];
        this.stateFrameNum = 0;
        this.lastPos = [-1, -1];
    }
    isOpen(fingers) {
        return fingers.curlNum <= 1; // ?
    }
    isStay(fingers) {
        const dist = (this.lastPos[0] - fingers.base.x) + (this.lastPos[1] - fingers.base.y);
        return this.lastPos[0] == -1 || dist <= this.stayThreshold;
    }
    isClose(fingers) {
        return !this.isOpen(fingers);
    }
    isMove(fingers) {
        return !this.isStay(fingers);
    }
    push(fingers) {
        const pattern = this.detect(fingers);
        this.lastPos[0] = fingers.base.x;
        this.lastPos[1] = fingers.base.y;
        return pattern;
    }
    getState(fingers) {
        return [this.isOpen(fingers), this.isStay(fingers)];
    }
    detect(fingers) {
        let pattern = -1;
        const lastStateFrameNum = this.stateFrameNum;
        // Open + Stay >= 10 frames
        if (this.isOpen(fingers) && this.isStay(fingers) && this.stateFrameNum >= this.lockFrameThreshold) {
            if (!this.isLock)
                console.log('lock');
            this.isLock = true;
            this.stateFrameNum = 0;
        }
        if (this.isOpen(fingers) && this.isMove(fingers)) {
            this.isLock = false;
            this.stateFrameNum = 0;
            // console.log('free');
        }
        // Pattern 1 : Lock + Close >= 20 frames
        if (this.isLock && this.isClose(fingers) && this.stateFrameNum == this.lockCloseFrameThreshold)
            pattern = 1;
        // Pattern 2 : Lock + Close + Open, Close <= 20 frames
        if (this.isLock && this.isOpen(fingers) && this.lastState[0] == false && lastStateFrameNum < this.lockCloseFrameThreshold)
            pattern = 2;
        const state = this.getState(fingers);
        if (state[0] === this.lastState[0] && state[1] === this.lastState[1]) {
            this.stateFrameNum++;
        }
        else {
            this.stateFrameNum = 0;
            this.lastState = [state[0], state[1]];
        }
        return pattern;
    }
}
class HandDetect {
    constructor(sigSlotName, netcamName) {
        this.sigslot = new SigSlot(sigSlotName);
        this.netcamName = netcamName;
        this.detector = new SeqDetect();
        this.running = true;
    }
    start() {
        this.netcam = new MediaDecoder();
        this.netcam.open(this.netcamName); // `slave` mode
        // sigslot-event `camera:detect`
        // hands : prob, x0, x1, y0, y1
        // pattern : gesture id
        // isLock : hand in lock state
        // on `video`
        this.netcam.on('video', (frame) => {
            // console.log('here')
            const buf = Buffer.from(frame.arrayBuffer);
            // const faces = facenn.detect(buf, { width: 640, height: 360, pixelFormat: facenn.PIX_FMT_BGR2RGB24 })
            const hands = handnn.detect(buf, { width: 640, height: 360, pixelFormat: handnn.PIX_FMT_BGR24 });
            const fingersList = hands.map((hand) => {
                const res = handnn.identify(buf, { width: 640, height: 360, pixelFormat: handnn.PIX_FMT_BGR24 }, hand);
                const { base, fingers } = res;
                return { base, curlNum: fingers.map(finger => finger.curl).filter(x => x).length };
            });
            let pattern;
            if (fingersList.length == 0)
                this.detector.clear();
            else
                pattern = this.detector.push(fingersList[0]);
            this.sigslot.emit('camera:detect', {
                hands,
                pattern,
                isLock: this.detector.isLock,
            });
        });
        this.netcam.start();
    }
    stop() {
        this.netcam.close();
        this.sigslot.off();
        this.running = false;
    }
}
const handdetect = new HandDetect(args.sigSlotName, args.netcamName);
handdetect.start();
while (handdetect.running)
    iosched.poll();
console.log('task over');
