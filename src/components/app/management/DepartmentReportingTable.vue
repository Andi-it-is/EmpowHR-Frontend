<script setup lang="ts">
import { ref, h } from "vue"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleCheckBig,
  MoreVertical,
  Loader2,
  Plus,
  ArrowUpDown
} from "lucide-vue-next"
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/vue-table"

// Shadcn UI Components
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getDepartmentColor } from "@/lib/enumTranslaters"


interface FakeDepartmentData {
  id: number,
  name: string,
  costCenter: string,
  lead: string,
  totalPeople: number,
  currentPeople: number,
  parent: string
  color: string
}

const props = defineProps<{
  data: FakeDepartmentData[]
}>()

// --- STATE ---
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const rowSelection = ref({})


// Column Defintions
const columns: ColumnDef<FakeDepartmentData>[] = [
  // {
  //   id: "select",
  //   size: 50,
  //   header: ({ table }) => h(Checkbox, {
  //     "modelValue": table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate"),
  //     "onUpdate:modelValue": value => table.toggleAllPageRowsSelected(!!value),
  //     "aria-label": "Select all",
  //   }),
  //   cell: ({ row }) => h(Checkbox, {
  //     "modelValue": row.getIsSelected(),
  //     "onUpdate:modelValue": value => row.toggleSelected(!!value),
  //     "aria-label": "Select row",
  //   }),
  //   enableSorting: false,
  //   enableHiding: false,
  // },

  {
    accessorKey: 'id',
    size: 70, 
    header: ({ column }) => {
      return h(Button, {
        variant: 'ghost',
        // 'justify-center' statt 'justify-start'
        // '-ml-4' entfernt, da wir echte Zentrierung wollen
        class: 'w-full justify-center px-0', 
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }, () => [
        h('span', { class: 'pl-3' }, 'ID'), // Ausgleich für das Icon rechts
        h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })
      ])
    },
    cell: ({ row }) => {
      return h('div', { 
        // 'text-center' statt 'pl-4'
        class: 'font-mono text-xs text-muted-foreground text-center w-full' 
      }, row.getValue('id'))
    },
  },

  {
    accessorKey: 'name',
    header: ({ column }) => {
      return h(Button, {
        variant: 'ghost',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }, () => ['Name', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]) // ml-2 für Abstand zum Icon
    },
    cell: ({ row }) => {
      const name = row.getValue('name') as string;
      const color = getDepartmentColor(name);
      return h('div', { class: 'flex items-center gap-3 pl-4' }, [
        // Der farbige Punkt
        h('span', { 
          class: `h-2 w-2 rounded-full`,
          style: {
            backgroundColor: color
          } 
        }),
        h('span', { class: 'font-medium min-w-[180px]' }, row.getValue('name'))
      ])
    },
  },

  {
    accessorKey: "costCenter",
    header: "Kostenstelle",
    cell: ({ row }) => h("div", { class: "font-mono min-w-[80px]" }, String(row.getValue("costCenter"))),
  },

  {
    accessorKey: "lead",
    header: "Leitung",
    cell: ({ row }) => h("div", { class: "min-w-[140px]" }, String(row.getValue("lead"))),
  },

  {
    accessorKey: "parent",
    header: "Übergeordnete Abteilung",
    cell: ({ row }) => {
      const parentName = String(row.getValue("parent"));
      
      return h("div", { class: "min-w-[180px]" }, [
        h(Badge, { variant: "secondary", class: "font-normal" }, () => parentName)
      ]);
    },
  },

  {
    accessorKey: "currentPeople",
    header: () => h("div", { class: "text-center w-full" }, "MA Anwesend"),
    cell: ({ row }) => {
      const ist = Number(row.getValue("currentPeople"));
      const soll = Number(row.original.totalPeople);
      
      // Logik: Ist weniger da als geplant?
      const isUnderstaffed = ist < soll;

      return h("div", { 
        class: [
          "text-center w-full font-bold",
          isUnderstaffed ? "text-orange-400" : "text-emerald-400"
        ]
      }, ist);
    },
  },

  {
    accessorKey: "totalPeople",
    header: ({ column }) => {
      return h(Button, {
        variant: "ghost",
        // w-full und justify-center sorgen für die Zentrierung im Header
        class: "w-full justify-center px-0",
        onClick: () => column.toggleSorting(column.getIsSorted() === "asc"),
      }, () => [
        // Ein kleiner Pl-3 oder Pr-3 hilft oft, das Icon optisch auszugleichen
        h("span", { class: "pl-3" }, "MA Gesamt"),
        h(ArrowUpDown, { class: "ml-2 h-3 w-3" })
      ])
    },
    cell: ({ row }) => {
      return h("div", { 
        class: "text-center w-full" 
      }, Number(row.getValue("totalPeople")))
    },
  },

  {
    id: "actions",
    cell: () => h(DropdownMenu, {}, {
      default: () => [
        h(DropdownMenuTrigger, { asChild: true }, {
          default: () => h(Button, { variant: "ghost", class: "h-8 w-8 p-0" }, {
            default: () => h(MoreVertical, { class: "h-4 w-4" }),
          }),
        }),
        h(DropdownMenuContent, { align: "end" }, {
          default: () => [
            h(DropdownMenuItem, {}, () => "Details anzeigen"),
            h(DropdownMenuItem, {}, () => "Bearbeiten"),
            h(DropdownMenuSeparator),
            h(DropdownMenuItem, { class: "text-destructive" }, () => "Löschen"),
          ],
        }),
      ],
    }),
  },

]

