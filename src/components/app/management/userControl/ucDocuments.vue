<script setup lang="ts">
import { ref, h, watch, computed, onMounted } from "vue"
import { ArrowUpDown, ChevronLeft, ChevronRight, MoreVertical, Pencil, Trash2, Eye, Upload, FileText, X, Loader2, DownloadIcon } from "lucide-vue-next"
import {
  FlexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, useVueTable,
  type ColumnDef, type ColumnFiltersState, type SortingState, type FilterFn
} from "@tanstack/vue-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { toast } from "vue-sonner"
import { DocumentType, DocumentSecurityLevel, DocumentSecurityLevelLabels, DocumentSecurityLevelVariant, DocumentTypeLabels, DocumentSecurityLevelFromApi, DocumentSecurityLevelApiMap } from "@/constants/enums/document.enum"
import { documentService, type Document } from "@/services/document.service"
import { userService, type User } from "@/services/user.service"
import VuePdfEmbed from 'vue-pdf-embed'


const documents = ref<Document[]>([])
const isLoading = ref(false)
const affectedUser = ref<User>() 

async function fetchDocuments() {
  const response = await documentService.listDocumentsByUserId(affectedUser.value!.id)
  documents.value = response.map((doc: any) => ({
    ...doc,
    security_level: DocumentSecurityLevelFromApi[doc.security_level],
  }))
}

onMounted(async () => {
  affectedUser.value = await userService.getUserById(props.user.id)

  await fetchDocuments()
})

const props = defineProps<{
  user: User
}>()

const emit = defineEmits<{
  refresh: []
}>()

const isPdfDialogOpen = ref(false)
const selectedDocument = ref<Document | null>(null)
const pdfUrl = ref<string | null>(null)
const isRendering = ref(false)

watch(() => pdfUrl.value, (newUrl) => {
  if (newUrl) isRendering.value = true
})

const onPdfRendered = () => { isRendering.value = false }

const openDocument = async (doc: Document) => {
  selectedDocument.value = doc
  isPdfDialogOpen.value = true
  pdfUrl.value = await documentService.getDocumentFile(doc.id)
}

const downloadPdf = () => {
  if (!pdfUrl.value || !selectedDocument.value) return
  const link = document.createElement('a')
  link.href = pdfUrl.value
  link.download = `${selectedDocument.value.title.replace(/\s+/g, '_')}.pdf`
  link.click()
}

const onDialogClose = () => {
  isRendering.value = false
  pdfUrl.value = null
  selectedDocument.value = null
}


// ─── View Dialog ───────────────────────────────────────────────
const viewingDocument = ref<Document | null>(null)

// ─── Edit Dialog ───────────────────────────────────────────────
const editingDocument = ref<Document | null>(null)
const editTitle = ref('')
const editType = ref<DocumentType | ''>('')
const editSecurityLevel = ref<DocumentSecurityLevel | ''>('')

watch(editingDocument, (doc) => {
  if (!doc) return
  editTitle.value = doc.title
  editType.value = doc.type
  editSecurityLevel.value = doc.security_level
})

async function onEditDocument() {
  if (!editingDocument.value) return
  try {
    await documentService.updateDocumentByUserId(
      affectedUser.value!.id,
      editingDocument.value.id,
      {
        title: editTitle.value,
        type: editType.value as DocumentType,
        security_level: DocumentSecurityLevelApiMap[editSecurityLevel.value as DocumentSecurityLevel],
      }
    )
    toast.success('Dokument aktualisiert')
    editingDocument.value = null
    await fetchDocuments()
  } catch {
    toast.error('Fehler beim Aktualisieren')
  }
}

// ─── Delete Dialog ─────────────────────────────────────────────
const deletingDocument = ref<Document | null>(null)

async function onDeleteDocument() {
  if (!deletingDocument.value) return
  try {
    await documentService.deleteDocumentByUserId(
      affectedUser.value!.id,
      deletingDocument.value.id,
    )
    toast.success('Dokument gelöscht')
    deletingDocument.value = null
    await fetchDocuments()
  } catch {
    toast.error('Fehler beim Löschen')
  }
}

