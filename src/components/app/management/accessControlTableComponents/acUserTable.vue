<script setup lang="ts">
import { ref, h, watch } from "vue"
import { ArrowUpDown, ChevronLeft, ChevronRight, MoreVertical, Pencil, Trash2, Eye } from "lucide-vue-next"
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
import { getDepartmentColor } from "@/lib/enumTranslaters"

export interface Role {
  name: string
}

export interface Department {
  name: string
}

export interface User {
  id: number | string
  firstname: string
  lastname: string
  email: string
  disabled: boolean
  supervisor: User | null
  roles: Role[] 
  department: Department | null
}

const props = defineProps<{
  data: User[]
}>()

const emit = defineEmits<{
  refresh: []
}>()

// --- Dialog state ---
const editingUser = ref<User | null>(null)
const deletingUser = ref<User | null>(null)

const editFirstname = ref('')
const editLastname = ref('')
const editEmail = ref('')

watch(editingUser, (user) => {
  if (!user) return
  editFirstname.value = user.firstname
  editLastname.value = user.lastname
  editEmail.value = user.email
})

const globalFilter = ref('')
const globalFilterFn: FilterFn<User> = (row, _columnId, filterValue) => {
  const search = filterValue.toLowerCase()
  const { firstname, lastname, email, roles, department, supervisor } = row.original
  const fullname = `${firstname} ${lastname}`.toLowerCase()
  return (
    fullname.includes(search) ||
    email.toLowerCase().includes(search) ||
    roles.some(r => r.name.toLowerCase().includes(search)) ||
    !!supervisor && `${supervisor.firstname} ${supervisor.lastname}`.toLowerCase().includes(search) ||
    (department?.name ?? '').toLowerCase().includes(search)
  )
}

// --- Actions ---
async function onEditUser() {
  if (!editingUser.value) return
  try {
    // TODO: call userService.updateUser(editingUser.value.id, { firstname: editFirstname.value, lastname: editLastname.value, email: editEmail.value })
    toast.success('Benutzer aktualisiert')
    editingUser.value = null
    emit('refresh')
  } catch (error) {
    console.error(error)
    toast.error('Fehler beim Aktualisieren')
  }
}

async function onDeleteUser() {
  if (!deletingUser.value) return
  try {
    // TODO: call userService.deleteUser(deletingUser.value.id)
    toast.success('Benutzer gelöscht')
    deletingUser.value = null
    emit('refresh')
  } catch (error) {
    console.error(error)
    toast.error('Fehler beim Löschen')
  }
}

// --- Table ---
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const rowSelection = ref({})

