<template lang="pug">
//- Header Sektion
h1(tabindex="0") Abwesenheiten
p(class="text-muted-foreground max-w-175" tabindex="0") Die Übersicht für deine Abwesenheiten und Auszeiten. 
  | Trage hier Urlaubstage, Krankheitstage und sonstige Abwesenheiten ein. 

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
  //- 1. Grid Row: Top Level KPIs
  div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4")

    Card(v-for="item in kpiAbscences")
      CardHeader(class="pb-2")
        CardTitle(class="text-sm text-muted-foreground") {{ item.title }}
      CardContent(class="pb-4")
        div(class="flex items-baseline")
          h3(class="text-3xl mr-1") {{ item.value }}
          span(class="text-sm ml-1 text-muted-foreground") {{ item.unit }}
        p(class="text-sm text-muted-foreground mt-2") {{ item.description }}

  //- 2. Grid Row: Legende und anstehende Termine
  div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4")
    
    //- Legenden Card
    Card(class="col-span-2 xl:col-span-1")
      CardHeader
        CardTitle Abwesenheitsarten
        CardDescription Legende der verfügbaren Eintragstypen
      CardContent
        div(class="grid grid-cols-2 xl:grid-cols-1 gap-y-4")
          div(v-for="item in legendItems" :key="item.type" class="flex items-center gap-2")
            div(:class="['w-3 h-3 rounded-full shrink-0', item.color]")
            span(class="text-sm text-foreground") {{ item.label }}

    //- Calendar
    Card(class="col-span-full lg:col-span-3")
      CardHeader(class="flex flex-row items-center justify-between pb-2")
        div(class="flex flex-col gap-1.5")
          CardTitle Kalender-Übersicht
          CardDescription Deine Abwesenheiten im Überblick
        Button(variant="brand" @click="openCreateDialog()")
          Plus(class="h-4 w-4")
          | Neue Abwesenheit
          //TODO Create Abscnece dialog
      CardContent(class="flex mt-8 justify-start")
        Calendar(
          expanded transparent borderless
          :rows="1"
          :columns="calendarColumns"
          :step="1"
          :attributes="calendarAttributes"
          :locale="'de'"
          class="w-full vc-custom-calendar"
        )

  //- 3. Grid Row: Tabellarische Historie
  div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-4")
    Card(class="col-span-5")
      CardHeader
        CardTitle Abwesenheits Historie
        CardDescription Alle Abwesenheitseinträge
      CardContent
        AbscencesTimeEntriesTables(
          :data="abscenceTimeEntries"
          :sollProTag="sollProTag"
          @refresh="refreshData"
        )

  //- Dialog for creating an Entry
  Dialog(:open="!!creatingEntry" @update:open="v => { if (!v) creatingEntry = null }")
    DialogContent
      DialogHeader
        DialogTitle Abwesenheit erstellen
        DialogDescription
        | Fülle das Formular aus, um eine neue Abwesenheit zu planen.
      form(@submit.prevent="oncreateEntry()")
        FieldGroup(class="flex flex-col gap-4")
          Field(class="min-h-25")
            FieldLabel Abwesenheitsart
            Select(v-model="creatingType")
              SelectTrigger
                SelectValue(placeholder="Typ wählen")
                  template(v-if="creatingType" #default)
                    div(class="flex items-center gap-2")
                      div(:class="`w-2.5 h-2.5 rounded-full ${TimeEntryTypeMapping[creatingType]?.color}`")
                      span {{ TimeEntryTypeMapping[creatingType]?.label }}
              p(v-show="typeError" class="text-xs text-destructive mt-1 h-4") {{ typeError }}&nbsp;

              SelectContent
                SelectItem(
                  v-for="option in typeOptions"
                  :key="option.value"
                  :value="option.value"
                )
                  div(class="flex items-center gap-2")
                    div(:class="`w-2.5 h-2.5 rounded-full ${option.color}`")
                    span {{ option.label }}

          Field
            div(class="flex items-center gap-2 mt-1")
              Checkbox(id="createFullDay" v-model="createIsFullDay")
              FieldLabel(for="createFullDay" class="cursor-pointer") Ganztägig

          div(class="grid grid-cols-2 gap-4")
            Field(class="min-h-25")
              CalendarInput(label="Startdatum" id="startDate" v-model="createStartDate")
              p(v-show="startDateError" class="text-xs text-destructive mt-1 h-4") {{ startDateError }}&nbsp;
            Field(class="min-h-25")
              FieldLabel Startzeit
              Input(type="time" :disabled="createIsFullDay" v-model="createStartTime" :class="startTimeError ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(v-show="startTimeError" class="text-xs text-destructive mt-1 h-4") {{ startTimeError }}&nbsp;

          div(class="grid grid-cols-2 gap-4")
            Field(class="min-h-25")
              CalendarInput(label="Enddatum" id="endDate" v-model="createEndDate")
              p(v-show="endDateError" class="text-xs text-destructive mt-1 h-4") {{ endDateError }}&nbsp;
            Field(class="min-h-25")
              FieldLabel Endzeit
              Input(type="time" :disabled="createIsFullDay" v-model="createEndTime" :class="endTimeError ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(v-show="endTimeError" class="text-xs text-destructive mt-1 h-4") {{ endTimeError }}&nbsp;

          DialogFooter(class="mt-4")
            Button(type="button" variant="outline" @click="creatingEntry = null") Abbrechen
            Button(type="submit" variant="brand") Abwesenheit Erstellen

</template>


<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import Badge from '@/components/ui/badge/Badge.vue'
import Button from '@/components/ui/button/Button.vue'
import Separator from '@/components/ui/separator/Separator.vue'
import { TimeEntryType } from '@/constants/enums/timeRecodring.enum'
import AbscencesTimeEntriesTables from '@/components/app/times/AbscencesTimeEntriesTables.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'vue-sonner';
import { Plus } from 'lucide-vue-next'
import { timeEntryService, type CreateTimeEntryRequest, type TimeEntry } from '@/services/timeEntry.service'
import { TimeEntryTypeMapping, TimeEntryTypeColors, TimeEntryTypeLabels } from '@/lib/enumTranslaters'
import { Calendar, DatePicker } from 'v-calendar';
import "v-calendar/dist/style.css";
import { useWindowSize } from '@vueuse/core'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'
import CalendarInput from '@/components/app/generic/CalendarInput.vue'
import { isoToGermanDate } from '@/lib/dateHelpers'

const createIsFullDay = ref(false)
const creatingEntry = ref<CreateTimeEntryRequest | null>(null);

const openCreateDialog = () => {
  creatingEntry.value = {
    start_date: new Date(),
    end_date: new Date(),
    working_location: null,
    type: undefined 
  };
};
const createStartDate = ref('')
const createStartTime = ref('')
const createEndDate = ref('')
const createEndTime = ref('')
const creatingType = ref<TimeEntryType | null>(null)

const submitted = ref(false)

const typeError = computed(() => submitted.value && !creatingType.value ? 'Wähle eine Abwesenheitsart aus' : null)
const startDateError = computed(() => submitted.value && !createStartDate.value ? 'Startdatum ist erforderlich' : null)
const endDateError = computed(() => submitted.value && !createEndDate.value ? 'Enddatum ist erforderlich' : null)
const startTimeError = computed(() => submitted.value && !createIsFullDay.value && !createStartTime.value ? 'Startzeit ist erforderlich' : null)
const endTimeError = computed(() => submitted.value && !createIsFullDay.value && !createEndTime.value ? 'Endzeit ist erforderlich' : null)

const isFormValid = computed(() =>
  !typeError.value && !startDateError.value && !endDateError.value &&
  !startTimeError.value && !endTimeError.value
)

const EXCLUDED_TYPES = [TimeEntryType.WORK, TimeEntryType.PUBLIC_HOLIDAY]

const typeOptions = computed(() =>
  Object.entries(TimeEntryTypeMapping)
    .filter(([key]) => !EXCLUDED_TYPES.includes(key as TimeEntryType))
    .map(([key, value]) => ({
      value: key,
      label: value.label,
      color: value.color,
    }))
)

watch(createIsFullDay, (isFullDay) => {
  if (!isFullDay) {
    createStartTime.value = '08:00'
    createEndTime.value = '16:00'
  }
})

async function oncreateEntry() {
  submitted.value = true
  if (!isFormValid.value) return
  if (!creatingEntry.value || !creatingType.value) return

  const start_date = new Date(`${createStartDate.value}T${createIsFullDay.value ? '00:00' : createStartTime.value}:00`)
  const end_date = new Date(`${createEndDate.value}T${createIsFullDay.value ? '23:59' : createEndTime.value}:00`)

  const reqObj: CreateTimeEntryRequest = {
    start_date: start_date,
    end_date: end_date,
    working_location: null,
    type: creatingType.value,
  }

  try {
    await timeEntryService.createTimeEntry(reqObj)
    toast.success('Abwesenheit erstellt')
    
    creatingEntry.value = null
    await refreshData()

  } catch (error) {
    console.error(error)
  }
}

// Array für die Legenden-Anzeige aufbauen (ohne 'WORK', da es hier primär um Abwesenheiten geht)
const legendItems = computed(() => {
  return Object.entries(TimeEntryTypeMapping)
    .filter(([key]) => key !== TimeEntryType.WORK)
    .map(([key, val]) => ({ type: key, ...val }))
})

const { width } = useWindowSize()

const calendarColumns = computed(() => {
  if (width.value < 768) return 1 // Mobile: 1 Monat
  if (width.value < 1480) return 2 // Tablet/Small Desktop: 2 Monate
  return 3 // Large Desktop: 3 Monate
})
const safeEntries = computed(() => abscenceTimeEntries.value ?? [])

// Mapping von Tailwind-Klassen zu VCalendar-Farbnamen
const TimeEntryTypeVCalendarColor: Record<TimeEntryType, string> = {
  [TimeEntryType.PARENTAL_LEAVE]:   'sky',
  [TimeEntryType.PUBLIC_HOLIDAY]:   'purple',    // fuchsia → nächste VCalendar-Farbe
  [TimeEntryType.EDUCATION]:        'gray',      // slate-600 → gray
  [TimeEntryType.SICK_CHILD]:       'orange',    // amber → orange
  [TimeEntryType.SICK]:             'red',
  [TimeEntryType.WORK]:             'gray',
  [TimeEntryType.SPECIAL_LEAVE]:    'pink',      // rose → pink
  [TimeEntryType.UNPAID_LEAVE]:     'gray',      // stone → gray
  [TimeEntryType.VACATION]:         'green',     // emerald → green
  [TimeEntryType.COMPENSATORY_OFF]: 'teal',
};

const calendarAttributes = computed(() => {
  return safeEntries.value.map(entry => {
    const startDate = new Date(entry.start_date)
    const endDate = new Date(entry.end_date)
    const isSingleDay = entry.start_date === entry.end_date
    const color = TimeEntryTypeVCalendarColor[entry.type] ?? 'blue'
    
    return {
      key: entry.id,
      color,
      highlight: isSingleDay
        ? { color }   // ← nicht nur `true`
        : {
            start: { fillMode: 'outline', color },
            base:  { fillMode: 'light', color },
            end:   { fillMode: 'outline', color },
          },
      dates: { start: startDate, end: endDate },
      popover: {
        label: TimeEntryTypeMapping[entry.type].label,
        visibility: 'hover-focus',
      },
    }
  })
})


async function refreshData() {
  // calling every AbscenceTimeEntry again, so the table updates
  const response = await timeEntryService.listAbscenceTimeEntires()
  abscenceTimeEntries.value = response.entries
  vacationDaysPerYear.value = response.vacationDaysPerYear
  calculateKpis(abscenceTimeEntries.value, response.timeAccount.vacation_days_per_year)

} 

// Mock-Daten für die Tabelle
const absenceHistory = ref([
  { id: 1, type: TimeEntryType.VACATION, startDate: '14.08.2026', endDate: '28.08.2026', days: 10, status: 'Genehmigt' },
  { id: 2, type: TimeEntryType.SICK, startDate: '12.03.2026', endDate: '14.03.2026', days: 3, status: 'Erfasst' },
  { id: 3, type: TimeEntryType.EDUCATION, startDate: '05.02.2026', endDate: '06.02.2026', days: 2, status: 'Genehmigt' },
])

// Top Level Informations to display
const kpiAbscences = ref([
  { title: "Jahresurlaub (verbraucht)", value: "24 / 30", unit: "Tage", description: "6 Tage noch verfügbar" },
  { title: "Jahresurlaub (geplant)", value: "30 / 30", unit: "Tage", description: "0 Tage noch verfügbar" },
  { title: "Krankheitstage", value: "3", unit: "Tage", description: "Im aktuellen Jahr" },
  { title: "Nächste geplante Abwesenheit", value: "12.05.2026", description: "Typ: Urlaub" },
])


const countDays = (entry: TimeEntry): number => {
  const start = new Date(entry.start_date)
  const end = new Date(entry.end_date)
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

const calculateKpis = (entries: TimeEntry[], vacationDaysPerYear: number) => {
  const currentYear = new Date().getFullYear()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const vacationDaysUsed = entries
    .filter(e =>
      e.type === TimeEntryType.VACATION &&
      new Date(e.start_date).getFullYear() === currentYear &&
      new Date(e.end_date) < today
    )
    .reduce((sum, e) => sum + countDays(e), 0)

  const vacationDaysPlanned = entries
    .filter(e =>
      e.type === TimeEntryType.VACATION &&
      new Date(e.start_date).getFullYear() === currentYear
    )
    .reduce((sum, e) => sum + countDays(e), 0)

  const sickDays = entries
    .filter(e =>
      (e.type === TimeEntryType.SICK || e.type === TimeEntryType.SICK_CHILD) &&
      new Date(e.start_date).getFullYear() === currentYear
    )
    .reduce((sum, e) => sum + countDays(e), 0)

  const nextAbsence = entries
    .filter(e => new Date(e.start_date) >= today)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0]

  kpiAbscences.value = [
    {
      title: 'Jahresurlaub (verbraucht)',
      value: `${vacationDaysUsed} / ${vacationDaysPerYear}`,
      unit: 'Tage',
      description: `${vacationDaysPerYear - vacationDaysUsed} Tage noch verfügbar`,
    },
    {
      title: 'Jahresurlaub (geplant)',
      value: `${vacationDaysPlanned} / ${vacationDaysPerYear}`,
      unit: 'Tage',
      description: `${vacationDaysPerYear - vacationDaysPlanned} Tage noch verfügbar`,
    },
    {
      title: 'Krankheitstage',
      value: `${sickDays}`,
      unit: 'Tage',
      description: 'Im aktuellen Jahr',
    },
    {
      title: 'Nächste geplante Abwesenheit',
      value: nextAbsence ? isoToGermanDate(new Date(nextAbsence.start_date)) : '—',
      description: nextAbsence ? `Typ: ${TimeEntryTypeLabels[nextAbsence.type]}` : 'Keine geplant',
    },
  ]
}

const abscenceTimeEntries = ref<TimeEntry[]>()
const vacationDaysPerYear = ref<number>()
const sollProTag = ref<number>()

const isLoaded = ref(false)
onMounted(async () => {
  const response = await timeEntryService.listAbscenceTimeEntires()
  abscenceTimeEntries.value = response.entries
  vacationDaysPerYear.value = response.vacationDaysPerYear
  sollProTag.value = response.timeAccount.contract_hours_per_week / response.timeAccount.working_days_per_week

  calculateKpis(abscenceTimeEntries.value, response.timeAccount.vacation_days_per_year)

  isLoaded.value = true
})
</script>

<style lang="css" scoped>

:deep(.vc-custom-calendar) {
  background-color: var(--bg);
  color: var(--text);
  border: 2px solid var(--color-border);
  padding: 0.5em;
  
  .vc-title {
    color: var(--text);
  }
}
</style>