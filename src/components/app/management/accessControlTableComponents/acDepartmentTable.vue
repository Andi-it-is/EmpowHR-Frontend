<script setup lang="ts">
import { ref, h, watch } from "vue"
import { ArrowUpDown, ChevronLeft, ChevronRight, MoreVertical, Pencil, Trash2, Plus, Building2 } from "lucide-vue-next"
import {
  FlexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useVueTable,
  type ColumnDef, type ColumnFiltersState, type SortingState, type FilterFn
} from "@tanstack/vue-table"
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
import { departmentService, type Department } from "@/services/department.service"
import { getDepartmentColor } from "@/lib/enumTranslaters"
import type { User } from "@/services/user.service"

// -------------------------------------------------------
// Props & Emits
// -------------------------------------------------------
const props = defineProps<{
  data: Department[]
  users: User[]
}>()

const emit = defineEmits<{
  refresh: []
}>()

// -------------------------------------------------------
// Create Dialog
// -------------------------------------------------------
const createOpen = ref(false)
const createName = ref('')
const createCostCenter = ref('')

const createHeadId = ref<string | undefined>(undefined)
const createParentId = ref<string | undefined>(undefined)

function openCreateDialog() {
  createName.value = ''
  createCostCenter.value = ''
  createOpen.value = true
}

async function onCreateDepartment() {
  try {
    const reqObj = {
      name: createName.value,
      cost_center: createCostCenter.value,
      headId: createHeadId.value,
      parentId: createParentId.value,
    }
    await departmentService.createDepartment(reqObj)
    toast.success('Abteilung erstellt')
    createOpen.value = false
    emit('refresh')
  } catch (error) {
    console.error(error)
    toast.error('Fehler beim Erstellen')
  }
}

// -------------------------------------------------------
// Edit Dialog
// -------------------------------------------------------
const editingDepartment = ref<Department | null>(null)
const editName = ref('')
const editCostCenter = ref('')

const editHeadId = ref<string | undefined>(undefined)
const editParentId = ref<string | undefined>(undefined)

watch(editingDepartment, (dept) => {
  if (!dept) return
  editName.value = dept.name
  editCostCenter.value = dept.cost_center ?? ''
  editHeadId.value = dept.head?.id ?? undefined
  editParentId.value = dept.parent?.id ?? undefined
})

async function onEditDepartment() {
  if (!editingDepartment.value) return
  try {
    const reqObj = {
      name: editName.value,
      cost_center: editCostCenter.value || undefined,
      headId: editHeadId.value,
      parentId: editParentId.value,
    }
    await departmentService.updateDepartmentById(editingDepartment.value.id, reqObj

    )
    toast.success('Abteilung aktualisiert')
    editingDepartment.value = null
    emit('refresh')
  } catch (error) {
    console.error(error)
    toast.error('Fehler beim Aktualisieren')
  }
}

// -------------------------------------------------------
// Delete AlertDialog
// -------------------------------------------------------
const deletingDepartment = ref<Department | null>(null)

async function onDeleteDepartment() {
  if (!deletingDepartment.value) return
  try {
    await departmentService.deleteDepartmentById(deletingDepartment.value.id)

    toast.success('Abteilung gelöscht')
    deletingDepartment.value = null
    emit('refresh')
  } catch (error) {
    console.error(error)
    toast.error('Fehler beim Löschen')
  }
}

// -------------------------------------------------------
// Global Filter
// -------------------------------------------------------
const globalFilter = ref('')
const globalFilterFn: FilterFn<Department> = (row, _columnId, filterValue) => {
  const search = filterValue.toLowerCase()
  const { name, cost_center, head } = row.original
  const headName = head ? `${head.firstname} ${head.lastname}`.toLowerCase() : ''
  return (
    name.toLowerCase().includes(search) ||
    (cost_center ?? '').toLowerCase().includes(search) ||
    headName.includes(search)
  )
}

// -------------------------------------------------------
// Table Columns
// -------------------------------------------------------
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const rowSelection = ref({})

