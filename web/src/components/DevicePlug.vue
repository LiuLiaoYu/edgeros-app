<script lang="ts" setup>
const props = defineProps<{
  state: string
  devid: string
  // bright: number
  // color: [number, number, number]
}>()

const emit = defineEmits(['update:state'])
const { state } = useVModels(props, emit)

const stateBoolean = computed({
  get() { return state.value === 'on' },
  set(newValue) { state.value = newValue ? 'on' : 'off' },
})

watchDebounced(
  state,
  () => {
    useAuthFetch('/api/device/control').post({ value: toDevice(props.devid).set({ state: state.value }).value }).json()
  },
  { debounce: 300, maxWait: 1000 },
)
</script>

<template>
  <van-cell-group inset>
    <van-cell title="开关">
      <van-switch v-model="stateBoolean" />
    </van-cell>
  </van-cell-group>
</template>

<style scope>

</style>
