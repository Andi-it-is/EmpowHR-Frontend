<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar"
import { IdCardLanyard, Minus, Plus } from "lucide-vue-next"
import NavUser from "./NavUser.vue"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarFooter
} from "@/components/ui/sidebar"
import {
  FileText, Database, Award, GitFork, Users,
  CalendarDays, Armchair, UmbrellaOff, Clock, Home,
  CalendarCheck, Ellipsis, UserRound, Building2, Timer, ShieldCheck, Upload
} from 'lucide-vue-next'

import { useRoute, useRouter } from "vue-router"
import { ref, watch, type Ref } from 'vue'
import { getIconColor, navigationData } from "@/constants/navigation"
import Separator from "../ui/separator/Separator.vue"


const props = defineProps<SidebarProps>()
const router = useRouter()
const route = useRoute()

const data = navigationData

function usePersistentSidebarState(key: string, defaultOpen: boolean) {
  const stored = localStorage.getItem(key)
  const isOpen = ref(stored !== null ? stored === 'true' : defaultOpen)

  watch(isOpen, (val) => {
    localStorage.setItem(key, String(val))
  })

  return isOpen
}

// Open-States für navMain
const navMainStates = ref(
  data.map((item, index) =>
    usePersistentSidebarState(`sidebar-nav-${item.title}`, index === 1)
  )
)
function getNavState(states: Ref<boolean>[], index: number): Ref<boolean> {
  return states[index] ?? ref(false)
}

function navToIndex() {
  return router.push("/")
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child @click="navToIndex()">
            <a href="#">
              <div class="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <IdCardLanyard class="size-6" />
              </div>
              <div class="flex flex-col gap-0.5 leading-none">
                <span class="font-medium">EmpowHR</span>
                <span class="">Prototyp Nr. 1</span>  
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <!-- Schnellaktionen -->
    <SidebarGroup class="mt-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Armchair class="size-4 text-muted-foreground" />
            <span> Jetzt Sitzplatz buchen</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <UmbrellaOff class="size-4 text-muted-foreground" />
            <span> Neue Abwesenheit einreichen</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <Clock class="size-4 text-muted-foreground" />
            <span> Aktuellen Arbeitstag erfassen</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>

    <Separator class="my-1" />

    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <Collapsible
            v-for="(item, index) in data"
            :key="item.title"
            v-model:open="getNavState(navMainStates, index).value"
            class="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger as-child>
                <SidebarMenuButton>
                <component :is="item.icon" :class="['size-4 shrink-0', getIconColor(item.color)]" />
                  {{ item.title }}
                  <Plus class="ml-auto group-data-[state=open]/collapsible:hidden" />
                  <Minus class="ml-auto group-data-[state=closed]/collapsible:hidden" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent v-if="item.items.length">
                <SidebarMenuSub>
                  <SidebarMenuSubItem v-for="childItem in item.items" :key="childItem.title">
                    <SidebarMenuSubButton as-child :is-active="route.path === childItem.url">
                      <RouterLink :to="childItem.url">
                        <component :is="childItem.icon" class="size-4 shrink-0" />
                        <span>{{ childItem.title }}</span>
                      </RouterLink>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
