<script lang="ts" setup>
const safeAreaStyle = computed(() => {
  return {
    padding: `${edgerSafeAreaInsets.value?.top ?? 0}px ${edgerSafeAreaInsets.value?.right ?? 0}px ${edgerSafeAreaInsets.value?.bottom ?? 0}px ${edgerSafeAreaInsets.value?.left ?? 0}px`,
  }
})
</script>

<template>
  <div
    :style="safeAreaStyle"
  >
    <slot />
  </div>
</template>

<style scope></style>
