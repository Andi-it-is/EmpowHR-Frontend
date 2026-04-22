<template lang="pug">

h1(tabindex="0") Zugriffsverwaltung
p(class="text-muted-foreground max-w-175" tabindex="0") Verwalte hier die Rollen und Berechtigungen die in EmpowHR verwendet werden.
  |  Verwalte die Rollen und Zugriffe der einzelnen Benutzer

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

Tabs(v-model="activeTab" class="w-full")
  TabsList(variant="outline")
    TabsTrigger(value="users") 
      | Benutzer
      Badge(class="ml-2 mr-1" variant="bordered") {{ mockUsers.length }}
    TabsTrigger(value="roles")
      | Rollen
      Badge(class="ml-2 mr-1" variant="bordered") {{ mockRoles.length }}
    TabsTrigger(value="permissions")
      | Berechtigungen
      Badge(class="ml-2 mr-1" variant="bordered") {{ mockPermissions.length }}
  Card(class="w-full min-h-96 mt-4")
    CardHeader
      CardTitle {{ tabConfig[activeTab].title }}
      CardDescription {{ tabConfig[activeTab].description }}
    CardContent
      component(:is="tabComponents[activeTab]" :data="tabData[activeTab]")

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

const activeTab = ref<'users' | 'roles' | 'permissions'>('permissions')
const tabConfig = {
  users: { title: 'Benutzer', description: 'Verwalte die Benutzer des Unternehmens.' },
  roles: { title: 'Rollen', description: 'Verwalte die Rollen und ihre Zuweisungen.' },
  permissions: { title: 'Berechtigungen', description: 'Verwalte die verfügbaren Berechtigungen.' },
}
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

const mockRoles = [
  { id: 1, name: 'Admin', max_security_level: DocumentSecurityLevel.TOP_SECRET, permissions: [{id:1,name:'user.read'},{id:2,name:'user.write'}] },
  { id: 2, name: 'Vorgesetzter', max_security_level: DocumentSecurityLevel.CONFIDENTIAL, permissions: [{id:1,name:'user.read'}] },
  { id: 3, name: 'Mitarbeiter', max_security_level: DocumentSecurityLevel.BUSINESS, permissions: [{id:1,name:'user.read'}] },
  { id: 4, name: 'HR', max_security_level: DocumentSecurityLevel.TOP_SECRET, permissions: [{id:1,name:'user.read'}] },
  { id: 5, name: 'Gast (?)', max_security_level: DocumentSecurityLevel.RESTRICTED, permissions: [] },
]
const mockPermissions = [
  { id: 1, entity: 'User', action: PermissionAction.READ, scope: PermissionScope.ALL },
  { id: 2, entity: 'User', action: PermissionAction.UPDATE, scope: PermissionScope.SELF },
  { id: 3, entity: 'User', action: PermissionAction.DELETE, scope: PermissionScope.SUBORDINATE },
  { id: 4, entity: 'Document', action: PermissionAction.CREATE, scope: PermissionScope.DEPARTMENT },
  { id: 5, entity: 'Document', action: PermissionAction.READ, scope: PermissionScope.ALL },
  { id: 6, entity: 'Document', action: PermissionAction.DELETE, scope: PermissionScope.SELF },
  { id: 7, entity: 'Role', action: PermissionAction.READ, scope: PermissionScope.ALL },
  { id: 8, entity: 'Role', action: PermissionAction.UPDATE, scope: PermissionScope.DEPARTMENT },
  // READ
  { id: 13, entity: 'TimeEntry', action: PermissionAction.READ, scope: PermissionScope.ALL },
  { id: 14, entity: 'TimeEntry', action: PermissionAction.READ, scope: PermissionScope.DEPARTMENT },
  { id: 15, entity: 'TimeEntry', action: PermissionAction.READ, scope: PermissionScope.SUBORDINATE },
  { id: 16, entity: 'TimeEntry', action: PermissionAction.READ, scope: PermissionScope.SELF },
  // CREATE
  { id: 17, entity: 'TimeEntry', action: PermissionAction.CREATE, scope: PermissionScope.ALL },
  { id: 18, entity: 'TimeEntry', action: PermissionAction.CREATE, scope: PermissionScope.DEPARTMENT },
  { id: 19, entity: 'TimeEntry', action: PermissionAction.CREATE, scope: PermissionScope.SUBORDINATE },
  { id: 20, entity: 'TimeEntry', action: PermissionAction.CREATE, scope: PermissionScope.SELF },
  // UPDATE
  { id: 21, entity: 'TimeEntry', action: PermissionAction.UPDATE, scope: PermissionScope.ALL },
  { id: 22, entity: 'TimeEntry', action: PermissionAction.UPDATE, scope: PermissionScope.DEPARTMENT },
  { id: 23, entity: 'TimeEntry', action: PermissionAction.UPDATE, scope: PermissionScope.SUBORDINATE },
  { id: 24, entity: 'TimeEntry', action: PermissionAction.UPDATE, scope: PermissionScope.SELF },
  // DELETE
  { id: 25, entity: 'TimeEntry', action: PermissionAction.DELETE, scope: PermissionScope.ALL },
  { id: 26, entity: 'TimeEntry', action: PermissionAction.DELETE, scope: PermissionScope.DEPARTMENT },
  { id: 27, entity: 'TimeEntry', action: PermissionAction.DELETE, scope: PermissionScope.SUBORDINATE },
  { id: 28, entity: 'TimeEntry', action: PermissionAction.DELETE, scope: PermissionScope.SELF },
]
const tabData = {
  users: mockUsers,
  roles: mockRoles,
  permissions: mockPermissions,
}


const isLoaded = ref(false)

onMounted(async () => {
  
  isLoaded.value = true

})

</script>