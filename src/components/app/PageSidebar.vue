<script lang="ts">
export const iframeHeight = "800px"
export const description = "A sidebar with collapsible submenus."
</script>

<script setup lang="ts">
import AppSidebar from "@/components/app/AppSidebar.vue"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { useRoute } from 'vue-router'
import { computed, ref, onMounted, watch } from 'vue'
import FooterComponent from "./FooterComponent.vue"

const route = useRoute()

const breadcrumbs = computed(() =>
  route.matched
    .filter(r => r.meta?.title)
    .map(r => ({ title: r.meta.title as string, path: r.path }))
)

const STORAGE_KEY = 'main-navbar-state'

const getInitialSidebarState = () => {
  // WICHTIG: Prüfen ob wir im Browser sind (wegen SSR/Nuxt)
  if (typeof window === 'undefined') return false 

  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === null) return false

  return saved === 'true'
}

const isDocSidebarOpen = ref(getInitialSidebarState())

watch(isDocSidebarOpen, (newVal) => {
  localStorage.setItem(STORAGE_KEY, String(newVal))
})

</script>

<template>
  <SidebarProvider :open="isDocSidebarOpen" @update:open="isDocSidebarOpen = $event">
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <Separator
          orientation="vertical"
          class="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbPage v-if="index === breadcrumbs.length - 1">
                  {{ crumb.title }}
                </BreadcrumbPage>
                <BreadcrumbLink v-else :href="crumb.path">
                  {{ crumb.title }}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator
                v-if="index < breadcrumbs.length - 1"
                class="hidden md:block"
              />
            </template>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <main class="flex flex-1 flex-col gap-2 p-4 md:p-8 h-fit">
        <RouterView /> 
      </main>
      <FooterComponent />
    </SidebarInset>
  </SidebarProvider>
</template>
