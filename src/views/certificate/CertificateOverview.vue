<template lang="pug">

//- Loading State
div(v-if="!isLoaded" class="flex flex-col gap-4 w-full")
  div(class="flex flex-col gap-3")
    div(class="flex justify-between items-center py-4")
      div(class="flex flex-col gap-2")
        Skeleton(class="h-5 w-48 bg-muted-foreground/20")
        Skeleton(class="h-3 w-32 bg-muted-foreground/20")
      Skeleton(class="h-8 w-8 bg-muted-foreground/20")
    Skeleton(class="h-37.5 w-full rounded-xl bg-muted-foreground/20")

//- Content State
div(v-else class="flex flex-col gap-6")
  
  //- Header
  div
    h1(tabindex="0" class="mb-2") Zertifikate
    p(class="text-muted-foreground max-w-175" tabindex="0")
      | Hier findest du alle relevanten Informationen hinsichtlich Zertifikaten, Schulungen, 
      | Lehrgängen und Unterweisungen innerhalb deines Arbeitslebens.

  Separator(class="my-4")

  div(class="flex justify-center")
    Card(class="w-fit")
      CardHeader(class="pb-2 border-b p-6")
        CardTitle(class="text-md") Aktuelle Gültigkeit deiner Zertifikate
      CardContent(class="xl:p-4 xl:pb-6 w-fit")
        div(class="w-full mt-6 relative xl:px-32 max-w-80 md:max-w-full mx-auto")
          DonutChart(
            :data="statsData"
            :category="'count'"
            :index="'name'"
            :colors="['#22c55e', '#f59e0b', '#ef4444']"
            :show-tooltip="true"
            :show-legend="true"
            :show-label="false"
            :arc-width="40"
            class="h-full w-full"
          )
          //- custom label in the middle
          div(class="absolute inset-0 flex flex-col items-center justify-center mb-16 md:mb-8 pointer-events-none")
            span(class="text-4xl font-bold leading-none") {{ certificates.length }}
            span(class="text-[10px] text-muted-foreground uppercase font-medium tracking-wider") Gesamt
            

  Separator(class="my-4")

  //- Filter & Suche
  Card
    CardContent(class="p-4")
      div(class="flex flex-col md:flex-row md:items-center justify-between gap-3")
        
        //- Ergebnisanzeige
        p(class="text-sm text-muted-foreground shrink-0")
          | {{ filteredCertificates.length }} {{ filteredCertificates.length === 1 ? 'Eintrag' : 'Einträge' }}

        div(class="flex flex-col sm:flex-row gap-4")
          //- Suche
          div(class="relative w-full sm:max-w-sm")
            Search(class="absolute inset-y-0 left-3 my-auto h-4 w-4 text-muted-foreground")
            Input(
              v-model="searchQuery"
              placeholder="Zertifikat suchen..."
              class="pl-9 min-w-75 border-2 border-brand"
            )
          
          //- Sortierung
          Select(v-model="sortOrder")
            SelectTrigger(class="w-16 px-0 justify-center")
              ArrowUpNarrowWide(v-if="sortOrder === 'asc'" class="h-4 w-4 text-muted-foreground")
              ArrowDownNarrowWide(v-else class="h-4 w-4 text-muted-foreground")
            SelectContent
              SelectItem(value="asc") Gültig bis: Aufsteigend
              SelectItem(value="desc") Gültig bis: Absteigend

  
  div(class="min-h-150")
    //- Empty State
    div(v-if="filteredCertificates.length === 0" class="py-12 text-center text-muted-foreground border rounded-xl border-dashed")
      p Keine Zertifikate hinterlegt.

    //- Certificate Grid
    div(v-if="filteredCertificates.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8")
      Card(
        v-for="cert in filteredCertificates" 
        :key="cert.id"
        class="flex flex-col transition-colors"
        :class="{ 'border-destructive': isExpired(cert.expires_at), 'border-warning': isExpiringSoon(cert.expires_at), 'border-positive': !isExpired(cert.expires_at) && !isExpiringSoon(cert.expires_at) }"
      )
        CardHeader
          div(class="flex items-start flex-wrap justify-between gap-4")
            div(class="space-y-1")
              CardTitle(class="text-md line-clamp-1" :title="cert.title") {{ cert.title }}
              CardDescription(class="line-clamp-2 xl:max-w-100 max-w-50" :title="cert.description") {{ cert.description }}
            
            //- Status Badges
            Badge(v-if="isExpired(cert.expires_at)" variant="destructive" class="shrink-0")
              | Abgelaufen
            Badge(v-else-if="isExpiringSoon(cert.expires_at)" variant="warning" class="shrink-0")
              | Läuft bald ab
            Badge(v-else variant="positive" class="shrink-0")
              | Gültig

        CardContent(class="flex-1")
          div(class="flex flex-col gap-2 text-sm")
            div(class="flex justify-between items-center")
              span(class="text-muted-foreground") Ausgestellt am:
              span {{ formatDate(cert.issued_at) }}
            div(class="flex justify-between items-center")
              span(class="text-muted-foreground") Gültig bis:
              span(
                class="font-medium"
              ) {{ formatDate(cert.expires_at) }}

        CardFooter(class="pt-4 border-t")
          Button(variant="secondary" class="w-full" @click="openCertificate(cert)")
            FileText(class="h-4 w-4 mr-2")
            | Zertifikat ansehen

  Dialog(v-model:open="isPdfDialogOpen" @update:open="onDialogClose")
    DialogContent(class="max-w-4xl w-full h-[90vh] flex flex-col p-0")
      DialogHeader(class="px-6 pt-6 pb-4 border-b shrink-0")
        DialogTitle {{ selectedCertificateName }}
      div(class="flex-1 overflow-hidden p-8")
        iframe(
          v-if="pdfUrl"
          :src="pdfUrl"
          class="w-full h-full border-0"
          type="application/pdf"
        )
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DonutChart } from '@/components/ui/chart-donut'
import { Search, ArrowUpNarrowWide, ArrowDownNarrowWide } from 'lucide-vue-next'
import { certificateService, type Certificate } from '@/services/certificate.service'

