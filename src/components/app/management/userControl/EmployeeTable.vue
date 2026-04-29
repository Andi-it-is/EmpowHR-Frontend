<script setup lang="ts">
import { ref, h, watch } from "vue"
import { ArrowUpDown, ChevronLeft, ChevronRight, MoreVertical, Pencil, Trash2, Eye, Settings2, SlidersHorizontal, ChevronRightCircle } from "lucide-vue-next"
import { FlexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useVueTable,
  type ColumnDef, type ColumnFiltersState, type SortingState, type FilterFn } from "@tanstack/vue-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { toast } from "vue-sonner"
import { getDepartmentColor, translateRoleName } from "@/lib/enumTranslaters"
import { RoleName } from "@/constants/enums/acessControl.enum"
import MultiSelect from "../../generic/MultiSelect.vue"
import Switch from "@/components/ui/switch/Switch.vue"
import { userService, type User } from "@/services/user.service"
import type { Department } from "@/services/department.service"

const props = defineProps<{
  data: User[]
  departments: Department[]
}>()

const emit = defineEmits<{
  'select-user': [user: User]
}>()


// --- Dialog state ---
const editingUser = ref<User | null>(null)

const editFirstname = ref('')
const editLastname = ref('')
const editEmail = ref('')
const editActive = ref(true)
const editDepartmentId = ref<string | null>(null)

watch(editingUser, (user) => {
  if (!user) return
  editFirstname.value = user.firstname
  editLastname.value = user.lastname
  editEmail.value = user.email
  editActive.value = !user.disabled
  editDepartmentId.value = user.department?.id ?? null
})

async function onEditUser() {
  if (!editingUser.value) return
  try {
    const reqObj = {
      firstname: editFirstname.value,
      lastname: editLastname.value,
      email: editEmail.value,
      disabled: !editActive.value,
      departmentId: editDepartmentId.value,
    }
    await userService.updateUserById(editingUser.value.id, reqObj)
    toast.success(`Benutzer aktualisiert`)
    editingUser.value = null

  } catch (error) {
    console.error(error)
    toast.error('Fehler beim Aktualisieren')
  }
}

const globalFilter = ref('')
const globalFilterFn: FilterFn<User> = (row, _columnId, filterValue) => {
  const search = filterValue.toLowerCase()
  const { firstname, lastname, email, roles, department, supervisor } = row.original
  const fullname = `${firstname} ${lastname}`.toLowerCase()
  return (
    fullname.includes(search) ||
    email.toLowerCase().includes(search) ||
    roles.some(r =>
      r.name.toLowerCase().includes(search) ||
      translateRoleName(r.name as RoleName).toLowerCase().includes(search)
    ) ||
    !!supervisor && `${supervisor.firstname} ${supervisor.lastname}`.toLowerCase().includes(search) ||
    (department?.name ?? '').toLowerCase().includes(search)
  )
}

// --- Table ---
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const rowSelection = ref({})

