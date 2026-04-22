<template lang="pug">

p(class="max-w-175 text-sm text-brand dark:text-emerald-200" tabindex="0") {{ today }}
h1(tabindex="0") Reporting
p(class="text-muted-foreground max-w-175" tabindex="0") Schaue dir hier die aktuellen relevanten Kennzahlen 
  | zu EmpowHR und dem Unternehmen an.
Separator(class="my-4")

//- Grid Container for all the informations
div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4 mb-4")

  Card(v-for="item in baseInformationArray")
    ReportingBaseInformation(
      :label="item.label"
      :value="item.value"
      :unit="item.unit"
      :trend="item.trend"
      :subLabel="item.subLabel"
      :invertTrend="item.invertTrend"
    )

//- Grid Container for the Bar Chart and Area Chart
div(class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-5 gap-4 mb-4")
  Card(class="col-span-2")
    CardContent
      CustomBarChart(
        :data="roleDistributionData"
        :yDomain="yAxisRange"
        class="h-full w-full pb-4"
      )
  Card(class="col-span-3")
    CardHeader
      CardTitle Plattform Aktivität
      CardDescription Datenbanktransaktionen der letzten 30 Arbeitstage.
    CardContent(class="p-2")
      div(class="h-100 w-full")
        AreaChart(
          :data="activityData"
          index="date"
          :categories="activityDataCategories"
          :colors="activityDataColors"
          :show-legend="true"
          :show-tooltip="true"
          :show-x-axis="false"
          :show-y-axis="true"
          :showXAxis="true"
          :x-axis-options="{ ticks: 6 }"
          class="h-full w-full"
          :margin="{ top: 0, right: 0, bottom: 40, left: 40 }"
        )

//- Grid Container for the Department Table 
div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-4")
  Card(class="col-span-5 p-8")
    DepartmentReportingTable(
      :data="departmentTable"
    )

</template>


<script setup lang="ts">
import { ShieldAlertIcon, BriefcaseBusiness } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ReportingBaseInformation from '@/components/app/management/ReportingBaseInformation.vue'
import CustomBarChart from '@/components/app/generic/CustomBarChart.vue'
import DepartmentReportingTable from '@/components/app/management/DepartmentReportingTable.vue'
import Separator from '@/components/ui/separator/Separator.vue';
import { ref, computed, watch, onMounted } from 'vue'
import { getFormattedTodayDate } from '@/lib/dateHelpers'
import { BarChart } from '@/components/ui/chart-bar'
import { AreaChart } from '@/components/ui/chart-area'
import { RoleName } from '@/constants/enums/acessControl.enum'
import { getDepartmentColor, getRoleColor, translateRoleName } from '@/lib/enumTranslaters'
import { DepartmentName } from '@/constants/enums/departmentNames.enum'

const today = getFormattedTodayDate()

// Base Informations
const baseInformationArray = ref([
  { label: "Mitarbeitende Gesamt", value: 114, unit: "Mitarbeitende", trend: 4.9, subLabel: "Wachstum zum Vorjahr" },
  { label: "Frauenquote", value: "42  %", unit: "in Führungsposition" ,trend: 3, subLabel: "Wachstum zum Vorjahr" },
  { label: "Heute Anwesend", value: 105, unit: "Mitarbeitende", trend: 1.2, subLabel: "Vergleich zum Vorjahrestag" },
  { label: "Krankheitsquote", value: "1.8%", unit: "über alle Abteilungen", trend: 0.3, subLabel: "Vergleich zum Vorjahrestag", invertTrend: true },
  { label: "Betriebszugehörigkeit", value: 5.6, unit: "Jahre ⌀", trend: -4, subLabel: "Wachstum zum Vorjahr", invertTrend: false },
])

// Role Distribution
const roleDistributionData = [
  {
    label: translateRoleName(RoleName.DEPARTMENT_HEAD),
    value: 11,
    color: getRoleColor(RoleName.DEPARTMENT_HEAD)
  },
  {
    label: translateRoleName(RoleName.HR_MANAGER),
    value: 6,
    color: getRoleColor(RoleName.HR_MANAGER)
  },
  {
    label: translateRoleName(RoleName.ACCOUNTANT),
    value: 8,
    color: getRoleColor(RoleName.ACCOUNTANT)
  },
  {
    label: translateRoleName(RoleName.IT_ADMINISTRATOR),
    value: 5,
    color: getRoleColor(RoleName.IT_ADMINISTRATOR)
  },
  {
    label: translateRoleName(RoleName.EXECUTIVE),
    value: 3,
    color: getRoleColor(RoleName.EXECUTIVE)
  },
]
const yAxisRange = [0, 12]

// Activity Data Section
const activityDataCategories = ['Persönlich', 'Organisation', 'Zeitverwaltung']
const activityDataColors = ['#22c55e', '#3b82f6', '#f59e0b']

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
        Persönlich: Math.floor(Math.random() * 50) + 20,
        Organisation: Math.floor(Math.random() * 90) + 45,
        Zeitverwaltung: Math.floor(Math.random() * 100) + 70,
      })
      daysCount++
    }
    offset++
  }
  return data
}

