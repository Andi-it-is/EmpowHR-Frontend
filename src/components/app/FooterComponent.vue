<script setup lang="ts">
import { Separator } from '@/components/ui/separator'

interface Props {
  impressumHref?: string
  datenschutzHref?: string
}

withDefaults(defineProps<Props>(), {
  impressumHref: '/impressum',
  datenschutzHref: '/datenschutz',
})
</script>

<template lang="pug">
footer.mt-auto
  Separator
  .flex.items-center.justify-between.px-10.py-5.mx-auto.flex-wrap
    span.text-sm.text-muted-foreground {{ new Date().getFullYear() }} | EmpowHR
    nav.flex.items-center.gap-4
      a.text-sm.text-muted-foreground.hover_text-foreground.transition-colors(
        :href="impressumHref"
      ) Impressum
      Separator(orientation="vertical" class="h-4")
      a.text-sm.text-muted-foreground.hover_text-foreground.transition-colors(
        :href="datenschutzHref"
      ) Datenschutz
</template>