<template lang="pug">
div
  div(class="rounded-md border bg-card overflow-x-auto shadow-sm")
    Table
      TableHeader(class="bg-muted dark:[&_th]:text-slate-100 [&_th]:text-slate-900")
        TableRow(v-for="headerGroup in absenceTable.getHeaderGroups()" :key="headerGroup.id" class="hover:bg-transparent border-none")
          TableHead(v-for="header in headerGroup.headers" :key="header.id" class="font-bold h-11")
            FlexRender(v-if="!header.isPlaceholder" :render="header.column.columnDef.header" :props="header.getContext()")
      TableBody
        template(v-if="absenceTable.getRowModel().rows?.length")
          TableRow(v-for="row in absenceTable.getRowModel().rows" :key="row.id")
            TableCell(v-for="cell in row.getVisibleCells()" :key="cell.id")
              FlexRender(:render="cell.column.columnDef.cell" :props="cell.getContext()")
        tr(v-else)
          TableCell(:colspan="columns.length" class="h-24 text-center") Keine Einträge gefunden.

  div(class="flex flex-wrap items-center justify-end px-2 gap-6 mt-4")
    div(class="flex items-center gap-2")
      p(class="text-sm font-medium text-muted-foreground") Zeilen
      Select(:model-value="`${absenceTable.getState().pagination.pageSize}`" @update:model-value="v => absenceTable.setPageSize(Number(v))")
        SelectTrigger(class="h-8 w-17.5")
          SelectValue
        SelectContent(side="top")
          SelectItem(v-for="size in [5, 10, 20, 50, 100]" :key="size" :value="`${size}`") {{ size }}
    div(class="text-sm font-medium") Seite {{ absenceTable.getState().pagination.pageIndex + 1 }} von {{ absenceTable.getPageCount() }}
    div(class="flex items-center gap-2")
      Button(variant="outline" size="icon" class="h-8 w-8" :disabled="!absenceTable.getCanPreviousPage()" @click="absenceTable.previousPage()")
        ChevronLeft(class="h-4 w-4")
      Button(variant="outline" size="icon" class="h-8 w-8" :disabled="!absenceTable.getCanNextPage()" @click="absenceTable.nextPage()")
        ChevronRight(class="h-4 w-4")
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { FlexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useVueTable, type ColumnDef, type SortingState } from '@tanstack/vue-table'
import { ArrowUpDown, ChevronLeft, ChevronRight, Check, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TimeEntryTypeMapping } from '@/lib/enumTranslaters'
import { TimeEntryType } from '@/constants/enums/timeRecodring.enum'
import { toast } from 'vue-sonner'
import { timeEntryService } from '@/services/timeEntry.service'

interface CalendarUser {
  id: string
  firstname: string
  lastname: string
  timeEntries: any[]
}

interface CalendarData {
  id: string
  name: string
  users: CalendarUser[]
}

interface FlatEntry {
  entryId: string
  userId: string
  fullname: string
  type: TimeEntryType
  start_date: string
  end_date: string
  is_confirmed: boolean
}

const props = defineProps<{
  data: any[]  // flaches Array statt CalendarData
}>()

const flatEntries = computed<FlatEntry[]>(() => {
  if (!props.data?.length) return []
  return props.data.map((e) => ({
    entryId: e.id,
    userId: e.user.id,
    fullname: `${e.user.lastname}, ${e.user.firstname}`,
    type: e.type,
    start_date: e.start_date,
    end_date: e.end_date,
    is_confirmed: e.is_confirmed,
  }))
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

const emit = defineEmits<{
  'refresh': []
}>()

async function handleConfirm(id: string) {
  try {
    await timeEntryService.changeTimeEntryConfirmation(id, true)
    toast.success('Zeiteintrag genehmigt')
    emit('refresh')
  } catch {
    toast.error('Fehler beim Genehmigen')
  }
}

async function handleReject(id: string) {
  try {
    await timeEntryService.changeTimeEntryConfirmation(id, false)
    toast.success('Zeiteintrag abgelehnt')
    emit('refresh')
  } catch {
    toast.error('Fehler beim Ablehnen')
  }
}

const sorting = ref<SortingState>([])

const columns: ColumnDef<FlatEntry>[] = [
  {
    accessorKey: 'fullname',
    header: ({ column }) => h(Button, {
      variant: 'ghost', class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Mitarbeiter', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => h('div', { class: 'ml-4 text-sm font-medium' }, row.original.fullname),
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'type',
    header: () => h('span', { class: 'font-medium' }, 'Typ'),
    cell: ({ row }) => h(Badge, { variant: 'outline' }, () => TimeEntryTypeMapping[row.original.type]?.label ?? row.original.type),
  },
  {
    accessorKey: 'start_date',
    header: ({ column }) => h(Button, {
      variant: 'ghost', class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Von', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => h('div', { class: 'ml-4 text-sm' }, formatDate(row.original.start_date)),
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'end_date',
    header: ({ column }) => h(Button, {
      variant: 'ghost', class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Bis', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => h('div', { class: 'ml-4 text-sm' }, formatDate(row.original.end_date)),
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'is_confirmed',
    header: ({ column }) => h(Button, {
      variant: 'ghost', class: 'hover:bg-transparent -ml-4',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Status', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => h(Badge, {
      variant: row.original.is_confirmed ? 'positive' : 'destructive',
    }, () => row.original.is_confirmed ? 'Bestätigt' : 'Ausstehend'),
    sortingFn: (a, b) => Number(a.original.is_confirmed) - Number(b.original.is_confirmed),
  },
  {
    id: 'actions',
    cell: ({ row }) => h('div', { class: 'flex items-center justify-end gap-2' }, [
      !row.original.is_confirmed
        ? h(Button, {
            variant: 'outline', size: 'sm',
            onClick: () => handleConfirm(row.original.entryId),
          }, () => ['Genehmigen', h(Check, { class: 'ml-2 h-4 w-4' })])
        : null,
      h(Button, {
        variant: 'outline', size: 'sm',
        class: 'text-destructive hover:text-destructive',
        onClick: () => handleReject(row.original.entryId),
      }, () => ['Ablehnen', h(X, { class: 'ml-2 h-4 w-4' })]),
    ]),
  },
]

const absenceTable = useVueTable({
  get data() { return flatEntries.value },
  columns,
  state: {
    get sorting() { return sorting.value },
  },
  onSortingChange: updater => sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})
</script>