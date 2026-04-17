<script setup lang="ts">
import type { BulletLegendItemInterface } from "@unovis/ts"
import { BulletLegend } from "@unovis/ts"
import { VisBulletLegend } from "@unovis/vue"
import { nextTick, onMounted, ref } from "vue"
import { buttonVariants } from '@/components/ui/button'

const props = withDefaults(defineProps<{ items: BulletLegendItemInterface[] }>(), {
  items: () => [],
})

const emits = defineEmits<{
  "legendItemClick": [d: BulletLegendItemInterface, i: number]
  "update:items": [payload: BulletLegendItemInterface[]]
}>()

const elRef = ref<HTMLElement>()

function keepStyling() {
  const selector = `.${BulletLegend.selectors.item}`
  nextTick(() => {
    const elements = elRef.value?.querySelectorAll(selector)
    const classes = buttonVariants({ variant: "ghost", size: "xs" }).split(" ")

    elements?.forEach(el => el.classList.add(...classes, "!inline-flex", "!mr-2"))
  })
}

onMounted(() => {
  keepStyling()
})

function onLegendItemClick(d: BulletLegendItemInterface, i: number) {
  emits("legendItemClick", d, i)
  const isBulletActive = !props.items[i]!.inactive
  const isFilterApplied = props.items.some(i => i.inactive)
  if (isFilterApplied && isBulletActive) {
    // reset filter
    emits("update:items", props.items.map(item => ({ ...item, inactive: false })))
  }
  else {
    // apply selection, set other item as inactive
    emits("update:items", props.items.map(item => item.name === d.name ? ({ ...d, inactive: false }) : { ...item, inactive: true }))
  }
  keepStyling()
}
</script>

<template>
  <div
    ref="elRef"
    class="flex flex-wrap"
    :style="{ '--vis-legend-bullet-size': '16px' }"
  >
    <button
      v-for="(item, i) in items"
      :key="item.name"
      :class="buttonVariants({ variant: 'ghost', size: 'xs' })"
      class="inline-flex! mr-2! mb-1"
      @click="onLegendItemClick(item, i)"
    >
      <span
        class="inline-block rounded-full shrink-0"
        :style="{
          width: 'var(--vis-legend-bullet-size)',
          height: 'var(--vis-legend-bullet-size)',
          backgroundColor: Array.isArray(item.color) ? item.color[0] : item.color,
          opacity: item.inactive ? 0.3 : 1
        }"
      />
      <span class="text-muted-foreground" :style="{ opacity: item.inactive ? 0.3 : 1 }">{{ item.name }}</span>
    </button>
  </div>
</template>
