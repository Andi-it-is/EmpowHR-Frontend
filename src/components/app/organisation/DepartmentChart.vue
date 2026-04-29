<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueFlow, MarkerType } from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import DepartmentNode from './DepartmentNode.vue'

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string
  firstname: string
  lastname: string
  gender: string
  email: string
  disabled: boolean
  failed_login_attempts: number
  created_at: string
  updated_at: string
}

interface Department {
  id: string
  name: string
  cost_center: string
  created_at: string
  updated_at: string
  head: User | null
  users: User[]
  parent: { id: string; name: string; cost_center: string } | null
}

// ─── Props ────────────────────────────────────────────────────────────────────

const props = defineProps<{
  departments: Department[]
}>()

// ─── State ────────────────────────────────────────────────────────────────────

const expandedNodes = ref<Set<string>>(new Set())

function toggleExpand(id: string) {
  if (expandedNodes.value.has(id)) {
    expandedNodes.value.delete(id)
  } else {
    expandedNodes.value.add(id)
  }
}

// ─── Layout: Hierarchisches Top-Down Layout ───────────────────────────────────

function buildLayout(departments: Department[]) {
  // Baum aufbauen
  const nodeMap = new Map<string, Department>()
  departments.forEach(d => nodeMap.set(d.id, d))

  // Root-Nodes (kein Parent)
  const roots = departments.filter(d => d.parent === null)
  // Nodes mit Parent
  const childrenMap = new Map<string, Department[]>()
  departments.forEach(d => {
    if (d.parent) {
      const existing = childrenMap.get(d.parent.id) || []
      existing.push(d)
      childrenMap.set(d.parent.id, existing)
    }
  })

  const NODE_WIDTH = 260
  const NODE_HEIGHT = 160
  const H_GAP = 40
  const V_GAP = 80

  const positions = new Map<string, { x: number; y: number }>()

  // Rekursive Breiten-Berechnung
  function subtreeWidth(id: string): number {
    const children = childrenMap.get(id) || []
    if (children.length === 0) return NODE_WIDTH
    const total = children.reduce((acc, c) => acc + subtreeWidth(c.id), 0)
    return Math.max(NODE_WIDTH, total + H_GAP * (children.length - 1))
  }

  function placeNode(id: string, x: number, y: number) {
    positions.set(id, { x, y })
    const children = childrenMap.get(id) || []
    if (children.length === 0) return

    const totalW = children.reduce((acc, c) => acc + subtreeWidth(c.id), 0) + H_GAP * (children.length - 1)
    let curX = x + NODE_WIDTH / 2 - totalW / 2

    for (const child of children) {
      const w = subtreeWidth(child.id)
      placeNode(child.id, curX, y + NODE_HEIGHT + V_GAP)
      curX += w + H_GAP
    }
  }

  // Roots nebeneinander platzieren
  const totalRootW = roots.reduce((acc, r) => acc + subtreeWidth(r.id), 0) + H_GAP * (roots.length - 1)
  let startX = 0
  for (const root of roots) {
    placeNode(root.id, startX, 0)
    startX += subtreeWidth(root.id) + H_GAP
  }

  return positions
}

// ─── Nodes & Edges für VueFlow ────────────────────────────────────────────────

const positions = computed(() => buildLayout(props.departments))

const nodes = computed(() =>
  props.departments.map(dept => ({
    id: dept.id,
    type: 'department',
    position: positions.value.get(dept.id) || { x: 0, y: 0 },
    data: { dept, expanded: expandedNodes.value.has(dept.id) },
    style: { width: '260px' },
  }))
)

const edges = computed(() =>
  props.departments
    .filter(d => d.parent !== null)
    .map(d => ({
      id: `edge-${d.parent!.id}-${d.id}`,
      source: d.parent!.id,
      target: d.id,
      type: 'smoothstep',
      style: { stroke: 'var(--default-brand)', strokeWidth: 2, opacity: 0.6 },
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--default-brand)' },
      animated: false,
    }))
)

// ─── VueFlow Optionen ─────────────────────────────────────────────────────────

const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { strokeWidth: 2 },
}
</script>

<template>
  <div class="dept-chart-wrapper">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :default-edge-options="defaultEdgeOptions"
      fit-view-on-init
      :min-zoom="0.2"
      :max-zoom="2"
      :nodes-draggable="true"
      :elements-selectable="true"
      class="dept-flow"
    >
      <!-- Custom Node Template -->
      <template #node-department="{ data }">
        <DepartmentNode
          :dept="data.dept"
          :expanded="data.expanded"
          @toggle="toggleExpand(data.dept.id)"
        />
      </template>

      <!-- Background: Kreuz-/Schachbrettmuster wie n8n -->
      <Background
        :variant="BackgroundVariant.Lines"
        pattern-color="var(--border)"
        :gap="40"
        :size="1"
      />
    </VueFlow>
  </div>
</template>

<style scoped>
.dept-chart-wrapper {
  width: 100%;
  height: 600px;
  background: var(--background);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  overflow: hidden;
}

.dept-flow {
  width: 100%;
  height: 100%;
}

</style>