// ─── Upload Dialog ─────────────────────────────────────────────
const uploadOpen = ref(false)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

const uploadForm = ref<{
  title: string
  type: DocumentType | ''
  security_level: DocumentSecurityLevel | ''
}>({ title: '', type: '', security_level: '' })

const documentTypes = Object.values(DocumentType).map(value => ({ value, label: DocumentTypeLabels[value] }))
const securityLevels = Object.values(DocumentSecurityLevel).map(value => ({
  value: String(value),
  label: DocumentSecurityLevelLabels[value as DocumentSecurityLevel],
}))

const isUploadValid = computed(() =>
  !!selectedFile.value &&
  uploadForm.value.title.trim().length > 0 &&
  !!uploadForm.value.type &&
  uploadForm.value.security_level !== ''
)

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) validateAndSet(file)
}

function clearFile() {
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function onDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) validateAndSet(file)
}

function validateAndSet(file: File) {
  if (file.type !== 'application/pdf') {
    toast.error('Ungültiger Dateityp', { description: 'Nur PDF-Dateien sind erlaubt.' })
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    toast.error('Datei zu groß', { description: 'Maximale Dateigröße beträgt 10 MB.' })
    return
  }
  selectedFile.value = file
  if (!uploadForm.value.title) {
    uploadForm.value.title = file.name.replace(/\.pdf$/i, '')
  }
}

function resetUpload() {
  selectedFile.value = null
  uploadForm.value = { title: '', type: '', security_level: '' }
  if (fileInput.value) fileInput.value.value = ''
}

async function submitUpload() {
  if (!isUploadValid.value || !selectedFile.value) return
  isUploading.value = true
  try {
    await documentService.uploadDocumentByUserId(
      affectedUser!.value!.id,
      selectedFile.value,
      {
        title: uploadForm.value.title,
        type: uploadForm.value.type as DocumentType,
        security_level: DocumentSecurityLevelApiMap[uploadForm.value.security_level as DocumentSecurityLevel],
      }
    )
    toast.success('Dokument hochgeladen')
    await fetchDocuments()
    uploadOpen.value = false
    resetUpload()
  } catch {
    toast.error('Fehler beim Hochladen', { description: 'Bitte versuche es erneut.' })
  } finally {
    isUploading.value = false
  }
}

// ─── Table ─────────────────────────────────────────────────────
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const globalFilter = ref('')

const globalFilterFn: FilterFn<Document> = (row, _columnId, filterValue) => {
  const search = filterValue.toLowerCase()
  const { title, type, security_level } = row.original
  return (
    title.toLowerCase().includes(search) ||
    DocumentTypeLabels[type]?.toLowerCase().includes(search) ||
    DocumentSecurityLevelLabels[security_level as DocumentSecurityLevel]?.toLowerCase().includes(search)
  )
}

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date))
}

