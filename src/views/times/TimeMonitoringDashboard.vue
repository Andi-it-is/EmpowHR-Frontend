<template lang="pug">

h1(tabindex="0") Zeiten Monitoring
p(class="text-muted-foreground max-w-175" tabindex="0") Die Graphische Übersicht für alle Abwesenheiten und Arbeitszeiten im Unternehmen. 

div(v-if="!isLoaded" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4")
  Card(class="col-span-4")
    CardHeader
      Skeleton(class="h-5 w-40")
      Skeleton(class="h-4 w-64 mt-1")
    CardContent(class="flex flex-col gap-3")
      Skeleton(v-for="i in 5" :key="i" class="h-9 w-full")
div(v-else)
  
  Card(class="max-w-fit mt-4 mb-2")
    CardHeader
      CardTitle Zeitraum
      CardDescription Wähle das Jahr aus, für welches 
    CardContent
      div(class="flex flex-col justify-center gap-1")
        label(for="yearSelect" class="text-sm font-medium") Jahr
        Select(:model-value="selectedYear.toString()" @update:model-value="v => selectedYear = Number(v)")
          SelectTrigger(id="yearSelect" class="w-32")
            SelectValue
          SelectContent
            SelectItem(v-for="year in availableYears" :key="year" :value="year.toString()")
              | {{ year }}

  div(class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4")
    //- 1st Chart Worktime
    Card(class="col-span-1 lg:col-span-2 pb-8")
      Tabs(v-model="activeTabWorkHours" class="w-full")
        CardHeader(class="flex flex-row items-center justify-between space-y-0 pb-6")
          div
            CardTitle(class="mb-2") Arbeitszeiten
            CardDescription(v-if="activeTabWorkHours === 'entries'") Gruppiert nach der Anzahl an Einträgen im Zeitkonto
            CardDescription(v-if="activeTabWorkHours === 'hours'") Gruppiert nach tatsächlichen Stunden
          
          TabsList(class="grid w-50 grid-cols-2")
            TabsTrigger(value="entries") Einträge
            TabsTrigger(value="hours") Stunden

        CardContent(class="p-2")
          //- Tab: STUNDEN
          TabsContent(value="hours" class="mt-0 focus-visible:ring-0")
            div(class="w-full mt-6 relative px-4 max-w-80 md:max-w-full mx-auto py-4 h-64")
              DonutChart(
                :data="workTypeHoursChartData"
                :category="'value'"
                :index="'name'"
                :colors="workingLocationColorArray"
                :show-tooltip="true"
                :show-legend="true"
                :show-label="false"
                :arc-width="40"
                class="h-full w-full"
                :value-formatter="(v) => `${v} h`"
              )
              div(class="absolute inset-0 flex flex-col items-center justify-center mb-8 md:mb-4 pointer-events-none")
                span(class="text-[clamp(24px,4vw,36px)] font-bold leading-none") {{ totalHours }}
                span(class="text-[10px] text-muted-foreground uppercase font-medium tracking-wider") Gesamt Stunden

          //- Tab: EINTRÄGE
          TabsContent(value="entries" class="mt-0 focus-visible:ring-0")
            div(class="w-full mt-6 relative px-4 max-w-80 md:max-w-full mx-auto py-4 h-64")
              DonutChart(
                :data="entryCountChartData"
                :category="'value'"
                :index="'name'"
                :colors="workingLocationColorArray"
                :show-tooltip="true"
                :show-legend="true"
                :show-label="false"
                :arc-width="40"
                class="h-full w-full"
              )
              div(class="absolute inset-0 flex flex-col items-center justify-center mb-8 md:mb-4 pointer-events-none")
                span(class="text-[clamp(24px,4vw,36px)] font-bold leading-none") {{ totalEntries }}
                span(class="text-[10px] text-muted-foreground uppercase font-medium tracking-wider") Einträge
    
    //- 2nd Chart only Abscences and their distribution
    Card(class="col-span-1 lg:col-span-2 pb-8")
      CardHeader
        CardTitle Abwesenheitszeiten
        CardDescription Gruppiert nach Tagen
      CardContent
        div(class="w-full mt-6 relative px-4 max-w-80 md:max-w-full mx-auto py-4 h-64")
          DonutChart(
            :data="absenceTypesHoursChartData"
            :category="'value'"
            :index="'name'"
            :colors="absenceTypesColorArray"
            :show-tooltip="true"
            :show-legend="true"
            :show-label="false"
            :arc-width="40"
            :value-formatter="(val: number) => `${val} Tage`"
            class="h-full w-full"
          )
          div(class="absolute inset-0 flex flex-col items-center justify-center mb-8 md:mb-4 pointer-events-none")
            span(class="text-[clamp(24px,4vw,36px)] font-bold leading-none") {{ totalAbsenceDays }}
            span(class="text-[10px] text-muted-foreground uppercase font-medium tracking-wider") Tage

</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { Skeleton } from '@/components/ui/skeleton'
import BarChart from '@/components/ui/chart-bar/BarChart.vue';
import AreaChart from '@/components/ui/chart-area/AreaChart.vue';
import DonutChart from '@/components/ui/chart-donut/DonutChart.vue';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { type TimeEntry, type TimeEntryFilter, timeEntryService } from '@/services/timeEntry.service';
import { TimeEntryTypeColorMap, TimeEntryTypeColors, TimeEntryTypeLabels, workingLocationColorMap, workingLocationLabels } from '@/lib/enumTranslaters';
import { TimeEntryType, WorkingLocation } from '@/constants/enums/timeRecodring.enum';
import { userTimeAccountService } from '@/services/userTImeAccount.service';


const workingLocationColorArray = Object.values(workingLocationColorMap);
const absenceTypesColorArray = computed(() =>
  absenceTypesHoursChartData.value.map((entry) => entry.color)
)
const yearlyWorkHoursColorArray = ['#10b981', '#737373']


const workTypeHoursChartData = computed(() => {

  const grouped: Record<string, number> = {
    [WorkingLocation.OFFICE]: 0,
    [WorkingLocation.REMOTE]: 0,
    [WorkingLocation.FIELD_SERVICE]: 0,
  }

  timeEntryData.value?.forEach((entry: TimeEntry) => {
    const loc = entry.working_location
    if (loc && grouped[loc] !== undefined) {
      grouped[loc] += entry.recorded_hours
    }
  })

  // In Array umwandeln
  return Object.entries(grouped).map(([name, value]) => ({
    name: workingLocationLabels[name as WorkingLocation] ?? name,
    value: Math.round(value * 100) / 100,
  }))
})

const totalHours = computed(() =>
  workTypeHoursChartData.value.reduce((sum, d) => sum + d.value, 0)
)

const entryCountChartData = computed(() => {
  const counts: Record<string, number> = {
    [WorkingLocation.OFFICE]: 0,
    [WorkingLocation.REMOTE]: 0,
    [WorkingLocation.FIELD_SERVICE]: 0,
  }

  timeEntryData.value?.forEach((entry: TimeEntry) => {
    const loc = entry.working_location
    if (loc && counts[loc] !== undefined) {
      // Hier zählen wir einfach nur +1 pro Eintrag
      counts[loc] += 1
    }
  })

  return Object.entries(counts).map(([name, value]) => ({
    name: workingLocationLabels[name as WorkingLocation] ?? name,
    value,
  }))
})

const totalEntries = computed(() => {
  return entryCountChartData.value.reduce((acc, curr) => acc + curr.value, 0)
})

const totalAbsenceDays = computed(() => {
  const total = absenceTypesHoursChartData.value.reduce(
    (sum, entry) => sum + entry.value, 0
  )
  return Math.round(total * 100) / 100
})

const activeTabWorkHours = ref<'hours' | 'entries'>('entries');

const absenceTypesHoursChartData = computed(() => {
  const grouped: Record<string, number> = Object.fromEntries(
    Object.values(TimeEntryType)
      .filter(type => type !== TimeEntryType.WORK)
      .map(type => [type, 0])
  )

  timeEntryData.value?.forEach((entry: TimeEntry) => {
    const type = entry.type
    if (type !== TimeEntryType.WORK && grouped[type] !== undefined) {
      grouped[type] += entry.recorded_hours
    }
  })

  return Object.entries(grouped).map(([name, value]) => ({
    name: TimeEntryTypeLabels[name as TimeEntryType] ?? name,
    value: (Math.round(value * 100) / 100) / shouldWorkHoursTimeData.value!,
    color: TimeEntryTypeColorMap[name as TimeEntryType], // <-- hier noch als enum key
  }))
})

const currentYear = new Date().getFullYear()
const availableYears = computed(() =>
  Array.from({ length: 11 }, (_, i) => currentYear - i)
)

const selectedYear = ref(currentYear)

const yearFilter = computed((): TimeEntryFilter => ({
  start_date: `${selectedYear.value}-01-01`,
  end_date: `${selectedYear.value}-12-31`,
}))

const shouldWorkHoursTimeData = ref<number>() 
const isLoaded = ref(false)
const timeEntryData = ref<TimeEntry[]>([])

const loadData = async () => {
  const result = await timeEntryService.listAllTimeEntriesByFilter(yearFilter.value)
  timeEntryData.value = result
}

watch(selectedYear, loadData)


onMounted(async () => {
    
  timeEntryData.value = await timeEntryService.listAllTimeEntriesByFilter(yearFilter.value)
  const timeAcc = await userTimeAccountService.getMyTimeAccount()
  shouldWorkHoursTimeData.value = timeAcc.shouldWorkHoursPerWeek

  isLoaded.value = true
})

</script>

