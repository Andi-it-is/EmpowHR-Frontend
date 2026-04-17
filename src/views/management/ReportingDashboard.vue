<template lang="pug">

p(class="max-w-175 text-sm text-brand dark:text-emerald-200" tabindex="0") {{ today }}
h1(tabindex="0") Reporting
p(class="text-muted-foreground max-w-175" tabindex="0") Schaue dir hier die aktuellen relevanten Kennzahlen 
  | zu EmpowHR und dem Unternehmen an.
Separator

//- Grid Container for all the informations
div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-4")

  ReportingBaseInformation(
    v-for="item in baseInformationArray"
    :label="item.label"
    :value="item.value"
    :unit="item.unit"
    :trend="item.trend"
    :subLabel="item.subLabel"
    :invertTrend="item.invertTrend"
  )

//- Grid Container for the Bar Chart and Area Chart
div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-4")
  div(class="col-span-2 border-0 rounded-md")
    CustomBarChart(
      :data="roleDistributionData"
      class="h-full w-full pb-4"
    )
  div(class="col-span-3 border-0 rounded-md bg-muted/50 shadow-none")
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
          class="h-full w-full pb-4"
          :margin="{ top: 0, right: 0, bottom: 40, left: 40 }"
        )

//- Grid Container for the Table 
div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4")
  div(class="col-span-5 border-0 rounded-md bg-muted/50 p-8")
    DepartmentReportingTable(
      :data="tableData"
    )

//- Grid Container for the HR Numbers
div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4")

  div(class="col-span-2 border-0 rounded-md bg-muted/50")
    Card(class="h-100 p-8") HR-Kennzahlen

  div(class="col-span-3 border-0 rounded-md bg-muted/50")
    Card(class="h-100 p-8") Offene Vorgägnge

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
import { getRoleColor, translateRoleName } from '@/lib/enumTranslaters'

const today = getFormattedTodayDate()

// Base Informations
const baseInformationArray = ref([
  { label: "Mitarbeitende Gesamt", value: 67, unit: "Mitarbeitende", trend: 4.9, subLabel: "Wachstum zum Vorjahr" },
  { label: "Frauenquote", value: "42  %", unit: "in Führungsposition" ,trend: 3, subLabel: "Wachstum zum Vorjahr" },
  { label: "Heute Anwesend", value: 59, unit: "Mitarbeitende", trend: 1.2, subLabel: "Vergleich zum Vorjahrestag" },
  { label: "Krankheitsquote", value: "1.8%", unit: "über alle Abteilungen", trend: 0.3, subLabel: "Vergleich zum Vorjahrestag", invertTrend: true },
  { label: "Betriebszugehörigkeit", value: 5.6, unit: "Jahre ⌀", trend: -4, subLabel: "Wachstum zum Vorjahr", invertTrend: false },
])

// Role Distribution
const roleDistributionData = [
  {
    label: translateRoleName(RoleName.DEPARTMENT_HEAD),
    value: 7,
    color: getRoleColor(RoleName.DEPARTMENT_HEAD)
  },
  {
    label: translateRoleName(RoleName.HR_MANAGER),
    value: 4,
    color: getRoleColor(RoleName.HR_MANAGER)
  },
  {
    label: translateRoleName(RoleName.ACCOUNTANT),
    value: 5,
    color: getRoleColor(RoleName.ACCOUNTANT)
  },
  {
    label: translateRoleName(RoleName.IT_ADMINISTRATOR),
    value: 4,
    color: getRoleColor(RoleName.IT_ADMINISTRATOR)
  },
  {
    label: translateRoleName(RoleName.EXECUTIVE),
    value: 3,
    color: getRoleColor(RoleName.EXECUTIVE)
  },
]

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


// Departments Table
const tableData = [
  {
    id: 1,
    header: "Quartalsplanung Q2",
    type: "Planung",
    status: "In Bearbeitung",
    target: "Abteilungsleiter",
    limit: "15.05.2026",
    reviewer: "Dr. Müller (Executive)"
  },
  {
    id: 2,
    header: "Jahresgespräch 2026",
    type: "Persönlich",
    status: "Abgeschlossen",
    target: "Mitarbeiter",
    limit: "01.04.2026",
    reviewer: "Sarah Schmidt (HR)"
  },
  {
    id: 3,
    header: "IT-Sicherheitsaudit",
    type: "Infrastruktur",
    status: "Offen",
    target: "IT-Administrator",
    limit: "20.06.2026",
    reviewer: "Technik-Vorstand"
  },
  {
    id: 4,
    header: "Budgetfreigabe Marketing",
    type: "Finanzen",
    status: "Wartet auf Freigabe",
    target: "Buchhaltung",
    limit: "30.04.2026",
    reviewer: "CFO (Executive)"
  },
  {
    id: 5,
    header: "Fortbildung React/Vue",
    type: "Persönlich",
    status: "Geplant",
    target: "Mitarbeiter",
    limit: "12.07.2026",
    reviewer: "Teamlead Frontend"
  }
]

onMounted(async () => {
  
})

</script>

<style lang="css">

</style>