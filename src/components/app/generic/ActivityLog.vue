<template lang="pug">
Card
  CardHeader(class="flex flex-row items-center gap-2 py-4 border-0 border-b border-muted")
    History(:size="15")
    CardTitle(class="text-sm font-semibold") {{ title }}
  CardContent(class="p-0")
    div(class="divide-y divide-border")
      div(
        v-for="entry in data"
        :key="entry.id"
        class="px-4 py-3 flex flex-col gap-1"
      )
        div(class="flex items-center justify-between gap-2")
          div(class="flex items-center gap-1.5 text-xs text-muted-foreground")
            Clock(:size="11")
            span {{ formatDateTime(entry.created_at) }}
          div(class="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground")
            UserRound(:size="11")
            span {{ entry.changed_by.first_name }} {{ entry.changed_by.last_name }}
        div(
          v-for="(value, key) in entry.new_value"
          :key="key"
          class="flex items-center gap-1.5 text-sm"
        )
          span(class="text-md text-muted-foreground px-1 rounded") {{ labels?.[key] ?? key }}
          code(class="text-muted-foreground font-mono bg-muted px-1 rounded") {{ maskValue(key, entry.old_value?.[key]) }}
          ArrowRight(:size="11" class="text-muted-foreground shrink-0")
          code(class="font-mono bg-muted px-1 rounded") {{ maskValue(key, value) }}
      div(v-if="!data || data.length === 0" class="px-4 py-6 text-center text-sm text-muted-foreground")
        | Noch keine Änderungen
</template>

<script setup lang="ts">
import { History, ArrowRight, Clock, UserRound } from 'lucide-vue-next'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'

interface ChangedBy {
  id: string
  first_name: string
  last_name: string
}

interface ChangeLogEntry {
  id: string
  entity_table_name: string
  entity_id: string
  action: string
  old_value: Record<string, any> | null
  new_value: Record<string, any> | null
  changed_by: ChangedBy
  created_at: string
}

const props = defineProps<{
  title: string
  data: ChangeLogEntry[]
  labels?: Record<string, string>
  sensitiveFields?: string[]
}>()

function maskValue(key: string, value: any): string {
  if (props.sensitiveFields?.includes(key)) return '••••••••'
  return value ?? '—'
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>