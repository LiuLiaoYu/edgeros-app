<script lang="ts" setup>
import { socketClient } from '~/composables/sockets'

const currentPattern = ref(-1)

socketClient.client.on('camera:data', ({ pattern }) => {
  currentPattern.value = pattern ?? -1
})
</script>

<template>
  <div w-100vw>
    <van-cell-group title="预设手势">
      <van-cell title="快速握拳" :class="{ action: currentPattern === 2 }">
        <template #icon>
          <span i-clarity:cursor-hand-open-line m-auto mr-0.5em />
        </template>
      </van-cell>
      <van-cell title="终止握拳" :class="{ action: currentPattern === 1 }">
        <template #icon>
          <span i-ph:hand-fist m-auto mr-0.5em />
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group title="动作">
      <van-cell title="智能氛围灯1" label="切换" value="快速握拳触发" />
      <van-cell title="智能插座" label="切换" value="终止握拳触发" />
    </van-cell-group>
  </div>
</template>

<style scope>
.action{
  background-color: #ccc;
}
</style>
