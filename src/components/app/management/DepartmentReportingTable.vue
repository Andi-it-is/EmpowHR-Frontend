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

interface TableData {
  id: number
  header: string
  type: string
  status: string
  target: string
  limit: string
  reviewer: string
}

const props = defineProps<{
  data: TableData[]
}>()

// --- STATE ---
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const rowSelection = ref({})

// --- COLUMNS DEFINITION ---
const columns: ColumnDef<TableData>[] = [
  {
    id: "select",
    header: ({ table }) => h(Checkbox, {
      "modelValue": table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate"),
      "onUpdate:modelValue": value => table.toggleAllPageRowsSelected(!!value),
      "aria-label": "Select all",
    }),
    cell: ({ row }) => h(Checkbox, {
      "modelValue": row.getIsSelected(),
      "onUpdate:modelValue": value => row.toggleSelected(!!value),
      "aria-label": "Select row",
    }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "header",
    header: "Titel",
    cell: ({ row }) => h("div", { class: "font-medium" }, String(row.getValue("header"))),
  },
  {
    accessorKey: "type",
    header: "Sektion",
    cell: ({ row }) => {
      const type = String(row.getValue("type"))
      const displayType = type === "FürMich" ? "Persönlich" : type
      return h(Badge, { variant: "outline" }, () => displayType)
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const isDone = status === "Abgeschlossen"
      const isWaiting = status === "Wartet auf Freigabe"

      return h("div", { class: "flex items-center gap-2" }, [
        isDone 
          ? h(CircleCheckBig, { class: "h-4 w-4 text-emerald-500" }) 
          : h(Loader2, { class: `h-4 w-4 animate-spin ${isWaiting ? 'text-[#dc2626]' : 'text-muted-foreground'}` }),
        h("span", { class: isWaiting ? "text-[#dc2626] font-semibold" : "" }, status),
      ])
    },
  },
  {
    accessorKey: "target",
    header: "Zielgruppe",
    cell: ({ row }) => h("span", { class: "text-xs font-mono bg-muted px-1.5 py-0.5 rounded" }, String(row.getValue("target"))),
  },
  {
    accessorKey: "limit",
    header: "Frist",
    cell: ({ row }) => h("span", { class: "text-muted-foreground" }, String(row.getValue("limit"))),
  },
  {
    accessorKey: "reviewer",
    header: "Reviewer",
    cell: ({ row }) => h("div", { class: "min-w-[120px]" }, String(row.getValue("reviewer"))),
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
        <p class="text-muted-foreground max-w-175" tabindex="0"> Übersicht über alle Abteilungen</p>
      </div>
      <Button variant="brand-outline" size="sm">
        <Plus class="mr-2 h-4 w-4" />
        Neue Sektion
      </Button>
    </div>

    <div class="rounded-md border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader class="bg-muted">
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id" class="hover:bg-transparent border-none">
            <TableHead 
              v-for="header in headerGroup.headers" 
              :key="header.id" 
              class="text-white font-bold h-11"
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
              class="transition-colors data-[state=selected]:bg-blue-50/80 data-[state=selected]:shadow-[inset_3px_0_0_0_#3b82f6]"
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
      <div class="text-sm text-muted-foreground italic">
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