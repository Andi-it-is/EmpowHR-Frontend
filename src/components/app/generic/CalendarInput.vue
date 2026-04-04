<template lang="pug">

div(class="grid items-center gap-2")
  Label(:for="id" class="ml-1 text-sm font-medium") {{ label }}
  div(
    class="flex h-9 w-full items-center rounded-md border border-input bg-transparent px-3 shadow-sm text-sm dark:bg-input/30"
    tabindex="0"
    ref="triggerRef"
    @keydown.enter="isOpen = true"
    @keydown.space="isOpen = true"
  )    
    Popover(v-model:open="isOpen")
      PopoverTrigger(as-child)
        div(class="flex items-center gap-2 flex-1 cursor-pointer hover:text-accent-foreground" @click="isOpen = true")
          CalendarIcon(class="w-4 h-4 opacity-50 shrink-0")
          span(:class="!date ? 'text-muted-foreground' : ''")
            | {{ date ? df.format(date.toDate(getLocalTimeZone())) : (placeholder ?? label) }}
      PopoverContent(class="w-auto p-0" align="center" @keydown.esc="isOpen = false")
        Calendar(v-model="date" locale="de" initial-focus)
    div(class="w-4 shrink-0")
      X(
        v-if="date"
        class="w-4 h-4 opacity-50 cursor-pointer hover:opacity-100"
        @click.stop="date = undefined"
      )

</template>

<script setup lang="ts">
import { DateFormatter, getLocalTimeZone } from '@internationalized/date'
import Button from '@/components/ui/button/Button.vue'
import { Calendar as CalendarIcon, X } from 'lucide-vue-next'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{
  id: string
  label: string
  placeholder?: string
}>()

const triggerRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

watch(isOpen, (val) => {
  if (!val) {
    nextTick(() => triggerRef.value?.focus())
  }
})

const date = defineModel<any>()

const df = new DateFormatter('de-DE', { dateStyle: 'medium' })

</script>
