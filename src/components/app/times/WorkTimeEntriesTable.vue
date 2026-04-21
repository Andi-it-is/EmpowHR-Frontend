<script setup lang="ts">
import { ref, h, computed, watch } from "vue"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreVertical,
  ArrowUpDown,
  MapPin,
  Clock,
  Pencil,
  Trash2,
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
  type SortingState,
} from "@tanstack/vue-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'


import { timeEntryService, type CreateTimeEntryRequest, type TimeEntry } from "@/services/timeEntry.service"
import { WorkingLocation, TimeEntryType } from "@/constants/enums/timeRecodring.enum"
import CalendarInput from "../generic/CalendarInput.vue"
import { Input } from '@/components/ui/input'
import { toast } from "vue-sonner"
import { isoToGermanDate } from "@/lib/dateHelpers"
import { TimeEntryTypeLabels, workingLocationLabels } from "@/lib/enumTranslaters"

const emit = defineEmits<{
  refresh: []
}>()

const props = defineProps<{
  data: TimeEntry[]
}>()

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const rowSelection = ref({})

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })

const formatTime = (date: Date) =>
  new Date(date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })


// Zustand für die Dialoge
const editingEntry = ref<TimeEntry | null>(null)
const deletingEntry = ref<TimeEntry | null>(null)

async function onEditEntry() {
  if (!editingEntry.value) return
  if (editEndDateError.value || editEndTimeError.value) return

  const start_date = new Date(`${editStartDate.value}T${editStartTime.value}:00`)
  const end_date = new Date(`${editEndDate.value}T${editEndTime.value}:00`)

  const reqObj: CreateTimeEntryRequest = {
    start_date: start_date,
    end_date: end_date,
    working_location: editWorkingLocation.value as WorkingLocation,
  }

  try {
    await timeEntryService.updateTimeEntry(editingEntry.value.id, reqObj)

    toast.success('Zeiteintrag aktualisiert', {
      description: `${isoToGermanDate(start_date)} · ${editStartTime.value} – ${editEndTime.value} Uhr`,
    })
    
    editingEntry.value = null
    emit('refresh')

  } catch (error) {
    console.error(error)
  }
}

async function onDeleteEntry() {
  if (!deletingEntry.value) return

  const entry = { ...deletingEntry.value }

  try {
    await timeEntryService.deleteTimeEntry(entry.id)

    deletingEntry.value = null
    emit('refresh')

    toast.success('Zeiteintrag gelöscht', {
      description: `${isoToGermanDate(new Date(entry.start_date))} wurde erfolgreich gelöscht.`,
    })

  } catch (error) {
    console.error(error)
  }
}

const editStartDate = ref('')
const editStartTime = ref('')
const editEndDate = ref('')
const editEndTime = ref('')
const editWorkingLocation = ref<WorkingLocation | null>(null)

watch(editingEntry, (entry) => {
  if (!entry) return
  const start = new Date(entry.start_date)
  const end = new Date(entry.end_date)

  editStartDate.value = start.toISOString().split('T')[0] as string
  editStartTime.value = start.toTimeString().slice(0, 5)
  editEndDate.value = end.toISOString().split('T')[0] as string
  editEndTime.value = end.toTimeString().slice(0, 5)
  editWorkingLocation.value = entry.working_location
})

const editEndDateError = computed(() => {
  if (!editStartDate.value || !editEndDate.value) return null
  const start = new Date(editStartDate.value)
  const end = new Date(editEndDate.value)
  if (end < start) return 'Enddatum muss nach dem Startdatum liegen'
  return null
})

const editEndTimeError = computed(() => {
  if (editEndDateError.value) return null
  if (!editStartDate.value || !editEndDate.value || !editStartTime.value || !editEndTime.value) return null
  const start = new Date(`${editStartDate.value}T${editStartTime.value}`)
  const end = new Date(`${editEndDate.value}T${editEndTime.value}`)
  if (end <= start) return 'Endzeitpunkt muss nach dem Startzeitpunkt liegen'
  return null
})


