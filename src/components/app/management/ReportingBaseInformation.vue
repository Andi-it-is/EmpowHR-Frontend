<template lang="pug">

Item(variant="muted" class="flex flex-col justify-between gap-4 items-start")
  div(class="flex justify-between items-end w-full flex-wrap-reverse")
    p(class="text-sm text-muted-foreground leading-snug max-w-[70%]") {{ label }}
    Badge(:variant="isPositive ? 'positive' : 'destructive'") {{ trendFormatted }}
  div(class="flex items-baseline gap-1.5")
    h3(class="text-5xl leading-none") {{ value }}
    span(class="text-sm text-muted-foreground") {{ unit }}
  div(class="flex items-center gap-2")
    div(class="w-6 h-1 rounded-full" :class="isPositive ? 'bg-positive/50' : 'bg-destructive/50'")
    p(class="text-xs text-muted-foreground") {{ subLabel }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Item } from '@/components/ui/item'

const props = defineProps<{
  label: string
  value: number | string
  unit?: string
  trend: number
  subLabel?: string
  invertTrend?: boolean
}>()

const isPositive = computed(() => {
  return props.invertTrend ? props.trend <= 0 : props.trend >= 0
})

const trendFormatted = computed(() => {
  const sign = props.trend >= 0 ? '+' : ''
  return `${sign}${props.trend}%`
})
</script>

<style lang="css" scoped>
</style>