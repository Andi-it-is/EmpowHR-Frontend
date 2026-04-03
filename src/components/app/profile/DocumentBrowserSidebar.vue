<template>
  <Sidebar side="right" class="border-l h-full">
    <SidebarHeader>
      <SidebarMenu>

        <SidebarMenuItem class="py-4 px-2">
          <h3> 25 Dokumente </h3>
          <p class="text-muted-foreground"> Im Jahr 2026 </p>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent class="p-0">
      <ScrollArea class="h-full w-full">
        <div class="py-4 px-2 space-y-2">
          <Button variant="outline" @click="nullifySelectedDoc()"> Auswahl leeren </Button>
          <div v-for="doc in documents" :key="doc.id">
            <Item 
              @click="selectDoc(doc.id)"
              class="cursor-pointer mb-2 transition-all duration-200 border-2"
              :class="[
                selectedId === doc.id 
                  ? 'bg-accent border-primary shadow-sm' 
                  : 'bg-muted border-transparent hover:bg-accent/50 hover:border-muted-foreground/20'
              ]"
            >
              <ItemMedia variant="icon">
                <FileIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle> Mein ultra cooles und super langes Dokument {{ doc.id }} {{ doc.name }} </ItemTitle>
                <ItemDescription> Hochgeladen am: {{ doc.date }}</ItemDescription>
              </ItemContent>
            </Item>
          </div>
        </div>
      </ScrollArea>
    </SidebarContent>
    <SidebarFooter />
    <SidebarRail />
  </Sidebar>
</template>

<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  FileText, 
  FileStack, 
  Plus, 
  Calendar,
  FileSearch,
  ShieldAlertIcon,
  FileTextIcon,
  FileIcon
} from 'lucide-vue-next'
import {
  Item,
  ItemMedia,
  ItemActions,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from '@/components/ui/item/';
import { GalleryVerticalEnd, GalleryVertical } from "lucide-vue-next";
import { ref, onMounted, watch } from 'vue'
import Button from "@/components/ui/button/Button.vue";

// 1. Custom Ref für den Status (Standardmäßig offen: true)
const isDocSidebarOpen = ref(true)
const STORAGE_KEY = 'document-browser-state'

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved !== null) {
    isDocSidebarOpen.value = saved === 'true'
  }
})

// 3. Manuelles Speichern bei Änderung (für Persistenz beim Reload)
watch(isDocSidebarOpen, (newVal) => {
  localStorage.setItem(STORAGE_KEY, String(newVal))
})


// Wir definieren das Model für die Dokumentenliste
const documents = defineModel<any[]>('documents', { default: () => [] })

// Optional: Ein zweites Model für das aktuell ausgewählte Dokument
const selectedId = defineModel<string | null>('selectedId', { default: null })

const selectDoc = (id: string) => {
  selectedId.value = id
}

function nullifySelectedDoc() {
  selectedId.value = null
}

</script>