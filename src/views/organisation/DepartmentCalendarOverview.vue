<template lang="pug">

h1(tabindex="0") Teamkalendar
p(class="text-muted-foreground max-w-175" tabindex="0") Dein abteilungsweiter Überblick darüber, wer im Dienst ist.

Separator(class="my-4")


div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4")

  //- Legenden Card
  Card(class="col-span-4 xl:col-span-4")
    CardHeader
      CardTitle Abwesenheitsarten
      CardDescription Legende der verfügbaren Eintragstypen
    CardContent
      div(class="flex flex-wrap gap-8")
        div(v-for="item in legendItems" :key="item.type" class="flex items-center gap-2")
          div(:class="['w-3 h-3 rounded-full shrink-0', item.color]")
          span(class="text-sm text-foreground") {{ item.label }}

  Card(v-if="isLoaded" class="col-span-4")
    CardHeader
      CardTitle Kalender
      CardDescription Wähle eine Abteilung aus und schaue dir die Einträge der Mitarbeitenden an
    CardContent
      TeamCalendar(
        v-model:month="selectedMonth"
        v-model:year="selectedYear"
        v-model:calendarData="calendarData"
        :anonymized="true"
        :viewingUser="viewingUser.id"
      )

</template>


<script setup lang="ts">
import TeamCalendar from '@/components/app/organisation/TeamCalendar.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Separator from '@/components/ui/separator/Separator.vue';
import { TimeEntryType } from '@/constants/enums/timeRecodring.enum';
import { TimeEntryTypeMapping } from '@/lib/enumTranslaters';
import { userService } from '@/services/user.service';
import { computed, onMounted, ref } from 'vue';

const isLoaded = ref(false)

const legendItems = computed(() => {
  return Object.entries(TimeEntryTypeMapping)
    .filter(([key]) => key !== TimeEntryType.WORK)
    .map(([key, val]) => ({ type: key, ...val }))
})

const viewingUser = ref()

const now = new Date()
const selectedMonth = ref(now.getMonth() + 1)
const selectedYear = ref(now.getFullYear())
const calendarData = ref<any>()

onMounted(async () => {

  viewingUser.value = await userService.getSimpleUserInfo()

  isLoaded.value = true
})
</script>