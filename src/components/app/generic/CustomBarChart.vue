<script setup lang="ts">
import type { ChartConfig } from "@/components/ui/chart"
import { VisAxis, VisGroupedBar, VisXYContainer } from "@unovis/vue"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ChartContainer from "@/components/ui/chart/ChartContainer.vue"
import { ChartTooltip, ChartCrosshair, ChartLegend } from '@/components/ui/chart' 
import { computed } from "vue"
import Separator from "@/components/ui/separator/Separator.vue"

// TODO propify
const chartData = [
  { label: 'Department Head', value: 7, color: '#9366c1' },
  { label: 'HR Manager', value: 4, color: '#22c55e' },
  { label: 'Accountant', value: 5, color: '#f59e0b' },
  { label: 'IT Admin',   value: 4, color: '#3b82ff' },
  { label: 'Executive',  value: 3, color: '#ff1157' },
]

type Data = typeof chartData[number]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const formattedItems = computed(() => 
  chartData.map(d => ({
    name: d.label,
    color: d.color,
    value: d.value
  }))
)

</script>

<template>
  <Card class="bg-muted/50 border-0">
    <CardHeader>
      <CardTitle>Rollenverteilung</CardTitle>
      <CardDescription>Verteilung der speziellen Rollen</CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer :config="chartConfig">
        <VisXYContainer
          :data="chartData"
          :margin="{ left: 25, right: 20, top: 20 }" 
          :y-domain="[0, 8]"
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
  </Card>
</template>