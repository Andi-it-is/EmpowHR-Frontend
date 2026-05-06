<script setup lang="ts">
import { ref, h, computed, watch } from "vue"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Calendar,
  Pencil,
  Trash2,
  MoreVertical
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
  DialogDescription
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { toast } from "vue-sonner"
import { TimeEntryType } from "@/constants/enums/timeRecodring.enum"
import { timeEntryService, type TimeEntry, type CreateTimeEntryRequest } from "@/services/timeEntry.service"
import CalendarInput from "../generic/CalendarInput.vue"
import { isoToGermanDate } from "@/lib/dateHelpers"
import { TimeEntryTypeLabels, getTimeEntryColor, TimeEntryTypeColors, TimeEntryTypeMapping } from "@/lib/enumTranslaters"
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const props = defineProps<{
  data: TimeEntry[]
  sollProTag: number
  affectedUserId?: string  // wenn gesetzt → HR-Modus
}>()

const emit = defineEmits<{
  refresh: []
}>()

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const rowSelection = ref({})

// --- Helpers ---
const formatDate = (date: Date) => new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
const formatTime = (date: Date) => new Date(date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })

// --- State für Dialoge ---
const editingEntry = ref<TimeEntry | null>(null)
const deletingEntry = ref<TimeEntry | null>(null)

const editStartDate = ref('')
const editStartTime = ref('')
const editEndDate = ref('')
const editEndTime = ref('')
const editType = ref<TimeEntryType | null>(null)

const submitted = ref(false)

const typeError = computed(() => submitted.value && !editType.value ? 'Wähle eine Abwesenheitsart aus' : null)
const startDateError = computed(() => submitted.value && !editStartDate.value ? 'Startdatum ist erforderlich' : null)
const endDateError = computed(() => submitted.value && !editEndDate.value ? 'Enddatum ist erforderlich' : null)
const startTimeError = computed(() => submitted.value && !editIsFullDay.value && !editStartTime.value ? 'Startzeit ist erforderlich' : null)
const endTimeError = computed(() => submitted.value && !editIsFullDay.value && !editEndTime.value ? 'Endzeit ist erforderlich' : null)

const editIsFullDay = ref(false)

const isEditFormValid = computed(() =>
  !typeError.value && !startDateError.value && !endDateError.value &&
  !startTimeError.value && !endTimeError.value
)

watch(editIsFullDay, (isFullDay) => {
  if (!isFullDay) {
    editStartTime.value = '08:00'
    editEndTime.value = '16:00'
  }
})

watch(editingEntry, (entry) => {
  if (!entry) return
  editType.value = entry.type
  const start = new Date(entry.start_date)
  const end = new Date(entry.end_date)
  editStartDate.value = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
  editEndDate.value = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
  
  const isFullDay = start.getHours() === 0 && start.getMinutes() === 0 &&
    end.getHours() === 23 && end.getMinutes() === 59
  
  editIsFullDay.value = isFullDay
  editStartTime.value = isFullDay ? '00:00' : start.toTimeString().slice(0, 5)
  editEndTime.value = isFullDay ? '23:59' : end.toTimeString().slice(0, 5)
})

const EXCLUDED_TYPES = [TimeEntryType.WORK, TimeEntryType.PUBLIC_HOLIDAY]

const typeOptions = computed(() =>
  Object.entries(TimeEntryTypeMapping)
    .filter(([key]) => !EXCLUDED_TYPES.includes(key as TimeEntryType))
    .map(([key, value]) => ({
      value: key,
      label: value.label,
      color: value.color,
    }))
)

// --- Actions ---
async function onEditEntry() {
  submitted.value = true
  if (!isEditFormValid.value) return
  if (!editingEntry.value || !editType.value) return

  const start_date = new Date(`${editStartDate.value}T${editIsFullDay.value ? '00:00' : editStartTime.value}:00`)
  const end_date = new Date(`${editEndDate.value}T${editIsFullDay.value ? '23:59' : editEndTime.value}:00`)

  const reqObj: CreateTimeEntryRequest = {
    start_date: start_date,
    end_date: end_date,
    working_location: null,
    type: editType.value,
  }

  try {
    if (props.affectedUserId) {

      await timeEntryService.updateTimeEntryByUserId(props.affectedUserId, editingEntry.value.id, reqObj)

    } else {
      await timeEntryService.updateTimeEntry(editingEntry.value.id, reqObj)
    }
    toast.success('Abwesenheit aktualisiert')
    editingEntry.value = null
    emit('refresh')
  } catch (error) {
    console.error(error)
  }
}

async function onDeleteEntry() {
  if (!deletingEntry.value) return
  try {
    if (props.affectedUserId) {

      await timeEntryService.deleteTimeEntryByUserId(props.affectedUserId, deletingEntry.value.id)

    } else {
      await timeEntryService.deleteTimeEntry(deletingEntry.value.id)
    }
    toast.success('Abwesenheit gelöscht')
    deletingEntry.value = null
    emit('refresh')
  } catch (error) {
    console.error(error)
  }
}