const isLoaded = ref(false)
const certificates = ref<Certificate[]>([])

// --- Hilfsfunktionen für die Datumslogik ---

const formatDate = (dateString: string | Date) => {
  if (!dateString) return 'Unbekannt'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

const isExpired = (dateString: string | Date) => {
  if (!dateString) return false
  const expiryDate = new Date(dateString)
  const today = new Date()
  return expiryDate < today
}

const isExpiringSoon = (dateString: string | Date) => {
  if (!dateString) return false
  
  const expiryDate = new Date(dateString)
  const today = new Date()
  
  // Wenn es schon abgelaufen ist, greift die isExpired Logik
  if (expiryDate < today) return false 

  // Datum in 3 Monaten berechnen
  const threeMonthsFromNow = new Date()
  threeMonthsFromNow.setMonth(today.getMonth() + 3)

  return expiryDate <= threeMonthsFromNow
}


const isPdfDialogOpen = ref(false)
const selectedCertificateName = ref()
const pdfUrl = ref<string | null>(null)

const openCertificate = async (cert: Certificate) => {
  pdfUrl.value = await certificateService.getCertificateById(String(cert.id))
  selectedCertificateName.value = cert.title
  isPdfDialogOpen.value = true
}

// States für Filter
const searchQuery = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')

// 1. Statistik-Daten für das Chart berechnen
const statsData = computed(() => {
  const counts = {
    Gültig: 0,
    Warnung: 0,
    Abgelaufen: 0
  }

  certificates.value.forEach(cert => {
    if (isExpired(cert.expires_at)) counts.Abgelaufen++
    else if (isExpiringSoon(cert.expires_at)) counts.Warnung++
    else counts.Gültig++
  })

  return [
    { name: 'Gültig', count: counts.Gültig },
    { name: 'Muss bald erneuert werden', count: counts.Warnung },
    { name: 'Abgelaufen', count: counts.Abgelaufen }
  ]
})

// 2. Gefilterte und sortierte Liste
const filteredCertificates = computed(() => {
  let list = [...certificates.value]

  // Suche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    list = list.filter(c => 
      c.title.toLowerCase().includes(query) || 
      c.description.toLowerCase().includes(query)
    )
  }

  // Sortierung nach Ablaufdatum
  list.sort((a, b) => {
    const dateA = new Date(a.expires_at).getTime()
    const dateB = new Date(b.expires_at).getTime()
    return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA
  })

  return list
})


onMounted( async() => {

  certificates.value = await certificateService.listCertificates()

  isLoaded.value = true
})
</script>


<style scoped>

</style>