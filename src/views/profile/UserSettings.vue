<template lang="pug">

pre hello UserSettings.vue
Button(variant="outline" @click="navToPreferences()") Navs to navToPreferences

</template>


<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
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
