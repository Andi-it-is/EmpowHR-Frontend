<template lang="pug">
.team-calendar
  //- Header Controls
  Card.calendar-header
    CardContent.pt-4
      .flex.items-center.justify-between.flex-wrap.gap-4
        .flex.items-center.gap-3
          Button(variant="outline" size="icon" @click="prevMonth")
            ChevronLeft.h-4.w-4
          h2.month-title {{ monthTitle }}
          Button(variant="outline" size="icon" @click="nextMonth")
            ChevronRight.h-4.w-4
          Button(variant="outline" size="sm" @click="goToToday") Heute

        .flex.items-center.gap-3
          //- Department Selector
          Select(v-model="selectedDepartmentId")
            SelectTrigger.w-56
              SelectValue(placeholder="Abteilung wählen")
            SelectContent
              SelectItem(
                v-for="dept in departments"
                :key="dept.id"
                :value="dept.id"
              ) {{ dept.name }}

          //- Legend
          .flex.items-center.gap-3.ml-2
            .legend-item(v-for="item in legendItems" :key="item.label")
              .legend-dot(:style="{ background: item.color }")
              span.legend-label {{ item.label }}

  //- Calendar Grid
  .calendar-wrapper(v-if="activeDepartment")
    .calendar-grid-container
      //- Sticky left: employee names
      .employee-column
        .employee-header-spacer Mitarbeitende
        .employee-row(
          v-for="user in activeDepartment.users"
          :key="user.id"
          :class="{ 'row-even': activeDepartment.users.indexOf(user) % 2 === 0 }"
        )
          .employee-info
            span.employee-name.ml-4 {{ user.lastname }} {{ user.firstname }}

      //- Scrollable right: calendar days
      .days-scroll-container(ref="scrollContainer")
        .days-grid(:style="gridStyle")
          //- Day headers row
          template(v-for="(day, index) in calendarDays" :key="'header-' + index")
            .day-header(
              :class="getDayHeaderClass(day)"
              :style="{ gridColumn: index + 1 }"
            )
              .day-number {{ day.getDate() }}
              .day-name {{ getDayName(day) }}

          //- Employee rows
          template(v-for="(user, rowIndex) in activeDepartment.users" :key="user.id")
            template(v-for="(day, colIndex) in calendarDays" :key="user.id + '-' + colIndex")
              .calendar-cell(
                :class="getCellClass(user, day, rowIndex)"
                :style="{ gridColumn: colIndex + 1, gridRow: rowIndex + 2 }"
              )
                //- Absence entry rendering
                template(v-if="getAbsenceForDay(user, day)")
                  TooltipProvider
                    Tooltip
                      TooltipTrigger(as-child)
                        .absence-block(
                          :class="getAbsenceClass(user, day)"
                          :style="getAbsenceStyle(user, day)"
                        )
                      TooltipContent
                        .tooltip-content
                          p.font-semibold {{ getAbsenceLabel(user, day) }}
                          p.text-xs.text-muted-foreground {{ formatAbsenceDate(getAbsenceForDay(user, day)) }}

                //- Holiday marker
                template(v-else-if="isHoliday(day)")
                  .holiday-cell
                    span.holiday-label(v-if="getHolidayName(day)") {{ getHolidayName(day) }}

  //- Empty state
  .empty-state(v-else)
    Card
      CardContent.py-12.text-center
        p.text-muted-foreground Bitte wähle eine Abteilung aus.
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { Department } from '@/services/department.service'
import type { TimeEntry } from '@/services/timeEntry.service'
import { TimeEntryType } from '@/constants/enums/timeRecodring.enum'
import type { User } from '@/services/user.service'

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const today = new Date()
const y = today.getFullYear()
const m = today.getMonth()

const dummyDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Engineering',
    cost_center: 'CC-100',
    created_at: new Date(),
    updated_at: new Date(),
    users: [
      {
        id: 'u1',
        firstname: 'Lena',
        lastname: 'Müller',
        email: 'lena.mueller@company.com',
        disabled: false,
        supervisor: null,
        roles: [],
        department: null,
      },
      {
        id: 'u2',
        firstname: 'Jonas',
        lastname: 'Schmidt',
        email: 'jonas.schmidt@company.com',
        disabled: false,
        supervisor: null,
        roles: [],
        department: null,
      },
      {
        id: 'u3',
        firstname: 'Sara',
        lastname: 'Weber',
        email: 'sara.weber@company.com',
        disabled: false,
        supervisor: null,
        roles: [],
        department: null,
      },
      {
        id: 'u4',
        firstname: 'Maximilian',
        lastname: 'Bauer',
        email: 'max.bauer@company.com',
        disabled: false,
        supervisor: null,
        roles: [],
        department: null,
      },
      {
        id: 'u5',
        firstname: 'Priya',
        lastname: 'Nair',
        email: 'priya.nair@company.com',
        disabled: false,
        supervisor: null,
        roles: [],
        department: null,
      },
    ],
  },
  {
    id: 'dept-2',
    name: 'Human Resources',
    cost_center: 'CC-200',
    created_at: new Date(),
    updated_at: new Date(),
    users: [
      {
        id: 'u6',
        firstname: 'Katrin',
        lastname: 'Hoffmann',
        email: 'katrin.hoffmann@company.com',
        disabled: false,
        supervisor: null,
        roles: [],
        department: null,
      },
      {
        id: 'u7',
        firstname: 'Thomas',
        lastname: 'Fischer',
        email: 'thomas.fischer@company.com',
        disabled: false,
        supervisor: null,
        roles: [],
        department: null,
      },
      {
        id: 'u8',
        firstname: 'Anna',
        lastname: 'Koch',
        email: 'anna.koch@company.com',
        disabled: false,
        supervisor: null,
        roles: [],
        department: null,
      },
    ],
  },
  {
    id: 'dept-3',
    name: 'Marketing',
    cost_center: 'CC-300',
    created_at: new Date(),
    updated_at: new Date(),
    users: [
      {
        id: 'u9',
        firstname: 'Florian',
        lastname: 'Wagner',
        email: 'florian.wagner@company.com',
        disabled: false,
        supervisor: null,
        roles: [],
        department: null,
      },
      {
        id: 'u10',
        firstname: 'Julia',
        lastname: 'Becker',
        email: 'julia.becker@company.com',
        disabled: false,
        supervisor: null,
        roles: [],
        department: null,
      },
      {
        id: 'u11',
        firstname: 'David',
        lastname: 'Schulz',
        email: 'david.schulz@company.com',
        disabled: false,
        supervisor: null,
        roles: [],
        department: null,
      },
      {
        id: 'u12',
        firstname: 'Sophie',
        lastname: 'Zimmermann',
        email: 'sophie.zimmermann@company.com',
        disabled: false,
        supervisor: null,
        roles: [],
        department: null,
      },
    ],
  },
]

