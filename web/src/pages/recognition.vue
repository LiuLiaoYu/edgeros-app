<script lang="ts" setup>

</script>

<template>
  <div w-100vw>
    <van-cell-group title="预设手势">
      <van-cell title="快速握拳">
        <template #icon>
          <span i-clarity:cursor-hand-open-line m-auto mr-0.5em />
        </template>
      </van-cell>
      <van-cell title="终止握拳">
        <template #icon>
          <span i-ph:hand-fist m-auto mr-0.5em />
        </template>
      </van-cell>
      <!-- <van-cell title="单元格" value="内容" /> -->
    </van-cell-group>
    <van-cell-group title="动作">
      <van-cell title="智能氛围灯1" label="切换" value="快速握拳触发" />
      <van-cell title="智能插座" label="切换" value="终止握拳触发" />
    </van-cell-group>
  </div>
</template>

<style scope></style>
