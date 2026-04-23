<script setup lang="ts">
import { ref, h } from "vue"
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
} from "lucide-vue-next"
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type SortingState,
} from "@tanstack/vue-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { toast } from "vue-sonner"
import { DocumentSecurityLevel, DocumentSecurityLevelLabels, DocumentSecurityLevelApiMap } from "@/constants/enums/document.enum"

export interface Permission {
  id: number | string
  name: string
}

export interface Role {
  id: number | string
  name: string
  max_security_level: DocumentSecurityLevel
  permissions: Permission[]
}

const props = defineProps<{
  data: Role[]
}>()

const emit = defineEmits<{
  refresh: []
}>()

// --- Dialog state ---
const editingRole = ref<Role | null>(null)
const deletingRole = ref<Role | null>(null)
const editName = ref('')

import { watch } from "vue"
watch(editingRole, (role) => {
  if (!role) return
  editName.value = role.name
})

// --- Actions ---
async function onEditRole() {
  if (!editingRole.value) return
  try {
    // TODO: call roleService.updateRole(editingRole.value.id, { name: editName.value })
    toast.success('Rolle aktualisiert')
    editingRole.value = null
    emit('refresh')
  } catch (error) {
    console.error(error)
    toast.error('Fehler beim Aktualisieren')
  }
}

async function onDeleteRole() {
  if (!deletingRole.value) return
  try {
    // TODO: call roleService.deleteRole(deletingRole.value.id)
    toast.success('Rolle gelöscht')
    deletingRole.value = null
    emit('refresh')
  } catch (error) {
    console.error(error)
    toast.error('Fehler beim Löschen')
  }
}

// --- Table ---
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const rowSelection = ref<Record<string, boolean>>({})
const globalFilter = ref('')

const globalFilterFn: FilterFn<Role> = (row, _columnId, filterValue) => {
  const search = filterValue.toLowerCase()
  const { name, max_security_level, permissions } = row.original
  const levelNumber = DocumentSecurityLevelApiMap[max_security_level]
  const levelLabel = DocumentSecurityLevelLabels[max_security_level]
  return (
    name.toLowerCase().includes(search) ||
    levelLabel.toLowerCase().includes(search) ||
    String(levelNumber).includes(search) ||
    permissions.some(p => p.name.toLowerCase().includes(search))
  )
}

