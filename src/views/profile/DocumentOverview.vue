<template lang="pug">

  h1 Dokumente
  p(class="text-muted-foreground max-w-200")
    | Hier findest du alle relevanten Unterlagen zu deinem Beschäftigungsverhältnis. 
    | Greife jederzeit auf deine Verträge Gehaltsdokumente und sonstigen Dokumenten zu.
  
  //- SidebarProvider is responsible for determining spacing based on the sidebar's open/closed state
  //- setting inline styles to a custom sidebar width variable to determine the space the sidebar is pushing
  SidebarProvider(:open="isDocSidebarOpen" @update:open="isDocSidebarOpen = $event" style="--sidebar-width: 25rem;")
    div(class="flex min-h-svh mb-16 w-full overflow-hidden")
      
      div(class="flex-1 flex flex-col")

        Separator(class="my-4")

        h3 Filter
        p(class="text-muted-foreground max-w-200") Setze Filter um nach speziellen Dokumenten zu suchen.
        //- Container mit Hintergrund und Padding für einen "Bar"-Look
        div(class="flex flex-wrap justify-center gap-4 p-4 bg-muted/30 rounded-xl border mb-8 shadow-sm w-fit mt-2")
          
          //- Gruppe: Datums-Zeitraum 
          div(class="flex items-center gap-4 bg-background border rounded-lg px-3 py-1 focus-within:ring-2 focus-within:ring-primary/20 transition-all")
            CalendarIcon(class="w-4 h-4 text-muted-foreground")
            Input(
              type="text" 
              placeholder="Startdatum" 
              class="w-24 bg-transparent border-none text-sm focus:outline-none placeholder:text-muted-foreground/60"
            )
            Input(
              type="text" 
              placeholder="Enddatum" 
              class="w-24 bg-transparent border-none text-sm focus:outline-none placeholder:text-muted-foreground/60"
            )
            CalendarIcon(class="w-4 h-4 text-muted-foreground")

          //- Trenner (optional, nur für Desktop)
          div(class="hidden md:block w-px h-6 bg-border mx-2")

          //- Der Select-Filter
          Select
            SelectTrigger(class="w-50 bg-background focus:ring-2 focus:ring-primary/20")
              div(class="flex items-center gap-2")
                FilterIcon(class="w-4 h-4 text-muted-foreground")
                SelectValue(placeholder='Dokumententyp')
            SelectContent
              SelectItem(value='all') Alle Dokumente
              SelectItem(value='contract') Verträge
              SelectItem(value='salary') Gehaltsabrechnungen
              SelectItem(value='cert') Zertifikate

          //- Reset Button (Immer gut für die UX)
          Button(variant="ghost" size="sm" class="text-muted-foreground hover:text-foreground")
            XIcon(class="w-4 h-4 mr-2")
            | Filter zurücksetzen


        Separator(class="my-4")

        div(class="flex flex-col flex-1 min-h-0 mx-1")
          header(class="py-4 flex justify-between items-center")
            div(class="flex flex-col")
              h2(class="text-xl font-bold") document.title
              p(class="text-sm text-muted-foreground") Hochgeladen am: 02.04.2026
            
            div(class="flex gap-2 items-center")
              p(class="text-sm hidden sm:block") Dokument auswählen
              SidebarTrigger(side="right")

          //- PDF-Container
          div(class="border-2 border-dotted border-muted rounded-xl bg-muted/30 p-4 justify-center shadow-lg flex flex-1 min-h-150")
            iframe(
              v-if="currentPdf"
              :src="currentPdf" 
              class="w-full max-w-5xl h-full min-h-250 border-none rounded-md"
              title="PDF Viewer"
            )
            div(v-else class="flex flex-col items-center justify-center w-full max-w-md mx-auto text-center gap-6")
              
              div(class="relative p-6 bg-muted/30 rounded-full border-2 border-dashed border-muted-foreground/20")
                FileSearch2Icon(class="w-16 h-16 text-muted-foreground/40")
                div(class="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 shadow-sm")
                  PlusIcon(class="w-4 h-4")

              div(class="space-y-2")
                h3(class="text-xl font-semibold tracking-tight text-foreground") 
                  | Kein Dokument ausgewählt
                p(class="text-muted-foreground text-sm") 
                  | Bitte wähle ein Dokument aus der rechten Seitenleiste aus, um das Dokument zu sehen.

      //- 3. Die Sidebar (bleibt rechts und reserviert Platz)
      DocumentBrowserSidebar(
        side="right"
        v-model:documents="myFiles"
        v-model:selectedId="activeDocId"
      )

</template>


<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import { onMounted, ref, watch, computed } from 'vue';
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
import { ShieldIcon, FileSearch2Icon,XIcon, CalendarIcon } from 'lucide-vue-next';
import Separator from '@/components/ui/separator/Separator.vue';
import DocumentBrowserSidebar from '@/components/app/profile/DocumentBrowserSidebar.vue';
import Input from '@/components/ui/input/Input.vue';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
const router = useRouter()

const pdfFileUrl = ref('/Beispiel-Lohnabrechnung.pdf')
const selectedDocument = ref(null)

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

// Dein zentraler State
const myFiles = ref([
  { id: '1', name: 'Dokumenterino.pdf', date: '01.01.2024', url: '/Beispiel-Lohnabrechnung.pdf' },
  { id: '2', name: 'Files.pdf', date: '15.02.2024', url: '/Beispiel-Lohnsteuerbescheinigung.pdf' }
])

const activeDocId = ref<string | null>(null)

// Computed für die Anzeige im Viewer
const currentPdf = computed(() => {

  const doc = myFiles.value.find(f => f.id === activeDocId.value)
  return doc ? doc.url : null
})

onMounted(() => {

})

</script>

<style lang="css" scoped>

</style>