const columns: ColumnDef<Document>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => h(Button, {
      variant: 'ghost', class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Titel', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => h('div', { class: 'ml-4 flex items-center gap-2' }, [
      h(FileText, { class: 'h-4 w-4 text-muted-foreground shrink-0' }),
      h('span', { class: 'text-sm font-medium' }, row.original.title),
    ]),
    sortingFn: 'alphanumeric',
  },
  {
    accessorKey: 'type',
    header: ({ column }) => h(Button, {
      variant: 'ghost', class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Kategorie', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => h('div', { class: 'ml-4' }, [
      h(Badge, { variant: 'bordered' }, () => DocumentTypeLabels[row.original.type])
    ]),
    sortingFn: (a, b) => DocumentTypeLabels[a.original.type].localeCompare(DocumentTypeLabels[b.original.type]),
  },
  {
    accessorKey: 'security_level',
    header: ({ column }) => h(Button, {
      variant: 'ghost', class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Vertraulichkeit', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => {
      const level = row.original.security_level as DocumentSecurityLevel
      return h('div', { class: 'ml-4' }, [
        h(Badge, { variant: DocumentSecurityLevelVariant[level] as any }, () => DocumentSecurityLevelLabels[level])
      ])
    },
    sortingFn: (a, b) => Number(a.original.security_level) - Number(b.original.security_level),
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => h(Button, {
      variant: 'ghost', class: 'hover:bg-transparent',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    }, () => ['Hochgeladen am', h(ArrowUpDown, { class: 'ml-2 h-3 w-3' })]),
    cell: ({ row }) => h('div', { class: 'text-sm text-muted-foreground ml-4' }, formatDate(row.original.created_at)),
    sortingFn: (a, b) => new Date(a.original.created_at).getTime() - new Date(b.original.created_at).getTime(),
  },
  {
    id: 'view',
    size: 60,
    cell: ({ row }) => h(Button, {
      variant: 'brand-outline',
      class: 'gap-2',
      onClick: () => openDocument(row.original),
    }, () => [h(Eye, { class: 'h-4 w-4' }), 'Öffnen']),
  },
  {
    id: 'actions',
    size: 50,
    cell: ({ row }) => h(DropdownMenu, {}, {
      default: () => [
        h(DropdownMenuTrigger, { asChild: true }, {
          default: () => h(Button, { variant: 'ghost', class: 'h-8 w-8 p-0' }, {
            default: () => h(MoreVertical, { class: 'h-4 w-4' }),
          }),
        }),
        h(DropdownMenuContent, { align: 'end' }, {
          default: () => [
            h(DropdownMenuItem, {
              class: 'gap-2 cursor-pointer',
              onClick: () => editingDocument.value = row.original,
            }, () => [h(Pencil, { class: 'h-4 w-4' }), 'Bearbeiten']),
            h(DropdownMenuSeparator),
            h(DropdownMenuItem, {
              class: 'gap-2 cursor-pointer text-destructive focus:text-destructive',
              onClick: () => deletingDocument.value = row.original,
            }, () => [h(Trash2, { class: 'h-4 w-4' }), 'Löschen']),
          ],
        }),
      ],
    }),
  },
]

const table = useVueTable({
  get data() { return documents.value },
  columns,
  globalFilterFn,
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get globalFilter() { return globalFilter.value },
  },
  onSortingChange: updater => sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater,
  onColumnFiltersChange: updater => columnFilters.value = typeof updater === 'function' ? updater(columnFilters.value) : updater,
  onGlobalFilterChange: updater => globalFilter.value = typeof updater === 'function' ? updater(globalFilter.value) : updater,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})
</script>

