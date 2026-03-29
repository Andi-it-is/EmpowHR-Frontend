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

import LoginForm from "@/components/app/LoginForm.vue"
import Separator from '@/components/ui/separator/Separator.vue';
</script>

<template>
  <div class="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    <div class="flex w-full max-w-sm flex-col gap-6">
      <div class="flex items-center gap-4 self-center p-4 bg-sidebar-primary rounded-xl ">
        <div class="flex items-center justify-center size-14 rounded-xl text-primary-foreground">
          <IdCardLanyard :size="64" color="white" />
        </div>
        <div class="flex flex-col">
          <h2>EmpowHR</h2>
          <h3 class="text-muted-foreground">Mein Unternehmen GmbH</h3>
        </div>
      </div>
      <Separator />
      <LoginForm />
    </div>
  </div>
</template>
