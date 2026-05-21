<template lang="pug">

h1(tabindex="0") Abwesenheiten planen
p(class="text-muted-foreground max-w-175" tabindex="0") Plane hier die Abwesenheiten der Mitarbeitenden.

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
      CardDescription Wähle eine Abteilung aus, in welcher du Abteilungsleiter bist. Schaue dir die Einträge deiner Mitarbeitenden an.
    CardContent
      TeamCalendar(
        ref="teamCalendarRef"
        v-model:month="selectedMonth"
        v-model:year="selectedYear"
        v-model:calendarData="calendarData"
        v-model:departmentId="selectedDepartmentId"
        :anonymized="false"
        :viewingUser="viewingUser.id"
      )

//- Tables
div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4" v-if="isLoaded" )

  Tabs(default-value="calendar" class="col-span-4")
    TabsList
      TabsTrigger(value="calendar")
        | Kalendar Daten
        Badge(class="ml-2 mr-1" variant="bordered") {{ totalEntries }}

      TabsTrigger(value="unconfirmed")
        | Alle offenen Anträge
        Badge(class="ml-2 mr-1" variant="bordered") {{ unconfirmedAbsencensByDepartment.length }}

    TabsContent(value="calendar")
      Card(class="col-span-4 xl:col-span-4")
        CardHeader
          CardTitle Abwesenheiten aus dem Kalender 
          CardDescription Alle Antäge aus dem ausgewählten Monat und Jahr im Kalendar
        CardContent
          amAbsenceTable(:calendarData="calendarData" @refresh="refresh")  

    TabsContent(value="unconfirmed")
      Card(class="col-span-4 xl:col-span-4")
        CardHeader
          CardTitle Offene Anträge
          CardDescription Alle offenen Anträge von <b>{{ departmentName }}</b>
        CardContent
          amUnconfirmedAbsencesTable(:data="unconfirmedAbsencensByDepartment" @refresh="refresh")

</template>

<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Separator from '@/components/ui/separator/Separator.vue'
import TeamCalendar from '@/components/app/organisation/TeamCalendar.vue';
import { computed, onMounted, ref, h, watch } from 'vue';
import { TimeEntryTypeMapping } from '@/lib/enumTranslaters';
import { TimeEntryType } from '@/constants/enums/timeRecodring.enum';
import { userService } from '@/services/user.service';
import { timeEntryService } from '@/services/timeEntry.service';
import { toast } from "vue-sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowUpDown, ChevronLeft, ChevronRight, Check, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import amAbsenceTable from '@/components/app/management/absenceMangagement/amAbsenceTable.vue';
import amUnconfirmedAbsencesTable from '@/components/app/management/absenceMangagement/amUnconfirmedAbsencesTable.vue';
import { departmentService, type Department } from '@/services/department.service';

const legendItems = computed(() => {
  return Object.entries(TimeEntryTypeMapping)
    .filter(([key]) => key !== TimeEntryType.WORK)
    .map(([key, val]) => ({ type: key, ...val }))
})

const now = new Date()
const selectedMonth = ref(now.getMonth() + 1)
const selectedYear = ref(now.getFullYear())
const selectedDepartmentId = ref<string>()

const allDepartments = ref<Department[]>([])
const departmentName = ref<string>()

const calendarData = ref<any>()
const unconfirmedAbsencensByDepartment = ref<any>([])

const isLoaded = ref(false)
const viewingUser = ref()

const totalEntries = computed(() =>
  calendarData.value?.users?.reduce((acc: number, user: any) => acc + user.timeEntries.length, 0) ?? 0
)

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

watch(selectedDepartmentId, async (newId) => {
  if (!newId) return
  unconfirmedAbsencensByDepartment.value = await timeEntryService.listUnconfirmedTimeEntriesByDepartment(newId)
})

watch(selectedDepartmentId, (newId) => {
  if (!newId) return
  departmentName.value = allDepartments.value.find(d => d.id === newId)?.name
})

const teamCalendarRef = ref()

async function refresh() {
  if (!selectedDepartmentId.value) return
  await Promise.all([
    teamCalendarRef.value?.loadData(),
    timeEntryService.listUnconfirmedTimeEntriesByDepartment(selectedDepartmentId.value)
      .then(data => unconfirmedAbsencensByDepartment.value = data)
  ])
}

onMounted(async () => {
  allDepartments.value = await departmentService.listAllDepartments()
  viewingUser.value = await userService.getSimpleUserInfo()
  isLoaded.value = true
})
</script>