<template lang="pug">
div(class="w-full space-y-4")

  //- Toolbar
  div(class="flex items-center justify-between gap-4 mb-2")
    Input(
      placeholder="Dokumente suchen..."
      class="max-w-sm"
      :model-value="globalFilter"
      @update:model-value="table.setGlobalFilter($event)"
    )
    Button(variant="brand" class="gap-2" @click="uploadOpen = true")
      Upload(class="h-4 w-4")
      | Dokument hochladen

  //- Table
  div(class="rounded-md border bg-card overflow-hidden shadow-sm")
    Table
      TableHeader(class="bg-muted dark:[&_th]:text-slate-100 [&_th]:text-slate-900")
        TableRow(
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
          class="hover:bg-transparent border-none"
        )
          TableHead(
            v-for="header in headerGroup.headers"
            :key="header.id"
            class="font-bold h-11"
            :style="{ width: `${header.getSize()}px` }"
          )
            FlexRender(
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()"
            )
      TableBody
        template(v-if="table.getRowModel().rows?.length")
          TableRow(
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="transition-colors"
          )
            TableCell(v-for="cell in row.getVisibleCells()" :key="cell.id")
              FlexRender(:render="cell.column.columnDef.cell" :props="cell.getContext()")
        tr(v-else)
          TableCell(:colspan="columns.length" class="h-24 text-center text-muted-foreground")
            div(class="flex flex-col items-center gap-2")
              FileText(class="h-8 w-8 opacity-30")
              span Keine Dokumente gefunden.

  //- Pagination
  div(class="flex flex-wrap items-center justify-end px-2 gap-6")
    div(class="flex items-center gap-2")
      p(class="text-sm font-medium text-muted-foreground") Zeilen
      Select(
        :model-value="`${table.getState().pagination.pageSize}`"
        @update:model-value="v => table.setPageSize(Number(v))"
      )
        SelectTrigger(class="h-8 w-17.5")
          SelectValue
        SelectContent(side="top")
          SelectItem(v-for="size in [5, 10, 20, 50]" :key="size" :value="`${size}`") {{ size }}
    div(class="text-sm font-medium") Seite {{ table.getState().pagination.pageIndex + 1 }} von {{ table.getPageCount() }}
    div(class="flex items-center gap-2")
      Button(variant="outline" size="icon" class="h-8 w-8" :disabled="!table.getCanPreviousPage()" @click="table.previousPage()")
        ChevronLeft(class="h-4 w-4")
      Button(variant="outline" size="icon" class="h-8 w-8" :disabled="!table.getCanNextPage()" @click="table.nextPage()")
        ChevronRight(class="h-4 w-4")

  //- View Dialog
  Dialog(v-model:open="isPdfDialogOpen" @update:open="v => { if (!v) onDialogClose() }")
    DialogContent(class="max-w-4xl w-full h-[90vh] flex flex-col p-0")
      DialogHeader(class="px-6 pt-6 pb-4 border-b shrink-0 flex flex-row items-center justify-between gap-8")
        div(class="flex flex-col gap-1")
          DialogTitle {{ selectedDocument?.title }}
          DialogDescription(v-if="selectedDocument")
            | {{ DocumentTypeLabels[selectedDocument.type] }} · {{ DocumentSecurityLevelLabels[selectedDocument.security_level] }}
        Button(
          v-if="pdfUrl"
          @click="downloadPdf"
          variant="outline"
          class="gap-2 shrink-0"
        )
          DownloadIcon(class="w-4 h-4")
          | Download

      div(class="relative flex-1 bg-muted/30 overflow-y-auto p-4 md:p-8 custom-scrollbar")
        
        //- Spinner
        transition(name="fade")
          div(v-if="isRendering" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm")
            div(class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin")
            p(class="mt-4 text-xs font-medium text-muted-foreground") PDF wird gerendert...

        div(class="w-full max-w-4xl mx-auto")
          vue-pdf-embed(
            v-if="pdfUrl"
            :source="pdfUrl"
            class="pdf-dialog-canvas shadow-2xl rounded-sm border border-border"
            @rendered="onPdfRendered"
          )

  //- ── Upload Dialog ──────────────────────────────────────────
  Dialog(:open="uploadOpen" @update:open="v => { if (!v) { uploadOpen = false; resetUpload() } }")
    DialogContent(class="sm:max-w-md")
      DialogHeader
        DialogTitle Dokument hochladen
        DialogDescription Lade ein PDF-Dokument hoch. Maximale Dateigröße: 10 MB.

      div(class="flex flex-col gap-4 py-2")

        //- Drop Zone
        div(
          class="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/30 relative"
          :class="{ 'border-primary bg-primary/5': selectedFile }"
          @click="fileInput?.click()"
          @dragover.prevent
          @drop.prevent="onDrop"
        )
          button(
            v-if="selectedFile"
            class="absolute top-2 right-2 p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            @click.stop="clearFile"
          )
            X(class="w-5 h-5")
          FileText(v-if="selectedFile" class="w-8 h-8 text-primary")
          Upload(v-else class="w-8 h-8 text-muted-foreground")
          p(v-if="selectedFile" class="text-sm font-medium text-foreground text-center break-all") {{ selectedFile.name }}
          template(v-else)
            p(class="text-sm font-medium") Datei auswählen oder hierher ziehen
            p(class="text-xs text-muted-foreground") Nur PDF-Dateien, max. 10 MB
          input(
            ref="fileInput"
            type="file"
            accept="application/pdf"
            class="hidden"
            @change="onFileChange"
          )

        //- Titel
        div(class="flex flex-col gap-2")
          Label(for="upload-title") Titel
          Input(id="upload-title" v-model="uploadForm.title" placeholder="z.B. Arbeitsvertrag 2025")

        //- Typ
        div(class="flex flex-col gap-2")
          Label(for="upload-type") Kategorie
          Select(v-model="uploadForm.type")
            SelectTrigger
              SelectValue(placeholder="Kategorie wählen")
            SelectContent
              SelectItem(v-for="opt in documentTypes" :key="opt.value" :value="opt.value") {{ opt.label }}

        //- Security Level
        div(class="flex flex-col gap-2")
          Label(for="upload-security") Vertraulichkeit
          Select(v-model="uploadForm.security_level")
            SelectTrigger
              SelectValue(placeholder="Vertraulichkeit wählen")
            SelectContent
              SelectItem(v-for="opt in securityLevels" :key="opt.value" :value="opt.value") {{ opt.label }}

      DialogFooter
        Button(variant="ghost" @click="uploadOpen = false; resetUpload()" :disabled="isUploading") Abbrechen
        Button(variant="brand" @click="submitUpload" :disabled="isUploading || !isUploadValid" class="gap-2")
          Loader2(v-if="isUploading" class="w-4 h-4 animate-spin")
          Upload(v-else class="w-4 h-4")
          | {{ isUploading ? 'Wird hochgeladen...' : 'Hochladen' }}

  //- ── Edit Dialog ────────────────────────────────────────────
  Dialog(:open="!!editingDocument" @update:open="v => { if (!v) editingDocument = null }")
    DialogContent
      DialogHeader
        DialogTitle Dokument bearbeiten
        DialogDescription Bearbeite die Metadaten des Dokuments.
      form(@submit.prevent="onEditDocument()")
        FieldGroup(class="flex flex-col gap-4 mt-2")
          Field
            FieldLabel Titel
            Input(v-model="editTitle" placeholder="Dokumenttitel")
          Field
            FieldLabel Kategorie
            Select(v-model="editType")
              SelectTrigger
                SelectValue(placeholder="Kategorie wählen")
              SelectContent
                SelectItem(v-for="opt in documentTypes" :key="opt.value" :value="opt.value") {{ opt.label }}
          Field
            FieldLabel Vertraulichkeit
            Select(v-model="editSecurityLevel")
              SelectTrigger
                SelectValue(placeholder="Vertraulichkeit wählen")
              SelectContent
                SelectItem(v-for="opt in securityLevels" :key="opt.value" :value="opt.value") {{ opt.label }}
        DialogFooter(class="mt-4")
          Button(type="button" variant="outline" @click="editingDocument = null") Abbrechen
          Button(type="submit" variant="brand") Speichern

  //- ── Delete AlertDialog ─────────────────────────────────────
  AlertDialog(:open="!!deletingDocument")
    AlertDialogContent
      AlertDialogHeader
        AlertDialogTitle Dokument löschen?
        AlertDialogDescription Diese Aktion kann nicht rückgängig gemacht werden.
      div(v-if="deletingDocument" class="rounded-md border p-4 bg-muted/50 text-sm")
        p(class="font-bold") {{ deletingDocument.title }}
        p(class="text-muted-foreground") {{ DocumentTypeLabels[deletingDocument.type] }}
      AlertDialogFooter
        AlertDialogCancel(@click="deletingDocument = null") Abbrechen
        AlertDialogAction(
          class="bg-destructive text-white hover:bg-destructive/90"
          @click="onDeleteDocument"
        ) Löschen
</template>


<style scoped>
:deep(.pdf-dialog-canvas) {
  width: 100% !important;
  display: flex;
  justify-content: center;
}
:deep(.pdf-dialog-canvas canvas) {
  max-width: 100% !important;
  height: auto !important;
  display: block;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: hsl(var(--muted-foreground) / 0.3);
  border-radius: 10px;
}
</style>