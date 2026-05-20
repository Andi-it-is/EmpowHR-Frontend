<template lang="pug">
div.overflow-x-auto.rounded-lg.border
  table.w-full.border-collapse(style="table-layout: fixed; min-width: 700px")
    thead
      tr.bg-muted
        th.text-left.px-3.py-2.border-r.font-normal.text-xs.text-muted-foreground(
          style="width: 140px"
        )
          button.flex.items-center.gap-1(
            @click="toggleSort"
          )
            span Mitarbeiter
            ArrowUpAZ(v-if="sortDir === 'asc'" :size="14")
            ArrowDownAZ(v-else :size="14")

        th.text-center.py-1.border-r.font-normal(
          v-for="d in dayNumbers"
          :key="d"
          :class="[\
            'text-xs',\
            isWeekend(d) ? 'bg-muted/60' : '',\
            isToday(d) ? 'text-positive font-medium' : 'text-muted-foreground'\
          ]"
        )
          div {{ getDow(d) }}
          div {{ d }}

    tbody
      tr.border-t(
        v-for="user in sortedUsers"
        :key="user.id"
        class="hover:bg-muted/20"
      )
        td.px-3.border-r.text-xs.truncate(style="height: 40px; width: 140px")
          | {{ user.lastname }}, {{ user.firstname }}

        td.border-r.p-0.text-center(
          v-for="d in dayNumbers"
          :key="d"
          :class="[isWeekend(d) ? 'bg-muted/40' : '', isToday(d) ? 'bg-brand/10' : '']"
          style="height: 40px"
        )
          Popover(v-if="getEntry(user.timeEntries, d)")
            PopoverTrigger(as-child)
              div.mx-auto.rounded.flex.items-center.justify-center.text-xs.font-medium.overflow-hidden.cursor-pointer(
                :style="entryStyle(getEntry(user.timeEntries, d))"
                :class="{ 'opacity-30': !getEntry(user.timeEntries, d).is_confirmed }"
                style="width: 94%; height: 22px; white-space: nowrap"
              ) {{ entryLabel(getEntry(user.timeEntries, d)?.type) }}

            PopoverContent(class="w-56 p-3")
              div.flex.flex-col.gap-2
                div.flex.items-center.justify-between
                  span.text-sm.font-medium {{ getEntry(user.timeEntries, d).type ? TimeEntryTypeMapping[getEntry(user.timeEntries, d).type]?.label : 'Abwesenheit' }}
                  Badge(
                    v-if="getEntry(user.timeEntries, d).type"
                    :variant="getEntry(user.timeEntries, d).is_confirmed ? 'positive' : 'destructive'"
                  )
                    | {{ getEntry(user.timeEntries, d).is_confirmed ? 'Bestätigt' : 'Ausstehend' }}
                div.text-xs.text-muted-foreground.flex.flex-col.gap-1
                  div
                    span.font-medium Von:&nbsp;
                    | {{ formatDate(getEntry(user.timeEntries, d).start_date) }}
                  div
                    span.font-medium Bis:&nbsp;
                    | {{ formatDate(getEntry(user.timeEntries, d).end_date) }}
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { TimeEntryTypeMapping } from '@/lib/enumTranslaters'
import type { TimeEntryType } from '@/constants/enums/timeRecodring.enum'
import { ArrowUpAZ, ArrowDownAZ } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

interface TimeEntry {
  id: string
  type: TimeEntryType
  start_date: string
  end_date: string
  recorded_hours: number
  is_confirmed: boolean
}

interface CalendarUser {
  id: string
  firstname: string
  lastname: string
  email: string
  timeEntries: TimeEntry[]
}

interface CalendarData {
  id: string
  name: string
  users: CalendarUser[]
}

const props = defineProps<{
  calendarData: CalendarData
  month: number
  year: number
}>()

type SortDir = 'asc' | 'desc'
const sortDir = ref<SortDir>('asc')

const sortIcon = computed(() =>
  sortDir.value === 'asc' ? 'ti-sort-ascending-letters' : 'ti-sort-descending-letters'
)

function toggleSort() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

const sortedUsers = computed(() => {
  return [...props.calendarData.users].sort((a, b) => {
    const cmp = a.lastname.localeCompare(b.lastname, 'de') || a.firstname.localeCompare(b.firstname, 'de')
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

const TYPE_HEX: Record<string, { bg: string; color: string }> = {
  WORK:             { bg: '#475569', color: '#ffffff' }, // slate-600
  VACATION:         { bg: '#10b981', color: '#ffffff' }, // emerald-500
  SICK:             { bg: '#dc2626', color: '#ffffff' }, // red-600
  SICK_CHILD:       { bg: '#f59e0b', color: '#000000' }, // amber-500
  EDUCATION:        { bg: '#475569', color: '#ffffff' }, // slate-600
  PUBLIC_HOLIDAY:   { bg: '#d946ef', color: '#ffffff' }, // fuchsia-500
  COMPENSATORY_OFF: { bg: '#2dd4bf', color: '#000000' }, // teal-400
  SPECIAL_LEAVE:    { bg: '#fb7185', color: '#000000' }, // rose-400
  PARENTAL_LEAVE:   { bg: '#0ea5e9', color: '#ffffff' }, // sky-500
  UNPAID_LEAVE:     { bg: '#a8a29e', color: '#000000' }, // stone-400
}

const dayNumbers = computed(() => {
  const count = new Date(props.year, props.month, 0).getDate()
  return Array.from({ length: count }, (_, i) => i + 1)
})

function isWeekend(day: number) {
  const w = new Date(props.year, props.month - 1, day).getDay()
  return w === 0 || w === 6
}

function isToday(day: number) {
  const t = new Date()
  return t.getFullYear() === props.year
    && t.getMonth() + 1 === props.month
    && t.getDate() === day
}

function getDow(day: number) {
  return new Date(props.year, props.month - 1, day)
    .toLocaleDateString('de-DE', { weekday: 'short' })
    .slice(0, 2)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function getEntry(entries: TimeEntry[], day: number): TimeEntry | undefined {
  const dayStart = new Date(props.year, props.month - 1, day, 0, 0, 0)
  const dayEnd   = new Date(props.year, props.month - 1, day, 23, 59, 59)
  return entries.find(e =>
    new Date(e.start_date) <= dayEnd && new Date(e.end_date) >= dayStart
  )
}

function entryStyle(entry: TimeEntry) {
  const hex = TYPE_HEX[entry.type] ?? { bg: '#F1EFE8', color: '#444441' }
  return { background: hex.bg, color: hex.color }
}

function entryLabel(type?: TimeEntryType) {
  if (!type) return '–'
  return TimeEntryTypeMapping[type]?.label?.slice(0, 3) ?? type.slice(0, 3)
}

</script>