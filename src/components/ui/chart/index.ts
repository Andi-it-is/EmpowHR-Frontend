import type { Ref } from "vue"
import { provide, inject } from "vue"

export const THEMES = {
  light: "",
  dark: ".dark",
} as const

export type ChartConfig = Record<string, {
  label?: string
  color?: string
  icon?: any
  theme?: Partial<Record<keyof typeof THEMES, string>>
}>

interface ChartContext {
  id: string
  config: Ref<ChartConfig>
}

const CHART_CONTEXT_KEY = Symbol("chart-context")

export function provideChartContext(context: ChartContext) {
  provide(CHART_CONTEXT_KEY, context)
}

export function useChartContext() {
  return inject<ChartContext>(CHART_CONTEXT_KEY)!
}

export function useChart() {
  const context = inject<ChartContext>(CHART_CONTEXT_KEY)
  if (!context) throw new Error("useChart must be used within a ChartContainer")
  return context
}

export { default as ChartCrosshair } from "./ChartCrosshair.vue"
export { default as ChartLegend } from "./ChartLegend.vue"
export { default as ChartLegendContent } from "./ChartLegendContent.vue"
export { default as ChartSingleTooltip } from "./ChartSingleTooltip.vue"
export { default as ChartTooltip } from "./ChartTooltip.vue"
export { default as ChartContainer } from "./ChartContainer.vue"

export function defaultColors(count: number = 3) {
  const quotient = Math.floor(count / 2)
  const remainder = count % 2

  const primaryCount = quotient + remainder
  const secondaryCount = quotient
  return [
    ...Array.from(new Array(primaryCount).keys()).map(i => `hsl(var(--vis-primary-color) / ${1 - (1 / primaryCount) * i})`),
    ...Array.from(new Array(secondaryCount).keys()).map(i => `hsl(var(--vis-secondary-color) / ${1 - (1 / secondaryCount) * i})`),
  ]
}

export * from "./interface"