const columns: ColumnDef<User>[] = [
  {
    id: 'firstname',
    accessorKey: 'firstname',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Vorname', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => h('div', { class: 'ml-4 text-sm font-medium min-w-25' }, row.original.firstname),
    sortingFn: 'alphanumeric',
  },
  {
    id: 'lastname',
    accessorKey: 'lastname',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Nachname', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => h('div', { class: 'ml-4 text-sm font-medium min-w-25' }, row.original.lastname),
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'email',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['E-Mail', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => h('div', { class: 'text-sm ml-4 min-w-40' }, row.getValue('email')),
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'disabled',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent -ml-4',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Status', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => {
      const disabled = row.getValue('disabled') as boolean
      return h('div', { class: 'ml-0 min-w-25' }, [
        h(Badge, { variant: disabled ? 'destructive' : 'positive' }, () => disabled ? 'Deaktiviert' : 'Aktiv')
      ])
    },
    sortingFn: (a, b) => Number(a.original.disabled) - Number(b.original.disabled),
  },

  {
    id: 'department',
    accessorFn: (row) => row.department?.name ?? '',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Abteilung', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => {
      const dept = row.original.department
      if (!dept) return h('div', { class: 'text-sm text-muted-foreground ml-4 min-w-35' }, '—')
      const color = getDepartmentColor(dept.name)
      return h('div', { class: 'flex items-center gap-2 ml-4 min-w-35' }, [
        h('span', { class: 'h-2 w-2 rounded-full flex-shrink-0', style: { backgroundColor: color } }),
        h('span', { class: 'text-sm' }, dept.name),
      ])
    },
    sortingFn: 'alphanumeric',
  },
  {
    id: 'roles',
    header: () => h('span', { class: 'text-foreground font-medium' }, 'Rollen'),
    cell: ({ row }) => {
      const roles = row.original.roles
      if (!roles?.length) return h('div', { class: 'text-sm text-muted-foreground min-w-75' }, '—')
      return h('div', { class: 'flex flex-wrap gap-1 min-w-75' },
        roles.map(role => h(Badge, { key: role.name, variant: 'bordered' }, () => translateRoleName(role.name as RoleName)))
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => h('div', { class: 'flex items-center min-w-10' }, [
      h(Button, {
        variant: 'ghost',
        class: 'h-8 w-8 p-0',
        onClick: () => editingUser.value = row.original,
      }, {
        default: () => h(Pencil, { class: 'h-4 w-4' }),
      }),
    ]),
  },
  {
    id: 'assignments',
    cell: ({ row }) => h('div', { class: 'flex items-center min-w-30' }, [
      h(Button, {
        variant: 'brand-outline',
        onClick: () => emit('select-user', row.original),
      }, () => ['Auswählen', h(ChevronRight, { class: 'h-4 w-4' })]),
    ]),
  },

]

const table = useVueTable({
  get data() { return props.data },
  columns,
  globalFilterFn,
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get rowSelection() { return rowSelection.value },
    get globalFilter() { return globalFilter.value },
  },
  onSortingChange: updater => sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater,
  onColumnFiltersChange: updater => columnFilters.value = typeof updater === 'function' ? updater(columnFilters.value) : updater,
  onRowSelectionChange: updater => rowSelection.value = typeof updater === 'function' ? updater(rowSelection.value) : updater,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  onGlobalFilterChange: updater => globalFilter.value = typeof updater === 'function' ? updater(globalFilter.value) : updater,
})
</script>

<template lang="pug">
div(class="w-full space-y-4 min-w-0")
  div(class="flex items-center justify-end gap-4 mb-2")
    Input(
      placeholder="Suchen..."
      class="max-w-sm"
      :model-value="globalFilter"
      @update:model-value="table.setGlobalFilter($event)"
    )
  div(class="rounded-md border bg-card overflow-x-auto shadow-sm")
    Table
      TableHeader(class="bg-muted dark:[&_th]:text-slate-100 [&_th]:text-slate-900")
        TableRow(v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id" class="hover:bg-transparent border-none")
          TableHead(
            v-for="header in headerGroup.headers"
            :key="header.id"
            class="font-bold h-11"
            :style="{ width: `${header.getSize()}px` }"
          )
            FlexRender(v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()")
      TableBody
        template(v-if="table.getRowModel().rows?.length")
          TableRow(
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="transition-colors data-[state=selected]:bg-muted"
          )
            TableCell(v-for="cell in row.getVisibleCells()" :key="cell.id")
              FlexRender(:render="cell.column.columnDef.cell" :props="cell.getContext()")
        tr(v-else)
          TableCell(:colspan="columns.length" class="h-24 text-center") Keine Benutzer gefunden.

  div(class="flex flex-wrap items-center justify-end px-2 gap-6")
    div(class="flex items-center gap-2")
      p(class="text-sm font-medium text-muted-foreground") Zeilen
      Select(:model-value="`${table.getState().pagination.pageSize}`" @update:model-value="v => table.setPageSize(Number(v))")
        SelectTrigger(class="h-8 w-17.5")
          SelectValue
        SelectContent(side="top")
          SelectItem(v-for="size in [5, 10, 20, 50, 100]" :key="size" :value="`${size}`") {{ size }}
    div(class="text-sm font-medium") Seite {{ table.getState().pagination.pageIndex + 1 }} von {{ table.getPageCount() }}
    div(class="flex items-center gap-2")
      Button(variant="outline" size="icon" class="h-8 w-8" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()")
        ChevronLeft(class="h-4 w-4")
      Button(variant="outline" size="icon" class="h-8 w-8" :disabled="!table.getCanNextPage()" @click="table.nextPage()")
        ChevronRight(class="h-4 w-4")

  //- Edit Dialog
  Dialog(:open="!!editingUser" @update:open="v => { if (!v) editingUser = null }")
    DialogContent
      DialogHeader
        DialogTitle Benutzer bearbeiten
        DialogDescription Bearbeite die Basisinformationen des Benutzers.
      form(@submit.prevent="onEditUser()")
        FieldGroup(class="flex flex-col gap-4 mt-2")
          div(class="grid grid-cols-2 gap-4")
            Field
              FieldLabel Vorname
              Input(v-model="editFirstname" placeholder="Vorname")
            Field
              FieldLabel Nachname
              Input(v-model="editLastname" placeholder="Nachname")
          Field
            FieldLabel Abteilung
            Select(v-model="editDepartmentId")
              SelectTrigger
                SelectValue(placeholder="Abteilung wählen...")
              SelectContent
                SelectItem(
                  v-for="department in props.departments"
                  :key="department.id"
                  :value="department.id"
                ) {{ department.name }}

          DialogFooter(class="mt-4")
            Button(type="button" variant="outline" @click="editingUser = null") Abbrechen
            Button(type="submit" variant="brand") Speichern
</template>