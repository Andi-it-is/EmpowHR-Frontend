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
import { computed } from 'vue'

const route = useRoute()

const breadcrumbs = computed(() =>
  route.matched
    .filter(r => r.meta?.title)
    .map(r => ({ title: r.meta.title as string, path: r.path }))
)
</script>

<template>
  <SidebarProvider>
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
      <main class="flex flex-1 flex-col gap-4 p-4">
        <RouterView /> 
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