const columns: ColumnDef<Department>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Name', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => h('div', { class: 'ml-4 flex items-center gap-2' }, [
      h('span', {
        class: 'h-2 w-2 rounded-full shrink-0',
        style: { backgroundColor: getDepartmentColor(row.original.name) }
      }),
      h('span', { class: 'text-sm font-medium' }, row.original.name),
    ]),
    sortingFn: 'alphanumeric',
  },
  {
    id: 'head',
    accessorFn: (row) => row.head ? `${row.head.firstname} ${row.head.lastname}` : '',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Abteilungsleiter', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => {
      const head = row.original.head
      if (!head) return h('span', { class: 'ml-4 text-sm text-muted-foreground' }, '—')
      return h('span', { class: 'ml-4 text-sm' }, `${head.firstname} ${head.lastname}`)
    },
    sortingFn: 'alphanumeric',
  },
  {
    id: 'cost_center',
    accessorKey: 'cost_center',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Kostenstelle', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => {
      const cc = row.original.cost_center
      if (!cc) return h('span', { class: 'ml-4 text-sm text-muted-foreground' }, '—')
      return h('span', { class: 'ml-4 text-sm font-mono' }, cc)
    },
    sortingFn: 'alphanumeric',
  },
  {
    id: 'parent',
    accessorFn: (row) => row.parent?.name ?? '',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Übergeordnet', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => {
      const parent = row.original.parent
      if (!parent) return h('span', { class: 'ml-4 text-sm text-muted-foreground' }, '—')
      return h('div', { class: 'ml-4 flex items-center gap-2' }, [
        h('span', {
          class: 'h-2 w-2 rounded-full shrink-0',
          style: { backgroundColor: getDepartmentColor(parent.name) }
        }),
        h('span', { class: 'text-sm' }, parent.name),
      ])
    },
    sortingFn: 'alphanumeric',
  },
  {
    id: 'users',
    header: () => h('span', { class: 'text-foreground font-medium' }, 'Mitarbeitende'),
    cell: ({ row }) => {
      const count = row.original.users?.length ?? 0
      return h('div', { class: 'ml-0' }, [
        h(Badge, { variant: 'secondary' }, () => `${count} Nutzer`)
      ])
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
              onClick: () => editingDepartment.value = row.original,
            }, () => [h(Pencil, { class: 'h-4 w-4' }), 'Bearbeiten']),
            h(DropdownMenuSeparator),
            h(DropdownMenuItem, {
              class: 'gap-2 cursor-pointer text-destructive focus:text-destructive',
              onClick: () => deletingDepartment.value = row.original,
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
  div(class="flex items-center justify-between gap-4 mb-2")
    Button(variant="brand" @click="openCreateDialog()")
      Plus(class="h-4 w-4 mr-2")
      | Abteilung erstellen
    Input(
      placeholder="Suchen..."
      class="max-w-sm"
      :model-value="globalFilter"
      @update:model-value="table.setGlobalFilter($event)"
    )

  div(class="rounded-md border bg-card overflow-hidden shadow-sm")
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
          TableCell(:colspan="columns.length" class="h-24 text-center") Keine Abteilungen gefunden.

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

  //- Create Dialog
  Dialog(:open="createOpen" @update:open="v => { if (!v) createOpen = false }")
    DialogContent
      DialogHeader
        DialogTitle Neue Abteilung erstellen
        DialogDescription Lege eine neue Abteilung an.
      form(@submit.prevent="onCreateDepartment()")
        FieldGroup(class="flex flex-col gap-4 mt-2")
          Field
            FieldLabel Name
            Input(v-model="createName" placeholder="z.B. IT" required)
          Field
            FieldLabel Kostenstelle
            Input(v-model="createCostCenter" placeholder="z.B. CX_420420")

          Field
            FieldLabel Abteilungsleiter
            Select(v-model="createHeadId")
              SelectTrigger
                SelectValue(placeholder="Kein Leiter")
              SelectContent
                SelectItem(
                  v-for="user in users"
                  :key="user.id"
                  :value="user.id"
                ) {{ user.firstname }} {{ user.lastname }}

          Field
            FieldLabel Übergeordnete Abteilung
            Select(v-model="createParentId")
              SelectTrigger
                SelectValue(placeholder="Keine übergeordnete Abteilung")
              SelectContent
                SelectItem(
                  v-for="dept in data.filter(d => d.id !== editingDepartment?.id)"
                  :key="dept.id"
                  :value="dept.id"
                ) {{ dept.name }}

        DialogFooter(class="mt-4")
          Button(type="button" variant="outline" @click="createOpen = false") Abbrechen
          Button(type="submit" variant="brand") Erstellen

  //- Edit Dialog
  Dialog(:open="!!editingDepartment" @update:open="v => { if (!v) editingDepartment = null }")
    DialogContent
      DialogHeader
        DialogTitle Abteilung bearbeiten
        DialogDescription Bearbeite die Informationen der Abteilung.
      form(@submit.prevent="onEditDepartment()")
        FieldGroup(class="flex flex-col gap-4 mt-2")
          Field
            FieldLabel Name
            Input(v-model="editName" placeholder="z.B. IT" required)
          Field
            FieldLabel Kostenstelle
            Input(v-model="editCostCenter" placeholder="z.B. CX_420420")

          Field
            FieldLabel Abteilungsleiter
            Select(
              :model-value="editHeadId"
              @update:model-value="editHeadId = $event"
            )
              SelectTrigger
                SelectValue(placeholder="Kein Leiter")
              SelectContent
                SelectItem(
                  v-for="user in users"
                  :key="user.id"
                  :value="user.id"
                ) {{ user.firstname }} {{ user.lastname }}

          Field
            FieldLabel Übergeordnete Abteilung
            Select(
              :model-value="editParentId"
              @update:model-value="editParentId = $event"
            )
              SelectTrigger
                SelectValue(placeholder="Keine übergeordnete Abteilung")
              SelectContent
                SelectItem(
                  v-for="dept in data.filter(d => d.id !== editingDepartment?.id)"
                  :key="dept.id"
                  :value="dept.id"
                ) {{ dept.name }}

        DialogFooter(class="mt-4")
          Button(type="button" variant="outline" @click="editingDepartment = null") Abbrechen
          Button(type="submit" variant="brand") Speichern

  //- Delete AlertDialog
  AlertDialog(:open="!!deletingDepartment")
    AlertDialogContent
      AlertDialogHeader
        AlertDialogTitle Abteilung löschen?
        AlertDialogDescription Diese Aktion kann nicht rückgängig gemacht werden.
      div(v-if="deletingDepartment" class="rounded-md border p-4 bg-muted/50 text-sm")
        p(class="font-bold") {{ deletingDepartment.name }}
        p(class="text-muted-foreground") {{ deletingDepartment.cost_center ?? 'Keine Kostenstelle' }}
      AlertDialogFooter
        AlertDialogCancel(@click="deletingDepartment = null") Abbrechen
        AlertDialogAction(class="bg-destructive text-white hover:bg-destructive/90" @click="onDeleteDepartment") Löschen
</template>