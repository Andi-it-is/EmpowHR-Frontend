<template lang="pug">

h1(tabindex="0") Willkommen bei EmpowHR
p(class="text-muted-foreground max-w-175" tabindex="0") EmpowHR ist deine zentrale Anlaufstelle für alle personalrelevanten Themen.
  |  Alles was dein Arbeitsleben benötigt, an einem Ort.

div(class="flex flex-col gap-8 mt-8")
  div(v-for="group in navigationData" :key="group.title")
    h3(class="mb-4 w-fit" tabindex="0") {{ group.title }}
    div(class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4")
      Card(
        v-for="item in group.items"
        :key="item.title"
        class="cursor-pointer hover:border-primary transition-colors"
        @click="navToGivenPage(item.url)"
        tabindex="0"
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

const router = useRouter();

function navToGivenPage(url: string) {
  return router.push(`${url}`)
}
</script>


<style scoped>

</style>