<template>
  <Sidebar side="right" class="border-l h-full">
    <SidebarHeader>
      <SidebarMenu>

        <SidebarMenuItem class="py-4 px-2">
          <div class="flex items-start justify-between">
            <div>
              <h3> {{ documents.length }} Dokumente </h3>
              <p class="text-muted-foreground"> Zeitraum: Jahr - Jahr  </p>
            </div>
              <Button
                v-if="selectedId"
                variant="ghost"
                class="text-muted-foreground hover:text-foreground mt-1 flex items-center gap-2"
                @click="nullifySelectedDoc()"
              >
                <SquareDashed class="w-5 h-5" />
                Auswahl leeren
              </Button>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <Separator />
    <SidebarContent class="p-0">
      <ScrollArea class="h-full w-full">
        <div class="py-4 px-2 space-y-2">

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
                <ItemTitle> {{ doc.name }} </ItemTitle>
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
  FileIcon,
  Square,
  SquareDashedBottom
} from 'lucide-vue-next'
import {
  Item,
  ItemMedia,
  ItemActions,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from '@/components/ui/item/';
import { GalleryVerticalEnd, GalleryVertical, SquareDashed } from "lucide-vue-next";
import { ref, onMounted, watch } from 'vue'
import Button from "@/components/ui/button/Button.vue";
import Separator from "@/components/ui/separator/Separator.vue";

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