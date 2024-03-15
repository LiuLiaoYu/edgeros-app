<script lang="ts" setup>
import mpegts from 'mpegts'

const props = definePro

if (mpegts.getFeatureList().mseLivePlayback) {
  const videoElement = document.getElementById('videoElement')
  const player = mpegts.createPlayer({
    type: 'flv', // could also be mpegts, m2ts, flv
    isLive: true,
    url: `wss://${document.domain}:${window.location.port}/live.flv`,
  })
  player.attachMediaElement(videoElement)
  player.load()
  // player.play()
}
</script>

<template>
  <div>
    <video />
  </div>
</template>

<style scope></style>
