<template lang="pug">

div(class="grid items-center gap-2")
  Label(:for="id" class="ml-1 text-sm font-medium") {{ label }}
  Popover
    PopoverTrigger(as-child)
      Button(:id="id" variant="multiselect" role="combobox" class="w-full justify-between")
        span(v-if="selected.length === 0" class="text-muted-foreground") {{ placeholder ?? label }}
        span(v-else) {{ selected.length }} ausgewählt
        ChevronsUpDown(class="w-4 h-4 ml-2 opacity-50 shrink-0")
    PopoverContent(class="p-0" align="start")
      Command
        CommandList
          CommandGroup
            CommandItem(
              v-for="item in options"
              :key="item.value"
              :value="item.value"
              @select="toggle(item.value)"
              class="hover:bg-muted cursor-pointer"
            )
              Check(class="w-4 h-4 mr-2" :class="selected.includes(item.value) ? 'opacity-100' : 'opacity-0'")
              | {{ item.label }}

</template>

<script setup lang="ts">
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Command, CommandList, CommandGroup, CommandItem } from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Check, ChevronsUpDown } from 'lucide-vue-next'

interface Option {
  value: string
  label: string
}

const props = defineProps<{
  id: string
  label: string
  placeholder?: string
  options: Option[]
}>()

const selected = defineModel<string[]>({ default: [] })

function toggle(value: string) {
  const idx = selected.value.indexOf(value)
  if (idx === -1) {
    selected.value = [...selected.value, value]
  } else {
    selected.value = selected.value.filter(v => v !== value)
  }
}

</script>
