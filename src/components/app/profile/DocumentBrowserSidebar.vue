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
          <div v-for="i in 25" :key="i">
            <Item variant="outline" class="bg-muted">
              <ItemContent>
                <ItemTitle class="break-all"> Mein ultra cooles und super langes Dokument {{ i }}</ItemTitle>
                <ItemDescription>Beschreibung</ItemDescription>
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
import Button from "@/components/ui/button/Button.vue";
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
  FileTextIcon
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

</script>