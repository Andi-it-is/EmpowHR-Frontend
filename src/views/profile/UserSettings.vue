<template lang="pug">

pre hello UserSettings.vue
div(class="flex flex-col gap-4 items-start")
  Button(variant="outline" @click="navToPreferences()") Navs to navToPreferences (Obszolete Seite, aber jetzt noch da für POC)
  ThemeToggle

</template>


<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import ThemeToggle from '@/components/app/ThemeToggle.vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()

function navToPreferences() {
  return router.push({ name: 'preferences' })
}

onMounted(() => {

  console.log("mounted the UserSettings.vue file yay")
})

</script>

<style lang="css" scoped>

</style>
