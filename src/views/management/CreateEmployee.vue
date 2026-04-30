<template lang="pug">

h1(tabindex="0") Neuen Mitarbeitenden anlegen
p(class="text-muted-foreground max-w-175" tabindex="0") Erstelle hier einen neuen Mitarbeitenden. Nutzerinformationen, Stammdaten, Zeitkonten und sonstige Angaben auch.

Separator(class="my-4")

div(class="flex justify-start" @click="navToOverview()")
  Button(variant="outline")
    ChevronLeft
    | Zurück zur Übersicht

//- Stepper Header
div(class="hidden md:block mb-6")
  Stepper(v-model="currentStep" class="border-2 border-muted rounded-md p-6 flex w-full items-start gap-2")
    StepperItem(
      v-for="item in steps"
      :key="item.step"
      :step="item.step"
      class="relative flex w-full flex-col items-center justify-center"
    )
      StepperTrigger(class="border border-muted rounded-2xl group-data-[state=completed]:bg-positive")
        StepperIndicator(v-slot="{ step }")
          template(v-if="item.icon")
            component(:is="item.icon" class="w-4 h-4")
          span(v-else) {{ step }}
      StepperSeparator(
        v-if="item.step !== steps[steps.length - 1]?.step"
        class="absolute left-[calc(50%+20px)] right-[calc(-50%+10px)] top-5 block h-0.5 shrink-0 rounded-full bg-muted group-data-[state=completed]:bg-positive"
      )
      div(class="flex flex-col items-center mt-2")
        StepperTitle {{ item.title }}
        StepperDescription(class="hidden lg:block") {{ item.description }}

