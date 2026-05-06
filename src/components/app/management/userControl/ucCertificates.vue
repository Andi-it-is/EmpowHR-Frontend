<template lang="pug">
div(class="w-full space-y-6")

  //- Header
  div(class="flex items-center justify-between")
    div
      h2(class="text-xl font-semibold") Zertifikate verwalten
      p(class="text-sm text-muted-foreground mt-0.5")
        | Zertifikate für
        span(class="font-medium text-foreground") &nbsp;{{ affectedUser?.firstname }} {{ affectedUser?.lastname }}
    //- Upload Dialog Trigger
    Dialog(v-model:open="isCreateOpen")
      DialogTrigger(as-child)
        Button(variant="brand")
          PlusIcon(class="w-4 h-4")
          | Zertifikat hinzufügen
      DialogContent(class="sm:max-w-md")
        DialogHeader
          DialogTitle Zertifikat hochladen
          DialogDescription Lade ein PDF-Zertifikat hoch. Maximale Dateigröße: 10 MB.
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
              XIcon(class="w-6 h-6 bg-red-500 text-white")
            FileTextIcon(v-if="selectedFile" class="w-8 h-8 text-primary")
            UploadIcon(v-else class="w-8 h-8 text-muted-foreground")
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
            Label(for="title") Titel
            Input(id="title" v-model="createForm.title" placeholder="z.B. Erste-Hilfe-Kurs 2025")
          //- issued at
          div(class="flex flex-col gap-2")
            CalendarInput(label="Ausgestellt am" id="create_issued_at" v-model="createForm.issued_at")
          //- expires at
          div(class="flex flex-col gap-2")
            CalendarInput(label="Gültig bis" id="create_expires_at" v-model="createForm.expires_at")
          //- Beschreibung
          div(class="flex flex-col gap-2")
            Label(for="description") Beschreibung (optional)
            Input(id="description" v-model="createForm.description" placeholder="Kurze Beschreibung...")
        DialogFooter
          Button(variant="ghost" @click="isCreateOpen = false" :disabled="isUploading") Abbrechen
          Button(variant="brand" @click="submitCreate" :disabled="isUploading || !isCreateValid" class="gap-2")
            Loader2Icon(v-if="isUploading" class="w-4 h-4 animate-spin")
            UploadIcon(v-else class="w-4 h-4")
            | {{ isUploading ? 'Wird hochgeladen...' : 'Hochladen' }}

  div(v-if="!isLoaded" class="space-y-4")
    Skeleton(class="h-48 w-full")
    Skeleton(class="h-64 w-full")

  div(v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-4")

    //- DonutChart
    Card(class="col-span-5")
      CardHeader(class="pb-4")
        CardTitle Aktuelle Gültigkeit der Zertifikate
      CardContent(class="p-6")
        div(v-if="certificates.length === 0" class="text-center text-muted-foreground py-8")
          p Keine Zertifikate vorhanden.
        div(v-else class="flex justify-center")
          div(class="w-full max-w-md relative")
            DonutChart(
              :data="statsData"
              :category="'count'"
              :index="'name'"
              :colors="['#22c55e', '#f59e0b', '#ef4444']"
              :show-tooltip="true"
              :show-legend="true"
              :show-label="false"
              :arc-width="32"
              class="h-full w-full"
            )
            div(class="absolute inset-0 flex flex-col items-center justify-center mb-16 md:mb-8 pointer-events-none")
              span(class="text-4xl font-bold leading-none") {{ certificates.length }}
              span(class="text-[10px] text-muted-foreground uppercase font-medium tracking-wider") Gesamt

    //- Tabelle
    Card(class="col-span-5")
      CardHeader
        CardTitle Zertifikate
        CardDescription Alle hinterlegten Zertifikate
      CardContent
        div(v-if="certificates.length === 0" class="py-12 text-center text-muted-foreground border rounded-xl border-dashed")
          p Keine Zertifikate hinterlegt.
        div(v-else class="w-full space-y-4")
          div(class="rounded-md border bg-card overflow-hidden shadow-sm")
            Table
              TableHeader(class="bg-muted dark:[&_th]:text-slate-100 [&_th]:text-slate-900")
                TableRow(class="hover:bg-transparent border-none")
                  TableHead(class="font-bold h-11") Titel
                  TableHead(class="font-bold h-11") Beschreibung
                  TableHead(class="font-bold h-11") Ausgestellt am
                  TableHead(class="font-bold h-11") Gültig bis
                  TableHead(class="font-bold h-11") Status
                  TableHead(class="font-bold h-11") Dokument
                  TableHead(class="font-bold h-11 w-12")
              TableBody
                TableRow(v-for="cert in certificates" :key="cert.id")
                  TableCell(class="font-medium") {{ cert.title }}
                  TableCell(class="text-muted-foreground text-sm max-w-48 truncate" :title="cert.description") {{ cert.description || '—' }}
                  TableCell(class="text-sm") {{ formatDate(cert.issued_at) }}
                  TableCell(class="text-sm") {{ formatDate(cert.expires_at) }}
                  TableCell
                    Badge(v-if="isExpired(cert.expires_at)" variant="destructive") Abgelaufen
                    Badge(v-else-if="isExpiringSoon(cert.expires_at)" variant="warning") Läuft bald ab
                    Badge(v-else variant="positive") Gültig
                  TableCell
                    Button(variant="brand-outline" @click="openPdf(cert)")
                      | Öffnen
                      Award(class="h-4 w-4")
                  TableCell
                    DropdownMenu
                      DropdownMenuTrigger(as-child)
                        Button(variant="ghost" class="h-8 w-8 p-0")
                          MoreVertical(class="h-4 w-4")
                      DropdownMenuContent(align="end")
                        DropdownMenuItem(class="gap-2 cursor-pointer" @click="openEdit(cert)")
                          Pencil(class="h-4 w-4")
                          | Bearbeiten
                        DropdownMenuSeparator
                        DropdownMenuItem(class="gap-2 cursor-pointer text-destructive focus:text-destructive" @click="deletingCert = cert")
                          Trash2(class="h-4 w-4")
                          | Löschen

  //- Edit Dialog
  Dialog(:open="!!editingCert" @update:open="v => { if (!v) editingCert = null }")
    DialogContent(class="sm:max-w-md")
      DialogHeader
        DialogTitle Zertifikat bearbeiten
        DialogDescription Metadaten des Zertifikats aktualisieren.
      div(class="flex flex-col gap-4 py-2")
        div(class="flex flex-col gap-2")
          Label Titel
          Input(v-model="editForm.title" placeholder="Titel")
        div(class="flex flex-col gap-2")
          CalendarInput(label="Ausgestellt am" id="create_issued_at" v-model="editForm.issued_at")
        div(class="flex flex-col gap-2")
          CalendarInput(label="Gültig bis" id="create_expires_at" v-model="editForm.expires_at")
        div(class="flex flex-col gap-2")
          Label Beschreibung (optional)
          Input(v-model="editForm.description" placeholder="Kurze Beschreibung...")
      DialogFooter
        Button(variant="ghost" @click="editingCert = null") Abbrechen
        Button(variant="brand" @click="submitEdit" :disabled="isSaving" class="gap-2")
          Loader2Icon(v-if="isSaving" class="w-4 h-4 animate-spin")
          | {{ isSaving ? 'Speichern...' : 'Speichern' }}

  //- Delete Dialog
  AlertDialog(:open="!!deletingCert")
    AlertDialogContent
      AlertDialogHeader
        AlertDialogTitle Zertifikat löschen?
        AlertDialogDescription Diese Aktion kann nicht rückgängig gemacht werden.
      div(v-if="deletingCert" class="rounded-md border p-4 bg-muted/50 text-sm")
        p(class="font-bold") {{ deletingCert.title }}
        p(class="text-muted-foreground") Gültig bis: {{ formatDate(deletingCert.expires_at) }}
      AlertDialogFooter
        AlertDialogCancel(@click="deletingCert = null") Abbrechen
        AlertDialogAction(class="bg-destructive hover:bg-destructive/90" @click="submitDelete") Löschen


//- Dialog zum geöffneten Pdf
Dialog(v-model:open="isPdfOpen" @update:open="v => { if (!v) { pdfUrl = null; isRendering = false } }")
  DialogContent(class="max-w-4xl w-full h-[90vh] flex flex-col p-0")
    DialogHeader(class="px-6 pt-6 pb-4 border-b shrink-0 flex flex-row items-center gap-8")
      DialogTitle {{ selectedCertTitle }}
      Button(
        v-if="pdfUrl"
        @click="downloadPdf"
        class="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-all text-xs font-medium border border-border"
      )
        DownloadIcon(class="w-4 h-4")
        span Download
    div(class="relative flex-1 bg-muted/30 overflow-y-auto p-4 md:p-8 custom-scrollbar")
      transition(name="fade")
        div(v-if="isRendering" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm")
          div(class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin")
          p(class="mt-4 text-xs font-medium text-muted-foreground") PDF wird gerendert...
      div(class="w-full max-w-4xl mx-auto")
        vue-pdf-embed(
          v-if="pdfUrl"
          :source="pdfUrl"
          class="pdf-dialog-canvas shadow-2xl rounded-sm border border-border"
          @rendered="isRendering = false"
        )

</template>


<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import VuePdfEmbed from 'vue-pdf-embed'
import { PlusIcon, FileTextIcon, UploadIcon, Loader2Icon, XIcon, MoreVertical, Pencil, Trash2, Award, DownloadIcon } from 'lucide-vue-next'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DonutChart } from '@/components/ui/chart-donut'
import { toast } from 'vue-sonner'
import { userService, type User } from '@/services/user.service'
import { certificateService, type Certificate } from '@/services/certificate.service'
import CalendarInput from '../../generic/CalendarInput.vue'

const props = defineProps<{
  user: User
}>()

const affectedUser = ref<User>()
const certificates = ref<Certificate[]>([])
const isLoaded = ref(false)

// --- Helpers ---
const formatDate = (dateString: string | Date) => {
  if (!dateString) return '—'
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString))
}

