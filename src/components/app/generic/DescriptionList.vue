<template lang="pug">
h4.pt-4 {{ title }}
div(class="flex flex-col gap-4 border p-4 rounded-md lg:w-full")
  template(v-for="(value, key, index) in data" :key="key")
    div(class="flex flex-col sm:flex-row justify-between xl:gap-8 gap-2 text-sm")
      span(class="flex flex-wrap text-muted-foreground xl:min-w-32 lg:min-w-24 md:min-w-16 sm:min-w-2") {{ labels?.[String(key)] ?? formatKey(String(key)) }}
      span(class="font-medium") {{ value || '—' }}
    Separator(v-if="index < Object.keys(data).length - 1")
</template>

<script setup lang="ts">
import { Separator } from '@/components/ui/separator'

const props = defineProps<{
  data: Record<string, string | number | null | undefined>
  labels?: Record<string, string>
  title: string
}>()

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}
</script>