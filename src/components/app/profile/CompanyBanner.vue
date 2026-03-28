<template lang="pug">

Card()
  CardContent(class="flex flex-col items-center gap-3 p-8 text-center")
    Avatar(class="size-20")
      AvatarImage(:src="user.avatar" :alt="user.fullName")
      AvatarFallback(class="text-xl font-semibold") {{ initials(user.fullName) }}
    div
      p(class="font-semibold text-base") {{ user.fullName }}
      p(class="text-sm text-muted-foreground") {{ user.position }}
      p(class="text-sm text-muted-foreground") {{ user.department }}
    Badge(:class="statusClass(user.status)") {{ statusLabel(user.status) }}
    Separator
    div(class="w-full flex flex-col gap-2 text-sm")
      div(class="flex items-center gap-2 text-muted-foreground")
        Mail(:size="14" class="shrink-0")
        span(class="truncate") {{ user.email }}
      div(class="flex items-center gap-2 text-muted-foreground")
        MapPin(:size="14" class="shrink-0")
        span {{ user.location }}
      div(class="flex items-center gap-2 text-muted-foreground")
        CalendarDays(:size="14" class="shrink-0")
        span Seit {{ formatDate(user.startDate) }}

</template>


<script setup lang="ts">
import { Mail, MapPin, CalendarDays, History } from 'lucide-vue-next'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
 import {
  Card, CardContent
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