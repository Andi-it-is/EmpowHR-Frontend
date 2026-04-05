<script setup lang="ts">
import LoginPage from '@/views/LoginPage.vue'
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <LoginPage />
  <Toaster rich-colors />
</template>