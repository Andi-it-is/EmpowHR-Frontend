<template lang="pug">

div(v-if="!isLoaded" class="flex flex-col gap-4 w-full")
  
  //- Upload Button Skeleton
  Skeleton(class="h-9 w-36 ml-auto bg-muted-foreground/20")
  Separator(class="my-4")

  //- Filter Card Skeleton
  div(class="border rounded-xl p-6 flex flex-col gap-4")
    Skeleton(class="h-5 w-24 bg-muted-foreground/20")
    Skeleton(class="h-3 w-64 bg-muted-foreground/20")
    div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-2")
      Skeleton(class="h-9 w-full bg-muted-foreground/20")
      Skeleton(class="h-9 w-full bg-muted-foreground/20")
      Skeleton(class="h-9 w-full bg-muted-foreground/20")
      Skeleton(class="h-9 w-full bg-muted-foreground/20")
    Separator(class="my-4")
    div(class="flex justify-between")
      Skeleton(class="h-9 w-36 bg-muted-foreground/20")
      div(class="flex gap-2")
        Skeleton(class="h-9 w-48 bg-muted-foreground/20")
        Skeleton(class="h-9 w-28 bg-muted-foreground/20")

  Separator(class="my-4")

  //- PDF Viewer Skeleton
  div(class="flex flex-col gap-3")
    div(class="flex justify-between items-center py-4")
      div(class="flex flex-col gap-2")
        Skeleton(class="h-5 w-48 bg-muted-foreground/20")
        Skeleton(class="h-3 w-32 bg-muted-foreground/20")
      Skeleton(class="h-8 w-8 bg-muted-foreground/20")
    Skeleton(class="h-150 w-full rounded-xl bg-muted-foreground/20")
    
div(v-else)
  h1(tabindex="0") Dokumente
  p(class="text-muted-foreground max-w-175" tabindex="0")
    | Hier findest du alle relevanten Unterlagen zu deinem Beschäftigungsverhältnis. 
    | Greife jederzeit auf deine Verträge Gehaltsdokumente und sonstigen Dokumenten zu.
  
  //- SidebarProvider is responsible for determining spacing based on the sidebar's open/closed state
  //- setting inline styles to a custom sidebar width variable to determine the space the sidebar is pushing
  SidebarProvider(:open="isDocSidebarOpen" @update:open="isDocSidebarOpen = $event" :style="sidebarStyle")
    div(class="flex min-h-svh mb-16 w-full overflow-hidden")
      
      div(class="flex-1 flex flex-col")
        Button(variant="brand-outline" class="ml-auto flex justify-end max-w-50" disabled) Hochladen
          Upload(class="w-4 h-4")

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
                :options="documentTypes"
                v-model="selectedTypes"
              )

            Separator(class="my-4")

            //- Buttons
            div(class="mt-4 flex flex-col sm:grid sm:grid-cols-2 gap-2")
              div(class="flex justify-center sm:justify-start pr-2")
                Button(variant="ghost" class="flex items-center gap-2 text-muted-foreground hover:text-foreground" @click="resetFilter()")
                  X(class="w-4 h-4")
                  | Filter zurücksetzen
              div(class="flex flex-wrap justify-center sm:justify-end pl-2 gap-2")
                Popover(:open="isHovered")
                  PopoverTrigger(as-child)
                    Button(
                      variant="brand-outline"
                      class="flex items-center gap-2 hover:text-foreground text-xs"
                      @mouseenter="isHovered = true"
                      @mouseleave="isHovered = false"
                      @click="searchAll()"
                    )
                      FileSearch2Icon(class="w-4 h-4")
                      | Alle Dokumente durchsuchen
                  PopoverContent(class="w-auto text-sm text-muted-foreground max-w-50 sm:max-w-100" side="bottom")
                    | Ignoriert alle gesetzten Filter und gibt alle dir zustehenden Dokumente zurück.
                Button(variant="brand" class="flex items-center gap-2 px-8" @click="applyFilterAndSearch()")
                  Search(class="w-4 h-4")
                  | Suchen


        Separator(class="my-4")

        div(class="flex flex-col flex-1 min-h-0 mx-1")
          header(class="py-4 flex justify-between items-center")
            div(class="flex flex-col")
              h2(class="text-xl font-bold") {{ activeDocument?.name }}
              p(v-if="availableDocuments.find(d => d.id === activeDocId)?.date" class="text-sm text-muted-foreground") 
                | Hochgeladen am: {{ availableDocuments.find(d => d.id === activeDocId)?.date }}
            
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
        v-model:documents="availableDocuments"
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
import { ShieldIcon, FileSearch2Icon, XIcon, CalendarIcon, Search, RotateCcw, Check, ChevronsUpDown, X, Upload } from 'lucide-vue-next';
import Separator from '@/components/ui/separator/Separator.vue';
import DocumentBrowserSidebar from '@/components/app/document/DocumentBrowserSidebar.vue';
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
import { useWindowSize } from '@vueuse/core'
import { documentService } from '@/services/document.service';
import api from '@/lib/axios';
import { DocumentType, DocumentSecurityLevel, DocumentTypeLabels, DocumentSecurityLevelLabels, DocumentSecurityLevelApiMap } from '@/constants/enums/document.enum'
import { calendarToIsoDate } from '@/lib/calendarToIsoDate';