const columns: ColumnDef<User>[] = [
  {
    id: 'fullname',
    accessorFn: (row) => `${row.firstname} ${row.lastname}`,
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Name', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => h('div', { class: 'ml-4 text-sm font-medium' },
      `${row.original.firstname} ${row.original.lastname}`
    ),
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'email',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['E-Mail', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => h('div', { class: 'text-sm ml-4' }, row.getValue('email')),
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
      return h('div', { class: 'ml-0' }, [
        h(Badge, { variant: disabled ? 'destructive' : 'positive' }, () => disabled ? 'Deaktiviert' : 'Aktiv')
      ])
    },
    sortingFn: (a, b) => Number(a.original.disabled) - Number(b.original.disabled),
  },
  {
    id: 'supervisor',
    accessorFn: (row) => row.supervisor ? `${row.supervisor.firstname} ${row.supervisor.lastname}` : '',
    header: () => h('span', { class: 'text-foreground font-medium' }, 'Vorgesetzter'),
    cell: ({ row }) => {
      const supervisor = row.original.supervisor
      if (!supervisor) return h('div', { class: 'text-sm text-muted-foreground' }, '—')
      return h('a', {
        class: 'text-sm underline underline-offset-4 hover:text-primary transition-colors cursor-pointer',
      }, `${supervisor.firstname} ${supervisor.lastname}`)
    },
    sortingFn: 'alphanumeric',
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
      if (!dept) return h('div', { class: 'text-sm text-muted-foreground ml-4' }, '—')
      const color = getDepartmentColor(dept.name)
      return h('div', { class: 'flex items-center gap-2 ml-4' }, [
        h('span', { class: 'h-2 w-2 rounded-full flex-shrink-0', style: { backgroundColor: color } }),
        h('span', { class: 'text-sm' }, dept.name),
      ])
    },
    sortingFn: 'alphanumeric',
  },
  {
    id: 'roles',
    size: 200,
    header: () => h('span', { class: 'text-foreground font-medium' }, 'Rollen'),
    cell: ({ row }) => {
      const roles = row.original.roles
      if (!roles?.length) return h('div', { class: 'text-sm text-muted-foreground' }, '—')
      return h('div', { class: 'flex flex-wrap gap-1' },
        roles.map(role => h(Badge, { key: role.name, variant: 'bordered' }, () => role.name))
      )
    },
  },

  {
    id: 'actions',
    size: 50,
    cell: ({ row }) => h(DropdownMenu, {}, {
      default: () => [
        h(DropdownMenuTrigger, { asChild: true }, {
          default: () => h(Button, { variant: 'ghost', class: 'h-8 w-8 p-0' }, {
            default: () => h(MoreVertical, { class: 'h-4 w-4' }),
          }),
        }),
        h(DropdownMenuContent, { align: 'end' }, {
          default: () => [
            h(DropdownMenuItem, {
              class: 'gap-2 cursor-pointer',
              onClick: () => { /* TODO: navigate to user detail page */ },
            }, () => [h(Eye, { class: 'h-4 w-4' }), 'Details anzeigen']),
            h(DropdownMenuItem, {
              class: 'gap-2 cursor-pointer',
              onClick: () => editingUser.value = row.original,
            }, () => [h(Pencil, { class: 'h-4 w-4' }), 'Bearbeiten']),
            h(DropdownMenuSeparator),
            h(DropdownMenuItem, {
              class: 'gap-2 cursor-pointer text-destructive focus:text-destructive',
              onClick: () => deletingUser.value = row.original,
            }, () => [h(Trash2, { class: 'h-4 w-4' }), 'Löschen']),
          ],
        }),
      ],
    }),
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
div(class="w-full space-y-4")
  div(class="flex items-center justify-end gap-4 mb-2")
    //- Button(variant="brand") Benutzer erstellen
    Input(
      placeholder="Suchen..."
      class="max-w-sm"
      :model-value="globalFilter"
      @update:model-value="table.setGlobalFilter($event)"
    )
  div(class="rounded-md border bg-card overflow-hidden shadow-sm mt-4")
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
          SelectItem(v-for="size in [5, 10, 20]" :key="size" :value="`${size}`") {{ size }}
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
        DialogDescription Bearbeite die Stammdaten des Benutzers.
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
            FieldLabel E-Mail
            Input(v-model="editEmail" type="email" placeholder="E-Mail")
          DialogFooter(class="mt-4")
            Button(type="button" variant="outline" @click="editingUser = null") Abbrechen
            Button(type="submit" variant="brand") Speichern

  //- Delete AlertDialog
  AlertDialog(:open="!!deletingUser")
    AlertDialogContent
      AlertDialogHeader
        AlertDialogTitle Benutzer löschen?
        AlertDialogDescription Diese Aktion kann nicht rückgängig gemacht werden.
      div(v-if="deletingUser" class="rounded-md border p-4 bg-muted/50 text-sm")
        p(class="font-bold") {{ deletingUser.firstname }} {{ deletingUser.lastname }}
        p(class="text-muted-foreground") {{ deletingUser.email }}
      AlertDialogFooter
        AlertDialogCancel(@click="deletingUser = null") Abbrechen
        AlertDialogAction(class="bg-destructive hover:bg-destructive/90" @click="onDeleteUser") Löschen
</template>