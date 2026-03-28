<template lang="pug">
h2 {{ greeting }} Max Mustermann
p(class="text-muted-foreground") Hier kannst du deine Stammdaten einsehen und bearbeiten.

div(class="grid xl:grid-cols-10 grid-cols-1 gap-8")

  //- Section with the CompanyBanner
  div(class="flex flex-col col-span-2 gap-4")
    CompanyBanner(:user="userData")

  //- Section with the DescriptionsList
  Card(class="col-span-4")
    CardHeader
      div(class="flex items-center justify-between")
        div(class="flex flex-col gap-2")
          CardTitle Stammdaten
          CardDescription Persönliche Angaben & Kontaktdaten
        Button(variant="outline" size="sm" @click="enableEdit")
          Pencil(:size="16")
          span Bearbeiten
    CardContent
      DescriptionList(:data="personalData" :labels="personalLabels")

  //- Section with the Acitivty Log
  ActivityLog(:activity-log="activityLog" class="col-span-4")

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

import { Pencil } from 'lucide-vue-next'
import dayjs from 'dayjs'
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()

// 0-11 Guten Morgen ; 12-18 Guten Tag ; 19-23 Guten Abend 
const hour = dayjs().hour() 
const greeting = hour <= 11 ? 'Guten Morgen' : hour <= 18 ? 'Guten Tag' : 'Guten Abend'


const personalData = {
  firstName: 'Max',
  lastName: 'Mustermann',
  pronouns: 'Er / Ihm',
  address: 'Toulouser Allee 53',
  postalCode: '40476',
  city: 'Düsseldorf',
  country: 'Deutschland',
  mobileBusiness: '+49 123 4567890',
  mobilePrivate: '+49 098 7654321',
  bankDetails: 'DE00 **** **** **** **** 00',
}

const personalLabels = {
  firstName: 'Vorname',
  lastName: 'Nachname',
  pronouns: 'Pronomen',
  address: 'Adresse',
  postalCode: 'Postleitzahl',
  city: 'Stadt',
  country: 'Land',
  mobileBusiness: 'Telefonnummer (Geschäftlich)',
  mobilePrivate: 'Telefonnummer (Privat)',
  bankDetails: 'Bankinformation',
}

const userData = {
  fullName: 'Max Mustermann',
  position: 'Senior Developer',
  department: 'Entwicklung',
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

onMounted(() => {

})

</script>

<style lang="css" scoped>

</style>
