<script lang="ts" setup>
import { toDevice } from '../composables/device/edger-device'

const props = defineProps<{
  data: {
    state: string
    bright: number
    color: [number, number, number]
    start: number
    end: number
  }
  devid: string
}>()

// const emit = defineEmits(['update:state', 'update:bright', 'update:color'])
// const { state, bright, color } = useVModels(props, emit)

const emit = defineEmits(['update:data'])
const { data } = useVModels(props, emit)

const stateBoolean = computed({
  get() { return data.value.state === 'on' },
  set(newValue) { data.value.state = newValue ? 'on' : 'off' },
})

const colorString = computed({
  get() { return `#${data.value.color.map(num => num.toString(16).padStart(2, '0')).join('')}` },
  set(newValue) {
    data.value.color = [Number.parseInt(newValue.slice(1, 3), 16), Number.parseInt(newValue.slice(3, 5), 16), Number.parseInt(newValue.slice(5, 7), 16)]
  },
})

const range = computed({
  get() { return [data.value.start, data.value.end] },
  set(newValue) {
    [data.value.start, data.value.end] = newValue
    // data.value.color = [Number.parseInt(newValue.slice(1, 3), 16), Number.parseInt(newValue.slice(3, 5), 16), Number.parseInt(newValue.slice(5, 7), 16)]
  },

})

watchDebounced(
  data,
  () => {
    useAuthFetch('/api/device/control').post({ value: toDevice(props.devid).set({ ...data.value, start: range.value[0], end: range.value[1] }).value }).json()
  },
  { debounce: 300, maxWait: 1000, deep: true },
)
</script>

<template>
  <van-cell-group inset>
    <van-cell title="开关">
      <van-switch v-model="stateBoolean" />
    </van-cell>
    <van-cell title="亮度">
      <template #label>
        <van-slider v-model="data.bright" mt-2em max="255">
          <template #button>
            <div class="custom-button">
              {{ data.bright }}
            </div>
          </template>
        </van-slider>
      </template>
    </van-cell>
    <van-cell title="颜色">
      <input v-model="colorString" type="color">
    </van-cell>

    <van-cell title="范围">
      <template #label>
        <van-slider v-model="range" range mt-2em max="150">
          <template #left-button>
            <div class="custom-button start-btn">
              {{ range[0] }}
            </div>
          </template>
          <template #right-button>
            <div class="custom-button end-btn">
              {{ range[1] }}
            </div>
          </template>
        </van-slider>
      </template>
    </van-cell>
  </van-cell-group>
</template>

<style scope>
.custom-button {
  width: 26px;
  color: #fff;
  font-size: 10px;
  line-height: 18px;
  text-align: center;
  border-radius: 100px;
}

.start-btn{
  background-color: var(--van-primary-color);
}

.end-btn{
  background-color: #4ade80
}
</style>
