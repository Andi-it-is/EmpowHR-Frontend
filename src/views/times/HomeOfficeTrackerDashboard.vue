<template lang="pug">

h1(tabindex="0") Home Office Tracker
p(class="text-muted-foreground max-w-175" tabindex="0") Die Graphische Übersicht für deine Arbeitszeiten im Unternehmen. 

div(v-if="!isLoaded" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4")
  Card(class="col-span-4")
    CardHeader
      Skeleton(class="h-5 w-40")
      Skeleton(class="h-4 w-64 mt-1")
    CardContent(class="flex flex-col gap-3")
      Skeleton(v-for="i in 5" :key="i" class="h-9 w-full")
div(v-else)
  
  //- Bar Charts and Ring Chart for Distributions
  //- div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4")
  //-   Card(class="col-span-2")
  //-     CardHeader
  //-       CardTitle Plattform Aktivität
  //-       CardDescription Datenbanktransaktionen der letzten 30 Arbeitstage.
  //-     CardContent(class="p-2")
  //-       div(class="h-100 w-full")
  //-         BarChart(
  //-           :data="timeEntryData"
  //-           index="date"
  //-           :categories="activityDataCategories"
  //-           :colors="activityDataColors"
  //-           :show-legend="true"
  //-           :show-tooltip="true"
  //-           :show-x-axis="false"
  //-           :show-y-axis="true"
  //-           :showXAxis="true"
  //-           :x-axis-options="{ ticks: 6 }"
  //-           class="h-full w-full"
  //-           :margin="{ top: 0, right: 0, bottom: 40, left: 40 }"
  //-         )


</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Skeleton } from '@/components/ui/skeleton'
import BarChart from '@/components/ui/chart-bar/BarChart.vue';
import AreaChart from '@/components/ui/chart-area/AreaChart.vue';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, } from '@/components/ui/card'
import { type TimeEntry, timeEntryService } from '@/services/timeEntry.service';


const isLoaded = ref(false)
const timeEntryData = ref<TimeEntry[]>([])

onMounted(async () => {
    
  timeEntryData.value = await timeEntryService.listAllTimeEntriesAvailable()

  isLoaded.value = true
})

/**
 * [
  {
    "id": "1dc47cc1-4121-4e6b-b711-b81f09b9e57c",
    "working_location": null,
    "type": "VACATION",
    "start_date": "2026-04-23T22:00:00.000Z",
    "end_date": "2026-04-30T21:59:00.000Z",
    "interruption_hours": 48,
    "recorded_hours": 40,
    "is_confirmed": false,
    "created_at": "2026-04-21T09:11:54.716Z",
    "updated_at": "2026-04-21T09:11:54.716Z"
  },
  {
    "id": "9feadf08-3097-4624-b036-6f6f0ff0c2f8",
    "working_location": "OFFICE",
    "type": "WORK",
    "start_date": "2026-04-21T07:00:00.000Z",
    "end_date": "2026-04-21T13:59:00.000Z",
    "interruption_hours": 0.5,
    "recorded_hours": 6.48,
    "is_confirmed": true,
    "created_at": "2026-04-21T10:16:11.138Z",
    "updated_at": "2026-04-21T10:16:11.138Z"
  }
]
 */
</script>

