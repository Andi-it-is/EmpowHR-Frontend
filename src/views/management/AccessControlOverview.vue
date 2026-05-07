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
    TabsList(v-if="!selectedRole" variant="outline")
      TabsTrigger(value="roles")
        | Rollen
        Badge(class="ml-2 mr-1" variant="bordered") {{ allRoles.length }}

      TabsTrigger(value="users")
        | Benutzer
        Badge(class="ml-2 mr-1" variant="bordered") {{ allUsers.length }}

      TabsTrigger(value="departments")
        | Abteilungen
        Badge(class="ml-2 mr-1" variant="bordered") {{ allDepartments.length }}

      TabsTrigger(value="permissions")
        | Berechtigungen
        Badge(class="ml-2 mr-1" variant="bordered") {{ allPermissions.length }}

      TabsTrigger(value="passwordResets")
        | Zugang verwalten


    Button(v-if="selectedRole" variant="brand-outline" @click="goBack()")
      ArrowLeft
      | Zurück zur Tabelle

    div(v-if="activeTab==='roles'" class="rounded-md border bg-muted/30 p-4 my-4 space-y-2")
      p(class="text-md font-medium") Sicherheitsstufen & Zugriffsbereiche
      p(class="text-sm text-muted-foreground")
        | Die maximale Dokumenten Sichtenstufe einer Rolle legt fest, bis zu welcher Vertraulichkeiststufe Dokumente von anderen Benutzern gesichtet werden dürfen.
        | Je höher die Stufe, desto mehr Zugriff auf sensiblere Dokumente hat diese Rolle. Das betrifft nur Dokumente, welche in EmpowHR existieren.
        | So dürfen nur wenige ausgewählte Rollen sensible Dokumente, wie Gehaltsabrechnungen, Mahnungen oder sonstiges sichten, um beispielsweise 
        | die Buchhaltung zu pflegen oder einzelene Mitarbeiter über Mahnungen o.ä. zu informieren.

    //- Makes underlying table responsive
    div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-4")
      Card(class="col-span-5 mt-4")
        CardHeader
          CardTitle {{ tabConfig[activeTab].title }}
          CardDescription {{ tabConfig[activeTab].description }}

        CardContent(class="relative py-4")
          div(v-if="!selectedRole" class="overflow-x-auto py-4")
            component(
              :is="tabComponents[activeTab]"
              :data="tabData[activeTab]"
              :users="activeTab === 'departments' ? allUsers : undefined"
              :departments="activeTab === 'users' ? allDepartments: undefined"
              :roles="activeTab === 'users' ? allRoles: undefined"
              @open-detail="handleOpenDetail"
              @refresh="loadData()"
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
  div(v-if="selectedRole" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-8")
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
import acDepartmentTable from '@/components/app/management/accessControlTableComponents/acDepartmentTable.vue';
import acPasswordResets from '@/components/app/management/accessControlTableComponents/acPasswordResets.vue';
import { DepartmentName } from '@/constants/enums/departmentNames.enum';
import { DocumentSecurityLevel, DocumentSecurityLevelApiMap, DocumentSecurityLevelFromApi } from '@/constants/enums/document.enum';
import { PermissionAction, PermissionScope, RoleName } from '@/constants/enums/acessControl.enum';
import { type Permission, roleService, type Role } from '@/services/role.service';
import { PermissionActionClasses, PermissionActionLabels, PermissionScopeLabels, PermissionScopeColors } from '@/lib/enumTranslaters';
import { toast } from 'vue-sonner';
import { type User, userService } from '@/services/user.service';
import { type Department, departmentService } from '@/services/department.service';

const activeTab = ref<'roles' | 'users' | 'departments' | 'permissions' | 'passwordResets'>('roles')
const tabConfig = {
  roles: { title: 'Rollen', description: 'Verwalte die Rollen und ihre Zuweisungen.' },
  users: { title: 'Benutzer', description: 'Konfiguriere die Nutzer und die Rollen der Nutzer.' },
  departments: { title: 'Abteilungen', description: 'Erstelle und bearbeite vorhandene Abteilungen.' },
  permissions: { title: 'Berechtigungen', description: 'Schaue dir die verfügbaren Berechtigungen an.' },
  passwordResets: { title: 'Passwort zurücksetzen', description: 'Setze hier das Passwort eines Nutzers zurück. '}
}
const tabComponents = {
  roles: acRoleTable,
  users: acUserTable,
  departments: acDepartmentTable,
  permissions: acPermissionTable,
  passwordResets: acPasswordResets
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
const allUsers = ref<User[]>([])
const allPermissions = ref<Permission[]>([])
const allDepartments = ref<Department[]>([])

const tabData = computed(() => ({
  roles: allRoles.value,
  users: allUsers.value,
  departments: allDepartments.value,
  permissions: allPermissions.value,
  passwordResets: allUsers.value
}))

async function savePermissions() {
  if (!selectedRole.value) return
  try {
    await roleService.updateRolesPermissions(selectedRole.value.id, [...assignedIds.value])
    originalIds.value = new Set(assignedIds.value)
    await loadData()
    toast.success('Berechtigungen gespeichert')
  } catch (error) {
    toast.error('Fehler beim Speichern')
  }
}

async function loadData() {

  allRoles.value = await roleService.listRoles()
  allPermissions.value = await roleService.listPermissions()
  allUsers.value = await userService.listAllUsers()
  allDepartments.value = await departmentService.listAllDepartments()
  
  const roleCounts = Object.values(RoleName).reduce((acc, role) => {
    acc[role] = 0;
    return acc;
  }, {} as Record<RoleName, number>);

  for (const user of allUsers.value) {
    for (const role of user.roles) {
      if (role.name in roleCounts) {
        roleCounts[role.name as RoleName]++;
      }
    }
  }

  allRoles.value = allRoles.value.map(role => ({
    ...role,
    occurrences: roleCounts[role.name as RoleName] ?? 0,
  }));
  
}

onMounted(async () => {

  await loadData()  

  isLoaded.value = true
  
})

</script>


<style lang="css" scoped>

</style>