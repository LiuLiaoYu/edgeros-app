<script lang="ts" setup>
const props = defineProps<{
  cameras: {
    ip: string
  }[]
}>()
</script>

<template>
  <div>
    <van-cell-group>
      <van-cell title="单元格">
        <template #title>
          <span i-fluent:camera-dome-24-filled text-lg />
          <span class="custom-title">单元格</span>
          <van-tag type="primary">
            <!-- 标签 -->
          </van-tag>
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<style scope></style>
