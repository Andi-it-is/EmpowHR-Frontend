<script setup lang="ts">
import { computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import GuestLayout from '@/layouts/GuestLayout.vue'
import { useRoute } from 'vue-router'

/** 
 * TODO placeholder for now, replace with real auth logic later 
 */ 
const isLoggedIn = computed(() => true)

// const layout = computed(() => isLoggedIn.value ? AppLayout : GuestLayout)
const route = useRoute()
const layout = computed(() => {
  return route.meta.layout === 'GuestLayout' ? GuestLayout : AppLayout
})
</script>

<template>
  <component :is="layout" />
</template>