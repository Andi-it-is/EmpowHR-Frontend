<template lang="pug">

div(class="flex flex-col gap-6")
  div
    h2 Einstellungen
    p(class="text-muted-foreground") Passe deine persönlichen Präferenzen an.

  Card
    CardHeader
      CardTitle Erscheinungsbild
      CardDescription Passe das Aussehen der Anwendung an.
    CardContent(class="flex flex-col gap-4")
      div(class="flex items-center justify-between flex-wrap gap-2")
        div
          p(class="text-sm font-medium") Farbschema
          p(class="text-xs text-muted-foreground") Wechsle zwischen hellem und dunklem Modus.
        ThemeToggle

  Card
    CardHeader
      CardTitle Sprache
      CardDescription Wähle deine bevorzugte Sprache.
    CardContent
      div(class="flex items-center justify-between flex-wrap gap-2")
        div
          p(class="text-sm font-medium") Anzeigesprache
          p(class="text-xs text-muted-foreground") Sprache der Benutzeroberfläche.
        Select(default-value="de")
          SelectTrigger(class="w-40")
            SelectValue
          SelectContent
            SelectItem(value="de") Deutsch
            SelectItem(value="en") English

  Card
    CardHeader
      CardTitle Benachrichtigungen
      CardDescription Verwalte deine Benachrichtigungseinstellungen.
    CardContent(class="flex flex-col gap-4")
      div(class="flex items-center justify-between")
        div
          p(class="text-sm font-medium") E-Mail Benachrichtigungen
          p(class="text-xs text-muted-foreground") Erhalte Updates per E-Mail.
        Switch
      div(class="flex items-center justify-between")
        div
          p(class="text-sm font-medium") Push Benachrichtigungen
          p(class="text-xs text-muted-foreground") Benachrichtigungen im Browser.
        Switch

</template>


<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import { Switch } from '@/components/ui/switch'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import ThemeToggle from '@/components/app/ThemeToggle.vue'
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
