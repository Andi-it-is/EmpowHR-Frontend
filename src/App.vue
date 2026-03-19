<script setup lang="ts">
import { computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import GuestLayout from '@/layouts/GuestLayout.vue'

/** 
 * TODO placeholder for now, replace with real auth logic later 
 */ 
const isLoggedIn = computed(() => true)

const layout = computed(() => isLoggedIn.value ? AppLayout : GuestLayout)
</script>

<template>
  <component :is="layout" />
</template>