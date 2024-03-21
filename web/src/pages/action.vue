<script lang="ts" setup>
const iconMap = {
  'plug': 'i-iconoir:plug-type-g',
  'light.belt': 'i-material-symbols:lightbulb-outline-rounded',
}

const activeNames = ref([])
const { isFetching, data: dat, execute } = useAuthFetch('/api/device/list').json()

const data = ref({
  list: [],
})

watchEffect(async () => {
  data.value.list = dat.value.list || []
  // data.value.list.filter(dev => dev.type === 'light.belt').array.forEach((dev) => {
  // dev.state.start = 0
  // dev.state.end = 150
  // })
})

// const state = computed(()=>{

// const list = infoData.value.list.

// })

function onRefresh() {
  execute()
}
</script>

<template>
  <van-pull-refresh v-model="isFetching" @refresh="onRefresh">
    <div w-100vw>
      <van-cell-group title="可控制设备">
        <van-collapse v-model="activeNames" title="可控制设备">
          <template v-for="(info, idx) in (data.list || [])" :key="idx">
            <van-collapse-item :label="info.devid" :name="idx" :disabled="!info.online || null">
              <template #title>
                {{ info.label }}
                <van-tag :type="info.online ? 'success' : 'danger'" plain>
                  {{ info.online ? '在线' : '离线' }}
                </van-tag>
              </template>
              <template #icon>
                <span :class="iconMap[info.type]" m-auto mr-0.5em text-lg />
              </template>
              {{ info.state }}
              <template v-if="info.type === 'plug'">
                <DevicePlug
                  v-model:state="info.state.state"
                  :devid="info.devid"
                />
              </template>
              <template v-else>
                <DeviceLight
                  v-model:data="info.state"
                  :devid="info.devid"
                />
              </template>
            </van-collapse-item>
          </template>
        </van-collapse>
      </van-cell-group>
    </div>
  </van-pull-refresh>
</template>

<style scope>
  .custom-button {
    width: 26px;
    color: #fff;
    font-size: 10px;
    line-height: 18px;
    text-align: center;
    background-color: var(--van-primary-color);
    border-radius: 100px;
  }
</style>