const { width } = useWindowSize()
const sidebarStyle = computed(() => ({
  '--sidebar-width': width.value >= 1480 ? '25rem' : '16rem'
}))

const router = useRouter()

const activeDocument = computed(() => availableDocuments.value.find((d: any) => d.id === activeDocId.value))
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


const availableDocuments = ref([])

const activeDocId = ref<string | null>(null)

// Computed für die Anzeige im Viewer
const currentPdf = ref<string | null>(null)

watch(activeDocId, async (id) => {
  if (!id) { currentPdf.value = null; return }
  currentPdf.value = await documentService.getDocumentFile(id)
})

const documentTypes = Object.values(DocumentType).map(value => ({
  value,
  label: DocumentTypeLabels[value]
}))

const securityLevels = Object.values(DocumentSecurityLevel).map(value => ({
  value,
  label: DocumentSecurityLevelLabels[value]
}))

const selectedTypes = ref<DocumentType[]>([])
const selectedSecurityLevels = ref<DocumentSecurityLevel[]>([])


function resetFilter() {
  startdate.value = null
  enddate.value = null
  selectedSecurityLevels.value = []
  selectedTypes.value = []
}

async function searchAll() {

  const docs = await documentService.getDocuments()

  availableDocuments.value = docs.map((doc: any) => ({
    id: doc.id,
    name: doc.title,
    date: new Date(doc.created_at).toLocaleDateString('de-DE'),
    url: documentService.getFileUrl(doc.id)
  }))

  toast.success('Suche erfolgreich', {
    description: `${docs.length} Ergebnisse gefunden (Filter wurden ignoriert)`,
  })

  isDocSidebarOpen.value = true
}
async function applyFilterAndSearch() {

  const hasType          = selectedTypes.value.length > 0
  const hasSecurityLevel = selectedSecurityLevels.value.length > 0
  const hasDateFrom      = !!startdate.value
  const hasDateTo        = !!enddate.value
  
  if (!hasDateFrom && !hasDateTo) {
    toast.warning('Zeitraum fehlt', {
      description: 'Bitte setze ein Start- und Enddatum.',
    })
    return
  }

  if (hasDateFrom && !hasDateTo || !hasDateFrom && hasDateTo) {
    toast.warning('Zeitraum unvollständig', {
      description: 'Bitte setze sowohl ein Start- als auch ein Enddatum.',
    })
    return
  }

  if (!hasSecurityLevel) {
    toast.warning('Vertraulichkeit fehlt', {
      description: 'Bitte wähle mindestens eine Vertraulichkeitsstufe aus.',
    })
    return
  }

  if (!hasType) {
    toast.warning('Kategorie fehlt', {
      description: 'Bitte wähle mindestens eine Kategorie aus.',
    })
    return
  }

  const filters = {
    type: selectedTypes.value,
    security_level: selectedSecurityLevels.value.map(s => DocumentSecurityLevelApiMap[s]),
    date_from: calendarToIsoDate(startdate.value)!,
    date_to: calendarToIsoDate(enddate.value)!
  }

  const docs = await documentService.getDocumentsByFilters(filters)

  availableDocuments.value = docs.map((doc: any) => ({
    id: doc.id,
    name: doc.title,
    date: new Date(doc.created_at).toLocaleDateString('de-DE'),
    url: documentService.getFileUrl(doc.id)
  }))

  activeDocId.value = null
  currentPdf.value = null

  toast.success('Suche erfolgreich', {
    description: `${docs.length} Ergebnisse gefunden.`,
  })
  isDocSidebarOpen.value = true
  
}
const startdate = ref()
const enddate = ref()
const isHovered = ref(false)
const isLoaded = ref(false)

onMounted(async () => {
  
  isLoaded.value = true
})

</script>

<style lang="css" scoped>

</style>