const toInputDate = (date: string | Date | null) => {
  if (!date) return ''
  return new Date(date)
}

const isExpired = (dateString: string | Date) => {
  if (!dateString) return false
  return new Date(dateString) < new Date()
}

const isExpiringSoon = (dateString: string | Date) => {
  if (!dateString) return false
  const exp = new Date(dateString)
  const today = new Date()
  if (exp < today) return false
  const threeMonths = new Date()
  threeMonths.setMonth(today.getMonth() + 3)
  return exp <= threeMonths
}

// --- DonutChart ---
const statsData = computed(() => {
  let valid = 0, warning = 0, expired = 0
  certificates.value.forEach(c => {
    if (isExpired(c.expires_at)) expired++
    else if (isExpiringSoon(c.expires_at)) warning++
    else valid++
  })
  return [
    { name: 'Gültig', count: valid },
    { name: 'Muss bald erneuert werden', count: warning },
    { name: 'Abgelaufen', count: expired },
  ]
})

// --- Create ---
const isCreateOpen = ref(false)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const createForm = ref({ title: '', description: '', issued_at: '', expires_at: '' })

const isCreateValid = computed(() =>
  !!selectedFile.value &&
  createForm.value.title.trim().length > 0 &&
  !!createForm.value.expires_at
)

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) validateAndSet(file)
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
    toast.error('Datei zu groß', { description: 'Maximale Dateigröße: 10 MB.' })
    return
  }
  selectedFile.value = file
  if (!createForm.value.title) createForm.value.title = file.name.replace(/\.pdf$/i, '')
}