const activityData = generateActivityData()


// Fake Department Data
const departmentTable = [
  {
    id: 1,
    name: "Geschäftsführung",
    costCenter: "CX_0_000",
    lead: "Der Chef",
    totalPeople: 3,
    currentPeople: 3,
    parent: "-",
    color: getDepartmentColor(DepartmentName.EXECUTIVE)
  },
  {
    id: 2,
    name: "Sales",
    costCenter: "CX_1_B00",
    lead: "Samira Salaire",
    totalPeople: 25,
    currentPeople: 25,
    parent: "Geschäftsführung",
    color: getDepartmentColor(DepartmentName.SALES)
  },
  {
    id: 3,
    name: "Human Ressources",
    costCenter: "CX_1_A00",
    lead: "Helene Human",
    totalPeople: 6,
    currentPeople: 5,
    parent: "Geschäftsführung",
    color: getDepartmentColor(DepartmentName.HR)
  },
  {
    id: 4,
    name: "Marketing",
    costCenter: "CX_1_C00",
    lead: "Marlene Marki",
    totalPeople: 6,
    currentPeople: 5,
    parent: "Geschäftsführung",
    color: getDepartmentColor(DepartmentName.MARKETING)
  },
  {
    id: 5,
    name: "IT",
    costCenter: "CX_1_D00",
    lead: "Igor Informi",
    totalPeople: 55,
    currentPeople: 49,
    parent: "Geschäftsführung",
    color: getDepartmentColor(DepartmentName.IT)
  },
  // {
  //   id: 6,
  //   name: "Software Entwicklung",
  //   costCenter: "CX_2_D00",
  //   lead: "Sergej Software",
  //   totalPeople: 80,
  //   currentPeople: 77,
  //   parent: "IT"
  // },
  // {
  //   id: 7,
  //   name: "Dev-Ops",
  //   costCenter: "CX_2_D01",
  //   lead: "Sergej Software",
  //   totalPeople: 15,
  //   currentPeople: 12,
  //   parent: "IT"
  // },
  {
    id: 8,
    name: "Finance",
    costCenter: "CX_1_E00",
    lead: "Fiona Finanzi",
    totalPeople: 12,
    currentPeople: 12,
    parent: "Geschäftsführung",
    color: getDepartmentColor(DepartmentName.FINANCE)
  },
  // {
  //   id: 9,
  //   name: "Accountant",
  //   costCenter: "CX_2_E00",
  //   lead: "Andrea Accounti",
  //   totalPeople: 7,
  //   currentPeople: 7,
  //   parent: "Geschäftsführung"
  // },
  // {
  //   id: 10,
  //   name: "Controlling",
  //   costCenter: "CX_2_E01",
  //   lead: "Constantin Controlli",
  //   totalPeople: 5,
  //   currentPeople: 4,
  //   parent: "Geschäftsführung"
  // },
  {
    id: 11,
    name: "Rechtsabteilung",
    costCenter: "CX_1_F00",
    lead: "Jonas Juri",
    totalPeople: 7,
    currentPeople: 6,
    parent: "Geschäftsführung",
    color: getDepartmentColor(DepartmentName.LEGAL)
  },
]

onMounted(async () => {
  
})

</script>

<style lang="css">

</style>