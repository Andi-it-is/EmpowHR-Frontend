<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { IdCard } from "lucide-vue-next"
import { useRouter } from "vue-router"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const router = useRouter()

function navToIndex() {
  return router.push("/")
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-center">
        <CardTitle class="text-xl">
          Willkommen
        </CardTitle>
        <CardDescription>
          Login mit der Konzern Auth Lösung
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <Button variant="outline" type="button" >
                <IdCard />
                Login with SSO
              </Button>
            </Field>
            <FieldSeparator class="*:data-[slot=field-separator-content]:bg-card">
              Oder mit klassischem Login
            </FieldSeparator>
            <Field>
              <FieldLabel for="email">
                Email
              </FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </Field>
            <Field>
              <div class="flex items-center">
                <FieldLabel for="password">
                  Passwort
                </FieldLabel>
              </div>
              <Input id="password" type="password" required />
              <a
                href="#"
                class="ml-auto text-xs underline-offset-4 hover:underline"
              >
                Passwort vergessen ?
              </a>
            </Field>
            <Field>
              <Button variant="positive" type="submit">
                Login
              </Button>
              <Button variant="positiveish" @click="navToIndex()">
                Demo Login
              </Button>
              <FieldDescription class="text-center">
                Zugang gesperrt? Kontaktiere den Administrator
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
    <FieldDescription class="px-6 text-center">
      Wenn Sie auf "Login" klicken, erklären Sie sich mit unseren Nutzungsbedingungen
      und unserer Datenschutzerklärung einverstanden.
    </FieldDescription>
  </div>

</template>