// --- Spalten Definitionen ---
const columns: ColumnDef<TimeEntry>[] = [
  {
    accessorKey: 'type',
    // accessorFn sorgt dafür, dass die Tabelle das Label zum Sortieren nutzt
    accessorFn: (row) => TimeEntryTypeLabels[row.type as TimeEntryType] || row.type,
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'hover:bg-transparent', // -ml-4 gleicht das Padding des Buttons aus
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => [
      'Art der Abwesenheit',
      h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })
    ]),
    cell: ({ row }) => {
      const type = row.original.type as TimeEntryType
      return h('div', { class: 'flex items-center gap-2 ml-5 text-sm' }, [
        h('div', { 
          class: `w-2.5 h-2.5 rounded-full ${TimeEntryTypeColors[type] || 'bg-slate-300'}` 
        }),
        h('span', { class: 'font-medium' }, TimeEntryTypeLabels[type] || type),
      ])
    },
    sortingFn: 'alphanumeric', // Explizite Angabe der alphabetischen Sortierung
  },
  {
    accessorKey: 'start_date',
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Start', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => {
      const date = row.getValue('start_date') as Date
      const start = new Date(date)
      const isFullDay = start.getHours() === 0 && start.getMinutes() === 0 // vereinfachter Check für UI

      return h('div', { class: 'text-sm ml-4' }, [
        h('div', formatDate(date)),
        // Zeit nur anzeigen, wenn NICHT ganztägig
        !isFullDay ? h('div', { class: 'text-muted-foreground' }, formatTime(date)) : null,
      ])
    },
  },
  {
    accessorKey: 'end_date',
    header: () => h('span', { class: 'text-foreground font-medium' }, 'Ende'),
    cell: ({ row }) => {
      const date = row.getValue('end_date') as Date 
      const endDate = new Date(date)
      
      const startDate = new Date(row.getValue('start_date') as Date)
      const isFullDay = startDate.getHours() === 0 && startDate.getMinutes() === 0

      return h('div', { class: 'text-sm' }, [
        h('div', formatDate(date)),
        // Zeit nur anzeigen, wenn NICHT ganztägig
        !isFullDay ? h('div', { class: 'text-muted-foreground' }, formatTime(date)) : null,
      ])
    },
  },
  {
    id: 'isFullDay',
    header: () => h('div', { class: 'text-left w-full' }, [
      h('span', { class: 'text-foreground font-medium' }, 'Ganztägig')
    ]),
    cell: ({ row }) => {
      const start = new Date(row.original.start_date)
      const end = new Date(row.original.end_date)
      
      const isFullDay = 
        start.getHours() === 0 && start.getMinutes() === 0 &&
        ((end.getHours() === 23 && end.getMinutes() === 59) || 
        (end.getHours() === 0 && end.getMinutes() === 0 && end.getTime() > start.getTime()))

      return h('div', { class: 'w-full flex justify-start' }, [
        isFullDay 
          ? h(Badge, { variant: 'positive' }, () => 'Ja')
          : h(Badge, { variant: 'outline' }, () => 'Nein')
      ])
    },
  },
  {
    id: 'duration',
    accessorFn: (row) => Math.round((new Date(row.end_date).getTime() - new Date(row.start_date).getTime()) / (1000 * 60 * 60 * 24)),
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'w-full flex justify-start w-fit hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Dauer', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => {
      const totalDays = Math.round((new Date(row.original.end_date).getTime() - new Date(row.original.start_date).getTime()) / (1000 * 60 * 60 * 24))
      return h('div', { class: 'text-sm font-medium ml-4' }, `${totalDays} ${totalDays === 1 ? 'Tag' : 'Tage'}`)
    },
    sortingFn: 'basic',
  },

  {
    id: 'vacation_days',
    accessorFn: (row) => row.recorded_hours / props.sollProTag,
    header: ({ column }) => h(Button, {
      variant: 'ghost',
      class: 'w-full flex justify-start w-fit hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Urlaubstage', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => {
      const entry = row.original
      if (entry.type !== TimeEntryType.VACATION) {
        return h('div', { class: 'text-sm text-muted-foreground ml-4' }, '—')
      }
      const days = Math.round((entry.recorded_hours / props.sollProTag) * 10) / 10
      return h('div', { class: 'text-sm font-medium ml-4' }, `${days} ${days === 1 ? 'Tag' : 'Tage'}`)
    },
    sortingFn: 'basic',
  },
  {
    accessorKey: 'is_confirmed',
    header: () => h('div', { class: 'text-left w-full' }, [
      h('span', { class: 'text-foreground font-medium' }, 'Status')
    ]),
    cell: ({ row }) => {
      const confirmed = row.getValue('is_confirmed') as boolean
      return h(Badge, {
        variant: confirmed ? 'positive' : 'destructive',
      }, () => confirmed ? 'Bestätigt' : 'Ausstehend')
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
              onClick: () => editingEntry.value = row.original,
            }, () => [h(Pencil, { class: 'h-4 w-4' }), 'Bearbeiten']),
            h(DropdownMenuSeparator),
            h(DropdownMenuItem, {
              class: 'gap-2 cursor-pointer text-destructive focus:text-destructive',
              onClick: () => deletingEntry.value = row.original,
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
            class="transition-colors data-[state=selected]:bg-muted data-[state=selected]:shadow-[inset_6px_0_0_0_#064e3b]"
          )
            TableCell(v-for="cell in row.getVisibleCells()" :key="cell.id")
              FlexRender(:render="cell.column.columnDef.cell" :props="cell.getContext()")
        tr(v-else)
          TableCell(:colspan="columns.length" class="h-24 text-center") Keine Abwesenheiten gefunden.

  //- Pagination (analog zu deinem Original)
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

  //- Dialoge (Bearbeiten)
  Dialog(:open="!!editingEntry" @update:open="v => { if (!v) editingEntry = null }")
    DialogContent
      DialogHeader
        DialogTitle Abwesenheit bearbeiten
        DialogDescription
        | Bearbeite einen bestehenden Antrag auf Abwesenheit und reiche diesen neu ein.
      form(@submit.prevent="onEditEntry()")
        FieldGroup(class="flex flex-col gap-4")
          Field(class="min-h-25")
            FieldLabel Abwesenheitsart
            Select(v-model="editType")
              SelectTrigger(:class="editTypeError ? 'border-destructive focus-visible:ring-destructive' : ''" disabled)
                SelectValue(placeholder="Typ wählen")
                  template(v-if="editType" #default)
                    div(class="flex items-center gap-2")
                      div(:class="`w-2.5 h-2.5 rounded-full ${TimeEntryTypeMapping[editType]?.color}`")
                      span {{ TimeEntryTypeMapping[editType]?.label }}
                SelectContent
                  SelectItem(
                    v-for="option in typeOptions"
                    :key="option.value"
                    :value="option.value"
                  )
                    div(class="flex items-center gap-2")
                      div(:class="`w-2.5 h-2.5 rounded-full ${option.color}`")
                      span {{ option.label }}
            p(v-show="typeError" class="text-xs text-destructive mt-1 h-4") {{ typeError }}&nbsp;

          Field
            div(class="flex items-center gap-2 mt-1")
              Checkbox(id="editFullDay" v-model="editIsFullDay")
              FieldLabel(for="editFullDay" class="cursor-pointer") Ganztägig

          div(class="grid grid-cols-2 gap-4")
            Field(class="min-h-25")
              CalendarInput(label="Startdatum" id="startDate" v-model="editStartDate")
              p(v-show="startDateError" class="text-xs text-destructive mt-1 h-4") {{ startDateError }}&nbsp;
            Field(class="min-h-25")
              FieldLabel Startzeit
              Input(type="time" :disabled="editIsFullDay" v-model="editStartTime" :class="startTimeError ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(v-show="startTimeError" class="text-xs text-destructive mt-1 h-4") {{ startTimeError }}&nbsp;

          div(class="grid grid-cols-2 gap-4")
            Field(class="min-h-25")
              CalendarInput(label="Enddatum" id="endDate" v-model="editEndDate")
              p(v-show="endDateError" class="text-xs text-destructive mt-1 h-4") {{ endDateError }}&nbsp;
            Field(class="min-h-25")
              FieldLabel Endzeit
              Input(type="time" :disabled="editIsFullDay" v-model="editEndTime" :class="endTimeError ? 'border-destructive focus-visible:ring-destructive' : ''")
              p(v-show="endTimeError" class="text-xs text-destructive mt-1 h-4") {{ endTimeError }}&nbsp;

          DialogFooter(class="mt-4")
            Button(type="button" variant="outline" @click="editingEntry = null") Abbrechen
            Button(type="submit" variant="brand") Änderung Speichern

  //- AlertDialog (Löschen)
  AlertDialog(:open="!!deletingEntry")
    AlertDialogContent
      AlertDialogHeader
        AlertDialogTitle Abwesenheit löschen?
        AlertDialogDescription Diese Aktion kann nicht rückgängig gemacht werden.
      div(v-if="deletingEntry" class="rounded-md border p-4 bg-muted/50 text-sm")
        p(class="font-bold") {{ TimeEntryTypeLabels[deletingEntry.type] }}
        p(class="text-muted-foreground") {{ formatDate(deletingEntry.start_date) }} - {{ formatDate(deletingEntry.end_date) }}
      AlertDialogFooter
        AlertDialogCancel(@click="deletingEntry = null") Abbrechen
        AlertDialogAction(class="bg-destructive hover:bg-destructive/90" @click="onDeleteEntry") Löschen

</template>