<script setup lang="ts">
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CircleUser,
  CreditCard,
  Info,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-vue-next"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useRouter } from "vue-router";
import { authService } from "@/services/auth.service";
import { useUserStore } from "@/stores/user.store";
import { computed } from "vue";


const { isMobile } = useSidebar()

const router = useRouter()

function navToSettings() {
  return router.push("/settings")
}
async function logout() {
  await authService.logout()
  userStore.clearUser()
  router.push("/login")
}
function navToProfile() {
  return router.push("/profile")
}
function navToHelp() {
  return router.push("/help")
}

const userStore = useUserStore()

const user = computed(() => ({
  name: `${userStore.user?.firstname ?? ''} ${userStore.user?.lastname ?? ''}`.trim(),
  email: userStore.user?.email ?? '',
  avatar: ''
}))

function getInitials(name: string | undefined | null): string {
  if (!name || !name.trim()) return '??';

  const parts = name.trim().split(/\s+/);
  
  // Wir greifen sicher auf die Indizes zu
  const firstWord = parts[0];
  const lastWord = parts.length > 1 ? parts[parts.length - 1] : undefined;

  // Nur wenn das erste Wort wirklich existiert (charAt(0) sicherstellen)
  const firstInitial = firstWord ? firstWord.charAt(0) : '';
  const lastInitial = lastWord ? lastWord.charAt(0) : '';

  const res = (firstInitial + lastInitial).toUpperCase();
  
  return res || '??';
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage :src="user.avatar" :alt="user.name" />
              <AvatarFallback class="rounded-lg">
                {{ getInitials(user.name) }}
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{{ user.name }}</span>
              <span class="truncate text-xs">{{ user.email }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :src="user.avatar" :alt="user.name" />
                <AvatarFallback class="rounded-lg">
                  {{ getInitials(user.name) }}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ user.name }}</span>
                <span class="truncate text-xs">{{ user.email }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem @click="navToProfile">
              <CircleUser />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem @click="navToSettings">
              <Settings />
                Einstellungen
            </DropdownMenuItem>
            <DropdownMenuItem @click="navToHelp">
              <Info />
              Hilfe
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="logout">
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>