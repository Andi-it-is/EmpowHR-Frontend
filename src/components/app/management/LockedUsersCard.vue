<template lang="pug">

div(class="flex flex-col justify-between gap-4 p-5 h-full")

  //- Header
  div(class="flex justify-between items-center gap-2 flex-wrap")
    div(class="flex items-center gap-2")
      Lock(class="size-4 text-muted-foreground")
      p(class="text-sm text-muted-foreground") Gesperrte Nutzer
    Badge(v-if="locked !== null" :variant="locked > 0 ? 'destructive' : 'positive'")
      | {{ locked > 0 ? 'Prüfen' : 'Keine Sperren' }}

  //- Counter X / Y
  div(class="flex items-end justify-between gap-4 flex-wrap")
    div(class="flex items-baseline gap-1.5 flex-wrap")
      Skeleton(v-if="isLoading" class="h-12 w-28")
      template(v-else)
        h3(class="text-5xl leading-none tabular-nums") {{ locked ?? '–' }}
        span(class="text-3xl leading-none text-muted-foreground tabular-nums") / {{ total ?? '–' }}
        span(class="text-sm text-muted-foreground ml-1") Nutzer
    p(v-if="percentage !== null" class="text-sm text-muted-foreground tabular-nums")
      span(class="font-medium text-foreground") {{ percentage }} %
      |  aller Konten

  //- Share bar
  div(
    class="h-2 w-full rounded-full bg-muted overflow-hidden"
    role="progressbar"
    :aria-valuenow="locked ?? 0"
    aria-valuemin="0"
    :aria-valuemax="total ?? undefined"
    aria-label="Anteil gesperrter Nutzer"
  )
    div(
      class="h-full rounded-full bg-destructive transition-[width] duration-700 ease-out"
      :style="{ width: `${percentage ?? 0}%` }"
    )

  p(class="text-sm text-muted-foreground") Durch Admin gesperrt oder nach zu vielen Fehlversuchen

</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Lock } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const props = defineProps<{
  locked: number | null     // null = noch nicht geladen
  total: number | null
  loadFailed?: boolean
}>()

const isLoading = computed(() => props.total === null && !props.loadFailed)

const percentage = computed(() => {
  if (!props.total || props.locked === null) return null
  return Math.round((props.locked / props.total) * 1000) / 10
})
</script>

<style lang="css" scoped>
</style>
