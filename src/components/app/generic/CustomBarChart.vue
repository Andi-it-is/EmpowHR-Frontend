<script setup lang="ts">
import type { ChartConfig } from "@/components/ui/chart"
import { VisAxis, VisGroupedBar, VisXYContainer } from "@unovis/vue"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ChartContainer from "@/components/ui/chart/ChartContainer.vue"
import { ChartTooltip, ChartCrosshair, ChartLegend } from '@/components/ui/chart' 
import { computed } from "vue"
import Separator from "@/components/ui/separator/Separator.vue"

interface BarChartDataObject {
  label: string,
  value: number,
  color: string   // hex-code
}

const props = defineProps<{
  data: BarChartDataObject[]
  yDomain: number[]
}>()

const chartData = props.data

type Data = typeof chartData[number]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

</script>

<template>
  <div class="col-span-2">
    <CardHeader>
      <CardTitle>Rollenverteilung</CardTitle>
      <CardDescription>Verteilung der speziellen Rollen</CardDescription>
    </CardHeader>
    <CardContent class="p-2">
      <ChartContainer :config="chartConfig" class="max-h-100 w-full">
        <VisXYContainer
          :data="chartData"
          :margin="{ left: 25, right: 20, top: 20 }" 
          :y-domain="props.yDomain"
          :fit-height="true"
        >

          <VisGroupedBar
            :x="(_: Data, i: number) => i"
            :y="(d: Data) => d.value"
            :color="(d: Data) => d.color"
            :rounded-corners="10"
          />

          <VisAxis
            type="x"
            :tick-line="false"
            :domain-line="false"
            :grid-line="false"
            :tick-format="(i: number) => chartData[i]?.label ?? ''"
            :tick-values="chartData.map((_, i) => i)"
          />
          
          <VisAxis
            type="y"
            :num-ticks="4"
            :tick-line="false"
            :domain-line="false"
            :grid-line="true" 
            :tick-format="(y: number) => y.toString()"
          />
        </VisXYContainer>
      </ChartContainer>
    </CardContent>

    <Separator class="mb-4" />

    <CardContent>
      <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
        <div v-for="item in chartData" :key="item.label" class="flex items-center gap-2 text-sm">
          <span class="h-2 w-2 rounded-full shrink-0" :style="{ backgroundColor: item.color }" />
          
          <div class="flex items-center gap-1.5">
            <span class="text-muted-foreground whitespace-nowrap">{{ item.label }}</span>
            <span class="font-medium">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </div>
</template>