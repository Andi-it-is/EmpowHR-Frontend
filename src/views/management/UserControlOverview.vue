<template lang="pug">

h1(tabindex="0") Mitarbeiterverwaltung
p(class="text-muted-foreground max-w-175" tabindex="0") Verwalte hier die Mitarbeitenden des Unternehmens.
  |  Verwalte und konfiguriere die Inhalte für Mitarbeitende. 

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

  Card(class="w-full min-h-96")
    CardHeader
      CardTitle Benutzer
      CardDescription Verwalte die Benutzer des Unternehmens
    CardContent
      acUserTable(
        :data="mockUsers"
      )

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Badge from '@/components/ui/badge/Badge.vue';
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Separator from '@/components/ui/separator/Separator.vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import acPermissionTable from '@/components/app/management/accessControlTableComponents/acPermissionTable.vue';
import acRoleTable from '@/components/app/management/accessControlTableComponents/acRoleTable.vue';
import acUserTable from '@/components/app/management/accessControlTableComponents/acUserTable.vue';
import { DepartmentName } from '@/constants/enums/departmentNames.enum';
import { DocumentSecurityLevel } from '@/constants/enums/document.enum';
import { PermissionAction, PermissionScope } from '@/constants/enums/acessControl.enum';

const tabComponents = {
  users: acUserTable,
  roles: acRoleTable,
  permissions: acPermissionTable,
}

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


const isLoaded = ref(false)

onMounted(async () => {
  
  isLoaded.value = true

})

</script>