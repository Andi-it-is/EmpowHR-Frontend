<template lang="pug">
div.not-found
  h1 404
  h2 Seite nicht gefunden
  p Die aufgerufene Seite existiert nicht.
  Button(@click="$router.push('/')") Zurück zur Startseite
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>