// --- Column Definitions ---
const columns: ColumnDef<TimeEntry>[] = [

  {
    accessorKey: 'working_location',
    header: () => h('span', { class: 'text-foreground font-medium' }, 'Arbeitsort'),
    cell: ({ row }) => {
      const loc = row.getValue('working_location') as WorkingLocation | null
      if (!loc) return h('span', { class: 'text-muted-foreground text-sm' }, '—')
      return h('div', { class: 'flex items-center gap-1.5 text-sm' }, [
        h(MapPin, { class: 'h-3.5 w-3.5 text-muted-foreground' }),
        h('span', workingLocationLabels[loc] ?? loc),
      ])
    },
  },

  {
    accessorKey: 'start_date',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Start', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => {
      const date = row.getValue('start_date') as Date
      return h('div', { class: 'text-sm ml-4' }, [
        h('div', formatDate(date)),
        h('div', { class: 'text-muted-foreground text-sm' }, formatTime(date)),
      ])
    },
  },

  {
    accessorKey: 'end_date',
    header: () => h('span', { class: 'text-foreground font-medium' }, 'Ende'),
    cell: ({ row }) => {
      const date = row.getValue('end_date') as Date
      return h('div', { class: 'text-sm' }, [
        h('div', formatDate(date)),
        h('div', { class: 'text-muted-foreground text-sm' }, formatTime(date)),
      ])
    },
  },

  {
    accessorKey: 'recorded_hours',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => [h({ class: 'mr-2 h-3.5 w-3.5' }), 'Tatsächliche Stunden', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => {
      const hours = row.getValue('recorded_hours') as number
      const interruption = row.original.interruption_hours
      return h('div', { class: 'text-sm ml-4' }, [
        h('div', { class: 'font-medium' }, `${hours} h`),
        interruption > 0
          ? h('div', { class: 'text-muted-foreground text-sm' }, `- ${interruption} h Pause`)
          : h('div', { class: 'text-muted-foreground text-sm' }, 'Keine Pause berechnet'),
      ])
    },
  },

  {
    id: 'edit',
    size: 50,
    cell: ({ row }) => h(Button, {
      variant: 'ghost',
      class: 'h-8 w-auto px-3 gap-2 border',
      onClick: () => editingEntry.value = row.original,
    }, () => [h(Pencil, { class: 'h-4 w-4' }), 'Bearbeiten']),
  },
  {
    id: 'delete',
    size: 50,
    cell: ({ row }) => h(Button, {
      variant: 'ghost',
      class: 'h-8 w-auto px-3 gap-2 border border-destructive text-destructive hover:text-destructive',
      onClick: () => deletingEntry.value = row.original,
    }, () => [h(Trash2, { class: 'h-4 w-4' }), 'Löschen']),
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
})
</script>

