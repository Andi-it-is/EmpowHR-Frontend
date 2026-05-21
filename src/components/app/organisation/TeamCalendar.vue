<template lang="pug">

div(v-if="allDepartments.length === 0 && isLoaded")
  div(class="bg-red-200 p-4") Keine Berechtigungen, Einträge anderer sehen zu dürfen
div(v-else)
  //- Navigation options
  div(class="flex flex-col" v-if="isLoaded")

    div(class="flex flex-wrap items-center justify-end")

      Select(
        v-model="selectedDepartment"
        class="flex max-w-50"
        @update:modelValue="loadData"
      )
        SelectTrigger(class="w-75")
          SelectValue(placeholder="Ausgewählte Abteilung")
        SelectContent
          SelectItem(
            v-for="dept in allDepartments"
            :key="dept.id"
            :value="dept.id"
          ) {{ dept.name }}
    div(class="flex flex-col gap-2")
      h4 Abteilungsleitung
      Item(class="bg-muted max-w-fit")
        ItemMedia 
          Avatar
            AvatarFallback(class="flex bg-brand text-white text-lg h-12 w-12 justify-center items-center") {{ leadInitials }}
        ItemContent
          ItemTitle {{ deptLead?.firstname }} {{ deptLead?.lastname }}
          ItemDescription {{ deptLead?.email }}

      div(class="flex flex-wrap items-center gap-6 border rounded-md m-auto p-2 mb-4")
        Button(variant="outline" @click="goToToday")
          CalendarCheck(:size="16")
          | Heute

        div(class="flex gap-2 items-center")
          Button(variant="outline" size="icon" @click="prevMonth")
            ChevronLeft(:size="16")
          span(class="text-sm font-medium w-28 text-center") {{ monthLabel }}
          Button(variant="outline" size="icon" @click="nextMonth")
            ChevronRight(:size="16")


        Select(
          :modelValue="String(selectedYear)"
          @update:modelValue="onYearChange"
        )
          SelectTrigger(class="w-24")
            SelectValue
          SelectContent
            SelectItem(
              v-for="y in yearOptions"
              :key="y"
              :value="String(y)"
            ) {{ y }}

      DepartmentCalendar(
        v-if="calendarData"
        :calendarData="calendarData"
        :month="selectedMonth"
        :year="selectedYear"
      )
  

</template>


<script setup lang="ts">
import { departmentService, type Department } from '@/services/department.service';
import { onMounted, ref, computed } from 'vue';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Item, ItemContent, ItemDescription, ItemFooter, ItemHeader, ItemMedia, ItemTitle } from '@/components/ui/item'
import { userService } from '@/services/user.service';
import DepartmentCalendar from './DepartmentCalendar.vue';
import { ChevronRight, ChevronLeft, CalendarCheck  } from 'lucide-vue-next';
import Button from '@/components/ui/button/Button.vue';
import { toast } from 'vue-sonner'


const allDepartments = ref<Department[]>([])
const selectedDepartment = defineModel<string>('departmentId')

const isLoaded = ref(false)

const deptLead = computed( () => allDepartments.value.find(d => selectedDepartment.value === d.id)?.head )
const fullSelectedDepartment = computed(() => allDepartments.value.find(d => selectedDepartment.value === d.id))

const leadInitials = computed(() => {
  if (!deptLead.value) return '##'
  const first = deptLead.value.firstname?.[0] || ''
  const last = deptLead.value.lastname?.[0] || ''
  return (first + last).toUpperCase()
})

const props = defineProps<{
  anonymized: boolean
  viewingUser: string
}>()

// shared V-models
const now = new Date()
const selectedMonth = defineModel<number>('month', { required: true })
const selectedYear = defineModel<number>('year', { required: true })
const calendarData = defineModel<any>('calendarData')


const yearOptions = computed(() => {
  const y = now.getFullYear()
  return [y - 1, y, y + 1]
})

const monthLabel = computed(() =>
  new Date(selectedYear.value, selectedMonth.value - 1, 1)
    .toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
)

async function goToToday() {
  selectedMonth.value = now.getMonth() + 1
  selectedYear.value = now.getFullYear()
  await loadData()
}

async function prevMonth() {
  if (selectedMonth.value === 1) {
    selectedMonth.value = 12
    selectedYear.value -= 1
  } else {
    selectedMonth.value -= 1
  }
  await loadData()
}

async function nextMonth() {
  if (selectedMonth.value === 12) {
    selectedMonth.value = 1
    selectedYear.value += 1
  } else {
    selectedMonth.value += 1
  }
  await loadData()
}

function onYearChange(val: string) {
  selectedYear.value = parseInt(val)
}

defineExpose({ loadData })

async function loadData() {

  allDepartments.value = await departmentService.listAllDepartments()

  const propsUser = props.viewingUser
  if (!props.anonymized) {
    allDepartments.value = allDepartments.value.filter((d: Department) => d.head!.id === propsUser)
  }

  if (props.anonymized) {
    calendarData.value = await departmentService.listDepartmentCalendarAnonymized(
      selectedDepartment.value!,
      { month: selectedMonth.value, year: selectedYear.value }
    )
  } else {
    calendarData.value = await departmentService.listDepartmentCalendarWithUsers(
      selectedDepartment.value!,
      { month: selectedMonth.value, year: selectedYear.value }
    )
  }
}

onMounted(async () => {

  const userInfo = await userService.getSimpleUserInfo()

  if (props.anonymized) {
    selectedDepartment.value = userInfo.department.id
  } else {
    
    if (userInfo.department.head?.id === userInfo.id) {
      selectedDepartment.value = userInfo.department.id
    } else {
      selectedDepartment.value = ''
      toast.error('Keine Berechtigung', {
        description: 'Du bist kein Abteilungsleiter und hast keinen Zugriff auf diese Ansicht. Demo Account sieht trotzdem die leere Ansicht.',
      })
    }
  }

  await loadData()
  
  isLoaded.value = true
})

</script>

