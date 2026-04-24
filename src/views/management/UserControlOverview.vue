<template lang="pug">

h1(tabindex="0") Mitarbeiterverwaltung
p(class="text-muted-foreground max-w-175" tabindex="0") Verwalte hier die Mitarbeitenden des Unternehmens.
  |  Verwalte und konfiguriere die Inhalte für Mitarbeitende.
Separator(class="mt-4")

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

  //- Breadcrumb navigation
  div(class="sticky top-2 z-10 flex items-center gap-2 bg-muted/50 border rounded-md px-4 py-2 mb-4 text-sm backdrop-blur-sm w-fit")
    Breadcrumb
      BreadcrumbList
        BreadcrumbItem
          BreadcrumbLink(
            @click="selectedUser = undefined; activeSection = null"
            @keydown.enter="selectedUser = undefined; activeSection = null"
            class="cursor-pointer flex items-center gap-1.5"
            tabindex="0"
          )
            TableProperties(class="h-4 w-4")
            | Übersicht
        template(v-if="selectedUser")
          BreadcrumbSeparator
          BreadcrumbItem
            BreadcrumbLink(
              @click="activeSection = null"
              @keydown.enter="activeSection = null"
              class="cursor-pointer flex items-center gap-1.5"
              tabindex="0"
            )
              UserIcon(class="h-4 w-4")
              | {{ selectedUser.firstname }} {{ selectedUser.lastname }}
        template(v-if="selectedUser && activeSection")
          BreadcrumbSeparator
          BreadcrumbItem
            BreadcrumbPage(class="flex items-center gap-1.5")
              component(:is="sections.find(s => s.key === activeSection)?.icon" class="h-4 w-4")
              | {{ sections.find(s => s.key === activeSection)?.title }}

  //- Table view to select a user
  div(v-if="!selectedUser" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-4")
    Card(class="col-span-5")
      CardHeader
        CardTitle Benutzer
        CardDescription Wähle zunächst einen Benutzer aus, für wem den du Anpassungen machen möchtest
      CardContent
        EmployeeTable(
          :data="mockUsers"
          @select-user="selectedUser = $event"
        )

  //- Section Selection Menu
  div(v-else-if="selectedUser && !activeSection")
    h2(tabindex="0") {{ sections.length }} Optionen
    ItemGroup(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4")
      Item(
        v-for="section in sections"
        :key="section.key"
        variant="outline"
        as-child
        tabindex="0"
        class="cursor-pointer"
        @keydown.enter="activeSection = section.key"
      )
        a(@click.prevent="activeSection = section.key")
          ItemMedia(variant="icon")
            component(:is="section.icon")
          ItemContent
            ItemTitle {{ section.title }}
            ItemDescription {{ section.description }}
          ItemActions
            ChevronRight(class="size-4")

  //- Detail of a section
  div(v-else-if="selectedUser && activeSection")
    pre {{ activeSection }}
    component(
      :is="sectionComponentMap[activeSection]"
      :user="selectedUser"
    )

</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue';
import Badge from '@/components/ui/badge/Badge.vue';
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Separator from '@/components/ui/separator/Separator.vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import EmployeeTable from '@/components/app/management/userControl/EmployeeTable.vue';
import { DepartmentName } from '@/constants/enums/departmentNames.enum';
import { TableProperties, UserIcon, UserRound, FileText, CalendarOff, Clock, CalendarCheck, ShieldCheck, BarChart2, ChevronRight, Database, Award, UmbrellaOff } from 'lucide-vue-next'
import { Item, ItemGroup, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from '@/components/ui/item'
import { type User } from '@/services/user.service';


const mockUsers = [
  {
    id: 1,
    firstname: 'Anna',
    lastname: 'Müller',
    email: 'anna.mueller@firma.de',
    disabled: false,
    supervisor: null,
    department: { name: DepartmentName.IT },
    roles: [{ name: 'Admin' }, { name: 'HR' }],
  },
  {
    id: 2,
    firstname: 'Max',
    lastname: 'Schmidt',
    email: 'max.schmidt@firma.de',
    supervisor: { id: 1, firstname: 'Anna', lastname: 'Müller', email: 'anna.mueller@firma.de', disabled: false, supervisor: null, roles: [] },
    disabled: false,
    department: { name: DepartmentName.EXECUTIVE },    
    roles: [{ name: 'Mitarbeiter' }],
  },
  {
    id: 3,
    firstname: 'Laura',
    lastname: 'Weber',
    email: 'laura.weber@firma.de',
    disabled: true,
    supervisor: { id: 1, firstname: 'Anna', lastname: 'Müller', email: 'anna.mueller@firma.de', disabled: false, supervisor: null, roles: [] },
    roles: [{ name: 'Mitarbeiter' }, { name: 'Projektleiter' }, { name: 'IT-Admin' }, { name: 'Geschäftsführung' }],
    department: { name: DepartmentName.HR },
  },
  {
    id: 4,
    firstname: 'Felix',
    lastname: 'Bauer',
    email: 'felix.bauer@firma.de',
    disabled: false,
    supervisor: null,
    roles: [],
    department: null,
  },
]

const selectedUser = ref<User | any>(mockUsers[2])

const activeSection = ref<string | null>(null)

const sections = [
  { key: 'master-data', title: 'Stammdaten', description: 'Persönliche Daten und Kontaktinformationen', icon: Database },
  { key: 'documents', title: 'Dokumente', description: 'Dienstliche und persönliche Dokumente', icon: FileText },
  { key: 'certificates', title: 'Zertifikate', description: 'Schulungsnachweise und Zertifikate', icon: Award },
  { key: 'absences', title: 'Abwesenheiten', description: 'Urlaub, Krankheit und sonstige Abwesenheiten', icon: UmbrellaOff },
  { key: 'vacation', title: 'Urlaubsplanung', description: 'Urlaubsplanung zum Genehmigen und Übersicht', icon: CalendarCheck },
]
const sectionComponentMap: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  'master-data':    defineAsyncComponent(() => import('@/components/app/management/userControl/ucMasterData.vue')),
  'documents':      defineAsyncComponent(() => import('@/components/app/management/userControl/ucDocuments.vue')),
  'certificates':   defineAsyncComponent(() => import('@/components/app/management/userControl/ucCertificates.vue')),
  'absences':       defineAsyncComponent(() => import('@/components/app/management/userControl/ucAbsences.vue')),
  'vacation':       defineAsyncComponent(() => import('@/components/app/management/userControl/ucVacationPlanner.vue')),
}

const isLoaded = ref(false)

onMounted(async () => {
  
  // setInterval(() => {
  //   console.log(selectedUser.value)
  // }, 2000);

  isLoaded.value = true

})

</script>