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

        Card
          CardHeader
            CardTitle Filter
            CardDescription Setze Filter um nach speziellen Dokumenten zu suchen.
          CardContent
            div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4")

              CalendarInput(id="startdate" label="Startdatum" v-model="startdate")
              CalendarInput(id="enddate" label="Enddatum" v-model="enddate")

              MultiSelect(
                id="securitylevel"
                label="Vertraulichkeit"
                :options="securityLevels"
                v-model="selectedSecurityLevels"
              )

              MultiSelect(
                id="kategorie"
                label="Kategorie"
                :options="kategorien"
                v-model="selectedKategorien"
              )

            Separator(class="my-4")

            div(class="sm:grid sm:grid-cols-2 mt-4 flex flex-wrap")
              div(class="flex justify-start pr-2")
                Button(variant="ghost" class="flex items-center gap-2 text-muted-foreground hover:text-foreground" @click="resetFilter()")
                  X(class="w-4 h-4")
                  | Filter zurücksetzen
              div(class="flex flex-wrap justify-end pl-2 gap-2")
                Popover(:open="isHovered")
                  PopoverTrigger(as-child)
                    Button(
                      variant="ghost"
                      class="flex items-center gap-2 text-muted-foreground hover:text-foreground text-xs"
                      @mouseenter="isHovered = true"
                      @mouseleave="isHovered = false"
                      @click="searchAll()"
                    )
                      FileSearch2Icon(class="w-4 h-4")
                      | Alle Dokumente durchsuchen
                  PopoverContent(class="w-auto text-sm text-muted-foreground" side="bottom")
                    | Ignoriert alle gesetzten Filter und gibt alle dir zustehenden Dokumente zurück.
                Button(variant="outline" class="flex items-center gap-2 px-8" @click="applyFilterAndSearch()")
                  Search(class="w-4 h-4")
                  | Suchen

            div(class="flex justify-center mt-2")

        Separator(class="my-4")

        div(class="flex flex-col flex-1 min-h-0 mx-1")
          header(class="py-4 flex justify-between items-center")
            div(class="flex flex-col")
              h2(class="text-xl font-bold") document.title
              p(class="text-sm text-muted-foreground") Hochgeladen am: 02.04.2026
            
            div(class="flex gap-2 items-center")
              p(class="text-sm hidden sm:block") Dokumentenleiste
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
import { ShieldIcon, FileSearch2Icon, XIcon, CalendarIcon, Search, RotateCcw, Check, ChevronsUpDown, X } from 'lucide-vue-next';
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
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card/'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import MultiSelect from '@/components/app/generic/MultiSelect.vue';
import { toast } from 'vue-sonner'
import CalendarInput from '@/components/app/generic/CalendarInput.vue';

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


const kategorien = [
  { value: 'CONTRACT', label: 'Vertrag' },
  { value: 'FINANCE', label: 'Finanzen' },
  { value: 'ABSENCE', label: 'Abwesenheit' },
  { value: 'QUALIFICATION', label: 'Qualifikation' },
  { value: 'COMPLIANCE', label: 'Compliance' },
]
const selectedKategorien = ref<string[]>([])

const securityLevels = [
  { value: '1', label: 'Dienstgebrauch' },
  { value: '2', label: 'Geschäftlich' },
  { value: '3', label: 'Geheim' },
  { value: '4', label: 'Sehr Geheim' },
]
const selectedSecurityLevels = ref<string[]>([])


function resetFilter() {
  startdate.value = null
  enddate.value = null
  selectedSecurityLevels.value = []
  selectedKategorien.value = []
}
// every doc, no filters anymore
function searchAll() {
  toast.success('Suche für alle Elemente getätigt', {
    description: 'Der Text kommt weg.',
  })
  isDocSidebarOpen.value = true
}
function applyFilterAndSearch() {

  toast.success('Suche wurde getätigt', {
    description: 'Der Text kommt weg.',
  })
  isDocSidebarOpen.value = true
  
}
const startdate = ref()
const enddate = ref()
const isHovered = ref(false)

onMounted(() => {

})

</script>

<style lang="css" scoped>

</style>
