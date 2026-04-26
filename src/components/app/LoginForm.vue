<script setup lang="ts">
import { ref, nextTick, watch, type HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { IdCard, Eye, EyeOff } from "lucide-vue-next"
import { useRouter } from "vue-router"
import { toast } from 'vue-sonner'
import { authService, type LoginObject, type RegisterObject } from "@/services/auth.service"
import { useUserStore } from "@/stores/user.store"
import Cookies from "js-cookie"
import api from "@/lib/axios"

const props = defineProps<{ class?: HTMLAttributes["class"] }>()

const isLoginCard = ref(true)
const router = useRouter()

const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showRegisterPasswordConfirm = ref(false)

function navToIndex() { 
  console.log("pusshinnng")
  return router.push("/") 
}

async function registerUser() {

  let registerObj: RegisterObject = {
    email: registerEmail.value!,
    password: registerPassword.value!,
    passwordConfirm: registerPasswordConfirm.value!
  }
  const result = await authService.register(registerObj)
  toast.success('Konto registriert!', {
    description: 'Melde dich nun an mit dem Konto.',
  })
}

const userStore = useUserStore()

async function loginUser() {

  let loginObj: LoginObject = {
    email: loginEmail.value!,
    password: loginPassword.value!
  }
  const authResponse = await authService.login(loginObj)
  const access_token = authResponse.access_token;

  Cookies.set("access_token", access_token, {
    expires: 7, // 7 Tage
    path: "/",
    sameSite: "Lax",
  });

  await nextTick()
  await userStore.fetchUser()
  await nextTick()
  router.push("/")
}

const loginSchema = toTypedSchema(z.object({
  email: z.string().email('Keine gültige E-Mail Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
}))

const registerSchema = toTypedSchema(z.object({
  email: z.string().email('Keine gültige E-Mail Adresse'),
  password: z.string()
    .min(8, 'Passwort muss mindestens 8 Zeichen lang sein')
    .regex(/[A-Z]/, 'Muss einen Großbuchstaben enthalten')
    .regex(/[0-9]/, 'Muss eine Zahl enthalten'),
  passwordConfirm: z.string(),
}).refine(data => data.password === data.passwordConfirm, {
  message: 'Passwörter stimmen nicht überein',
  path: ['passwordConfirm'],
}))

const { handleSubmit: handleLogin, errors: loginErrors, defineField: defineLoginField, resetForm: resetLogin } = useForm({
  validationSchema: loginSchema
})

const { handleSubmit: handleRegister, errors: registerErrors, defineField: defineRegisterField, resetForm: resetRegister } = useForm({
  validationSchema: registerSchema
})

const [loginEmail, loginEmailAttrs] = defineLoginField('email')
const [loginPassword, loginPasswordAttrs] = defineLoginField('password')

const [registerEmail, registerEmailAttrs] = defineRegisterField('email')
const [registerPassword, registerPasswordAttrs] = defineRegisterField('password')
const [registerPasswordConfirm, registerPasswordConfirmAttrs] = defineRegisterField('passwordConfirm')

const onLogin = handleLogin(() => loginUser())
const onRegister = handleRegister(() => registerUser())

watch(isLoginCard, () => {
  resetLogin()
  resetRegister()
  showLoginPassword.value = false
  showRegisterPassword.value = false
  showRegisterPasswordConfirm.value = false
})
</script>

<template>
  <div :class="cn('flex flex-col gap-1', props.class)">
    <Transition name="fade" mode="out-in">
    <!-- Login Card -->
    <Card v-if="isLoginCard" key="login" class="min-h-165 flex flex-col">
      <CardHeader class="text-center">
        <CardTitle class="text-xl">Willkommen zurück</CardTitle>
        <CardDescription>Login mit der Konzern Auth Lösung</CardDescription>
      </CardHeader>
      <CardContent class="flex flex-col flex-1">
        <form @submit.prevent="onLogin" class="flex flex-col flex-1">
          <FieldGroup class="gap-2 flex flex-col flex-1">
            <Field>
              <Button variant="brand-outline" type="button">
                <IdCard />
                Login with SSO
              </Button>
            </Field>
            <FieldSeparator class="*:data-[slot=field-separator-content]:bg-card my-4">
              Oder mit klassischem Login
            </FieldSeparator>
            <Field class="min-h-25">
              <FieldLabel for="loginEmail">Email</FieldLabel>
              <Input
                id="loginEmail"
                v-model="loginEmail"
                v-bind="loginEmailAttrs"
                type="email"
                placeholder="m@example.com"
                :class="loginErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''"
              />
              <p v-show="loginErrors.email" class="text-xs text-destructive mt-1">{{ loginErrors.email }}</p>
            </Field>
            <Field class="min-h-25">
              <FieldLabel for="loginPassword">Passwort</FieldLabel>
              <div class="relative">
                <Input
                  id="loginPassword"
                  v-model="loginPassword"
                  v-bind="loginPasswordAttrs"
                  :type="showLoginPassword ? 'text' : 'password'"
                  class="pr-10"
                  :class="loginErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  class="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  @click="showLoginPassword = !showLoginPassword"
                >
                  <EyeOff v-if="showLoginPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </Button>
              </div>
              <p v-show="loginErrors.password" class="text-xs text-destructive mt-1">{{ loginErrors.password }}</p>
            </Field>
            <Field class="mt-auto">
              <FieldSeparator class="*:data-[slot=field-separator-content]:bg-card my-2"/>
              <Button variant="brand" type="submit">Login</Button>
              <Button variant="brand-outline" type="button" @click="navToIndex()">Demo</Button>
              <FieldDescription class="text-center">
                Zugang gesperrt? Kontaktiere den Administrator
              </FieldDescription>
              <FieldDescription class="text-center">
                Kein Konto? Jetzt
                <a class="cursor-pointer underline-offset-4 hover:underline" tabindex="0" @click="isLoginCard = false">
                  registrieren
                </a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>

    <!-- Register Card -->
    <Card v-else key="register" class="min-h-165 flex flex-col">
      <CardHeader class="text-center">
        <CardTitle class="text-xl">Willkommen</CardTitle>
        <CardDescription>Jetzt ein Konto anlegen</CardDescription>
        <FieldSeparator class="*:data-[slot=field-separator-content]:bg-card my-2"/>
      </CardHeader>
      <CardContent class="flex flex-col flex-1">
        <form @submit.prevent="onRegister" class="flex flex-col flex-1">
          <FieldGroup class="gap-2 flex flex-col flex-1">
            <Field class="min-h-25">
              <FieldLabel for="registerEmail">Email</FieldLabel>
              <Input
                id="registerEmail"
                v-model="registerEmail"
                v-bind="registerEmailAttrs"
                type="email"
                placeholder="m@example.com"
                :class="registerErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''"
              />
              <p v-if="registerErrors.email" class="text-xs text-destructive mt-1">{{ registerErrors.email }}</p>
            </Field>
            <Field class="min-h-25">
              <FieldLabel for="registerPassword">Passwort</FieldLabel>
              <div class="relative">
                <Input
                  id="registerPassword"
                  v-model="registerPassword"
                  v-bind="registerPasswordAttrs"
                  :type="showRegisterPassword ? 'text' : 'password'"
                  class="pr-10"
                  :class="registerErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  class="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  @click="showRegisterPassword = !showRegisterPassword"
                >
                  <EyeOff v-if="showRegisterPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </Button>
              </div>
              <p v-if="registerErrors.password" class="text-xs text-destructive mt-1">{{ registerErrors.password }}</p>
            </Field>
            <Field class="min-h-25">
              <FieldLabel for="registerPasswordConfirm">Passwort bestätigen</FieldLabel>
              <div class="relative">
                <Input
                  id="registerPasswordConfirm"
                  v-model="registerPasswordConfirm"
                  v-bind="registerPasswordConfirmAttrs"
                  :type="showRegisterPasswordConfirm ? 'text' : 'password'"
                  class="pr-10"
                  :class="registerErrors.passwordConfirm ? 'border-destructive focus-visible:ring-destructive' : ''"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  class="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  @click="showRegisterPasswordConfirm = !showRegisterPasswordConfirm"
                >
                  <EyeOff v-if="showRegisterPasswordConfirm" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </Button>
              </div>
              <p v-if="registerErrors.passwordConfirm" class="text-xs text-destructive mt-1">{{ registerErrors.passwordConfirm }}</p>
            </Field>
            <Field class="mt-auto">
              <FieldSeparator class="*:data-[slot=field-separator-content]:bg-card my-2"/>
              <Button variant="brand" type="submit">Konto erstellen</Button>
              <Button variant="brand-outline" type="button" @click="navToIndex()">Demo</Button>
              <FieldDescription class="text-center">
                Du besitzt ein Konto? Jetzt
                <a class="cursor-pointer underline-offset-4 hover:underline" tabindex="0" @click="isLoginCard = true">
                  anmelden
                </a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
    </Transition>

    <FieldDescription class="px-6 text-center">
      Wenn Sie auf "Login" oder "Konto erstellen" klicken, erklären Sie sich mit unseren
      Nutzungsbedingungen und unserer Datenschutzerklärung einverstanden.
    </FieldDescription>
  </div>
</template>


<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>