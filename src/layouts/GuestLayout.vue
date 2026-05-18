<script setup lang="ts">
import LoginPage from '@/views/LoginPage.vue'
import FooterComponent from '@/components/app/FooterComponent.vue'
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <div class="flex flex-col min-h-svh">
    <RouterView class="flex-1" />
    <FooterComponent />
    <Toaster rich-colors />
  </div>
</template>