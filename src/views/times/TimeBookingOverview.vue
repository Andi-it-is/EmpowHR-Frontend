<template lang="pug">

h1(tabindex="0") Zeitbuchung
p(class="text-muted-foreground max-w-175" tabindex="0") Die Übersicht über deine Arbeitstag. Trage hier deine Arbeitszeiten ein. 
  | Stempel dich aus und ein. Falls nötig, korrigiere vergangene Zeitbuchungen. 

Separator(class="my-4")

div(v-if="!isLoaded" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4")
  Card(class="col-span-2")
    CardHeader
      Skeleton(class="h-5 w-40")
      Skeleton(class="h-4 w-64 mt-1")
    CardContent(class="flex flex-col gap-3")
      Skeleton(v-for="i in 5" :key="i" class="h-9 w-full")

  Card(class="col-span-2")
    CardHeader
      Skeleton(class="h-5 w-40")
      Skeleton(class="h-4 w-64 mt-1")
    CardContent
      Skeleton(class="h-64 w-full rounded-md")

  Card(class="col-span-4")
    CardHeader
      Skeleton(class="h-5 w-32")
      Skeleton(class="h-4 w-80 mt-1")
    CardContent(class="flex flex-col gap-3")
      Skeleton(v-for="i in 6" :key="i" class="h-8 w-full")

div(v-else)

  //- Grid for New Entries and current week
  div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4")
    Card(class="col-span-2")
      CardHeader
        div(class="flex justify-between")
          div(class="flex flex-col gap-1.5")
            CardTitle Arbeitszeit erfassen
            CardDescription Soll und Ist Stunden deiner aktuellen Arbeitswoche
          div(class="flex flex-col border border-primary p-4 rounded-md")
            p(class="text-2xl") {{ deltaHours }} Stunden
            p(class="text-muted-foreground") Delta auf dem Zeitkonto
      CardContent
        form(@submit.prevent="onSubmit" novalidate)
          FieldGroup(class="flex flex-col gap-2")

            div(class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start")
              Field(class="min-h-28")
                CalendarInput(id="startDate" label="Startdatum" v-model="startDate")
                p(v-show="errors.startDate" class="text-xs text-destructive mt-1 h-4") {{ errors.startDate }}&nbsp;

              Field(class="min-h-28")
                FieldLabel(for="startTime") Startzeit
                Input(
                  id="startTime"
                  type="time"
                  v-model="startTime"
                  v-bind="startTimeAttrs"
                  class="bg-transparent shadow-sm dark:bg-input/30 dark:text-white"
                  :class="errors.startTime ? 'border-destructive focus-visible:ring-destructive' : ''"
                )
                p(v-show="errors.startTime" class="text-xs text-destructive mt-1 h-4") {{ errors.startTime }}&nbsp;

            div(class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start")
              Field(class="min-h-28")
                CalendarInput(id="endDate" label="Enddatum" v-model="endDate")
                p(v-show="errors.endDate || endDateError" class="text-xs text-destructive mt-1 h-4") 
                  | {{ errors.endDate || endDateError }}&nbsp;

              Field(class="min-h-28")
                FieldLabel(for="endTime") Endzeit
                Input(
                  id="endTime"
                  type="time"
                  v-model="endTime"
                  v-bind="endTimeAttrs"
                  class="bg-transparent shadow-sm dark:bg-input/30"
                  :class="errors.endTime ? 'border-destructive focus-visible:ring-destructive' : ''"
                )
                p(v-show="errors.endTime || endTimeError" class="text-xs text-destructive mt-1 h-4") 
                  | {{ errors.endTime || endTimeError }}&nbsp;

            Field(class="min-h-28")
              FieldLabel Arbeitsort
              Select(
                :model-value="workingLocation"
                @update:model-value="(val) => workingLocation = val"
              )
                SelectTrigger(:class="errors.workingLocation ? 'border-destructive focus-visible:ring-destructive' : ''")
                  SelectValue(placeholder="Arbeitsort wählen")
                SelectContent
                  SelectItem(
                    v-for="(label, key) in workingLocationLabels"
                    :key="key"
                    :value="key"
                  ) {{ label }}
              p(v-show="errors.workingLocation" class="text-xs text-destructive mt-1 h-4") {{ errors.workingLocation }}&nbsp;

            div(class="flex justify-end")
              Button(type="submit" variant="brand") Eintrag erstellen

    Card(class="col-span-2")
      CardHeader
        div(class="flex justify-between")
          div(class="flex flex-col gap-1.5")
            CardTitle Kalenderwoche {{ calendarWeek }}
            CardDescription Soll und Ist Stunden der ausgewählten Arbeitswoche
          div
            div(class="flex flex-wrap gap-8 items-center")
              p(class="text-sm font-medium text-muted-foreground flex flex-wrap gap-2")
                span {{ totalIst }} h
                span /
                span {{ totalSoll }} h
              Select(:model-value="selectedWeek?.toString()" @update:model-value="v => selectedWeek = Number(v)")
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
            :rounded-corners="8"
            :y-formatter="(tick) => `${tick}`"
            class="h-full w-full"
          )

  //- Grid for the Table that display all Time Entries
  div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4")
    Card(class="col-span-4")
      CardHeader
        CardTitle Zeitkonto
        CardDescription Alle Einträge der Arbeitszeiten, die dein Zeitkonto beeinflussen
      CardContent
        WorkTimeEntriesTable(
          :data="workTimeEntries"
        )

pre {{ workTimeEntries }}
</template>


<script setup lang="ts">
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import BarChart from '@/components/ui/chart-bar/BarChart.vue';
import { getCalendarWeek, isoToGermanDate } from '@/lib/dateHelpers';
import Separator from '@/components/ui/separator/Separator.vue';
import { Select, SelectContent, SelectItem, SelectGroup, SelectValue, SelectTrigger } from '@/components/ui/select';
import { ref, computed, onMounted } from 'vue';
import { useField, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { WorkingLocation } from '@/constants/enums/timeRecodring.enum';
import CalendarInput from '@/components/app/generic/CalendarInput.vue';
import WorkTimeEntriesTable from '@/components/app/times/WorkTimeEntriesTable.vue';
import { timeEntryService, type CreateTimeEntryRequest, type TimeEntry, type TimeEntryFilter } from '@/services/timeEntry.service';
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'vue-sonner';

const barCategories = ['Ist', 'Soll']
const barColors = ['#10b981', '#737373']

const getISOWeek = (date: Date): number => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

const getMondayOfWeek = (date: Date): Date => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

let shouldPerDay = 8

const groupedByWeek = computed(() => {
  const weeks: Record<number, { day: string; Ist: number; Soll: number }[]> = {}

  workTimeEntries.value?.forEach(entry => {
    const week = getISOWeek(new Date(entry.start_date))
    if (!weeks[week]) {
      const monday = getMondayOfWeek(new Date(entry.start_date))
      weeks[week] = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'].map((day, i) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        return { day, Ist: 0, Soll: shouldPerDay }
      })
    }

    const dayIndex = new Date(entry.start_date).getDay()
    const isoIndex = dayIndex === 0 ? 6 : dayIndex - 1 // 0=Mo, 4=Fr
    if (isoIndex < 5) {
      const weekData: any = weeks[week] as { day: string; Ist: number; Soll: number }[]
      weekData[isoIndex].Ist = Math.round(
        (weekData[isoIndex].Ist + entry.recorded_hours) * 100
      ) / 100
    }
  })

  return weeks
})

const currentWeek = getISOWeek(new Date())

// Verfügbare Kalenderwochen für den Select
const availableWeeks = computed(() =>
  Object.keys(groupedByWeek.value)
    .map(Number)
    .filter(week => week >= currentWeek - 3)
    .sort()
)

// Aktuell ausgewählte KW
const selectedWeek = ref<number>(getISOWeek(new Date()))

// Daten für den BarChart
const data = computed(() => groupedByWeek.value[selectedWeek.value] ?? [])

const calendarWeek = computed(() => selectedWeek.value)
const totalIst = computed(() => data.value.reduce((sum, d) => sum + d.Ist, 0))
const totalSoll = computed(() => data.value.reduce((sum, d) => sum + d.Soll, 0))


const workingLocationLabels: Record<WorkingLocation, string> = {
  [WorkingLocation.OFFICE]: 'Büro',
  [WorkingLocation.REMOTE]: 'Remote',
  [WorkingLocation.FIELD_SERVICE]: 'Dienstreise',
}

const endDateError = computed(() => {
  if (!startDate.value || !endDate.value) return null
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  // Nur das Datum vergleichen (ohne Zeit)
  if (end < start) return 'Enddatum muss nach dem Startdatum liegen'
  return null
})

const endTimeError = computed(() => {
  if (endDateError.value) return null // Datumsfehler hat Priorität
  if (!startDate.value || !endDate.value || !startTime.value || !endTime.value) return null
  const start = new Date(`${startDate.value}T${startTime.value}`)
  const end = new Date(`${endDate.value}T${endTime.value}`)
  if (end <= start) return 'Endzeitpunkt muss nach dem Startzeitpunkt liegen'
  return null
})

const formSchema = toTypedSchema(
  z.object({
    startDate: z.string().min(1, 'Startdatum ist erforderlich'),
    startTime: z.string().min(1, 'Startzeit ist erforderlich'),
    endDate: z.string().min(1, 'Enddatum ist erforderlich'),
    endTime: z.string().min(1, 'Endzeit ist erforderlich'),
    workingLocation: z.nativeEnum(WorkingLocation, {
      errorMap: () => ({ message: 'Bitte einen Ort auswählen' }),
    }),
  }).refine(
    (data) => {
      if (!data.startDate || !data.startTime || !data.endDate || !data.endTime) return true
      const start = new Date(`${data.startDate}T${data.startTime}`)
      const end = new Date(`${data.endDate}T${data.endTime}`)
      return end > start
    },
    { message: 'Endzeitpunkt muss nach dem Startzeitpunkt liegen', path: ['endDate'] }
  )
)

const { handleSubmit, errors, defineField, resetForm } = useForm({ validationSchema: formSchema })

const [startDate, startDateAttrs] = defineField('startDate')
const [startTime, startTimeAttrs] = defineField('startTime', { props: () => ({ required: false }) })
const [endDate, endDateAttrs] = defineField('endDate')
const [endTime, endTimeAttrs] = defineField('endTime', { props: () => ({ required: false }) })
const [workingLocation, workingLocationAttrs] = defineField('workingLocation', { props: () => ({ required: false }) })

const onSubmit = handleSubmit(async (values) => {
  try {
    const start_date = new Date(`${values.startDate}T${values.startTime}:00`)
    const end_date = new Date(`${values.endDate}T${values.endTime}:00`)

    const reqObj: CreateTimeEntryRequest = {
      start_date: start_date,
      end_date: end_date,
      working_location: values.workingLocation as WorkingLocation,
    }

    const result = await timeEntryService.createWorkTimeEntry(reqObj)

    // calling every WorkTimeEntry again, so the table updates
    const response = await timeEntryService.listWorkTimeEntries()
    deltaHours.value = response.timeAccount.delta_hours
    workTimeEntries.value = response.entries

    toast.success('Zeiteintrag erstellt', {
      description: `${isoToGermanDate(start_date)} · ${values.startTime} – ${values.endTime} Uhr`,
    })

    // Formular zurücksetzen
    resetForm()

  } catch (error: any) {
    console.error(error)
  }
})


const deltaHours = ref<number>()
const workTimeEntries = ref<TimeEntry[]>();
const isLoaded = ref(false)

onMounted(async () => {
  const response = await timeEntryService.listWorkTimeEntries()
  deltaHours.value = response.timeAccount.delta_hours
  workTimeEntries.value = response.entries
  shouldPerDay = response.shouldWorkHoursPerDay

  isLoaded.value = true
})

</script>