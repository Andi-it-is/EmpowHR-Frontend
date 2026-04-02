<template lang="pug">

  //- SidebarProvider is responsible for determining spacing based on the sidebar's open/closed state
  //- setting inline styled a custom sidebar width variable to determine the space the sidebar is pushing
  SidebarProvider(:open="isDocSidebarOpen" @update:open="isDocSidebarOpen = $event" style="--sidebar-width: 25rem;")
    div(class="flex min-h-svh mb-16 w-full overflow-hidden")
      
      //- 2. Main Content Bereich (scrollbar)
      main(class="flex-1 flex flex-col p-4 md:p-8")
        
        //- OBERER TEIL: Jetzt reagiert das Grid auf die Sidebar
        div(class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8")
          div(v-for="i in 10")
            Item(variant="outline")
              ItemMedia(variant="icon")
              ItemContent
                ItemTitle Mein Titel {{ i }}
                ItemDescription Meine Beschreibung
              ItemActions
                Button(size="sm" variant="outline") Aktion

        Separator(class="my-4")

        //- UNTERER TEIL: PDF Bereich
        div(class="flex flex-col flex-1 min-h-0")
          header(class="py-4 flex justify-between items-center")
            div(class="flex flex-col")
              h1(class="text-xl font-bold") document.title
              p(class="text-sm text-muted-foreground") Hochgeladen am: 02.04.2026
            
            div(class="flex gap-2 items-center")
              p(class="text-sm hidden sm:block") Dokument auswählen
              SidebarTrigger(side="right")

          //- PDF-Container
          div(class="border-2 border-dotted border-muted rounded-xl bg-muted/30 p-4 justify-center shadow-lg flex flex-1 min-h-250")
            iframe(
              :src="pdfFileUrl" 
              class="w-full max-w-5xl h-full min-h-250 border-none rounded-md"
              title="PDF Viewer"
            )

      //- 3. Die Sidebar (bleibt rechts und reserviert Platz)
      DocumentBrowserSidebar(side="right")

</template>


<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar"
import {
  Item,
  ItemMedia,
  ItemActions,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from '@/components/ui/item/';
import { ShieldIcon } from 'lucide-vue-next';
import Separator from '@/components/ui/separator/Separator.vue';
import DocumentBrowserSidebar from '@/components/app/profile/DocumentBrowserSidebar.vue';


const router = useRouter()

const pdfFileUrl = ref('/Beispiel-Lohnabrechnung.pdf')


// 1. Custom Ref für den Status (Standardmäßig offen: true)
const isDocSidebarOpen = ref(true)
const STORAGE_KEY = 'document-browser-state'

onMounted(() => {
  // 2. Beim Laden aus dem LocalStorage lesen
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved !== null) {
    isDocSidebarOpen.value = saved === 'true'
  }
})

// 3. Manuelles Speichern bei Änderung (für Persistenz beim Reload)
watch(isDocSidebarOpen, (newVal) => {
  localStorage.setItem(STORAGE_KEY, String(newVal))
})

// Funktion für den Trigger (falls du keinen Standard-Trigger nutzt)
const toggleDocSidebar = () => {
  isDocSidebarOpen.value = !isDocSidebarOpen.value
}


onMounted(() => {

})

</script>

<style lang="css" scoped>

</style>
