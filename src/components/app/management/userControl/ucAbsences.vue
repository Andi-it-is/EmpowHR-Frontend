<template lang="pug">
div(class="w-full space-y-6")

  //- Header mit User Info
  div(class="flex items-center justify-between")
    div
      h2(class="text-xl font-semibold") Abwesenheiten verwalten
      p(class="text-sm text-muted-foreground mt-0.5") 
        | Abwesenheiten für 
        span(class="font-medium text-foreground") {{ affectedUser?.firstname }} {{ affectedUser?.lastname }}
    Button(variant="brand" @click="openCreateDialog()")
      Plus(class="h-4 w-4")
      | Neue Abwesenheit

  div(v-if="!isLoaded" class="space-y-4")
    Skeleton(class="h-48 w-full")
    Skeleton(class="h-64 w-full")

  div(v-else class="space-y-6")

    //- Legende
    Card
      CardHeader(class="pb-3")
        CardTitle Abwesenheitsarten
        CardDescription Legende der verfügbaren Eintragstypen
      CardContent
        div(class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3")
          div(v-for="item in legendItems" :key="item.type" class="flex items-center gap-2")
            div(:class="['w-3 h-3 rounded-full shrink-0', item.color]")
            span(class="text-sm text-foreground") {{ item.label }}

    //- Tabelle
    div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4")
      Card(class="col-span-4")
        CardHeader
          CardTitle Abwesenheits Historie
          CardDescription Alle Abwesenheitseinträge von {{ affectedUser.firstname }} {{ affectedUser.lastname}}
        CardContent
          AbscencesTimeEntriesTables(
            :data="abscenceTimeEntries ?? []"
            :sollProTag="sollProTag ?? 8"
            :affectedUserId="affectedUser.id"
            @refresh="refreshData"
          )

  //- Create Dialog
  Dialog(:open="!!creatingEntry" @update:open="v => { if (!v) resetCreateForm() }")
    DialogContent
      DialogHeader
        DialogTitle Abwesenheit erstellen
        DialogDescription
          | Neue Abwesenheit für {{ affectedUser?.firstname }} {{ affectedUser?.lastname }} erfassen.
      form(@submit.prevent="onCreateEntry()")
        FieldGroup(class="flex flex-col gap-4")
          Field(class="min-h-25")
            FieldLabel Abwesenheitsart
            Select(v-model="creatingType")
              SelectTrigger(:class="typeError ? 'border-destructive focus-visible:ring-destructive' : ''")
                SelectValue(placeholder="Typ wählen")
                  template(v-if="creatingType" #default)
                    div(class="flex items-center gap-2")
                      div(:class="`w-2.5 h-2.5 rounded-full ${TimeEntryTypeMapping[creatingType]?.color}`")
                      span {{ TimeEntryTypeMapping[creatingType]?.label }}
              SelectContent
                SelectItem(
                  v-for="option in typeOptions"
                  :key="option.value"
                  :value="option.value"
                )
                  div(class="flex items-center gap-2")
                    div(:class="`w-2.5 h-2.5 rounded-full ${option.color}`")
                    span {{ option.label }}
            p(v-show="typeError" class="text-xs text-destructive mt-1 h-4") {{ typeError }}&nbsp;

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
            Button(type="button" variant="outline" @click="resetCreateForm()") Abbrechen
            Button(type="submit" variant="brand") Abwesenheit Erstellen
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'
import { Plus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { userService, type User } from '@/services/user.service'
import { timeEntryService, type TimeEntry, type CreateTimeEntryRequest } from '@/services/timeEntry.service'
import { TimeEntryType } from '@/constants/enums/timeRecodring.enum'
import { TimeEntryTypeMapping, TimeEntryTypeLabels } from '@/lib/enumTranslaters'
import AbscencesTimeEntriesTables from '@/components/app/times/AbscencesTimeEntriesTables.vue'
import CalendarInput from '@/components/app/generic/CalendarInput.vue'

const props = defineProps<{
  user: User
}>()

const affectedUser = ref<User>()
const abscenceTimeEntries = ref<TimeEntry[]>([])
const sollProTag = ref<number>()
const isLoaded = ref(false)

// --- Legende ---
const legendItems = computed(() =>
  Object.entries(TimeEntryTypeMapping)
    .filter(([key]) => key !== TimeEntryType.WORK)
    .map(([key, val]) => ({ type: key, ...val }))
)

const EXCLUDED_TYPES = [TimeEntryType.WORK, TimeEntryType.PUBLIC_HOLIDAY]
const typeOptions = computed(() =>
  Object.entries(TimeEntryTypeMapping)
    .filter(([key]) => !EXCLUDED_TYPES.includes(key as TimeEntryType))
    .map(([key, value]) => ({ value: key, label: value.label, color: value.color }))
)

// --- Create Form State ---
const creatingEntry = ref<boolean>(false)
const creatingType = ref<TimeEntryType | null>(null)
const createIsFullDay = ref(false)
const createStartDate = ref('')
const createStartTime = ref('')
const createEndDate = ref('')
const createEndTime = ref('')
const submitted = ref(false)

const typeError = computed(() => submitted.value && !creatingType.value ? 'Wähle eine Abwesenheitsart aus' : null)
const startDateError = computed(() => submitted.value && !createStartDate.value ? 'Startdatum ist erforderlich' : null)
const endDateError = computed(() => submitted.value && !createEndDate.value ? 'Enddatum ist erforderlich' : null)
const startTimeError = computed(() => submitted.value && !createIsFullDay.value && !createStartTime.value ? 'Startzeit ist erforderlich' : null)
const endTimeError = computed(() => submitted.value && !createIsFullDay.value && !createEndTime.value ? 'Endzeit ist erforderlich' : null)
const isFormValid = computed(() => !typeError.value && !startDateError.value && !endDateError.value && !startTimeError.value && !endTimeError.value)

watch(createIsFullDay, (isFullDay) => {
  if (!isFullDay) {
    createStartTime.value = '08:00'
    createEndTime.value = '16:00'
  }
})

function openCreateDialog() {
  creatingEntry.value = true
}

function resetCreateForm() {
  creatingEntry.value = false
  creatingType.value = null
  createIsFullDay.value = false
  createStartDate.value = ''
  createStartTime.value = ''
  createEndDate.value = ''
  createEndTime.value = ''
  submitted.value = false
}

async function onCreateEntry() {
  submitted.value = true
  if (!isFormValid.value || !creatingType.value) return

  const start_date = new Date(`${createStartDate.value}T${createIsFullDay.value ? '00:00' : createStartTime.value}:00`)
  const end_date = new Date(`${createEndDate.value}T${createIsFullDay.value ? '23:59' : createEndTime.value}:00`)

  const reqObj: CreateTimeEntryRequest = {
    start_date,
    end_date,
    working_location: null,
    type: creatingType.value,
  }

  try {
    // TODO: Ersetze mit HR-spezifischem Service-Aufruf für einen bestimmten User:
    await timeEntryService.createTimeEntryForUserByUserId(props.user.id, reqObj)
    toast.success('Abwesenheit erstellt')
    resetCreateForm()
    await refreshData()
  } catch (error) {
    console.error(error)
    toast.error('Fehler beim Erstellen der Abwesenheit')
  }
}

async function refreshData() {
  try {
    const response = await timeEntryService.listAbscenceTimeEntiresByUserId(props.user.id)
    abscenceTimeEntries.value = response.entries
    if (response.timeAccount) {
      sollProTag.value = response.timeAccount.contract_hours_per_week / response.timeAccount.working_days_per_week
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(async () => {
  affectedUser.value = await userService.getUserById(props.user.id)
  await refreshData()
  isLoaded.value = true
})
</script>