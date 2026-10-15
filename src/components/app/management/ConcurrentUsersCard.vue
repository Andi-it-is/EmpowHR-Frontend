<template lang="pug">

div(class="flex flex-col justify-between gap-4 p-5 h-full")

  //- Header: Live indicator + connection status
  div(class="flex justify-between items-center gap-2 flex-wrap")
    div(class="flex items-center gap-2")
      span(class="relative flex size-2.5")
        span(
          v-if="status === 'connected'"
          class="absolute inline-flex h-full w-full rounded-full bg-positive opacity-75 animate-ping"
        )
        span(class="relative inline-flex size-2.5 rounded-full" :class="statusInfo.dotClass")
      p(class="text-sm text-muted-foreground") Nutzer online
    Badge(variant="outline" class="gap-1.5")
      component(:is="statusInfo.icon" class="size-3.5" :class="statusInfo.iconClass")
      | {{ statusInfo.label }}

  //- Counter X / Y
  div(class="flex items-end justify-between gap-4 flex-wrap")
    div(class="flex items-baseline gap-1.5 flex-wrap")
      //- Noch keine Zahl vom Server: Skeleton statt einer Zahl. Ob die Verbindung steht, zeigt das Badge oben.
      Skeleton(v-if="online === null" class="h-12 w-14")
      h3(v-else class="text-5xl leading-none tabular-nums") {{ online }}
      span(class="text-3xl leading-none text-muted-foreground tabular-nums")
        | /
        Skeleton(v-if="total === null && !loadFailed" class="inline-block h-7 w-16 ml-1.5 align-middle")
        template(v-else)  {{ total ?? '–' }}
      span(class="text-sm text-muted-foreground ml-1") Nutzer
    p(v-if="percentage !== null" class="text-sm text-muted-foreground tabular-nums")
      span(class="font-medium text-foreground") {{ percentage }} %
      |  der Nutzer aktiv

  //- Utilisation bar
  div(
    class="h-2 w-full rounded-full bg-muted overflow-hidden"
    role="progressbar"
    :aria-valuenow="online ?? undefined"
    aria-valuemin="0"
    :aria-valuemax="total ?? undefined"
    aria-label="Anteil der Nutzer online"
  )
    div(
      class="h-full rounded-full bg-positive transition-[width] duration-700 ease-out"
      :style="{ width: `${percentage ?? 0}%` }"
    )

  p(class="text-sm text-muted-foreground")
    | Aktiv in den letzten {{ inactivityMinutes }} Minuten · Echtzeit via WebSocket
    template(v-if="lastUpdated")  · zuletzt aktualisiert {{ lastUpdatedFormatted }}

</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Wifi, WifiOff, Loader2 } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PRESENCE_INACTIVITY_TIMEOUT_MS } from '@/lib/websocket/messages'

const inactivityMinutes = PRESENCE_INACTIVITY_TIMEOUT_MS / 60_000

export type SocketStatus = 'connected' | 'connecting' | 'disconnected'

const props = defineProps<{
  online: number | null     // null = noch keine Zahl vom Server
  total: number | null      // null = noch nicht geladen
  status: SocketStatus
  lastUpdated?: Date | null
  loadFailed?: boolean
}>()

const percentage = computed(() => {
  if (!props.total || props.online === null) return null
  const value = (props.online / props.total) * 100
  return Math.min(100, Math.round(value * 10) / 10)
})

const statusInfo = computed(() => {
  switch (props.status) {
    case 'connected':
      return { label: 'Verbunden', icon: Wifi, iconClass: 'text-positive', dotClass: 'bg-positive' }
    case 'connecting':
      return { label: 'Verbinde…', icon: Loader2, iconClass: 'animate-spin text-muted-foreground', dotClass: 'bg-amber-500' }
    default:
      return { label: 'Getrennt', icon: WifiOff, iconClass: 'text-destructive', dotClass: 'bg-destructive' }
  }
})

const lastUpdatedFormatted = computed(() =>
  props.lastUpdated?.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
)
</script>

<style lang="css" scoped>
</style>