// Dummy TimeEntries: absences (working_location === null, is_confirmed === true)
const dummyTimeEntries: Record<string, TimeEntry[]> = {
  u1: [
    {
      id: 'te-u1-1',
      working_location: null,
      type: TimeEntryType.VACATION,
      start_date: new Date(y, m, 3),
      end_date: new Date(y, m, 7),
      interruption_hours: 0,
      recorded_hours: 40,
      is_confirmed: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 'te-u1-2',
      working_location: null,
      type: TimeEntryType.VACATION,
      start_date: new Date(y, m, 18),
      end_date: new Date(y, m, 19),
      interruption_hours: 0,
      recorded_hours: 16,
      is_confirmed: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
  u2: [
    {
      id: 'te-u2-1',
      working_location: null,
      type: TimeEntryType.VACATION,
      start_date: new Date(y, m, 10),
      end_date: new Date(y, m, 14),
      interruption_hours: 0,
      recorded_hours: 40,
      is_confirmed: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
  u3: [
    {
      id: 'te-u3-1',
      working_location: null,
      type: TimeEntryType.VACATION,
      start_date: new Date(y, m, 1),
      end_date: new Date(y, m, 28),
      interruption_hours: 0,
      recorded_hours: 160,
      is_confirmed: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
  u5: [
    {
      id: 'te-u5-1',
      working_location: null,
      type: TimeEntryType.VACATION,
      start_date: new Date(y, m, 8),
      end_date: new Date(y, m, 10),
      interruption_hours: 0,
      recorded_hours: 24,
      is_confirmed: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
  u10: [],
  u11: [
    {
      id: 'te-u11-1',
      working_location: null,
      type: TimeEntryType.VACATION,
      start_date: new Date(y, m, 2),
      end_date: new Date(y, m, 4),
      interruption_hours: 0,
      recorded_hours: 24,
      is_confirmed: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
}

// NRW Public Holidays (static for demo — replace with API/backend)
function getNRWHolidays(year: number, month: number): Record<string, string> {
  // month is 0-indexed
  const holidays: Record<string, string> = {}
  const key = (d: Date) => d.toISOString().slice(0, 10)

  // Fixed holidays
  const fixed = [
    [1, 1, 'Neujahr'],
    [5, 1, 'Tag der Arbeit'],
    [10, 3, 'Tag der Deutschen Einheit'],
    [11, 1, 'Allerheiligen'],
    [12, 25, 'Weihnachten'],
    [12, 26, '2. Weihnachtstag'],
  ]
  for (const [hm, hd, name] of fixed) {
    if ((hm as number) - 1 === month) {
      holidays[key(new Date(year, month, hd as number))] = name as string
    }
  }

  // Easter-based (Gauss approximation)
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d2 = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d2 - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const mm = Math.floor((a + 11 * h + 22 * l) / 451)
  const easterMonth = Math.floor((h + l - 7 * mm + 114) / 31) - 1
  const easterDay = ((h + l - 7 * mm + 114) % 31) + 1
  const easter = new Date(year, easterMonth, easterDay)

  const easterBased = [
    [-2, 'Karfreitag'],
    [1, 'Ostermontag'],
    [39, 'Christi Himmelfahrt'],
    [49, 'Pfingstsonntag'],
    [50, 'Pfingstmontag'],
    [60, 'Fronleichnam'],
  ]
  for (const [offset, name] of easterBased) {
    const d3 = new Date(easter)
    d3.setDate(d3.getDate() + (offset as number))
    if (d3.getMonth() === month) {
      holidays[key(d3)] = name as string
    }
  }

  return holidays
}

// ─── State ────────────────────────────────────────────────────────────────────

const departments = ref<Department[]>(dummyDepartments)
const timeEntries = ref<Record<string, TimeEntry[]>>(dummyTimeEntries)
const selectedDepartmentId = ref<string>(dummyDepartments[0]!.id)
const currentDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))

// ─── Computed ─────────────────────────────────────────────────────────────────

const activeDepartment = computed(() =>
  departments.value.find((d) => d.id === selectedDepartmentId.value) ?? null
)

const calendarDays = computed<Date[]>(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
})

const monthTitle = computed(() => {
  return currentDate.value.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${calendarDays.value.length}, minmax(36px, 1fr))`,
  gridTemplateRows: `40px repeat(${activeDepartment.value?.users.length ?? 0}, 44px)`,
}))

const holidays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return getNRWHolidays(year, month)
})

const legendItems = [
  { label: 'Urlaub', color: 'var(--color-vacation)' },
  { label: 'Krank', color: 'var(--color-sick)' },
  { label: 'Elternzeit', color: 'var(--color-parental)' },
  { label: 'Dienstreise', color: 'var(--color-business)' },
  { label: 'Sonstiges', color: 'var(--color-other)' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAbsences(user: User): TimeEntry[] {
  return (timeEntries.value[user.id] ?? []).filter(
    (e) => e.working_location === null && e.is_confirmed
  )
}

function getAbsenceForDay(user: User, day: Date): TimeEntry | null {
  const absences = getAbsences(user)
  return (
    absences.find((e) => {
      const start = normalizeDate(e.start_date)
      const end = normalizeDate(e.end_date)
      const d = normalizeDate(day)
      return d >= start && d <= end
    }) ?? null
  )
}

function normalizeDate(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isWeekend(day: Date): boolean {
  const dow = day.getDay()
  return dow === 0 || dow === 6
}

function isHoliday(day: Date): boolean {
  return !!holidays.value[day.toISOString().slice(0, 10)]
}

function getHolidayName(day: Date): string | undefined {
  return holidays.value[day.toISOString().slice(0, 10)]
}

function isToday(day: Date): boolean {
  return normalizeDate(day).getTime() === normalizeDate(new Date()).getTime()
}

function getDayName(day: Date): string {
  return day.toLocaleDateString('de-DE', { weekday: 'short' })
}

function getDayHeaderClass(day: Date): string[] {
  const classes = ['day-header']
  if (isWeekend(day)) classes.push('weekend')
  if (isHoliday(day)) classes.push('holiday')
  if (isToday(day)) classes.push('today')
  return classes
}

function getCellClass(user: User, day: Date, rowIndex: number): string[] {
  const classes = ['calendar-cell']
  if (isWeekend(day)) classes.push('weekend')
  if (isHoliday(day)) classes.push('holiday')
  if (isToday(day)) classes.push('today-col')
  if (rowIndex % 2 === 0) classes.push('row-even')
  return classes
}

function getAbsenceClass(user: User, day: Date): string[] {
  const entry = getAbsenceForDay(user, day)
  if (!entry) return []
  const classes = ['absence-fill', `type-${entry.type.toLowerCase()}`]

  const absences = getAbsences(user)
  const matchEntry = absences.find((e) => {
    const s = normalizeDate(e.start_date)
    const end = normalizeDate(e.end_date)
    const d = normalizeDate(day)
    return d >= s && d <= end
  })

  if (matchEntry) {
    const s = normalizeDate(matchEntry.start_date)
    const e = normalizeDate(matchEntry.end_date)
    const d = normalizeDate(day)
    if (d.getTime() === s.getTime() && d.getTime() === e.getTime()) classes.push('single')
    else if (d.getTime() === s.getTime()) classes.push('start')
    else if (d.getTime() === e.getTime()) classes.push('end')
    else classes.push('middle')
  }

  return classes
}

function getAbsenceStyle(_user: User, _day: Date): Record<string, string> {
  return {}
}

function getAbsenceLabel(user: User, day: Date): string {
  const entry = getAbsenceForDay(user, day)
  if (!entry) return ''
  const labels: Record<any, string> = {
    VACATION: 'Urlaub',
    SICK: 'Krankheit',
    REMOTE: 'Remote',
    BUSINESS_TRIP: 'Dienstreise',
    PARENTAL_LEAVE: 'Elternzeit',
    OTHER: 'Sonstiges',
  }
  return labels[entry.type] ?? entry.type
}

function formatAbsenceDate(entry: TimeEntry | null): string {
  if (!entry) return ''
  const s = entry.start_date.toLocaleDateString('de-DE')
  const e = entry.end_date.toLocaleDateString('de-DE')
  return s === e ? s : `${s} – ${e}`
}

function getInitials(user: User): string {
  return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase()
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function prevMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

function goToToday() {
  currentDate.value = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
}
</script>

<style scoped>
/* ─── Color Tokens ─────────────────────────────────────────────────────────── */
.team-calendar {
  --color-vacation:      #3b82f6;
  --color-sick:          #ef4444;
  --color-parental:      #8b5cf6;
  --color-business:      #f59e0b;
  --color-other:         #6b7280;
  --color-weekend-bg:    hsl(var(--muted) / 0.5);
  --color-holiday-bg:    hsl(var(--muted) / 0.7);
  --color-today-accent:  hsl(var(--primary));
  --employee-col-width:  200px;
  --row-height:          44px;
  --header-height:       40px;
}

/* ─── Layout ───────────────────────────────────────────────────────────────── */
.team-calendar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-family: inherit;
}

.calendar-header {
  border: 1px solid hsl(var(--border));
}

.month-title {
  font-size: 1.15rem;
  font-weight: 600;
  min-width: 180px;
  text-align: center;
}

/* ─── Legend ───────────────────────────────────────────────────────────────── */
.legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}
.legend-label {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
}

/* ─── Calendar wrapper ─────────────────────────────────────────────────────── */
.calendar-wrapper {
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  overflow: hidden;
  background: hsl(var(--card));
}

.calendar-grid-container {
  display: flex;
  overflow: hidden;
}

/* ─── Employee column (sticky left) ───────────────────────────────────────── */
.employee-column {
  flex-shrink: 0;
  width: var(--employee-col-width);
  border-right: 2px solid hsl(var(--border));
  z-index: 10;
  background: hsl(var(--card));
}

.employee-header-spacer {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: hsl(var(--muted-foreground));
  border-bottom: 1px solid hsl(var(--border));
  background: hsl(var(--muted) / 0.3);
}

.employee-row {
  height: var(--row-height);
  display: flex;
  align-items: center;
  border-bottom: 1px solid hsl(var(--border) / 0.5);
}
.employee-row.row-even {
  background: hsl(var(--muted) / 0.2);
  background-color: var(--muted);
}

.employee-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.employee-name {
  font-size: 0.82rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ─── Days scroll area ─────────────────────────────────────────────────────── */
.days-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  border: 2px solid var(--muted);
  border-radius: 1em;
  padding: 4px;
  /* Thin scrollbar */
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
}
.days-scroll-container::-webkit-scrollbar {
  height: 6px;
}
.days-scroll-container::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 999px;
}

/* ─── Days grid ────────────────────────────────────────────────────────────── */
.days-grid {
  display: grid;
  min-width: max-content;
}

/* ─── Day header ───────────────────────────────────────────────────────────── */
.day-header {
  height: var(--header-height);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid hsl(var(--border));
  border-right: 1px solid hsl(var(--border) / 0.4);
  background: hsl(var(--muted) / 0.3);
  grid-row: 1;
  min-width: 36px;
  position: sticky;
  top: 0;
  z-index: 5;
}
.day-header.weekend {
  background: var(--color-weekend-bg);
}
.day-header.holiday {
  background: hsl(var(--muted) / 0.8);
}
.day-header.today {
  background: hsl(var(--primary) / 0.12);
  position: relative;
}
.day-header.today::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-today-accent);
}

.day-number {
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1;
}
.day-name {
  font-size: 0.62rem;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
}

/* ─── Calendar cell ────────────────────────────────────────────────────────── */
.calendar-cell {
  height: var(--row-height);
  border-bottom: 1px solid hsl(var(--border) / 0.4);
  border-right: 1px solid hsl(var(--border) / 0.3);
  position: relative;
  display: flex;
  align-items: center;
  min-width: 36px;
}
.calendar-cell.row-even {
  background: hsl(var(--muted) / 0.15);
}
.calendar-cell.weekend {
  background: var(--color-weekend-bg) !important;
}
.calendar-cell.holiday {
  background: var(--color-holiday-bg) !important;
}
.calendar-cell.today-col {
  background: hsl(var(--primary) / 0.06) !important;
}

/* ─── Holiday label ────────────────────────────────────────────────────────── */
.holiday-cell {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.holiday-label {
  font-size: 0.5rem;
  color: hsl(var(--muted-foreground));
  writing-mode: vertical-rl;
  text-orientation: mixed;
  white-space: nowrap;
  overflow: hidden;
  max-height: 38px;
}

/* ─── Absence blocks ───────────────────────────────────────────────────────── */
.absence-block {
  width: 100%;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: filter 0.15s ease;
}
.absence-block:hover {
  filter: brightness(1.1);
}

/* type colors */
.absence-fill.type-vacation      { background: var(--color-vacation); opacity: 0.85; }
.absence-fill.type-sick_leave    { background: var(--color-sick);     opacity: 0.85; }
.absence-fill.type-parental_leave{ background: var(--color-parental); opacity: 0.85; }
.absence-fill.type-business_trip { background: var(--color-business); opacity: 0.85; }
.absence-fill.type-other         { background: var(--color-other);    opacity: 0.85; }

/* rounded caps for start/end/single */
.absence-fill.single {
  border-radius: 6px;
  margin: 0 4px;
  width: calc(100% - 8px);
}
.absence-fill.start {
  border-radius: 6px 0 0 6px;
  margin-left: 4px;
  width: calc(100% - 4px);
}
.absence-fill.end {
  border-radius: 0 6px 6px 0;
  margin-right: 4px;
  width: calc(100% - 4px);
}
.absence-fill.middle {
  border-radius: 0;
  width: 100%;
}

/* ─── Tooltip ──────────────────────────────────────────────────────────────── */
.tooltip-content {
  padding: 0.1rem 0;
}

/* ─── Empty state ──────────────────────────────────────────────────────────── */
.empty-state {
  padding: 1rem 0;
}
</style>