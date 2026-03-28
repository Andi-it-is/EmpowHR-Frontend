<template lang="pug">
h2 {{ greeting }} Max Mustermann
p(class="text-muted-foreground") Hier kannst du deine Stammdaten einsehen und bearbeiten.

//- Section with the CompanyBanner
div(class="grid xl:grid-cols-10 grid-cols-1 gap-8")
  CompanyBanner(:user="userData" class="xl:col-span-3 xl:col-start-4 xl:col-end-7") 

Separator(class="my-4")
div(class="grid xl:grid-cols-10 grid-cols-1 gap-8")

  //- Section with the DescriptionsList.
  Card(class="xl:col-span-6")
    CardHeader
      div(class="flex items-center justify-between")
        div(class="flex flex-col gap-2")
          CardTitle Stammdaten
          CardDescription Persönliche Angaben & Kontaktdaten
        div(class="flex gap-4") 
          Button(v-if="!editView" variant="outline" size="sm" @click="enableEditView()") Bearbeiten
            Pencil(v-if="!editView" :size="16")
          
          Button(v-if="editView" variant="outline" size="sm" @click="resetData()") Abbrechen
          Button(v-if="editView" variant="positive" size="sm" @click="saveData()") Speichern
            Save(:size="16")
    
    CardContent(class="flex flex-col gap-4" v-if="!editView")
      DescriptionList(:data="dlName" :labels="nameLabels" title="Name")
      DescriptionList(:data="dlAdress" :labels="adressLabels" title="Anschrift")
      DescriptionList(:data="dlContact" :labels="contactLabels" title="Kontakt")
      DescriptionList(:data="dlPayment" :labels="paymentLabels" title="Zahlung")
    CardContent(class="flex flex-col gap-4" v-if="editView")
      pre TODO. Hier wären jetzt die selben Felder aus der Leseansicht, aber zum Bearbeiten
      Input
      Input
      Input
      Input
      Input

  //- Section with the Acitivty Log
  ActivityLog(:activity-log="activityLog" class="xl:col-span-4 h-fit")

</template>


<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import ActivityLog from '@/components/app/profile/ActivityLog.vue';
import CompanyBanner from '@/components/app/profile/CompanyBanner.vue';
import DescriptionList from '@/components/app/generic/DescriptionList.vue';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Pencil, Save } from 'lucide-vue-next'
import dayjs from 'dayjs'
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner'
import Input from '@/components/ui/input/Input.vue';

const router = useRouter()

// 0-11 Guten Morgen ; 12-18 Guten Tag ; 19-23 Guten Abend 
const hour = dayjs().hour() 
const greeting = hour <= 11 ? 'Guten Morgen' : hour <= 18 ? 'Guten Tag' : 'Guten Abend'


const dlName = {
  firstName: 'Max',
  lastName: 'Mustermann',
}

const dlAdress = {
  address: 'Toulouser Allee 53',
  postalCode: '40476',
  city: 'Düsseldorf',
  country: 'Deutschland',
}

const dlContact = {
  mobileBusiness: '+49 123 4567890',
  mobilePrivate: '+49 098 7654321',
  email: 'm.mustermann@firma.de',
}

const dlPayment = {
  bankDetails: 'DE00 **** **** **** **** 00',
}

const nameLabels = {
  firstName: 'Vorname',
  lastName: 'Nachname',
}

const adressLabels = {
  address: 'Adresse',
  postalCode: 'Postleitzahl',
  city: 'Stadt',
  country: 'Land',
}

const contactLabels = {
  mobileBusiness: 'Telefonnummer (Geschäftlich)',
  mobilePrivate: 'Telefonnummer (Privat)',
  email: 'E-Mail (Geschäftlich)',
}

const paymentLabels = {
  bankDetails: 'Bankinformation',
}

const userData = {
  fullName: 'Max Mustermann',
  position: 'Software Engineer',
  department: 'IT@EmpowHR ',
  email: 'm.mustermann@firma.de',
  location: 'Düsseldorf',
  startDate: '2019-03-01',
  status: 'active',
}

const activityLog = [
  { id: 1, field: 'Adresse', changedBy: 'Max Mustermann', changedAt: '2026-03-25' },
  { id: 2, field: 'Telefonnummer (Privat)', changedBy: 'Max Mustermann', changedAt: '2026-03-20' },
  { id: 3, field: 'Bankverbindung', changedBy: 'HR · Sandra Klein', changedAt: '2026-02-10' },
]

const editView = ref(false)
function enableEditView() {
  editView.value = !editView.value
}


function resetData() {
  editView.value = false
  // reset form
}

function saveData() {
  // check if there are actually changes, compared to a copy of the previous initial object

  // api call
  toast.success('Stammdaten aktualisiert', {
    description: 'Deine Änderungen wurden erfolgreich übernommen.',
  })
  editView.value = false
}
onMounted(() => {

})

</script>

<style lang="css" scoped>

</style>