const table = useVueTable({
  get data() { return props.data },
  columns,
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get rowSelection() { return rowSelection.value },
  },
  onSortingChange: updater => sorting.value = typeof updater === "function" ? updater(sorting.value) : updater,
  onColumnFiltersChange: updater => columnFilters.value = typeof updater === "function" ? updater(columnFilters.value) : updater,
  onRowSelectionChange: updater => rowSelection.value = typeof updater === "function" ? updater(rowSelection.value) : updater,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})
</script>

<template>
  <div class="w-full space-y-4">
    <div class="flex items-center justify-between px-1">
      <div class="flex flex-col gap-2">
        <h3 tabindex="0">Abteilungen</h3>
        <p class="text-muted-foreground max-w-175" tabindex="0"> Übersicht über alle Abteilungen </p>
      </div>
      <!-- <Button variant="brand-outline" size="sm">
        <Plus class="mr-2 h-4 w-4" />
        Neue Sektion
      </Button> -->
    </div>

    <div class="rounded-md border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader class="bg-muted dark:[&_th]:text-slate-100 [&_th]:text-slate-900">
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id" class="hover:bg-transparent border-none">
            <TableHead 
              v-for="header in headerGroup.headers" 
              :key="header.id" 
              class="text-white font-bold h-11"
              :style="{ width: `${header.getSize()}px` }"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow 
              v-for="row in table.getRowModel().rows" 
              :key="row.id"
              :data-state="row.getIsSelected() && 'selected'"
              class="transition-colors data-[state=selected]:bg-muted data-[state=selected]:shadow-[inset_6px_0_0_0_#064e3b]"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <tr v-else>
            <TableCell :colspan="columns.length" class="h-24 text-center">
              Keine Daten verfügbar.
            </TableCell>
          </tr>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-between px-2">
      <div class="text-sm text-muted-foreground">
        {{ table.getFilteredSelectedRowModel().rows.length }} von {{ table.getFilteredRowModel().rows.length }} ausgewählt
      </div>

      <div class="flex items-center gap-6 lg:gap-8">
        <div class="flex items-center gap-2">
          <p class="text-sm font-medium whitespace-nowrap text-muted-foreground">Zeilen</p>
          <Select
            :model-value="`${table.getState().pagination.pageSize}`"
            @update:model-value="v => table.setPageSize(Number(v))"
          >
            <SelectTrigger class="h-8 w-17.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem v-for="size in [2, 5, 10, 20, 30, 50]" :key="size" :value="`${size}`">
                {{ size }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="text-sm font-medium">
          Seite {{ table.getState().pagination.pageIndex + 1 }} von {{ table.getPageCount() }}
        </div>

        <div class="flex items-center gap-2">
          <Button variant="outline" size="icon" class="h-8 w-8" :disabled="!table.getCanPreviousPage()" @click="table.setPageIndex(0)">
            <ChevronsLeft class="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" class="h-8 w-8" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()">
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" class="h-8 w-8" :disabled="!table.getCanNextPage()" @click="table.nextPage()">
            <ChevronRight class="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" class="h-8 w-8" :disabled="!table.getCanNextPage()" @click="table.setPageIndex(table.getPageCount() - 1)">
            <ChevronsRight class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>