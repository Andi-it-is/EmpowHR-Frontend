<template lang="pug">

h1(tabindex="0") Zeitverwaltung
p(class="text-muted-foreground max-w-175" tabindex="0") Finde hier alle Informationen rund um Arbeitszeiten und Abwesenheiten. 
  | Formulare, Einträge, Übersichten und Statistiken rund um Arbeiten, Dienstreisen und Remote Work.

div(class="flex flex-col gap-8 mt-8")
  div(v-for="group in limitedNavOptions" :key="group.title")
    h3(class="mb-4") {{ group.title }}
    div(class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4")
      Card(
        v-for="item in group.items"
        :key="item.title"
        class="cursor-pointer hover:border-primary transition-colors"
        @click="router.push(item.url)"
      )
        CardContent(class="flex flex-col items-center justify-center gap-3 pt-6 pb-6 text-center")
          div(:class="[getColorClasses(item.color), 'p-3 rounded-lg']")
            component(:is="item.icon" :size="22")
          span(class="text-md font-medium") {{ item.title }}
          span(class="text-sm text-muted-foreground") {{ item.description }}


</template>

<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import ThemeToggle from '@/components/app/ThemeToggle.vue';
import { ArrowUpIcon } from 'lucide-vue-next'
import { useRouter } from 'vue-router';
import {
  FileText, Database, Award, GitFork, Users,
  CalendarDays, Armchair, UmbrellaOff, Clock, Home,
  CalendarCheck, Ellipsis, UserRound, Building2, Timer, ShieldCheck
} from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { getColorClasses, navigationData } from '@/constants/navigation';
import { computed } from 'vue';

const router = useRouter();

const limitedNavOptions = computed(() => {
  return navigationData.filter(entry => entry.title === 'Zeitverwaltung')
})
</script>


<style scoped>

</style>