//- Step 1 – Basis Daten
div(v-if="currentStep === 1")
  div(class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4")

    //- Card 1: Informationen
    Card
      CardHeader
        CardTitle Informationen
        CardDescription Allgemeine Angaben über den Mitarbeitenden
      CardContent(class="flex flex-col gap-4 pt-4")
        FieldGroup
          div(class="grid grid-cols-2 gap-4")
            Field(class="min-h-20")
              FieldLabel Vorname
              Input(v-model="form.firstname" placeholder="Max" :class="step1Errors.firstname ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(class="text-xs text-destructive mt-1 h-4") {{ step1Errors.firstname }}&nbsp;
            Field(class="min-h-20")
              FieldLabel Nachname
              Input(v-model="form.lastname" placeholder="Mustermann" :class="step1Errors.lastname ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(class="text-xs text-destructive mt-1 h-4") {{ step1Errors.lastname }}&nbsp;
          Field(class="min-h-20")
            FieldLabel E-Mail
            Input(v-model="form.email" type="email" placeholder="max.mustermann@firma.de" :class="step1Errors.email ? 'border-destructive focus-visible:ring-destructive' : ''")
            p(class="text-xs text-destructive mt-1 h-4") {{ step1Errors.email }}&nbsp;
          Field(class="min-h-20")
            CalendarInput(v-model="form.entryDate" type="date" id="entryDate" label="Eintrittsdatum" :class="step1Errors.entryDate ? 'border-destructive focus-visible:ring-destructive' : ''")
            p(class="text-xs text-destructive mt-1 h-4") {{ step1Errors.entryDate }}&nbsp;

    //- Card 2: Unternehmenszugehörigkeit
    Card
      CardHeader
        CardTitle Unternehmenszugehörigkeit
        CardDescription Wo und wie soll der Mitarbeitende eingesetzt werden
      CardContent(class="flex flex-col gap-4 pt-4")
        FieldGroup
          Field(class="min-h-20")
            FieldLabel Abteilung
            Select(v-model="form.departmentId")
              SelectTrigger(:class="step1Errors.departmentId ? 'border-destructive focus-visible:ring-destructive' : ''")
                SelectValue(placeholder="Abteilung wählen...")
              SelectContent
                SelectItem(v-for="department in allDepartments"
                  :key="department.id"
                  :value="department.id"
                ) {{ department.name }}
            p(class="text-xs text-destructive mt-1 h-4") {{ step1Errors.departmentId }}&nbsp;
          Field(class="min-h-20")
            FieldLabel Standort
            Input(v-model="form.location" placeholder="Düsseldorf" :class="step1Errors.location ? 'border-destructive focus-visible:ring-destructive' : ''")
            p(class="text-xs text-destructive mt-1 h-4") {{ step1Errors.location }}&nbsp;
          Field(class="min-h-20")
            FieldLabel Rolle / Position
            Input(v-model="form.job_title" placeholder="z.B. Senior Developer" :class="step1Errors.job_title ? 'border-destructive focus-visible:ring-destructive' : ''")
            p(class="text-xs text-destructive mt-1 h-4") {{ step1Errors.job_title }}&nbsp;

//- Step 2 – Stammdaten
div(v-if="currentStep === 2")
  div(class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4")

    //- Card 1: Persönliche Daten
    Card
      CardHeader
        CardTitle Persönliche Daten
        CardDescription Offizielle Personenangaben
      CardContent(class="flex flex-col gap-4 pt-4")
        FieldGroup
          div(class="grid grid-cols-2 gap-4")
            Field(class="min-h-20")
              CalendarInput(v-model="form.birthDate" type="date" id="birthDate" label="Geburtsdatum" :class="step2Errors.birthDate ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(class="text-xs text-destructive mt-1 h-4") {{ step2Errors.birthDate }}&nbsp;
            Field(class="min-h-20")
              FieldLabel Geburtsort
              Input(v-model="form.birthPlace" placeholder="Köln" :class="step2Errors.birthPlace ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(class="text-xs text-destructive mt-1 h-4") {{ step2Errors.birthPlace }}&nbsp;
          div(class="grid grid-cols-2 gap-4")
            Field(class="min-h-20")
              FieldLabel Staatsangehörigkeit
              Input(v-model="form.nationality" placeholder="Deutsch" :class="step2Errors.nationality ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(class="text-xs text-destructive mt-1 h-4") {{ step2Errors.nationality }}&nbsp;
            Field(class="min-h-20")
              FieldLabel Geschlecht
              Select(v-model="form.gender")
                SelectTrigger(:class="step2Errors.gender ? 'border-destructive focus-visible:ring-destructive' : ''")
                  SelectValue(placeholder="Bitte wählen...")
                SelectContent
                  SelectItem(:value="Gender.MALE") Männlich
                  SelectItem(:value="Gender.FEMALE") Weiblich
                  SelectItem(:value="Gender.NONE") Keine Angabe
              p(class="text-xs text-destructive mt-1 h-4") {{ step2Errors.gender }}&nbsp;
          Field(class="min-h-20")
            FieldLabel IBAN
            Input(v-model="form.banking_detail" placeholder="DE00 1234 5678 9100 0000 00" :class="step2Errors.banking_detail ? 'border-destructive focus-visible:ring-destructive' : ''")
            p(class="text-xs text-destructive mt-1 h-4") {{ step2Errors.banking_detail }}&nbsp;

    //- Card 2: Adresse
    Card
      CardHeader
        CardTitle Adresse
        CardDescription Wohnanschrift des Mitarbeitenden
      CardContent(class="flex flex-col gap-4 pt-4")
        FieldGroup
          Field(class="min-h-20")
            FieldLabel Straße & Hausnummer
            Input(v-model="form.street" placeholder="Musterstraße 12" :class="step2Errors.street ? 'border-destructive focus-visible:ring-destructive' : ''")
            p(class="text-xs text-destructive mt-1 h-4") {{ step2Errors.street }}&nbsp;
          div(class="grid grid-cols-2 gap-4")
            Field(class="min-h-20")
              FieldLabel PLZ
              Input(v-model="form.zipcode" placeholder="40210" :class="step2Errors.zipcode ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(class="text-xs text-destructive mt-1 h-4") {{ step2Errors.zipcode }}&nbsp;
            Field(class="min-h-20")
              FieldLabel Stadt
              Input(v-model="form.city" placeholder="Düsseldorf" :class="step2Errors.city ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(class="text-xs text-destructive mt-1 h-4") {{ step2Errors.city }}&nbsp;
          div(class="grid grid-cols-2 gap-4")
            Field(class="min-h-20")
              FieldLabel Land
              Select(v-model="form.country" disabled)
                SelectTrigger(class="opacity-50 cursor-not-allowed")
                  SelectValue(placeholder="Deutschland")
                SelectContent
                  SelectItem(value="Deutschland") Deutschland
              p(class="text-xs text-destructive mt-1 h-4") {{ step2Errors.country }}&nbsp;

            Field(class="min-h-20")
              FieldLabel Unternehmenskennung
              Input(v-model="form.company_alias" placeholder="KENNUNG_12345" :class="step2Errors.company_alias ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(class="text-xs text-destructive mt-1 h-4") {{ step2Errors.company_alias }}&nbsp;
          div(class="grid grid-cols-2 gap-4")

            Field(class="min-h-20")
              FieldLabel Geschäftliche Telefonnummer
              Input(v-model="form.telephone_business" placeholder="+49 123 4567890" :class="step2Errors.telephone_business ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(class="text-xs text-destructive mt-1 h-4") {{ step2Errors.telephone_business }}&nbsp;

            Field(class="min-h-20")
              FieldLabel Private Telefonnummer
              Input(v-model="form.telephone_private" placeholder="+49 098 76543210" :class="step2Errors.telephone_private ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(class="text-xs text-destructive mt-1 h-4") {{ step2Errors.telephone_private }} &nbsp;

//- Step 3 – Zeitkonten
div(v-if="currentStep === 3")
  div(class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4")

    Card
      CardHeader
        CardTitle Arbeitszeit
        CardDescription Wöchentliche Arbeitszeit und Modell
      CardContent(class="flex flex-col gap-4 pt-4")
        FieldGroup
          div(class="grid grid-cols-2 gap-4")
            Field(class="min-h-20")
              FieldLabel Wochenstunden (Soll)
              Input(v-model="form.contract_hours_per_week" type="number" min="1" placeholder="40 (Stunden)" :class="step3Errors.contract_hours_per_week ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(class="text-xs text-destructive mt-1 h-4") {{ step3Errors.contract_hours_per_week }}&nbsp;

            Field(class="min-h-20")
              FieldLabel Arbeitstage pro Woche
              Input(v-model="form.working_days_per_week" type="number" min="1" max="7" placeholder="5 (Tage)" :class="step3Errors.working_days_per_week ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(class="text-xs text-destructive mt-1 h-4") {{ step3Errors.working_days_per_week }}&nbsp;

          div(class="grid grid-cols-2 gap-4")
            Field(class="min-h-20")
              FieldLabel Urlaubstage / Jahr
              Input(v-model="form.vacation_days_per_year" type="number" min="1" placeholder="30 (Urlaubstage)" :class="step3Errors.vacation_days_per_year ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(class="text-xs text-destructive mt-1 h-4") {{ step3Errors.vacation_days_per_year }}&nbsp;

            Field(class="min-h-20")
              FieldLabel Überstunden Konto (Startwert)
              Input(v-model="form.delta_hours" type="number" placeholder="0 (Stunden)" :class="step3Errors.delta_hours ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(class="text-xs text-destructive mt-1 h-4") {{ step3Errors.delta_hours }}&nbsp;


//- Step 4 – Zusammenfassung
div(v-if="currentStep === 4")
  div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4")

    Card(class="col-span-2")
      CardHeader
        CardTitle Basis Daten
        CardDescription Angaben zur Unternehmenszugehörigkeit
      CardContent(class="pt-4")
        dl(class="text-sm flex flex-col gap-2")
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Name
            dd {{ form.firstname }} {{ form.lastname }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") E-Mail
            dd {{ form.email || '–' }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Jobtitel
            dd {{ form.job_title || '–' }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Abteilung
            dd {{ form.departmentId || '–' }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Standort
            dd {{ form.location || '–' }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Eintrittsdatum
            dd {{ form.entryDate || '–' }}

    Card(class="col-span-2")
      CardHeader
        CardTitle Stammdaten
        CardDescription Persönliche Daten & Kontakt
      CardContent(class="pt-4")
        dl(class="text-sm flex flex-col gap-2")
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Geburtsdatum
            dd {{ form.birthDate || '–' }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Geburtsort
            dd {{ form.birthPlace || '–' }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Staatsangehörigkeit
            dd {{ form.nationality || '–' }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Geschlecht
            dd {{ genderLabel || '–' }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Tel. geschäftlich
            dd {{ form.telephone_business || '–' }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Tel. privat
            dd {{ form.telephone_private || '–' }}

    Card(class="col-span-2")
      CardHeader
        CardTitle Adresse & Finanzen
        CardDescription Wohnanschrift und Bankverbindung
      CardContent(class="pt-4")
        dl(class="text-sm flex flex-col gap-2")
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Straße
            dd {{ form.street || '–' }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") PLZ / Stadt
            dd {{ form.zipcode && form.city ? `${form.zipcode} ${form.city}` : '–' }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Land
            dd {{ form.country || '–' }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Unternehmenskennung
            dd {{ form.company_alias || '–' }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") IBAN
            dd {{ maskedIban || '–' }}

    Card(class="col-span-2")
      CardHeader
        CardTitle Zeitkonto
        CardDescription Vertragsarbeitszeit & Startwerte
      CardContent(class="pt-4")
        dl(class="text-sm flex flex-col gap-2")
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Wochenstunden
            dd {{ form.contract_hours_per_week ? `${form.contract_hours_per_week} Std.` : '–' }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Arbeitstage / Woche
            dd {{ form.working_days_per_week ? `${form.working_days_per_week} Tage` : '–' }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Urlaubstage / Jahr
            dd {{ form.vacation_days_per_year ? `${form.vacation_days_per_year} Tage` : '–' }}
          div(class="grid grid-cols-2")
            dt(class="text-muted-foreground") Überstunden (Startwert)
            dd {{ form.delta_hours !== '' ? `${form.delta_hours} Std.` : '–' }}

    Card(class="col-span-4 border-positive")
      CardHeader
        CardTitle Bereit zum Speichern
        CardDescription Alle Angaben korrekt?
      CardContent(class="pt-2")
        p(class="text-sm text-muted-foreground") Klicke auf „Mitarbeitenden anlegen", um den Vorgang abzuschließen. Alle Daten können danach noch bearbeitet werden.


//- Navigation
Separator(class="my-4")
div(class="flex justify-between")
  Button(variant="brand-outline" :disabled="currentStep === 1" @click="prevStep" type="button")
    ChevronLeft
    | Zurück
  
  div(class="flex items-center gap-2")
    span(class="text-sm text-muted-foreground mx-0 md:mx-4") Schritt {{ currentStep }} von {{ steps.length }}
    
    Button(
      v-if="currentStep < steps.length"
      variant="brand"
      type="button"
      @click="handleNextStep"
    )
      | Weiter
      ChevronRight
    
    Button(v-else variant="brand" @click="onSubmit" type="button")
      Check
      | Mitarbeitenden anlegen

</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Timer, UserRound, Database, ListIcon, ChevronRight, ChevronLeft, Check } from 'lucide-vue-next'
import Separator from '@/components/ui/separator/Separator.vue'
import {
  Stepper, StepperDescription, StepperIndicator, StepperItem,
  StepperSeparator, StepperTitle, StepperTrigger
} from '@/components/ui/stepper'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { toast } from 'vue-sonner'
import * as z from 'zod'
import CalendarInput from '@/components/app/generic/CalendarInput.vue'
import { type Department, departmentService } from '@/services/department.service'
import { getDepartmentColor } from '@/lib/enumTranslaters'
import { Gender } from '@/constants/enums/componentHelpers.enum'
import { userService, type CreateEmployeeForm } from '@/services/user.service'
import { useRouter } from 'vue-router'

// ---------------------------------------------------------------------------
// Steps config
// ---------------------------------------------------------------------------
const steps = [
  { step: 1, title: 'Basis Daten',      description: 'Zugehörigkeiten und Randinformationen', icon: UserRound },
  { step: 2, title: 'Stammdaten',       description: 'Persönliche Informationen',              icon: Database  },
  { step: 3, title: 'Zeitkonten',       description: 'Vergangene Zeitangaben',                 icon: Timer     },
  { step: 4, title: 'Zusammenfassung',  description: 'Übersicht der Ergebnisse',               icon: ListIcon  },
]

const currentStep = ref(1)

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------
const form = reactive({
  // Step 1
  firstname: '', lastname: '', email: '',
  departmentId: '', location: '', entryDate: '', job_title: '',
  // Step 2
  phone: '',
  birthDate: '', birthPlace: '', nationality: '', gender: '',
  banking_detail: '', street: '', zipcode: '', city: '', country: 'Deutschland',
  company_alias: '', telephone_business: '', telephone_private: '',
  // Step 3
  delta_hours: 0,
  contract_hours_per_week: '',
  working_days_per_week: '',
  vacation_days_per_year: '',
})

const genderLabel = computed(() => {
  const map: Record<string, string> = { male: 'Männlich', female: 'Weiblich', diverse: 'Divers' }
  return map[form.gender] ?? ''
})

const maskedIban = computed(() => {
  if (!form.banking_detail) return ''
  return form.banking_detail.slice(0, 4) + ' **** **** ' + form.banking_detail.slice(-4)
})

// ---------------------------------------------------------------------------
// Zod schemas – one per step (only required fields validated)
// ---------------------------------------------------------------------------
const step1Schema = z.object({
  firstname:    z.string().min(1, 'Vorname ist erforderlich'),
  lastname:     z.string().min(1, 'Nachname ist erforderlich'),
  email:        z.string().min(1, 'E-Mail ist erforderlich').email('Keine gültige E-Mail-Adresse'),
  departmentId: z.string().min(1, 'Abteilung ist erforderlich'),
  location:     z.string().min(1, 'Standort ist erforderlich'),
  entryDate:    z.string().min(1, 'Eintrittsdatum ist erforderlich'),
  job_title:    z.string().min(1, 'Jobtitel ist erforderlich'),
})

const step2Schema = z.object({
  birthDate:   z.string().min(1, 'Geburtsdatum ist erforderlich'),
  birthPlace:  z.string().min(1, 'Geburtsort ist erforderlich'),
  nationality: z.string().min(1, 'Staatsangehörigkeit ist erforderlich'),
  gender:      z.string().min(1, 'Geschlecht ist erforderlich'),
  banking_detail:        z.string().min(1, 'IBAN ist erforderlich'),
  street:      z.string().min(1, 'Straße ist erforderlich'),
  zipcode:         z.string().min(1, 'PLZ ist erforderlich'),
  city:        z.string().min(1, 'Stadt ist erforderlich'),
  country:     z.string().min(1, 'Land ist erforderlich'),
  company_alias: z.string().min(1, 'Unternehmenskennung ist erforderlich'),
  telephone_business: z.string().min(1, 'Geschäftsnummer ist erforderlich'),
  telephone_private: z.string().min(0, 'Privatnummer ist optional')
})

const step3Schema = z.object({
  contract_hours_per_week: z.coerce.number({ invalid_type_error: 'Wochenstunden sind erforderlich' }).min(1, 'Wochenstunden sind erforderlich'),
  working_days_per_week:   z.coerce.number({ invalid_type_error: 'Arbeitstage sind erforderlich' }).min(1, 'Arbeitstage sind erforderlich'),
  vacation_days_per_year:  z.coerce.number({ invalid_type_error: 'Urlaubstage sind erforderlich' }).min(1, 'Urlaubstage sind erforderlich'),
  delta_hours:             z.coerce.number({ invalid_type_error: 'Muss eine Zahl sein' }),
})

// ---------------------------------------------------------------------------
// Error state – typed per step
// ---------------------------------------------------------------------------
type Step1Errors = Partial<Record<keyof z.infer<typeof step1Schema>, string>>
type Step2Errors = Partial<Record<keyof z.infer<typeof step2Schema>, string>>
type Step3Errors = Partial<Record<keyof z.infer<typeof step3Schema>, string>>

const step1Errors = reactive<Step1Errors>({})
const step2Errors = reactive<Step2Errors>({})
const step3Errors = reactive<Step3Errors>({})

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
function validateStep1(): boolean {
  const result = step1Schema.safeParse(form)
  clearErrors(step1Errors)
  if (!result.success) {
    result.error.errors.forEach(e => {
      const key = e.path[0] as keyof Step1Errors
      step1Errors[key] = e.message
    })
  }
  return result.success
}

function validateStep2(): boolean {
  const result = step2Schema.safeParse(form)
  clearErrors(step2Errors)
  if (!result.success) {
    result.error.errors.forEach(e => {
      const key = e.path[0] as keyof Step2Errors
      step2Errors[key] = e.message
    })
  }
  return result.success
}

function validateStep3(): boolean {
  const result = step3Schema.safeParse(form)
  clearErrors(step3Errors)
  if (!result.success) {
    result.error.errors.forEach(e => {
      const key = e.path[0] as keyof Step3Errors
      step3Errors[key] = e.message
    })
  }
  return result.success
}

function clearErrors(errors: Record<string, string | undefined>) {
  Object.keys(errors).forEach(k => delete (errors as any)[k])
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------
const validators: Record<number, () => boolean> = {
  1: validateStep1,
  2: validateStep2,
  3: validateStep3,
}

function handleNextStep() {
  const validate = validators[currentStep.value]
  if (!validate || validate()) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) currentStep.value--
}

function navToOverview() {
  router.push("/management/user-control/")
}
// ---------------------------------------------------------------------------
// Final submit
// ---------------------------------------------------------------------------
const router = useRouter()

async function onSubmit() {
  try {
    // await employeeService.createEmployee(form)
    toast.success('Mitarbeitender angelegt')
    console.log(form)

    const reqObj: CreateEmployeeForm = {
      // Step 1
      firstname:    form.firstname,
      lastname:     form.lastname,
      email:        form.email,
      departmentId: form.departmentId,
      location:     form.location,
      entryDate:    form.entryDate,
      job_title:    form.job_title,

      // Step 2
      birthDate:          form.birthDate,
      birthPlace:         form.birthPlace,
      nationality:        form.nationality,
      gender:             form.gender as Gender,
      banking_detail:     form.banking_detail,
      street:             form.street,
      zipcode:            form.zipcode,
      city:               form.city,
      country:            form.country,
      company_alias:      form.company_alias,
      telephone_business: form.telephone_business,
      telephone_private:  form.telephone_private,

      // Step 3
      contract_hours_per_week: Number(form.contract_hours_per_week),
      working_days_per_week:   Number(form.working_days_per_week),
      vacation_days_per_year:  Number(form.vacation_days_per_year),
      delta_hours:             Number(form.delta_hours),
    }
    const result = await userService.createFullNewUser(reqObj)
    router.back()

  } catch (error) {
    console.error(error)
    toast.error('Fehler beim Anlegen des Mitarbeitenden')
  }
}


const allDepartments = ref<Department[]>([])
onMounted(async () => {

  allDepartments.value = await departmentService.listAllDepartments()
})
</script>