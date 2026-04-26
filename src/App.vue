<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import AppLayout from '@/layouts/AppLayout.vue'
import GuestLayout from '@/layouts/GuestLayout.vue'


// const route = useRoute()
// const userStore = useUserStore()

// Das Layout reagiert jetzt einfach nur noch auf die Route.
// Da der Router-Guard (beforeEach) garantiert, dass die Route erst 
// gewechselt wird, wenn der User-Check fertig ist, gibt es kein Flackern mehr.

</script>

<template>
  <AppLayout />
</template>