const columns: ColumnDef<Role>[] = [
  {
    id: "select",
    size: 40,
    header: ({ table }) => h(Checkbox, {
      "modelValue": table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate"),
      "onUpdate:modelValue": value => table.toggleAllPageRowsSelected(!!value),
      "aria-label": "Select all",
    }),
    cell: ({ row }) => h(Checkbox, {
      "modelValue": row.getIsSelected(),
      "onUpdate:modelValue": value => row.toggleSelected(!!value),
      "aria-label": "Select row",
    }),
    enableSorting: false,
    enableHiding: false,
  },
  
  {
    accessorKey: 'name',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Name', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => h('div', { class: 'text-sm font-medium ml-4' }, row.getValue('name')),
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'max_security_level',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Maximale Sicherheitsstufe', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => {
      const level = row.getValue('max_security_level') as DocumentSecurityLevel
      const number = DocumentSecurityLevelApiMap[level]
      const label = DocumentSecurityLevelLabels[level]
      return h('div', { class: 'text-sm ml-4' }, [
        h('span', { class: 'font-medium tabular-nums' }, `${number}`),
        h('span', { class: 'text-muted-foreground mx-1' }, '·'),
        h('span', {}, label),
      ])
    },
    sortingFn: (a, b) =>
      DocumentSecurityLevelApiMap[a.original.max_security_level] -
      DocumentSecurityLevelApiMap[b.original.max_security_level],
  },
    {
    id: 'permissions',
    accessorFn: (row) => row.permissions.length,
    header: ({ column }) => {
    const toggle = () => column.toggleSorting(column.getIsSorted() === 'asc')
    return h(Button, {
        variant: 'ghost',
        class: 'hover:bg-transparent',
        onClick: toggle,
    }, () => ['Berechtigungen', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })])
    },
    cell: ({ row }) => {
        const count = row.original.permissions.length
        if (!count) return h('div', { class: 'text-sm text-muted-foreground ml-4' }, '—')
        return h(Badge, { variant: 'bordered', class: 'ml-4' }, () => `${count} Berechtigung${count !== 1 ? 'en' : ''}`)
    },
    sortingFn: 'basic',
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
              onClick: () => { /* TODO: navigate to role detail */ },
            }, () => [h(Eye, { class: 'h-4 w-4' }), 'Details anzeigen']),
            h(DropdownMenuSeparator),
            h(DropdownMenuItem, {
              class: 'gap-2 cursor-pointer',
              onClick: () => editingRole.value = row.original,
            }, () => [h(Pencil, { class: 'h-4 w-4' }), 'Bearbeiten']),
            h(DropdownMenuSeparator),
            h(DropdownMenuItem, {
              class: 'gap-2 cursor-pointer text-destructive focus:text-destructive',
              onClick: () => deletingRole.value = row.original,
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
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get rowSelection() { return rowSelection.value },
    get globalFilter() { return globalFilter.value },
  },
  onSortingChange: updater => sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater,
  onColumnFiltersChange: updater => columnFilters.value = typeof updater === 'function' ? updater(columnFilters.value) : updater,
  onRowSelectionChange: updater => rowSelection.value = typeof updater === 'function' ? updater(rowSelection.value) : updater,
  onGlobalFilterChange: updater => globalFilter.value = typeof updater === 'function' ? updater(globalFilter.value) : updater,
  globalFilterFn,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  enableRowSelection: true,
})
</script>

<template lang="pug">
div(class="w-full space-y-4")
  div(class="flex items-center justify-between gap-4 mb-2")
    Input(
      placeholder="Suchen..."
      class="max-w-sm"
      :model-value="globalFilter"
      @update:model-value="table.setGlobalFilter($event)"
    )
    Button Rolle erstellen

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
            :data-state="row.getIsSelected() ? 'selected' : undefined"
          )
            TableCell(v-for="cell in row.getVisibleCells()" :key="cell.id")
              FlexRender(:render="cell.column.columnDef.cell" :props="cell.getContext()")
        tr(v-else)
          TableCell(:colspan="columns.length" class="h-24 text-center") Keine Rollen gefunden.

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
  Dialog(:open="!!editingRole" @update:open="v => { if (!v) editingRole = null }")
    DialogContent
      DialogHeader
        DialogTitle Rolle bearbeiten
        DialogDescription Bearbeite den Namen der Rolle.
      form(@submit.prevent="onEditRole()")
        FieldGroup(class="flex flex-col gap-4 mt-2")
          Field
            FieldLabel Name
            Input(v-model="editName" placeholder="Rollenname")
          DialogFooter(class="mt-4")
            Button(type="button" variant="outline" @click="editingRole = null") Abbrechen
            Button(type="submit") Speichern

  //- Delete AlertDialog
  AlertDialog(:open="!!deletingRole")
    AlertDialogContent
      AlertDialogHeader
        AlertDialogTitle Rolle löschen?
        AlertDialogDescription Diese Aktion kann nicht rückgängig gemacht werden.
      div(v-if="deletingRole" class="rounded-md border p-4 bg-muted/50 text-sm")
        p(class="font-bold") {{ deletingRole.name }}
        p(class="text-muted-foreground") {{ deletingRole.permissions.length }} Berechtigung(en) verknüpft
      AlertDialogFooter
        AlertDialogCancel(@click="deletingRole = null") Abbrechen
        AlertDialogAction(class="bg-destructive hover:bg-destructive/90" @click="onDeleteRole") Löschen
</template>