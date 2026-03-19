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

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <Card>
      <CardHeader class="text-center">
        <CardTitle class="text-xl">
          Willkommen zurück
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
              <FieldDescription class="text-center">
                Zugang gesperrt? Kontaktiere den
                <a href="#">
                  Administrator
                </a>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
    <FieldDescription class="px-6 text-center">
      By clicking continue, you agree to our <a href="#">Terms of Service</a>
      and <a href="#">Privacy Policy</a>.
    </FieldDescription>
  </div>
</template>