function clearFile() {
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function resetCreate() {
  selectedFile.value = null
  createForm.value = { title: '', description: '', issued_at: '', expires_at: '' }
  if (fileInput.value) fileInput.value.value = ''
}

async function submitCreate() {
  if (!isCreateValid.value || !selectedFile.value || !affectedUser.value) return
  isUploading.value = true
  try {
    await certificateService.uploadCertificateForUser(affectedUser.value.id, selectedFile.value, createForm.value)

    toast.success('Zertifikat hochgeladen')
    isCreateOpen.value = false
    resetCreate()
    await refreshData()
  } catch {
    toast.error('Fehler beim Hochladen')
  } finally {
    isUploading.value = false
  }
}

// --- Edit ---
const editingCert = ref<Certificate | null>(null)
const isSaving = ref(false)
const editForm = ref({ title: '', description: '', issued_at: '' as string | undefined, expires_at: '' as string | undefined })

function openEdit(cert: Certificate) {
  editingCert.value = cert
  editForm.value = {
    title: cert.title,
    description: cert.description ?? '',
    issued_at: cert.issued_at ? new Date(cert.issued_at).toISOString().split('T')[0] : undefined,
    expires_at: cert.expires_at ? new Date(cert.expires_at).toISOString().split('T')[0] : undefined,
  }
}

async function submitEdit() {
  if (!editingCert.value || !affectedUser.value) return
  isSaving.value = true
  try {

    await certificateService.updateCertificateForUser(affectedUser.value.id, editingCert.value.id, editForm.value)

    toast.success('Zertifikat aktualisiert')
    editingCert.value = null
    await refreshData()
  } catch {
    toast.error('Fehler beim Speichern')
  } finally {
    isSaving.value = false
  }
}

// --- Delete ---
const deletingCert = ref<Certificate | null>(null)

async function submitDelete() {
  if (!deletingCert.value || !affectedUser.value) return
  try {

    await certificateService.deleteCertificateForUser(affectedUser.value.id, deletingCert.value.id)
    
    toast.success('Zertifikat gelöscht')
    deletingCert.value = null
    await refreshData()
  } catch {
    toast.error('Fehler beim Löschen')
  }
}

const isPdfOpen = ref(false)
const pdfUrl = ref<string | null>(null)
const selectedCertTitle = ref('')
const isRendering = ref(false)

async function openPdf(cert: Certificate) {
  selectedCertTitle.value = cert.title
  isPdfOpen.value = true
  isRendering.value = true
  pdfUrl.value = await certificateService.getCertificateByUserId(affectedUser.value!.id, cert.id)
}


watch(() => pdfUrl.value, (newUrl) => {
  if (newUrl) isRendering.value = true
})

function downloadPdf() {
  if (!pdfUrl.value) return
  const link = document.createElement('a')
  link.href = pdfUrl.value
  link.download = `${selectedCertTitle.value.replace(/\s+/g, '_')}.pdf`
  link.click()
}

// --- Data ---
async function refreshData() {

  certificates.value = await certificateService.listCertificatesByUserId(affectedUser.value?.id!)

}

onMounted(async () => {
  affectedUser.value = await userService.getUserById(props.user.id)

  await refreshData()

  isLoaded.value = true
})
</script>

<style lang="css" scoped>
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