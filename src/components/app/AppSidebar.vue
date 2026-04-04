<script setup lang="ts">
import type { SidebarProps } from "@/components/ui/sidebar"
import { IdCardLanyard, Minus, Plus } from "lucide-vue-next"
import SearchForm from "@/components/app/SearchForm.vue"
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
  CalendarCheck, Ellipsis, UserRound, Building2, Timer, ShieldCheck
} from 'lucide-vue-next'

import { useRoute, useRouter } from "vue-router"
import { ref, watch, type Ref } from 'vue'
import { getIconColor, navigationData } from "@/constants/navigation"


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

const userData = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
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
      <SearchForm />
    </SidebarHeader>
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
      <NavUser :user="userData" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
