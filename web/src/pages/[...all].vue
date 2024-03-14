<script lang="ts" setup>
import unknownAreaWarn from '~/assets/paimeng.mp3'
</script>

<template>
  <!-- <div m-auto h-10em flex flex-col> -->
  <!-- <div i-akar-icons:chat-error m-auto text-5xl text-gray /> -->
  <!-- <div m-auto text-gray> -->
  <!-- 前面的区域，以后再来探索吧 -->
  <!-- </div> -->
  <van-empty image="error" description="前面的区域，以后再来探索吧" style="color: white" />
  <audio :src="unknownAreaWarn" autoplay />
  <!-- </div> -->
</template>
