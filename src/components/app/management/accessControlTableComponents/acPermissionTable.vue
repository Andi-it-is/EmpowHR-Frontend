<script setup lang="ts">
import { ref, h, watch } from "vue"
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
import { PermissionAction, PermissionScope } from "@/constants/enums/acessControl.enum"
import {
  PermissionActionLabels,
  PermissionActionColors,
  PermissionScopeLabels,
  PermissionScopeColors,
  PermissionActionClasses,
} from "@/lib/enumTranslaters"

export interface Permission {
  id: number | string
  entity: string
  action: PermissionAction
  scope: PermissionScope
}

const props = defineProps<{
  data: Permission[]
}>()

const emit = defineEmits<{
  refresh: []
}>()

// --- Dialog state ---
const editingPermission = ref<Permission | null>(null)
const deletingPermission = ref<Permission | null>(null)
const editEntity = ref('')

watch(editingPermission, (p) => {
  if (!p) return
  editEntity.value = p.entity
})

// --- Actions ---
async function onEditPermission() {
  if (!editingPermission.value) return
  try {
    // TODO: call permissionService.updatePermission(editingPermission.value.id, { entity: editEntity.value })
    toast.success('Berechtigung aktualisiert')
    editingPermission.value = null
    emit('refresh')
  } catch (error) {
    console.error(error)
    toast.error('Fehler beim Aktualisieren')
  }
}

async function onDeletePermission() {
  if (!deletingPermission.value) return
  try {
    // TODO: call permissionService.deletePermission(deletingPermission.value.id)
    toast.success('Berechtigung gelöscht')
    deletingPermission.value = null
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

const globalFilterFn: FilterFn<Permission> = (row, _columnId, filterValue) => {
  const search = filterValue.toLowerCase()
  const { entity, action, scope } = row.original
  return (
    entity.toLowerCase().includes(search) ||
    PermissionActionLabels[action].toLowerCase().includes(search) ||
    action.toLowerCase().includes(search) ||
    PermissionScopeLabels[scope].toLowerCase().includes(search) ||
    scope.toLowerCase().includes(search)
  )
}

const columns: ColumnDef<Permission>[] = [
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
    accessorKey: 'id',
    size: 40,
    header: ({ column }) => {
      const toggle = () => column.toggleSorting(column.getIsSorted() === 'asc')
      return h(Button, {
        variant: 'ghost',
        class: 'hover:bg-transparent',
        onClick: toggle,
      }, () => ['ID', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })])
    },
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground ml-4 tabular-nums' }, row.getValue('id')),
    sortingFn: 'basic',
  },

  {
    accessorKey: 'entity',
    header: ({ column }) => {
      const toggle = () => column.toggleSorting(column.getIsSorted() === 'asc')
      return h(Button, {
        variant: 'ghost',
        class: 'hover:bg-transparent',
        onClick: toggle,
      }, () => ['Entität', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })])
    },
    cell: ({ row }) => h('div', { class: 'text-sm font-medium ml-4' }, row.getValue('entity')),
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'action',
    header: ({ column }) => {
      const toggle = () => column.toggleSorting(column.getIsSorted() === 'asc')
      return h(Button, {
        variant: 'ghost',
        class: 'hover:bg-transparent',
        onClick: toggle,
      }, () => ['Aktion', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })])
    },
    cell: ({ row }) => {
      const action = row.getValue('action') as PermissionAction
      const color = PermissionActionColors[action]
      return h('div', { class: 'ml-4' }, [
        h(Badge, {
        variant: 'outline',
        class: PermissionActionClasses[action],
        }, () => PermissionActionLabels[action]),
      ])
    },
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'scope',
    header: ({ column }) => {
      const toggle = () => column.toggleSorting(column.getIsSorted() === 'asc')
      return h(Button, {
        variant: 'ghost',
        class: 'hover:bg-transparent',
        onClick: toggle,
      }, () => ['Geltungsbereich', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })])
    },
    cell: ({ row }) => {
      const scope = row.getValue('scope') as PermissionScope
      const color = PermissionScopeColors[scope]
      return h('div', { class: 'flex items-center gap-2 ml-4' }, [
        h('span', { class: 'h-2 w-2 rounded-full flex-shrink-0', style: { backgroundColor: color } }),
        h('span', { class: 'text-sm' }, PermissionScopeLabels[scope]),
      ])
    },
    sortingFn: 'alphanumeric',
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
              onClick: () => { /* TODO: navigate to permission detail */ },
            }, () => [h(Eye, { class: 'h-4 w-4' }), 'Details anzeigen']),
            h(DropdownMenuSeparator),
            h(DropdownMenuItem, {
              class: 'gap-2 cursor-pointer',
              onClick: () => editingPermission.value = row.original,
            }, () => [h(Pencil, { class: 'h-4 w-4' }), 'Bearbeiten']),
            h(DropdownMenuSeparator),
            h(DropdownMenuItem, {
              class: 'gap-2 cursor-pointer text-destructive focus:text-destructive',
              onClick: () => deletingPermission.value = row.original,
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
  div(class="flex items-center justify-end gap-4 mb-2")
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
            :data-state="row.getIsSelected() ? 'selected' : undefined"
          )
            TableCell(v-for="cell in row.getVisibleCells()" :key="cell.id")
              FlexRender(:render="cell.column.columnDef.cell" :props="cell.getContext()")
        tr(v-else)
          TableCell(:colspan="columns.length" class="h-24 text-center") Keine Berechtigungen gefunden.

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

</template>