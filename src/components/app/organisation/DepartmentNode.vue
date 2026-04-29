<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'

interface User {
  id: string
  firstname: string
  lastname: string
  gender: string
  email: string
  disabled: boolean
}

interface Department {
  id: string
  name: string
  cost_center: string
  head: User | null
  users: User[]
  parent: { id: string; name: string } | null
}

const props = defineProps<{
  dept: Department
  expanded: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const isRoot = computed(() => props.dept.parent === null)
const userCount = computed(() => props.dept.users.length)

function initials(user: User) {
  return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase()
}
</script>

<template>
  <div class="dept-node" :class="{ 'is-root': isRoot, 'is-expanded': expanded }">
    <!-- VueFlow Handles -->
    <Handle type="target" :position="Position.Top" class="custom-handle" />
    <Handle type="source" :position="Position.Bottom" class="custom-handle" />

    <!-- Header: Brand-farbig für Root, subtiler für Child -->
    <div class="node-header" :class="{ 'header-root': isRoot, 'header-child': !isRoot }">
      <div class="header-content">
        <span class="cost-center">{{ dept.cost_center }}</span>
        <h3 class="dept-name">{{ dept.name }}</h3>
      </div>
    </div>

    <!-- Body -->
    <div class="node-body">

      <!-- Abteilungsleiter -->
      <div class="section-head">
        <div class="section-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Abteilungsleiter
        </div>
        <div v-if="dept.head" class="head-info">
          <div class="avatar">
            {{ initials(dept.head) }}
          </div>
          <div class="head-details">
            <span class="head-name">{{ dept.head.firstname }} {{ dept.head.lastname }}</span>
            <span class="head-email">{{ dept.head.email }}</span>
          </div>
        </div>
        <div v-else class="no-head">
          <span>Nicht besetzt</span>
        </div>
      </div>

      <!-- Mitarbeiter Toggle -->
      <button
        class="users-toggle"
        :class="{ 'toggle-active': expanded }"
        @click.stop="emit('toggle')"
      >
        <div class="toggle-left">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Mitarbeiter
        </div>
        <div class="toggle-right">
          <span class="user-badge">{{ userCount }}</span>
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            class="chevron" :class="{ rotated: expanded }"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      <!-- Expandable Users List -->
      <transition name="expand">
        <div v-if="expanded && userCount > 0" class="users-list">
          <div
            v-for="user in dept.users"
            :key="user.id"
            class="user-row"
            :class="{ 'user-head': dept.head?.id === user.id }"
          >
            <div class="user-avatar-sm">{{ initials(user) }}</div>
            <div class="user-info">
              <span class="user-name">{{ user.firstname }} {{ user.lastname }}</span>
              <span v-if="dept.head?.id === user.id" class="user-role-badge">Leiter</span>
            </div>
            <div v-if="user.disabled" class="user-disabled-dot" title="Deaktiviert" />
          </div>
        </div>
        <div v-else-if="expanded && userCount === 0" class="users-empty">
          Keine Mitarbeiter zugewiesen
        </div>
      </transition>

    </div>
  </div>
</template>

<style scoped>
.dept-node {
  background: var(--card);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-lg);
  width: 260px;
  box-shadow: 0 2px 8px oklch(0 0 0 / 0.06), 0 1px 2px oklch(0 0 0 / 0.04);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  font-family: 'Geist', 'DM Sans', system-ui, sans-serif;
  overflow: hidden;
}

.dept-node:hover {
  box-shadow: 0 8px 24px oklch(0 0 0 / 0.10), 0 2px 6px oklch(0 0 0 / 0.06);
  border-color: var(--default-brand);
}

.dept-node.is-root {
  border-color: var(--default-brand);
  border-width: 2px;
  box-shadow: 0 0 0 3px oklch(0.38 0.07 169 / 0.12), 0 4px 16px oklch(0 0 0 / 0.08);
}

/* ── Header ── */
.node-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 14px 10px;
  gap: 8px;
}

.header-root {
  background: var(--default-brand);
  color: oklch(0.985 0 0);
}

.header-child {
  background: oklch(0.38 0.07 169 / 0.08);
  border-bottom: 1px solid var(--border);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.cost-center {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted-foreground) !important;
}

.header-root .cost-center {
  color: oklch(0.985 0 0);
}

.header-child .cost-center {
  color: var(--default-brand);
}

.dept-name {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-root .dept-name {
  color: oklch(0.985 0 0);
}

.header-child .dept-name {
  color: var(--foreground);
}

.header-badge {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: oklch(0 0 0 / 0.08);
  color: currentColor;
  flex-shrink: 0;
}

.header-root .header-badge {
  background: oklch(1 0 0 / 0.15);
  color: oklch(0.985 0 0);
}

.header-child .header-badge {
  background: var(--default-brand);
  color: oklch(0.985 0 0);
}

/* ── Body ── */
.node-body {
  padding: 10px 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Abteilungsleiter ── */
.section-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}

.head-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: oklch(0.38 0.07 169 / 0.06);
  border-radius: var(--radius-sm);
  border: 1px solid oklch(0.38 0.07 169 / 0.15);
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--default-brand);
  color: oklch(0.985 0 0);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}

.head-details {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.head-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--foreground);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.head-email {
  font-size: 10px;
  color: var(--muted-foreground);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-head {
  padding: 5px 8px;
  background: var(--muted);
  border-radius: var(--radius-sm);
  font-size: 11px;
  color: var(--muted-foreground);
  font-style: italic;
}

/* ── Users Toggle ── */
.users-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 6px 8px;
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
  color: var(--foreground);
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
}

.users-toggle:hover {
  background: oklch(0.38 0.07 169 / 0.08);
  border-color: var(--default-brand);
}

.users-toggle.toggle-active {
  background: oklch(0.38 0.07 169 / 0.10);
  border-color: var(--default-brand);
  color: var(--default-brand);
}

.toggle-left {
  display: flex;
  align-items: center;
  gap: 5px;
}

.toggle-right {
  display: flex;
  align-items: center;
  gap: 5px;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--default-brand);
  color: oklch(0.985 0 0);
  font-size: 10px;
  font-weight: 700;
}

.chevron {
  transition: transform 0.2s ease;
}

.chevron.rotated {
  transform: rotate(180deg);
}

/* ── Users List (expandable) ── */
.users-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow: hidden;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 6px;
  border-radius: var(--radius-sm);
  transition: background 0.12s ease;
}

.user-row:hover {
  background: var(--accent);
}

.user-row.user-head {
  background: oklch(0.38 0.07 169 / 0.06);
}

.user-avatar-sm {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--muted);
  border: 1.5px solid var(--border);
  color: var(--muted-foreground);
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-head .user-avatar-sm {
  background: var(--default-brand);
  border-color: var(--default-brand);
  color: oklch(0.985 0 0);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  flex: 1;
}

.user-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--foreground);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role-badge {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--default-brand);
  background: oklch(0.38 0.07 169 / 0.12);
  padding: 1px 5px;
  border-radius: 999px;
  flex-shrink: 0;
}

.user-disabled-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--destructive);
  flex-shrink: 0;
}

.users-empty {
  font-size: 11px;
  color: var(--muted-foreground);
  font-style: italic;
  padding: 4px 6px;
  text-align: center;
}

/* ── Transition ── */
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
  max-height: 300px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

/* ── VueFlow Handles ── */
.custom-handle {
  width: 8px;
  height: 8px;
  background: var(--default-brand);
  border: 2px solid var(--card);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.dept-node:hover .custom-handle {
  opacity: 1;
}
</style>