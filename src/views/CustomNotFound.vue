<template lang="pug">
div(class="flex flex-col gap-2 w-fit")
  h1 404
  h2 Seite nicht gefunden
  p Die aufgerufene Seite existiert nicht.
  Button(variant="brand" @click="$router.push('/')") Zurück zur Startseite
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>