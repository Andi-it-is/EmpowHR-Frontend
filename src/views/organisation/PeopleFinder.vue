<template lang="pug">
  
h1(tabindex="0") Personenregister
p(class="text-muted-foreground max-w-175" tabindex="0") Finde hier Personen und Talente im Unternehmen.

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
  //- Filter Section
  div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4")
    Card(class="col-span-4")
      CardHeader
        CardTitle Personensuche
        CardDescription Setze Filter um nach Personen zu suchen.
      CardContent
        div(class="flex flex-wrap gap-4 justify-between")
          div(class="relative w-full sm:w-80 md:w-100 xl:w-125")
            Search(class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none")
            Input(v-model="searchQuery" placeholder="Name, E-Mail, Kürzel, Jobtitel, ..." class="pl-9 w-full")
          Select(v-model="selectedDepartment")
            SelectTrigger(class="w-75")
              //- colored Dot
              div(class="flex items-center gap-2")
                span(
                  v-if="selectedDepartment === 'all'"
                  class="size-2 rounded-full shrink-0 bg-muted-foreground/40"
                )
                span(
                  v-else
                  :style="{ backgroundColor: getDepartmentColor(getSelectedDepartmentName()) }"
                  class="size-2 rounded-full shrink-0"
                )
                span {{ getSelectedDepartmentLabel() }}
            SelectContent
              SelectItem(value="all")
                div(class="flex items-center gap-2")
                  span(class="size-2 rounded-full shrink-0 bg-muted-foreground/40")
                  span Alle Abteilungen
              SelectItem(v-for="dept in allDepartments" :key="dept.id" :value="dept.id")
                div(class="flex items-center gap-2")
                  span(:style="{ backgroundColor: getDepartmentColor(dept.name) }" class="size-2 rounded-full shrink-0")
                  span {{ dept.name }}


  //- User Grids
  div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4")
    Card(v-for="user in filteredEmployees" :key="user.id" class="self-start")
      CardContent(class="pt-4 pb-4 px-4")
        Collapsible(v-model:open="openStates[user.id]")

          //- Header
          div(class="flex items-center gap-3")
            Avatar(class="size-10 shrink-0" :style=" { backgroundColor: getAvatarColor(user) }")
              AvatarFallback {{ getInitials(user.firstname, user.lastname) }}
            div(class="flex-1 min-w-0")
              p(class="font-medium truncate") {{ user.firstname }} {{ user.lastname }}
              p(class="text-sm text-muted-foreground truncate") {{ user.master_data?.job_title ?? '—' }}
            CollapsibleTrigger(as-child)
              Button(variant="ghost" size="icon" class="size-8 shrink-0")
                ChevronDown(:class="['size-4 transition-transform duration-200', openStates[user.id] ? 'rotate-180' : '']")

          //- Badges
          div(class="flex flex-wrap gap-1.5 mt-3")
            Badge(
              v-if="user.department"
              variant="outline"
              class="flex items-center gap-1.5"
            )
              span(:style="{ backgroundColor: getDepartmentColor(user.department.name) }" class="size-1.5 rounded-full shrink-0")
              span {{ user.department.name }}
            Badge(variant="secondary" class="text-muted-foreground") {{ user.master_data?.company_alias ?? '—' }}

          //- Collapsible Details
          CollapsibleContent
            Separator(class="my-3")
            div(class="flex flex-col gap-2.5 text-sm")
              div(class="flex items-center gap-2 text-muted-foreground")
                Mail(class="size-3.5 shrink-0")
                a(:href="`mailto:${user.email}`" class="hover:text-foreground transition-colors truncate") {{ user.email }}
              div(class="flex items-center gap-2 text-muted-foreground")
                Phone(class="size-3.5 shrink-0")
                a(:href="`tel:${user.master_data?.telephone_business}`" class="hover:text-foreground transition-colors") {{ user.master_data?.telephone_business ?? '—' }}
              div(class="flex items-center gap-2 text-muted-foreground")
                MapPin(class="size-3.5 shrink-0")
                span {{ user.master_data?.city }}, {{ user.master_data?.country }}
              div(class="flex items-center gap-2 text-muted-foreground")
                CalendarDays(class="size-3.5 shrink-0")
                span Im Unternehmen seit {{ formatDate(user.master_data?.started_working_date) }}

</template>


<script setup lang="ts">
import Separator from '@/components/ui/separator/Separator.vue';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card/'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectGroup, SelectValue, SelectTrigger } from '@/components/ui/select';
import { computed, onMounted, reactive, ref } from 'vue';
import { departmentService, type Department } from '@/services/department.service';
import { getDepartmentColor } from '@/lib/enumTranslaters';
import { type User, userService } from '@/services/user.service';
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronDown, Mail, Phone, MapPin, CalendarDays, Search } from 'lucide-vue-next'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import Badge from '@/components/ui/badge/Badge.vue';

const allDepartments = ref<Department[]>([])
const allUsers = ref<User[]>([])
const selectedDepartment = ref<string>('all')


const searchQuery = ref<string>('')

const filteredEmployees = computed(() => {
  return allUsers.value.filter((e: any) => {
    const matchesDept = selectedDepartment.value === 'all' || e.department?.id === selectedDepartment.value

    const query = searchQuery.value.toLowerCase().trim()
    const matchesSearch = query === '' || [
      e.firstname,
      e.lastname,
      e.email,
      e.master_data?.company_alias,
      e.master_data?.job_title,
      e.master_data?.city,
      e.master_data?.country,
    ].some(field => field?.toLowerCase().includes(query))

    return matchesDept && matchesSearch
  })
})

function getSelectedDepartmentName(): string {
  return allDepartments.value.find(d => d.id === selectedDepartment.value)?.name ?? ''
}

function getSelectedDepartmentLabel(): string {
  if (selectedDepartment.value === 'all') return 'Abteilung'
  return getSelectedDepartmentName()
}


const openStates = reactive<Record<string, boolean>>({})

function getAvatarColor(user: User) {
  const color = user.department ? getDepartmentColor(user.department.name) : '#64748b'
  return `color-mix(in srgb, ${color} 20%, transparent)`
}

function getInitials(firstname: string, lastname: string) {
  return `${firstname?.[0] ?? ''}${lastname?.[0] ?? ''}`.toUpperCase()
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })
}

const isLoaded = ref(false)

onMounted(async () => {

  const infos = await userService.listPeopleFinderInformations()
  allDepartments.value = infos.departments
  allUsers.value = infos.users
  isLoaded.value = true

})

</script>