<template lang="pug">
div
  div(class="flex justify-between py-4")  
    h4 {{ title }}
    div(class="flex gap-4" v-if="!props.readonly")
      Button(v-if="listMode === DynamicDataListType.READ" variant="brand-outline" size="sm" @click="enableEditView()") Bearbeiten
        Pencil(:size="16")
      Button(v-if="listMode === DynamicDataListType.EDIT" variant="brand-outline" size="sm" @click="resetData()")
        XCircle(:size="16") 
        | Abbrechen
      Button(v-if="listMode === DynamicDataListType.EDIT" variant="brand" size="sm" @click="saveData()") Speichern
        Save(:size="16")
  div(class="flex flex-col gap-4 border p-4 rounded-md lg:w-full")
    template(v-for="(value, key, index) in data" :key="key")
      div(class="flex flex-col sm:flex-row justify-between xl:gap-8 gap-2 text-sm items-center")
        span(class="flex flex-wrap text-muted-foreground xl:min-w-32 lg:min-w-24 md:min-w-16 sm:min-w-2") {{ labels?.[String(key)] ?? formatKey(String(key)) }}
        
        //- Edit Mode: Zeige das Input-Feld und binde es direkt an data[key]
        template(v-if="listMode === DynamicDataListType.EDIT")
          Input(
            v-model="data[key]" 
            class="font-medium w-full sm:max-w-[50%]"
          )
        
        //- Read Mode: Zeige einfachen Text
        template(v-else)
          span(class="font-medium") {{ getDisplayValue(value) || '' }}
          
      Separator(v-if="index < Object.keys(data || {}).length - 1")
</template>

<script setup lang="ts">
import { Pencil, Save, XCircle } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue';
import { Separator } from '@/components/ui/separator'
import Input from '@/components/ui/input/Input.vue'
import { onMounted, ref } from 'vue';
import { DynamicDataListType } from '@/constants/enums/componentHelpers.enum';
import { toast } from 'vue-sonner'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { userMasterDataService } from '@/services/userMasterData.service';


const props = defineProps<{
  title: string
  readonly: boolean
  isSensitive: boolean
}>()

const data = defineModel<Record<string, string | number | null | undefined>>('data', { required: true })
const labels = defineModel<Record<string, string>>('labels')

const originalData = ref<string>('')

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

function censorString(str: string) {
  if (!str || str.length <= 6) return str; // Zu kurz zum Zensieren

  // Wir teilen den String in 3 Teile:
  // 1. Die ersten 4 Zeichen
  const start = str.slice(0, 4);
  // 2. Die letzten 2 Zeichen
  const end = str.slice(-2);
  // 3. Den Mittelteil, in dem wir alles außer Leerzeichen ersetzen
  const middle = str.slice(4, -2).replace(/\S/g, '*');

  return start + middle + end;
}

function getDisplayValue(str: string) {
  if (props.isSensitive) {
    return censorString(str)
  } else {
    return str
  }
}

const listMode = ref<DynamicDataListType>( DynamicDataListType.READ )

function enableEditView() {
  originalData.value = JSON.stringify(data.value)
  listMode.value = DynamicDataListType.EDIT
}

function resetData() {
  data.value = JSON.parse(originalData.value)
  listMode.value = DynamicDataListType.READ
}

async function saveData() {

  const errors: string[] = []
  
  for (const [key, value] of Object.entries(data.value)) {
    if (value === null || value === undefined || String(value).trim() === '') {
      errors.push(labels.value?.[key] ?? formatKey(key))
    }
  }

  if (errors.length > 0) {
    toast.error('Pflichtfelder fehlen', {
      description: `Bitte füllen Sie folgende Felder aus: ${errors.join(', ')}`,
    })
    return
  }

  // return immediately, if no changes were made (no need to call api)
  if (JSON.stringify(data.value) === originalData.value) {
    listMode.value = DynamicDataListType.READ
    return
  }

  const patchData: Record<string, any> = {};

  const original = JSON.parse(originalData.value);

  Object.keys(data.value).forEach(key => {
    if (data.value[key] !== original[key]) {

      patchData[key] = data.value[key];
    }
  });

  const result = await userMasterDataService.updateMasterData(patchData)
  
  toast.success('Stammdaten aktualisiert', {
    description: 'Deine Änderungen wurden erfolgreich übernommen.',
  })
  
  listMode.value = DynamicDataListType.READ
}
</script>