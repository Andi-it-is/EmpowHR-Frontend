<template lang="pug">

div(class="impressum-container")
  
  Button(variant="brand-outline" class="bg-primary text-primary w-50" @click="navToIndex()") Zurück
  h3 Impressum
  h4 Privatperson

  p Andreas Ivanov
  p Stahlenhauser Straße 39
  p 40699 Erkrath
  
  h4 Kontaktmöglichkeiten
  p E-mail-Adresse: andreasivanov80@gmail.com

  h4 Weitere Kontaktmöglichkeiten 
  p LinkedIn
    
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import Button from '@/components/ui/button/Button.vue';
import { useRouter } from 'vue-router';

const router = useRouter()

function navToIndex() {
  return router.push("/")
}

onMounted(() => {
  
})
</script>

<style scoped>
h3 {
  font-weight: 700;
  font-size: 2rem;
  line-height: 2rem;
  letter-spacing: normal;
}
h4 {
  font-weight: 700;
  font-size: 1.55rem;
  line-height: 1.5rem;
  letter-spacing: normal;
}
p {
  font-size: 16px;
}
.impressum-container{
  display: flex;
  flex-direction: column;
  gap: 1em;
  max-width: 1000px;
  padding: 4rem;
}
.a11y:focus-visible {
  outline: 2px solid var(--secondary);
  outline-offset: 0.5rem;
  border-radius: 0.5rem;
}
</style>
