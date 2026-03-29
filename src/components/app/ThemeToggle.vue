<template lang="pug">
div(class="flex rounded-md border border-border overflow-hidden")
  Button(
    v-for="option in options"
    :key="option.value"
    variant="ghost"
    class="flex-1 gap-2 rounded-none border-r last:border-r-0 border-border"
    :class="{ 'bg-muted': stored === option.value }"
    @click="setMode(option.value)"
  )
    component(:is="option.icon" :size="16")
    span(class="text-sm") {{ option.label }}
</template>

<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { useColorMode } from '@vueuse/core'
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

type ColorMode = 'light' | 'dark' | 'auto'

const mode = useColorMode()
const stored = useStorage('vueuse-color-scheme', 'auto')

const options = [
  { value: 'light', label: 'Hell', icon: Sun },
  { value: 'dark', label: 'Dunkel', icon: Moon },
  { value: 'auto', label: 'System', icon: Monitor },
] satisfies { value: ColorMode, label: string, icon: any }[]

function setMode(value: ColorMode) {
  stored.value = value
  mode.value = value
}
</script>