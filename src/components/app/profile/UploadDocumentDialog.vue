<template lang="pug">
Dialog(v-model:open="open")
  DialogTrigger(as-child)
    slot

  DialogContent(class="sm:max-w-md")
    DialogHeader
      DialogTitle Dokument hochladen
      DialogDescription Lade ein PDF-Dokument hoch. Maximale Dateigröße: 10 MB.

    div(class="flex flex-col gap-4 py-2")

      //- Datei-Drop-Zone
      div(
        class="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/30 relative"
        :class="{ 'border-primary bg-primary/5': selectedFile }"
        @click="fileInput?.click()"
        @dragover.prevent
        @drop.prevent="onDrop"
      )
        //- Clear Button
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
        Input(id="title" v-model="form.title" placeholder="z.B. Arbeitsvertrag 2025")

      //- Typ
      div(class="flex flex-col gap-2")
        Label(for="type") Kategorie
        Select(v-model="form.type")
          SelectTrigger
            SelectValue(placeholder="Kategorie wählen")
          SelectContent
            SelectItem(
              v-for="opt in documentTypes"
              :key="opt.value"
              :value="opt.value"
            ) {{ opt.label }}

      //- Security Level
      div(class="flex flex-col gap-2")
        Label(for="security_level") Vertraulichkeit
        Select(v-model="form.security_level")
          SelectTrigger
            SelectValue(placeholder="Vertraulichkeit wählen")
          SelectContent
            SelectItem(
              v-for="opt in securityLevels"
              :key="opt.value"
              :value="opt.value"
            ) {{ opt.label }}

    DialogFooter
      Button(variant="ghost" @click="open = false" :disabled="isUploading") Abbrechen
      Button(variant="brand" @click="submit" :disabled="isUploading || !isValid" class="gap-2")
        Loader2Icon(v-if="isUploading" class="w-4 h-4 animate-spin")
        UploadIcon(v-else class="w-4 h-4")
        | {{ isUploading ? 'Wird hochgeladen...' : 'Hochladen' }}
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileTextIcon, UploadIcon, Loader2Icon, XIcon } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'vue-sonner'
import { documentService } from '@/services/document.service'
import { DocumentType, DocumentSecurityLevel, DocumentTypeLabels, DocumentSecurityLevelLabels, DocumentSecurityLevelApiMap } from '@/constants/enums/document.enum'

const emit = defineEmits<{
  uploaded: []
}>()

const open = ref(false)
const isUploading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

const form = ref<{
  title: string
  type: DocumentType | ''
  security_level: DocumentSecurityLevel | ''
}>({
  title: '',
  type: '',
  security_level: '',
})

const documentTypes = Object.values(DocumentType).map(value => ({
  value,
  label: DocumentTypeLabels[value]
}))

const securityLevels = Object.values(DocumentSecurityLevel).map(value => ({
  value,
  label: DocumentSecurityLevelLabels[value]
}))

const isValid = computed(() =>
  !!selectedFile.value &&
  form.value.title.trim().length > 0 &&
  !!form.value.type &&
  form.value.security_level !== ''
)

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  validateAndSet(file)
}

function clearFile() {
  selectedFile.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function onDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  validateAndSet(file)
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
  if (!form.value.title) {
    form.value.title = file.name.replace(/\.pdf$/i, '')
  }
}

function reset() {
  selectedFile.value = null
  form.value = { title: '', type: '', security_level: '' }
  if (fileInput.value) fileInput.value.value = ''
}

async function submit() {
  if (!isValid.value || !selectedFile.value) return

  isUploading.value = true
  try {
    await documentService.uploadDocument(selectedFile.value, {
      title: form.value.title,
      type: form.value.type as DocumentType,
      security_level: DocumentSecurityLevelApiMap[form.value.security_level as DocumentSecurityLevel],
    })

    toast.success('Dokument hochgeladen')
    emit('uploaded')
    open.value = false
    reset()
  } catch {
    toast.error('Fehler beim Hochladen', { description: 'Bitte versuche es erneut.' })
  } finally {
    isUploading.value = false
  }
}
</script>