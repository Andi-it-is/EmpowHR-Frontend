<template lang="pug">

h1(tabindex="0") Zeitbuchung
p(class="text-muted-foreground max-w-175" tabindex="0") Die Übersicht über deine Arbeitstag. Trage hier deine Arbeitszeiten ein. 
  | Stempel dich aus und ein. Falls nötig, korrigiere vergangene Zeitbuchungen. 

Separator(class="my-4")

//- Grid for New Entries and current week
div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-4")
  Card(class="col-span-2 rounded-md bg-muted/50 shadow-none")

  Card(class="col-span-3 rounded-md bg-muted/50 shadow-none")
    CardHeader
      div(class="flex justify-between")
        div
          CardTitle Kalenderwoche {{ calendarWeek }}
          CardDescription Soll und Ist Stunden deiner aktuellen Arbeitswoche
        div
          div(class="flex flex-wrap gap-8 items-center")
            p(class="text-sm font-medium text-muted-foreground flex flex-wrap gap-2")
              span Ist: {{ totalIst }}h
              span /
              span Soll: {{ totalSoll }}h
            Select(v-model="selectedWeek")
              SelectTrigger(class="w-30")
                SelectValue(placeholder="Woche")
              SelectContent
                SelectItem(v-for="w in availableWeeks" :key="w" :value="w.toString()")
                  | KW {{ w }}

    CardContent(class="p-2")
      div(class="h-100 w-full px-4 pb-2")
        BarChart(
          :data="data"
          index="day"
          :categories="barCategories"
          :colors="barColors"
          :show-legend="true"
          :show-tooltip="true"
          :show-x-axis="false"
          :show-y-axis="true"
          :showXAxis="true"
          :y-formatter="(tick) => `${tick}`"
          class="h-full w-full"
        )


</template>


<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import BarChart from '@/components/ui/chart-bar/BarChart.vue';
import { getCalendarWeek } from '@/lib/dateHelpers';
import Separator from '@/components/ui/separator/Separator.vue';
import { Select, SelectContent, SelectItem, SelectGroup, SelectValue, SelectTrigger } from '@/components/ui/select';
import { ref, computed } from 'vue';

const calendarWeek = computed( () => getCalendarWeek())

// TODO 
// assuming 40 hour week. 
// SOLL needs to be calculated dynamically based on the user time account 
const data = ref([
  { day: 'Montag', Ist: 7, Soll: 8 },
  { day: 'Dienstag', Ist: 7.5, Soll: 8 },
  { day: 'Mittwoch', Ist: 9, Soll: 8 },
  { day: 'Donnerstag', Ist: 0, Soll: 8 },
  { day: 'Freitag', Ist: 0, Soll: 8 },
])

const barCategories = ['Ist', 'Soll']
const barColors = ['#10b981', '#737373']

// Zustand für das Select-Feld
const selectedWeek = ref('16') // Standardwert
const availableWeeks = [14, 15, 16, 17] // Beispielhafte Auswahl

// Berechnung der Gesamtsummen
const totalIst = computed(() => {
  return data.value.reduce((acc, curr) => acc + curr.Ist, 0)
})

const totalSoll = computed(() => {
  return data.value.reduce((acc, curr) => acc + curr.Soll, 0)
})
</script>