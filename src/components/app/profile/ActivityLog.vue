<template lang="pug">
Card
  CardHeader(class="flex flex-row items-center gap-2 py-4 border border-b border-muted")
    History(:size="15")
    CardTitle(class="text-sm font-semibold") Letzte Änderungen
  CardContent(class="p-0")
    div(class="divide-y divide-border")
      div(
        v-for="entry in activityLog"
        :key="entry.id"
        class="px-4 py-3 flex flex-col gap-0.5"
      )
        div(class="flex items-center justify-between gap-2")
          span(class="text-sm font-medium") {{ entry.field }}
          span(class="text-xs text-muted-foreground shrink-0") {{ timeAgo(entry.changedAt) }}
        span(class="text-xs text-muted-foreground") {{ entry.changedBy }}
      div(v-if="activityLog.length === 0" class="px-4 py-6 text-center text-sm text-muted-foreground")
        | Noch keine Änderungen
</template>


<script setup lang="ts">
import { Mail, MapPin, CalendarDays, History } from 'lucide-vue-next'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
 import {
  Card, CardTitle, CardHeader, CardContent
} from '@/components/ui/card'
 
interface User {
  fullName: string
  position: string
  department: string
  email: string
  location: string
  startDate: string
  status: 'active' | 'inactive' | 'parental_leave'
  avatar?: string
}
 
interface ActivityEntry {
  id: number
  field: string
  changedBy: string
  changedAt: string
}
 
defineProps<{
  user: User
  activityLog: ActivityEntry[]
}>()
 
function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function statusLabel(s: string) {
  return { active: 'Aktiv', inactive: 'Inaktiv', parental_leave: 'Elternzeit' }[s] ?? s
}
function statusClass(s: string) {
  return { active: 'badge-active', inactive: 'badge-inactive', parental_leave: 'badge-parental' }[s] ?? ''
}
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Heute'
  if (days === 1) return 'Gestern'
  if (days < 7) return `vor ${days} Tagen`
  if (days < 30) return `vor ${Math.floor(days / 7)} Wo.`
  return `vor ${Math.floor(days / 30)} Mon.`
}
</script>
 
<style scoped>
:deep(.badge-active)  { background: #dcfce7; color: #16a34a; border-color: #bbf7d0; }
:deep(.badge-inactive) { background: #fee2e2; color: #dc2626; border-color: #fecaca; }
:deep(.badge-parental) { background: #fef9c3; color: #ca8a04; border-color: #fef08a; }
</style>