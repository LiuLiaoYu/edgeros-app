<script setup lang="ts">
import { showToast } from 'vant'

const viewer = ref()

// const ws = new WebSocket(`wss://${document.location.hostname}:3000`)
// ws.binaryType = 'arraybuffer'

const record = {
  mediaRecorder: null as any,
  video: viewer.value,
  pause() {
    this.video.pause()
    this.mediaRecorder.pause()
  },

}

onMounted(() => {
  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  }).then((mediaStream) => {
    viewer.value.srcObject = mediaStream
    record.mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm;codecs=h264' })
    record.mediaRecorder.start(10)
    record.mediaRecorder.ondataavailable = (e: BlobEvent) => {
      // ws.send(e.data)
    }
  })
})

function handlePause() {
  viewer.value.pause()
  record.pause()
}

const types = [
  'video/webm',
  'audio/webm',
  'video/webm;codecs=vp8',
  'video/webm;codecs=daala',
  'video/webm;codecs=h264',
  'audio/webm;codecs=opus',
  'video/mpeg',
]

for (const type of types) {
  console.log(
    `Is ${type} supported? ${
      MediaRecorder.isTypeSupported(type) ? 'Maybe!' : 'Nope :('
    }`,
  )
}
</script>

<template>
  <div flex flex-col items-center>
    <div max-w-50rem w-full flex>
      <video
        ref="viewer"
        muted controls autoplay w-full
      />
    </div>
  </div>
</template>

<style scope></style>
