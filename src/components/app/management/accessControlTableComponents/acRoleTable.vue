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
import { DocumentSecurityLevel, DocumentSecurityLevelLabels, DocumentSecurityLevelApiMap, DocumentSecurityLevelFromApi } from "@/constants/enums/document.enum"
import { watch } from "vue"
import { RoleColors, translateRoleName } from "@/lib/enumTranslaters"
import { PermissionScope } from "@/constants/enums/acessControl.enum"
import type { RoleName } from "@/constants/enums/acessControl.enum"
import { type Permission, type Role } from "@/services/role.service"

const props = defineProps<{
  data: Role[]
}>()

const emit = defineEmits<{
  refresh: [],
  'open-detail': [role: Role] 
}>()


const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const rowSelection = ref<Record<string, boolean>>({})


const columns: ColumnDef<Role>[] = [
  // {
  //   id: "select",
  //   size: 40,
  //   header: ({ table }) => h(Checkbox, {
  //     "modelValue": table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate"),
  //     "onUpdate:modelValue": value => table.toggleAllPageRowsSelected(!!value),
  //     "aria-label": "Select all",
  //   }),
  //   cell: ({ row }) => h(Checkbox, {
  //     "modelValue": row.getIsSelected(),
  //     "onUpdate:modelValue": value => row.toggleSelected(!!value),
  //     "aria-label": "Select row",
  //   }),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  
  {
    accessorKey: 'name',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Name', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => h('div', { class: 'flex items-center gap-2 ml-4' }, [
      h('span', {
        class: 'h-2 w-2 rounded-full shrink-0',
        style: { backgroundColor: RoleColors[row.original.name as RoleName] }
      }),
      h('span', { class: 'text-sm font-medium' }, translateRoleName(row.original.name as RoleName)),
    ]),
  },
  {
    accessorKey: 'max_security_level',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Maximale Dokumenten Sichtenstufe', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => {
      const levelEnum = DocumentSecurityLevelFromApi[row.getValue('max_security_level') as number]
      const number = DocumentSecurityLevelApiMap[levelEnum!]
      const label = DocumentSecurityLevelLabels[levelEnum!]
      return h('div', { class: 'text-sm ml-4' }, [
        h('span', { class: 'font-medium tabular-nums' }, `${number}`),
        h('span', { class: 'text-muted-foreground mx-1' }, '·'),
        h('span', {}, label),
      ])
    },
    sortingFn: (a, b) =>
      (a.original.max_security_level as unknown as number) -
      (b.original.max_security_level as unknown as number),
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
    id: 'occurrences',
    accessorFn: (row) => row.occurrences ?? 0,
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Vergeben an', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => {
      const count = row.original.occurrences ?? 0
      if (!count) return h('div', { class: 'text-sm text-muted-foreground ml-4' }, '—')
      return h(Badge, { variant: 'bordered', class: 'ml-4' }, () => `${count} Nutzer`)
    },
    sortingFn: 'basic',
  },
  {
    id: 'actions',
    size: 120,
    cell: ({ row }) => h(Button, {
      variant: 'brand-outline',
      size: "sm",
      class: 'gap-2',
      onClick: () => emit('open-detail', row.original),
    }, {
      default: () => [h(Eye, { class: 'h-4 w-4' }), 'Berechtigungen anzeigen'],
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
  },
  onSortingChange: updater => sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater,
  onColumnFiltersChange: updater => columnFilters.value = typeof updater === 'function' ? updater(columnFilters.value) : updater,
  onRowSelectionChange: updater => rowSelection.value = typeof updater === 'function' ? updater(rowSelection.value) : updater,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  enableRowSelection: true,
})
</script>

<template lang="pug">
div(class="w-full space-y-4")

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
          SelectItem(v-for="size in [5, 10, 20, 50, 100]" :key="size" :value="`${size}`") {{ size }}
    div(class="text-sm font-medium") Seite {{ table.getState().pagination.pageIndex + 1 }} von {{ table.getPageCount() }}
    div(class="flex items-center gap-2")
      Button(variant="outline" size="icon" class="h-8 w-8" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()")
        ChevronLeft(class="h-4 w-4")
      Button(variant="outline" size="icon" class="h-8 w-8" :disabled="!table.getCanNextPage()" @click="table.nextPage()")
        ChevronRight(class="h-4 w-4")

</template>