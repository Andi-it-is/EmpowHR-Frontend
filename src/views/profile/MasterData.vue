<template lang="pug">
div(v-if="!isLoaded" class="flex flex-col items-center gap-3 p-8")
  Skeleton(class="h-20 w-20 rounded-full bg-muted-foreground/20")
  Skeleton(class="h-4 w-32 bg-muted-foreground/20")
  Skeleton(class="h-3 w-24 bg-muted-foreground/20")
  Skeleton(class="h-5 w-16 bg-muted-foreground/20")
  Skeleton(class="h-px w-full bg-muted-foreground/20")
  div(class="w-full flex flex-col gap-3 mt-1")
    Skeleton(class="h-3 w-full bg-muted-foreground/20")
    Skeleton(class="h-3 w-full bg-muted-foreground/20")
    Skeleton(class="h-3 w-full bg-muted-foreground/20")
    
div(v-else)
  h1(tabindex="0" class="mb-2") {{ greeting }} {{ groupedMasterDataObject.other.fullname }}
  p(class="text-muted-foreground" tabindex="0") Hier kannst du deine Stammdaten einsehen und bearbeiten.

  //- pre {{ groupedMasterDataObject }}

  //- Section with the CompanyBanner
  div(class="grid xl:grid-cols-10 grid-cols-1 gap-8")
    CompanyBanner(:data="groupedMasterDataObject.other" class="xl:col-span-3 xl:col-start-4 xl:col-end-7") 

  Separator(class="my-4")
  div(class="grid xl:grid-cols-10 grid-cols-1 gap-8")

    //- Section with the DescriptionsList.
    Card(class="xl:col-span-6")
      CardHeader
        div(class="flex items-center justify-between")
          div(class="flex flex-col gap-2")
            CardTitle Stammdaten
            CardDescription Persönliche Angaben & Kontaktdaten
      
      CardContent(class="flex flex-col gap-8")
        DynamicDataList(
          :data="groupedMasterDataObject.address.values" 
          :labels="groupedMasterDataObject.address.labels"
          title="Anschrift"
          ref="addressListRef"
          @save="(patchData) => onSave(patchData, 'address')"
        )
        DynamicDataList(
          :data="groupedMasterDataObject.payment.values" 
          :labels="groupedMasterDataObject.payment.labels" 
          title="Zahlung"
          ref="paymentListRef"
          @save="(patchData) => onSave(patchData, 'payment')"
          isSensitive=true
        )
        DynamicDataList(
          :data="groupedMasterDataObject.name.values" 
          :labels="groupedMasterDataObject.name.labels" 
          readonly=true
          title="Person"
        )
        DynamicDataList(
          :data="groupedMasterDataObject.contact.values" 
          :labels="groupedMasterDataObject.contact.labels"
          readonly=true
          title="Kontakt"
        )

    //- Section with the Acitivty Log
    ActivityLog(
      title="Letzte Änderungen an den Stammdaten"
      :data="changeLogs"
      :labels="activityLogsLabelMap"
      :sensitive-fields="['banking_detail']"
      class="xl:col-span-4 h-fit"
    )
</template>


<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import ActivityLog from '@/components/app/generic/ActivityLog.vue';
import CompanyBanner from '@/components/app/profile/CompanyBanner.vue';
import DynamicDataList from '@/components/app/generic/DynamicDataList.vue';
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
import { onMounted, ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner'
import Input from '@/components/ui/input/Input.vue';
import { userMasterDataService } from '@/services/userMasterData.service';
import { DynamicDataListType } from '@/constants/enums/componentHelpers.enum';
import { changeLogsService } from '@/services/changeLogs.service';
import { Skeleton } from '@/components/ui/skeleton'
import { isoToGermanDate } from '@/lib/dateHelpers';

const router = useRouter()

// 0-11 Guten Morgen ; 12-18 Guten Tag ; 19-23 Guten Abend 
const hour = dayjs().hour() 
const greeting = hour <= 11 ? 'Guten Morgen' : hour <= 18 ? 'Guten Tag' : 'Guten Abend'

const addressListRef = ref()
const paymentListRef = ref()

const refMap: Record<string, Ref> = {
  address: addressListRef,
  payment: paymentListRef,
}

async function onSave(patchData: Record<string, any>, key: string) {
  await userMasterDataService.updateMasterData(patchData)
  toast.success('Aktualisiert', {
    description: 'Deine Änderungen wurden erfolgreich übernommen.',
  })
  refMap[key]!.value?.closeEditMode()

  // get all data

  // get the loggs
  await getChangeLogs()
}


const changeLogs = ref()
const masterDataObject = ref()
const groupedMasterDataObject = ref({
  name: {values: {}, labels: {}},
  address: {values: {}, labels: {}},
  contact: {values: {}, labels: {}},
  payment: {values: {}, labels: {}},
  other: {}
})
const activityLogsLabelMap = ref()

const isLoaded = ref(false)


function groupMasterDataForDisplay() {

  // sublist Person
  groupedMasterDataObject.value.name.values = {
    firstname: masterDataObject.value.user.firstname,
    lastname: masterDataObject.value.user.lastname,
    date_of_birth: isoToGermanDate(masterDataObject.value.date_of_birth),
  }
  groupedMasterDataObject.value.name.labels = {
    firstname: "Vorname",
    lastname: "Nachname",
    date_of_birth: "Geburtsdatum",
  }
  
  // sublist Anschrift
  groupedMasterDataObject.value.address.values = {
    street: masterDataObject.value.street,
    zipcode: masterDataObject.value.zipcode,
    city: masterDataObject.value.city,
    country: masterDataObject.value.country,
  }
  groupedMasterDataObject.value.address.labels = {
    street: "Straße",
    zipcode: "Postleitzahl",
    city: "Stadt",
    country: "Land",
  }
  
  // sublist Contact
  groupedMasterDataObject.value.contact.values = {
    telephone_business: masterDataObject.value.telephone_business,
    telephone_private: masterDataObject.value.telephone_private,
    email: masterDataObject.value.user.email,
    company_alias: masterDataObject.value.company_alias
  }
  groupedMasterDataObject.value.contact.labels = {
    telephone_business: 'Telefonnummer (Geschäftlich)',
    telephone_private: 'Telefonnummer (Privat)',
    email: 'E-Mail (Geschäftlich)',
    company_alias: "Firmenkennung"
  }

  // sublist payment
  groupedMasterDataObject.value.payment.values = {
    banking_detail: masterDataObject.value.banking_detail
  }
  groupedMasterDataObject.value.payment.labels = {
    banking_detail: 'Bankinformation'
  }

  // used for the CompanyBanner Card that has some additional infos
  groupedMasterDataObject.value.other = {
    fullname: `${masterDataObject.value.user.firstname} ${masterDataObject.value.user.lastname}`,
    job_title: masterDataObject.value.job_title,
    department_name: masterDataObject.value.firstname,
    disabled: masterDataObject.value.user.disabled,
    email: masterDataObject.value.user.email,
    city: masterDataObject.value.city,
    started_working_date: masterDataObject.value.started_working_date
  }

}

async function getChangeLogs() {

  changeLogs.value = await changeLogsService.getLogsById(masterDataObject.value.id)
  activityLogsLabelMap.value = Object.values(groupedMasterDataObject.value).reduce((acc, group) => {
    return { ...acc, ...(group as any).labels }
  }, {} as Record<string, string>)
}

onMounted( async() => {
  masterDataObject.value = await userMasterDataService.getMasterData()

  groupMasterDataForDisplay()
  await getChangeLogs()

  isLoaded.value = true
})

</script>

<style lang="css" scoped>

</style>
