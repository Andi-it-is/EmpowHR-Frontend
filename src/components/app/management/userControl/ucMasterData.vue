<template lang="pug">

//- Header mit User Info
div(class="flex items-center justify-between mb-8")
  div
    h2(class="text-xl font-semibold") Stammdaten verwalten
    p(class="text-sm text-muted-foreground mt-0.5") 
      | Stammdaten von 
      span(class="font-medium text-foreground") {{ affectedUser?.firstname }} {{ affectedUser?.lastname }}

div(class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4")
  Card(class="col-span-2")
    CardContent(class="flex flex-col gap-8 pt-4")
      DynamicDataList(
        :data="groupedMasterDataObject.name.values"
        :labels="groupedMasterDataObject.name.labels"
        title="Person"
        ref="nameListRef"
        @save="(patchData) => onSave(patchData, 'name')"
      )
  Card(class="col-span-2")
    CardContent(class="flex flex-col gap-8 pt-4")
      DynamicDataList(
        :data="groupedMasterDataObject.address.values"
        :labels="groupedMasterDataObject.address.labels"
        title="Anschrift"
        ref="addressListRef"
        @save="(patchData) => onSave(patchData, 'address')"
      )
  Card(class="col-span-2")
    CardContent(class="flex flex-col gap-8 pt-4")
      DynamicDataList(
        :data="groupedMasterDataObject.contact.values"
        :labels="groupedMasterDataObject.contact.labels"
        title="Kontakt"
        ref="contactListRef"
        @save="(patchData) => onSave(patchData, 'contact')"
      )
  Card(class="col-span-2")
    CardContent(class="flex flex-col gap-8 pt-4")
      DynamicDataList(
        :data="groupedMasterDataObject.other.values"
        :labels="groupedMasterDataObject.other.labels"
        title="Unternehmensdaten"
        ref="otherListRef"
        @save="(patchData) => onSave(patchData, 'other')"
      )

</template>

<script setup lang="ts">
import { userService, type User } from '@/services/user.service'
import { userMasterDataService, type UserMasterData } from '@/services/userMasterData.service';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import DynamicDataList from '../../generic/DynamicDataList.vue';
import { onMounted, ref, type Ref } from 'vue';
import { isoToGermanDate } from '@/lib/dateHelpers';
import { toast } from 'vue-sonner';

const props = defineProps<{
  user: User
}>()

const nameListRef    = ref()
const addressListRef = ref()
const contactListRef = ref()
const otherListRef   = ref()

const refMap: Record<string, Ref> = {
  name:    nameListRef,
  address: addressListRef,
  contact: contactListRef,
  other:   otherListRef,
}

async function onSave(patchData: Record<string, any>, key: string) {
  await userMasterDataService.updateMasterDataById(affectedUser.value!.id!, patchData)
  toast.success('Aktualisiert', { description: 'Änderungen wurden gespeichert.' })
  refMap[key]?.value?.closeEditMode()
}

const affectedUser = ref<User>() 
const userMasterData = ref<UserMasterData>()
const isLoaded = ref(false)

const groupedMasterDataObject = ref({
  name:    { values: {}, labels: {} },
  address: { values: {}, labels: {} },
  contact: { values: {}, labels: {} },
  other:   { values: {}, labels: {} },
})

function groupUserMasterData() {
  const d: any = userMasterData.value

  groupedMasterDataObject.value.name = {
    values: {
      firstname:     d.user.firstname,
      lastname:      d.user.lastname,
      date_of_birth: isoToGermanDate(d.date_of_birth),
      job_title:     d.job_title,
    },
    labels: {
      firstname:     'Vorname',
      lastname:      'Nachname',
      date_of_birth: 'Geburtsdatum',
      job_title:     'Position',
    },
  }

  groupedMasterDataObject.value.address = {
    values: {
      street:  d.street,
      zipcode: d.zipcode,
      city:    d.city,
      country: d.country,
    },
    labels: {
      street:  'Straße',
      zipcode: 'Postleitzahl',
      city:    'Stadt',
      country: 'Land',
    },
  }

  groupedMasterDataObject.value.contact = {
    values: {
      email:              d.user.email,
      telephone_business: d.telephone_business,
      telephone_private:  d.telephone_private,
      company_alias:      d.company_alias,
    },
    labels: {
      email:              'E-Mail (Geschäftlich)',
      telephone_business: 'Telefonnummer (Geschäftlich)',
      telephone_private:  'Telefonnummer (Privat)',
      company_alias:      'Firmenkennung',
    },
  }

  groupedMasterDataObject.value.other = {
    values: {
      job_title:            d.job_title,
      started_working_date: isoToGermanDate(d.started_working_date),
      banking_detail: d.banking_detail,
    },
    labels: {
      job_title:            'Position',
      started_working_date: 'Eintrittsdatum',
      banking_detail: 'Bankinformation',
    },
  }
}

onMounted(async () => {
  affectedUser.value    = await userService.getUserById(props.user.id)
  userMasterData.value  = await userMasterDataService.getMasterDataById(affectedUser.value.id)

  groupUserMasterData()

  isLoaded.value = true
})

</script>