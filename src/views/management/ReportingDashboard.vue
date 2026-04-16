<template lang="pug">

p(class="max-w-175 text-sm text-brand dark:text-emerald-200" tabindex="0") {{ today }}
h1(tabindex="0") Reporting
p(class="text-muted-foreground max-w-175" tabindex="0") Schaue dir hier die aktuellen relevanten Kennzahlen 
  | zu EmpowHR und dem Unternehmen an.
Separator

//- Grid Container for Base Informations
div(class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4")

  ReportingBaseInformation(
    v-for="item in baseInformationArray"
    :label="item.label"
    :value="item.value"
    :unit="item.unit"
    :trend="item.trend"
    :subLabel="item.subLabel"
    :invertTrend="item.invertTrend"
  )

  div(class="col-span-2 border-0 rounded-md")
    CustomBarChart(
      :data="roleDistributionData"
      :height="300"
    )
  Card(class="col-span-3 border-0 rounded-md bg-muted/50")
    CardHeader
      CardTitle Plattform Aktivität
      CardDescription Aktivität der letzten 30 Arbeitstage
    CardContent(class="p-2")
      div(class="h-100 w-full")
        AreaChart(
          :data="activityData"
          index="date"
          :categories="['docs', 'desk', 'time']"
          :colors="['#22c55e', '#3b82f6', '#eab308']"
          :show-legend="true"
          :show-tooltip="true"
          :show-x-axis="false"
          :show-y-axis="true"
          :showXAxis="true"
          :x-axis-options="{ ticks: 6 }"
          class="h-full w-full"
          :margin="{ top: 0, right: 0, bottom: 40, left: 40 }"
        )

  div(class="col-span-5 border-0 rounded-md bg-muted/50")
    Card(class="h-100 p-8") big ass table. Sichtbarkeit über alle Abteilungen

  div(class="col-span-2 border-0 rounded-md bg-muted/50")
    Card(class="h-100 p-8") HR-Kennzahlen

  div(class="col-span-3 border-0 rounded-md bg-muted/50")
    Card(class="h-100 p-8") Offene Vorgägnge

</template>


<script setup lang="ts">
import { ShieldAlertIcon, BriefcaseBusiness } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ReportingBaseInformation from '@/components/app/management/ReportingBaseInformation.vue'
import CustomBarChart from '@/components/app/generic/CustomBarChart.vue'
import Separator from '@/components/ui/separator/Separator.vue';
import { ref, computed, watch, onMounted } from 'vue'
import { getFormattedTodayDate } from '@/lib/dateHelpers'
import { BarChart } from '@/components/ui/chart-bar'
import { AreaChart } from '@/components/ui/chart-area'

const baseInformationArray = ref([
  { label: "Mitarbeitende Gesamt", value: 67, unit: "MA", trend: 4.9, subLabel: "Wachstum zum Vorjahr" },
  { label: "Frauenquote in Führungspositionen", value: "42%", trend: 3, subLabel: "Wachstum zum Vorjahr" },
  { label: "Heute Anwesend", value: 59, unit: "MA", trend: 1.2, subLabel: "Vergleich zum Vorjahrestag" },
  { label: "Krankheitsquote", value: "1.8%", trend: 0.3, subLabel: "Vergleich zum Vorjahrestag", invertTrend: true },
  { label: "Durchschnittliche Betriebszugehörigkeit", value: 5.6, unit: "Jahre", trend: -4, subLabel: "Wachstum zum Vorjahr", invertTrend: false },
])

const roleDistributionData = computed(() => [
  { label: 'Dept. Head', value: 7 },
  { label: 'HR Manager', value: 4 },
  { label: 'Accountant', value: 5 },
  { label: 'IT Admin',   value: 4 },
  { label: 'Executive',  value: 3 },
])
  
const today = getFormattedTodayDate()

const generateActivityData = () => {
  const data = []
  // Wir starten exakt heute: Donnerstag, 16.04.2026
  const today = new Date('2026-04-16') 
  let daysCount = 0
  let offset = 0

  while (daysCount < 30) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    
    const dayOfWeek = date.getDay() // 0 = So, 6 = Sa
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      data.unshift({
        // Das Datum für die X-Achse
        date: date.toLocaleDateString('de-DE', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        docs: Math.floor(Math.random() * 100) + 50,
        desk: Math.floor(Math.random() * 80) + 20,
        time: Math.floor(Math.random() * 60) + 10,
      })
      daysCount++
    }
    offset++
  }
  return data
}

const activityData = generateActivityData()

// Shadcn Chart-Konfiguration
const chartConfig = {
  docs: { label: 'Dokumente + Zertifikate', color: '#22c55e' },
  desk: { label: 'Desksharing', color: '#3b82f6' },
  time: { label: 'Zeitbuchungen', color: '#eab308' },
}

onMounted(async () => {
  
})

</script>

<style lang="css">

</style>