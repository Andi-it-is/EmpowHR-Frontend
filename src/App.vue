<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import AppLayout from '@/layouts/AppLayout.vue'
import GuestLayout from '@/layouts/GuestLayout.vue'

const route = useRoute()
const userStore = useUserStore()

// Das Layout reagiert jetzt einfach nur noch auf die Route.
// Da der Router-Guard (beforeEach) garantiert, dass die Route erst 
// gewechselt wird, wenn der User-Check fertig ist, gibt es kein Flackern mehr.

const layout = computed(() => {
  // 1. Sicherheits-Check: Wir wissen noch nicht, wer der User ist
  if (userStore.isInitializing) return null

  // 2. Fallback-Logik: 
  // Wenn der User eingeloggt ist, nimm das AppLayout, 
  // außer die Route sagt explizit "GuestLayout"
  const isLoggedIn = !!userStore.user
  
  if (isLoggedIn) {
    return route.meta.layout === 'GuestLayout' ? GuestLayout : AppLayout
  } else {
    return GuestLayout
  }
})
</script>

<template>
  <component :is="layout"/>
</template>