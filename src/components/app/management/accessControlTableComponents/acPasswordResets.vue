<template lang="pug">
div(class="flex flex-col gap-6")

  Card(class="max-w-lg")
    CardHeader
      CardTitle Passwort zurücksetzen
      CardDescription Admin-Funktion · Wirkt sofort

    CardContent
      form(class="flex flex-col gap-5" @submit.prevent="onSubmit")

        FieldGroup
          //- User Select
          VeeField(name="userId" v-slot="{ value, handleChange, errors }")
            Field(:data-invalid="errors.length > 0")
              FieldLabel Nutzer
              Select(:model-value="value" @update:model-value="handleChange")
                SelectTrigger
                  SelectValue(placeholder="Nutzer auswählen...")
                SelectContent
                  SelectItem(
                    v-for="user in props.data"
                    :key="user.id"
                    :value="user.id"
                  )
                    span {{ user.firstname }} {{ user.lastname }}
                    span(class="ml-2 text-muted-foreground text-xs") {{ user.email }}
              FieldError(:errors="errors.map(m => ({ message: m }))")

          //- Neues Passwort
          VeeField(name="new_password" v-slot="{ componentField, errors }")
            Field(:data-invalid="errors.length > 0")
              FieldLabel Neues Passwort
              div(class="relative")
                Input(
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Mind. 8 Zeichen"
                  v-bind="componentField"
                )
                Button(
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                  @click="showPassword = !showPassword"
                )
                  EyeOff(v-if="showPassword" :size="16")
                  Eye(v-else :size="16")
              FieldError(:errors="errors.map(m => ({ message: m }))")

          //- Passwort bestätigen
          VeeField(name="new_password_confirm" v-slot="{ componentField, errors }")
            Field(:data-invalid="errors.length > 0")
              FieldLabel Passwort bestätigen
              div(class="relative")
                Input(
                  :type="showConfirm ? 'text' : 'password'"
                  placeholder="Passwort wiederholen"
                  v-bind="componentField"
                )
                Button(
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                  @click="showConfirm = !showConfirm"
                )
                  EyeOff(v-if="showConfirm" :size="16")
                  Eye(v-else :size="16")
              FieldError(:errors="errors.map(m => ({ message: m }))")

          div(class="flex justify-end pt-2")
            Button(type="submit" variant="brand" :disabled="isLoading")
              Loader2(v-if="isLoading" :size="16" class="mr-2 animate-spin")
              ShieldCheck(v-else :size="16" class="mr-2")
              | Passwort zurücksetzen
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useForm, Field as VeeField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field, FieldGroup, FieldLabel, FieldError
} from '@/components/ui/field'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { userService, type User } from '@/services/user.service'

interface UserOption {
  id: string
  firstname: string
  lastname: string
  email: string
}

const users = ref<UserOption[]>([])
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)

const formSchema = toTypedSchema(
  z.object({
    userId: z
      .string({ required_error: 'Bitte einen Nutzer auswählen.' })
      .uuid('Ungültige Nutzer-ID.'),
    new_password: z
      .string({ required_error: 'Bitte ein neues Passwort eingeben.' })
      .min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein.')
      .max(100, 'Das Passwort darf maximal 100 Zeichen lang sein.'),
    new_password_confirm: z
      .string({ required_error: 'Bitte das Passwort bestätigen.' }),
  }).refine(
    (data) => data.new_password === data.new_password_confirm,
    { message: 'Die Passwörter stimmen nicht überein.', path: ['new_password_confirm'] }
  )
)

const props = defineProps<{
  data: User[]
}>()

const { handleSubmit } = useForm({ validationSchema: formSchema })


const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true
  try {
    await userService.resetUserPassword(values.userId, values.new_password, values.new_password_confirm)
    toast.success('Passwort zurückgesetzt')
  } catch (err: any) {
    toast.error('Fehler beim Zurücksetzen', { description: err.message })
  } finally {
    isLoading.value = false
  }
})
</script>