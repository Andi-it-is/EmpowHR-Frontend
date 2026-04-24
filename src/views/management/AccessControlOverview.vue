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

  div(class="rounded-md border bg-muted/30 p-4 mb-4 space-y-2")
    p(class="text-md font-medium") Sicherheitsstufen & Zugriffsbereiche
    p(class="text-sm text-muted-foreground")
      | Die maximale Dokumenten Sichtenstufe einer Rolle legt fest, bis zu welcher Vertraulichkeiststufe Dokumente von anderen Benutzern gesichtet werden dürfen.
      | Je höher die Stufe, desto mehr Zugriff auf sensiblere Dokumente hat diese Rolle. Das betrifft nur Dokumente, welche in EmpowHR existieren.
      | So dürfen nur wenige ausgewählte Rollen sensible Dokumente, wie Gehaltsabrechnungen, Mahnungen oder sonstiges sichten, um beispielsweise 
      | die Buchhaltung zu pflegen oder einzelene Mitarbeiter über Mahnungen o.ä. zu informieren.

  Tabs(v-model="activeTab" class="w-full")
    TabsList(v-if="!selectedRole" variant="outline")
      TabsTrigger(value="roles")
        | Rollen
        Badge(class="ml-2 mr-1" variant="bordered") {{ allRoles.length }}
      TabsTrigger(value="users")
        | Benutzer
        Badge(class="ml-2 mr-1" variant="bordered") {{ allPermissions.length }}
      TabsTrigger(value="permissions")
        | Berechtigungen
        Badge(class="ml-2 mr-1" variant="bordered") {{ allPermissions.length }}

    Button(v-if="selectedRole" variant="brand-outline" @click="goBack()")
      ArrowLeft
      | Zurück zur Tabelle

    //- Makes underlying table responsive
    div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-4")
      Card(class="col-span-5 mt-4")
        CardHeader
          CardTitle {{ tabConfig[activeTab].title }}
          CardDescription {{ tabConfig[activeTab].description }}

        CardContent(class="relative py-4")
          div(v-if="!selectedRole" class="overflow-x-auto")
            component(
              :is="tabComponents[activeTab]"
              :data="tabData[activeTab]"
              @open-detail="handleOpenDetail"
            )
          div(v-else)

  div(
    v-if="selectedRole"
    class="sticky top-2 z-10 border-2 rounded-md flex items-center justify-between bg-muted px-6 py-3 mt-4"
  )
    div(class="flex items-center gap-4 text-sm")
      span {{ assignedIds.size }} ausgewählt
      span(v-if="addedCount > 0" class="text-positive") +{{ addedCount }} hinzugefügt
      span(v-if="removedCount > 0" class="text-destructive") -{{ removedCount }} entfernt
    Button(variant="brand" @click="savePermissions()") Speichern

  //- Detail Selection in the role table. Every Permission, both unselected and selected ones as grouped tables
  div(v-if="selectedRole" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mt-8")
    Card(v-for="(permissions, entity) in groupedPermissions" :key="entity")
      CardHeader(class="pb-2")
        CardTitle(class="text-md font-semibold mb-2") {{ entity }}
      CardContent(class="p-0 px-4")
        Table
          TableHeader
            TableRow(class="hover:bg-transparent")
              TableHead(class="h-8 text-xs") Aktion
              TableHead(class="h-8 text-xs") Scope
              TableHead(class="h-8 text-xs w-1 text-center") Ausgewählt
          TableBody
            TableRow(
              v-for="permission in permissions"
              :key="permission.id"
              class="h-10"
            )
              TableCell(class="py-1")
                Badge(variant="outline" :class="PermissionActionClasses[permission.action]") 
                  | {{ PermissionActionLabels[permission.action] }}
              TableCell(class="py-1 text-sm text-muted-foreground")
                div(class="flex items-center gap-2")
                  span(class="h-2 w-2 rounded-full shrink-0" :style="{ backgroundColor: PermissionScopeColors[permission.scope] }")
                  | {{ PermissionScopeLabels[permission.scope] }}
              TableCell(class="py-1 text-center")
                div(class="flex justify-center pr-4")
                  Checkbox(:model-value="assignedIds.has(permission.id)" @update:model-value="togglePermission(permission.id)")
          

</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import Button from '@/components/ui/button/Button.vue';
import { ArrowLeft } from 'lucide-vue-next';
import Badge from '@/components/ui/badge/Badge.vue';
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue';
import { Table, TableHeader, TableHead, TableRow, TableCell, TableBody } from '@/components/ui/table';
import Separator from '@/components/ui/separator/Separator.vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import acPermissionTable from '@/components/app/management/accessControlTableComponents/acPermissionTable.vue';
import acRoleTable from '@/components/app/management/accessControlTableComponents/acRoleTable.vue';
import acUserTable from '@/components/app/management/accessControlTableComponents/acUserTable.vue';
import { DepartmentName } from '@/constants/enums/departmentNames.enum';
import { DocumentSecurityLevel, DocumentSecurityLevelApiMap, DocumentSecurityLevelFromApi } from '@/constants/enums/document.enum';
import { PermissionAction, PermissionScope, RoleName } from '@/constants/enums/acessControl.enum';
import { type Permission, roleService, type Role } from '@/services/role.service';
import { PermissionActionClasses, PermissionActionLabels, PermissionScopeLabels, PermissionScopeColors } from '@/lib/enumTranslaters';
import { toast } from 'vue-sonner';

const activeTab = ref<'roles' | 'users' |'permissions'>('users')
const tabConfig = {
  roles: { title: 'Rollen', description: 'Verwalte die Rollen und ihre Zuweisungen.' },
  users: { title: 'Benutzer', description: 'Konfiguriere die Nutzer und die Rollen der Nutzer.' },
  permissions: { title: 'Berechtigungen', description: 'Schaue dir die verfügbaren Berechtigungen an.' },
}
const tabComponents = {
  roles: acRoleTable,
  users: acUserTable,
  permissions: acPermissionTable,
}

const selectedRole = ref<Role | null>()

const originalIds = ref(new Set<string>())
const assignedIds = ref(new Set<string>())

function handleOpenDetail(role: Role) {
  selectedRole.value = role
  const ids = new Set(role.permissions.map(p => p.id))
  originalIds.value = ids
  assignedIds.value = new Set(ids)
}

const addedCount = computed(() =>
  [...assignedIds.value].filter(id => !originalIds.value.has(id)).length
)

const removedCount = computed(() =>
  [...originalIds.value].filter(id => !assignedIds.value.has(id)).length
)

function goBack() {
  selectedRole.value = null
}

watch(selectedRole, (role) => {
  if (!role) assignedIds.value = new Set()
})

function togglePermission(id: string) {
  const next = new Set(assignedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  assignedIds.value = next
}

const actionOrder = [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.UPDATE, PermissionAction.DELETE]
const scopeOrder  = [PermissionScope.ALL, PermissionScope.DEPARTMENT, PermissionScope.SUBORDINATE, PermissionScope.SELF]

const groupedPermissions = computed(() => {
  const result = allPermissions.value.reduce<Record<string, typeof allPermissions.value>>((acc, p) => {
    if (!acc[p.entity]) acc[p.entity] = []
    acc[p.entity]!.push(p)
    return acc
  }, {})

  Object.values(result).forEach(group => {
    group.sort((a, b) => {
      const actionDiff = actionOrder.indexOf(a.action) - actionOrder.indexOf(b.action)
      if (actionDiff !== 0) return actionDiff
      return scopeOrder.indexOf(a.scope) - scopeOrder.indexOf(b.scope)
    })
  })

  return Object.fromEntries(
    Object.entries(result).sort(([a], [b]) => a.localeCompare(b))
  )
})

const isLoaded = ref(false)
const allRoles = ref<Role[]>([])
const allPermissions = ref<Permission[]>([])

const tabData = computed(() => ({
  roles: fakeRoles ,//allRoles.value,
  users: fakeUsers,
  permissions: [] //allPermissions.value,
}))

async function savePermissions() {
  if (!selectedRole.value) return
  try {
    await roleService.updateRolesPermissions(selectedRole.value.id, [...assignedIds.value])
    originalIds.value = new Set(assignedIds.value)
    toast.success('Berechtigungen gespeichert')
  } catch (error) {
    toast.error('Fehler beim Speichern')
  }
}

const fakeUsers = [
  {
    firstname: "Andi",
    lastname: "Arbeit",
    email: "andi.arbeit@mail.de",
    disabled: false ,
    roles: [ 
      { id: "uuid-2345", name: RoleName.EMPLOYEE },
      { id: "uuid-1234", name: RoleName.IT_ADMINISTRATOR },
      { id: "uuid-2345", name: RoleName.ACCOUNTANT },
      { id: "uuid-1234", name: RoleName.DEPARTMENT_HEAD },
      { id: "uuid-2345", name: RoleName.HR_MANAGER },
      { id: "uuid-1234", name: RoleName.DEMO },
      { id: "uuid-2345", name: RoleName.EXECUTIVE },
    ],
    department: { id: "dept-1234", name: DepartmentName.IT }
  },
  {
    firstname: "Bettina",
    lastname: "ZZZ",
    email: "b.z@mail.de",
    disabled: false ,
    roles: [
      { id: "uuid-2345", name: RoleName.EMPLOYEE },
      { id: "uuid-2345", name: RoleName.EXECUTIVE },
    ],
    department: { id: "dept-1234", name: DepartmentName.EXECUTIVE }
  },
  {
    firstname: "WWW",
    lastname: "Demo",
    email: "w.d@mail.de",
    disabled: true,
    roles: [
      { id: "uuid-2345", name: RoleName.EMPLOYEE },
      { id: "uuid-1234", name: RoleName.DEMO },
    ],
    department: { id: "dept-1234", name: DepartmentName.LEGAL }
  },
  {
    firstname: "Norma",
    lastname: "Normalo",
    email: "n.n@mail.de",
    disabled: false,
    roles: [
      { id: "uuid-2345", name: RoleName.EMPLOYEE },
    ],
    department: { id: "dept-1234", name: DepartmentName.SALES }
  },
]

const roleOccurrences = computed(() => {
  const map = new Map<string, number>()
  for (const user of fakeUsers) {
    for (const role of user.roles) {
      map.set(role.name, (map.get(role.name) ?? 0) + 1)
    }
  }
  return map
})

let fakeRoles: Role[] = [
  {
    id: 'role-1234',
    name: RoleName.EMPLOYEE,
    max_security_level: DocumentSecurityLevel.TOP_SECRET,
    permissions: [],
    occurrences: 4,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
  {
    id: 'role-2345',
    name: RoleName.IT_ADMINISTRATOR,
    max_security_level: DocumentSecurityLevel.BUSINESS,
    permissions: [],
    occurrences: 1,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
  {
    id: 'role-3456',
    name: RoleName.HR_MANAGER,
    max_security_level: DocumentSecurityLevel.CONFIDENTIAL,
    permissions: [],
    occurrences: 0,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
]

onMounted(async () => {

  // allRoles.value = await roleService.listRoles()
  // allPermissions.value = await roleService.listPermissions()
  
  
  const occurrences = new Map<string, number>()
  for (const user of fakeUsers) {
    for (const role of user.roles) {
      occurrences.set(role.name, (occurrences.get(role.name) ?? 0) + 1)
    }
  }
  fakeRoles = fakeRoles.map(role => ({
    ...role,
    occurrences: occurrences.get(role.name) ?? 0,
  }))
  

  isLoaded.value = true
  
})

</script>


<style lang="css" scoped>

</style>