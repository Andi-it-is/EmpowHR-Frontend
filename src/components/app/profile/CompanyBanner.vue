<template lang="pug">
Card
  CardContent(class="flex flex-col items-center gap-3 p-8 text-center")
    Avatar(class="size-20")
      AvatarImage(:alt="data.fullname")
      AvatarFallback(class="text-xl font-semibold") {{ initials(data.fullname) }}
    div
      p(class="font-semibold text-base") {{ data.fullname }}
      p(class="text-sm text-muted-foreground") {{ data.job_title }}
    Badge(:class="data.disabled ? 'badge-inactive' : 'badge-active'") {{ data.disabled ? 'Inaktiv' : 'Aktiv' }}
    Separator
    div(class="w-full flex flex-col gap-2 text-sm")
      div(class="flex items-center gap-2 text-muted-foreground")
        Mail(:size="14" class="shrink-0")
        span(class="truncate") {{ data.email }}
      div(class="flex items-center gap-2 text-muted-foreground")
        MapPin(:size="14" class="shrink-0")
        span {{ data.city }}
      div(class="flex items-center gap-2 text-muted-foreground")
        CalendarDays(:size="14" class="shrink-0")
        span Seit {{ formatDate(data.started_working_date) }} im Unternehmen
</template>

<script setup lang="ts">
import { Mail, MapPin, CalendarDays } from 'lucide-vue-next'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'

interface UserOther {
  fullname: string
  job_title: string
  disabled: boolean
  email: string
  city: string
  started_working_date: string
}

defineProps<{
  data: UserOther
}>()

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
</script>

<style scoped>
:deep(.badge-active)   { background: #dcfce7; color: #05461d; border-color: #bbf7d0; }
:deep(.badge-inactive) { background: #fee2e2; color: #630808; border-color: #fecaca; }
</style>