<template>
  <div class="w-full space-y-4">

    <div class="rounded-md border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader class="bg-muted dark:[&_th]:text-slate-100 [&_th]:text-slate-900">
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id" class="hover:bg-transparent border-none">
            <TableHead 
              v-for="header in headerGroup.headers" 
              :key="header.id" 
              class="text-white font-bold h-11"
              :style="{ width: `${header.getSize()}px` }"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow 
              v-for="row in table.getRowModel().rows" 
              :key="row.id"
              :data-state="row.getIsSelected() && 'selected'"
              class="transition-colors data-[state=selected]:bg-muted data-[state=selected]:shadow-[inset_6px_0_0_0_#064e3b]"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <tr v-else>
            <TableCell :colspan="columns.length" class="h-24 text-center">
              Keine Daten verfügbar.
            </TableCell>
          </tr>
        </TableBody>
      </Table>
    </div>

    <div class="flex flex-wrap items-center justify-end px-2">

      <div class="flex  flex-wrap items-center gap-6 lg:gap-8">
        <div class="flex items-center gap-2">
          <p class="text-sm font-medium whitespace-nowrap text-muted-foreground">Zeilen</p>
          <Select
            :model-value="`${table.getState().pagination.pageSize}`"
            @update:model-value="v => table.setPageSize(Number(v))"
          >
            <SelectTrigger class="h-8 w-17.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem v-for="size in [2, 5, 10, 20, 30, 50]" :key="size" :value="`${size}`">
                {{ size }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="text-sm font-medium">
          Seite {{ table.getState().pagination.pageIndex + 1 }} von {{ table.getPageCount() }}
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" class="h-8 w-8" :disabled="!table.getCanPreviousPage()" @click="table.setPageIndex(0)">
            <ChevronsLeft class="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" class="h-8 w-8" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()">
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" class="h-8 w-8" :disabled="!table.getCanNextPage()" @click="table.nextPage()">
            <ChevronRight class="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" class="h-8 w-8" :disabled="!table.getCanNextPage()" @click="table.setPageIndex(table.getPageCount() - 1)">
            <ChevronsRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>


  <!-- Bearbeiten Dialog -->
  <Dialog :open="!!editingEntry" @update:open="v => { if (!v) editingEntry = null }">
    <DialogContent>
      <DialogHeader>
        <DialogTitle class="mb-4">Zeiteintrag bearbeiten</DialogTitle>
      </DialogHeader>
        <form @submit.prevent="onEditEntry()" novalidate>
          <FieldGroup class="flex flex-col gap-2">

            <div class="grid grid-cols-2 gap-4 items-start">
              <Field class="min-h-28">
                <CalendarInput id="editStartDate" label="Startdatum" v-model="editStartDate" />
                <p v-show="editEndDateError" class="text-xs text-destructive mt-1 h-4">{{ editEndDateError }}&nbsp;</p>
              </Field>
              <Field class="min-h-28">
                <FieldLabel for="editStartTime">Startzeit</FieldLabel>
                <Input
                  id="editStartTime"
                  type="time"
                  v-model="editStartTime"
                  class="bg-transparent shadow-sm dark:bg-input/30 dark:text-white"
                />
              </Field>
            </div>

            <div class="grid grid-cols-2 gap-4 items-start">
              <Field class="min-h-28">
                <CalendarInput id="editEndDate" label="Enddatum" v-model="editEndDate" />
                <p v-show="editEndDateError" class="text-xs text-destructive mt-1 h-4">{{ editEndDateError }}&nbsp;</p>
              </Field>
              <Field class="min-h-28">
                <FieldLabel for="editEndTime">Endzeit</FieldLabel>  
                <Input
                  id="editEndTime"
                  type="time"
                  v-model="editEndTime"
                  class="bg-transparent shadow-sm dark:bg-input/30"
                  :class="editEndTimeError ? 'border-destructive focus-visible:ring-destructive' : ''"
                />
                <p v-show="editEndTimeError" class="text-xs text-destructive mt-1 h-4">{{ editEndTimeError }}&nbsp;</p>
              </Field>
            </div>

            <Field class="min-h-28">
              <FieldLabel>Arbeitsort</FieldLabel>
              <Select :model-value="editWorkingLocation" @update:model-value="v => editWorkingLocation = v as WorkingLocation">
                <SelectTrigger>
                  <SelectValue placeholder="Arbeitsort wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="(label, key) in workingLocationLabels" :key="key" :value="key">
                    {{ label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <DialogFooter>
              <Button type="button" variant="outline" @click="editingEntry = null">Abbrechen</Button>
              <Button type="submit" variant="brand">Änderung Speichern</Button>
            </DialogFooter>

          </FieldGroup>
        </form>
    </DialogContent>
  </Dialog>

  <!-- Löschen Dialog -->
  <AlertDialog :open="!!deletingEntry">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle class="mb-4">Zeiteintrag löschen</AlertDialogTitle>
        <AlertDialogDescription>Dieser Vorgang kann nicht rückgängig gemacht werden.</AlertDialogDescription>
      </AlertDialogHeader>
      <div class="rounded-md border border-border bg-muted/50 p-4 text-sm space-y-1">
        <p class="font-medium">{{ deletingEntry?.type ? TimeEntryTypeLabels[deletingEntry.type] : '' }} · {{ deletingEntry?.working_location ? workingLocationLabels[deletingEntry.working_location] : 'Abwesenheit' }}</p>
        <p class="text-muted-foreground">{{ deletingEntry ? formatDate(deletingEntry.start_date) : '' }} · {{ deletingEntry ? formatTime(deletingEntry.start_date) : '' }} Uhr</p>
        <p class="text-muted-foreground">bis</p>
        <p class="text-muted-foreground">{{ deletingEntry ? formatDate(deletingEntry.end_date) : '' }} · {{ deletingEntry ? formatTime(deletingEntry.end_date) : '' }} Uhr</p>
        <p class="text-muted-foreground pt-1">{{ deletingEntry?.recorded_hours }} h erfasst</p>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel @click="deletingEntry = null">Abbrechen</AlertDialogCancel>
        <AlertDialogAction class="bg-destructive text-white hover:bg-destructive/90" @click="onDeleteEntry()">Löschen</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

</template>