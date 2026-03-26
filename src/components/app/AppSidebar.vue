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

const props = defineProps<SidebarProps>()

// Routing Object, that defines the sidebar's options to navigate to
const data = {
  navMain: [
    {
      title: "Für mich",
      url: "#",
      items: [
        {
          title: "Dokumente",   // Docs wie Krankmeldungen, Lohnabrechnungen, Zertifikate.
          url: "#",
        },
        {
          title: "Stammdaten",  // Stammdaten wie Anschrift, Bankverbindungen.
          url: "#",
          isActive: true,
        },
        {
          title: "Zertifikate",   // Docs wie Krankmeldungen, Lohnabrechnungen, Zertifikate.
          url: "#",
        },
      ],
    },
    {
      title: "Organisation",
      url: "#",
      items: [
        {
          title: "Organigramm",     // Bigass Grafik mit Unternehmensstruktur
          url: "#",
        },
        {
          title: "Personenregister",    // Suche von einzelnen Mitarbeitern
          url: "#"
        },
        {
          title: "Desk Sharing",    // Sitzplatzbuchung
          url: "#"
        },
        {
          title: "Teamkalender",    // Geteilter Kalender für alle Mitglieder. ähnlich zu MyTView
          url: "#"
        }
      ],
    },
    {
      title: "Zeitverwaltung",
      url: "#",
      items: [
        {
          title: "Abwesenheiten",   // Urlaube und Shit
          url: "#",
        },
        {
          title: "Zeitbuchung",     // Zeitbuchung
          url: "#",
        },
        {
          title: "Home Office Tracker",   // Variant von der Zeitbuchung
          url: "#"
        }
      ],
    },
  ],

  supervisorNavOptions: [ 
    {
      title: "Manager Self Service (MSS)",
      url: "#",
      items: [
        {
          title: "Urlaubsplanungen",    // Board oder so für den Chef, zum Urlaub verwalten und planen
          url: "#",
          isActive: false
        },
        {
          title: "Sonstiges",
          url: "#",
          isActive: true
        }
      ],
    },
  ]
}

const userData = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <a href="#">
              <div class="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <IdCardLanyard class="size-6" />
              </div>
              <div class="flex flex-col gap-0.5 leading-none">
                <span class="font-medium">EmpowHR</span>
                <span class="">v1.0.0</span>
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
            v-for="(item, index) in data.navMain"
            :key="item.title"
            :default-open="index === 1"
            class="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger as-child>
                <SidebarMenuButton>
                  {{ item.title }}
                  <Plus class="ml-auto group-data-[state=open]/collapsible:hidden" />
                  <Minus class="ml-auto group-data-[state=closed]/collapsible:hidden" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent v-if="item.items.length">
                <SidebarMenuSub>
                  <SidebarMenuSubItem v-for="childItem in item.items" :key="childItem.title">
                    <SidebarMenuSubButton
                      as-child
                      :is-active="childItem.isActive"
                    >
                      <a :href="childItem.url">{{ childItem.title }}</a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
          <Collapsible
            v-for="(item, index) in data.supervisorNavOptions"
            :key="item.title"
            :default-open="index === 1"
            class="group/collapsible border-t border-t-primary mt-4 pt-1"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger as-child>
                <SidebarMenuButton>
                  {{ item.title }}
                  <Plus class="ml-auto group-data-[state=open]/collapsible:hidden" />
                  <Minus class="ml-auto group-data-[state=closed]/collapsible:hidden" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent v-if="item.items.length">
                <SidebarMenuSub>
                  <SidebarMenuSubItem v-for="childItem in item.items" :key="childItem.title">
                    <SidebarMenuSubButton
                      as-child
                      :is-active="childItem.isActive"
                    >
                      <a :href="childItem.url">{{ childItem.title }}</a>
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
