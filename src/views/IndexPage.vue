<template>
  <div class="content-wrapper">
    
    <pre>
      relevant ist die Seite Für Mich > Stammdaten. Und Profilsektion > Einstellungen
    </pre>
      <Button variant="outline" @click="navToLogin()"> Zur Login Seite </Button>
    <div class="flex flex-wrap items-center gap-2 mt-16 md:flex-row">
      <ThemeToggle/>
      <Button variant="default">
        Button
      </Button>
      <Button class="outline">
        Button
      </Button>
      <Button variant="destructive">
        Button
      </Button>
      <Button variant="positive">
        Button
      </Button>
      <Button variant="outline" size="icon" aria-label="Submit">
        <ArrowUpIcon />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import ThemeToggle from '@/components/app/ThemeToggle.vue';
import { ArrowUpIcon } from 'lucide-vue-next'
import { useRouter } from 'vue-router';

const router = useRouter();

function navToLogin() {
  return router.push("/login")  
}
</script>


<style scoped>

.content-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 4em;
}

</style>