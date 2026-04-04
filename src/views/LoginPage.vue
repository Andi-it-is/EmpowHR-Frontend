<script lang="ts">
export const description = "A login page with a muted background color."
</script>

<script setup lang="ts">
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from '@/components/ui/item'
import { IdCardLanyard } from 'lucide-vue-next'
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from '@/components/ui/card'

import LoginForm from "@/components/app/LoginForm.vue"
import Separator from '@/components/ui/separator/Separator.vue';
import ThemeToggle from '@/components/app/ThemeToggle.vue';
</script>

<template>
  <div class="bg-muted flex min-h-svh items-center justify-center p-4 md:p-10">
    <div class="flex w-full max-w-5xl justify-center">

      <div class="flex flex-col-reverse md:flex-row items-start justify-center gap-2 md:gap-10 w-full">

        <LoginForm class="w-full max-w-md" />

        <div class="flex flex-col gap-2 md:gap-6 w-full max-w-md">
          
          <div class="flex items-center gap-2 p-4 bg-sidebar-primary rounded-xl shadow-lg">
            <div class="flex items-center justify-center size-14 rounded-xl">
              <IdCardLanyard :size="64" color="white" />
            </div>
            <div class="flex flex-col">
              <h2 class="text-white font-bold text-xl">EmpowHR</h2>
              <h3 class="text-gray-300">Mein Unternehmen GmbH</h3>
            </div>
          </div>

          <Card class="p-8 shadow-sm">
            <CardHeader class="p-0 font-semibold text-lg">
              Farbschema
            </CardHeader>
            <CardDescription>
              Wechsle zwischen hellem und dunklem Modus.
            </CardDescription>
            <ThemeToggle class="mt-4 w-full"/> 
          </Card>
        </div>

      </div>
    </div>
  </div>
</template>
