<template>
  <div class="content-wrapper">
    
    <div class="flex flex-wrap items-center gap-2 md:flex-row">
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
import ThemeToggle from '@/components/ThemeToggle.vue';
import { ArrowUpIcon } from 'lucide-vue-next'


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