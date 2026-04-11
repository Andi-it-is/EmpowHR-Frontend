<script setup lang="ts">
import type { BulletLegendItemInterface } from "@unovis/ts"
import type { Component } from "vue"
import { omit } from "@unovis/ts"
import { VisTooltip } from "@unovis/vue"
import { createApp } from "vue"
import { ChartTooltip } from "."

const props = defineProps<{
  selector: string
  index: string
  category?: string  // NEU
  items?: BulletLegendItemInterface[]
  valueFormatter?: (tick: number, i?: number, ticks?: number[]) => string
  customTooltip?: Component
}>()

const wm = new WeakMap()

function template(d: any, i: number, elements: (HTMLElement | SVGElement)[]) {
  const valueFormatter = props.valueFormatter ?? ((tick: number) => `${tick}`)

  if (props.index in d) {
    // XY-Chart Pfad – unverändert
    if (wm.has(d)) {
      return wm.get(d)
    }
    else {
      const componentDiv = document.createElement("div")
      const omittedData = Object.entries(omit(d, [props.index])).map(([key, value]) => {
        const legendReference = props.items?.find(i => i.name === key)
        return { ...legendReference, value: valueFormatter(value) }
      })
      const TooltipComponent = props.customTooltip ?? ChartTooltip
      createApp(TooltipComponent, { title: d[props.index], data: omittedData }).mount(componentDiv)
      wm.set(d, componentDiv.innerHTML)
      return componentDiv.innerHTML
    }
  }
  else {
    // Donut-Segment Pfad – kein WeakMap Cache (Farbe ändert sich pro Segment)
    const data = d.data
    const style = getComputedStyle(elements[i]!)
    const color = style.fill
    const categoryKey = props.category ?? props.index
  
    const omittedData = [{
      name: data[props.index],
      value: valueFormatter(data[categoryKey]),
      color,
    }]

    const componentDiv = document.createElement("div")
    const TooltipComponent = props.customTooltip ?? ChartTooltip
    createApp(TooltipComponent, {
      title: data[props.index],
      data: omittedData,
    }).mount(componentDiv)

    return componentDiv.innerHTML
  }
}
</script>

<template>
  <VisTooltip
    :horizontal-shift="20"
    :vertical-shift="20"
    :triggers="{
      [selector]: template,
    }"
  />
</template>