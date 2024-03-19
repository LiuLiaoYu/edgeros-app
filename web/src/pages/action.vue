<script lang="ts" setup>
// const device = reactive({
// list:
// })

const { isFetching, data, execute } = useAuthFetch('/api/device/list').json()

const showBottom = ref(false)

function showPopup() {
  showBottom.value = true
}

// const loading = computed(() => {
// return isFetching.value
// })

function onRefresh() {
  execute()
}
</script>

<template>
  <van-pull-refresh v-model="isFetching" @refresh="onRefresh">
    <!-- <p>刷新次数: {{ count }}</p> -->
    <div w-100vw>
      <van-cell-group title="可控制设备">
        <template v-for="(info, idx) in data.list ?? []" :key="idx">
          <van-cell :title="info.label" :value="info.devid" @click="showPopup()" />
        </template>
      </van-cell-group>

      <van-cell-group title="预设手势">
        <van-cell title="单元格" value="内容" />
        <van-cell title="单元格" value="内容" />
      </van-cell-group>
      <van-cell-group title="动作">
        <van-cell title="单元格" value="内容" />
        <van-cell title="单元格" value="内容" />
      </van-cell-group>
    </div>

    <van-popup
      v-model:show="showBottom"
      position="bottom"
      round
      :style="{ 'height': '50%', 'padding-top': '3em' }"
    >
      <div>状态：{{}}</div>
      <!-- <div>123</div> -->
      <van-button type="">
        开
      </van-button>
      <van-button type="">
        关
      </van-button>
      <van-button type="">
        切换
      </van-button>
    </van-popup>
  </van-pull-refresh>
</template>

<style scope></style>
