<template lang="pug">

h1(tabindex="0") Organigramm
p(class="text-muted-foreground max-w-175" tabindex="0") Aufbau des Unternehmens

Separator(class="my-4")

Card(v-if="isLoaded")
  div(class="p-8")
    DepartmentChart(
      :departments="allDepartments"
    )


</template>

<script setup lang="ts">
import DepartmentChart from '@/components/app/organisation/DepartmentChart.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Separator from '@/components/ui/separator/Separator.vue';
import { type Department, departmentService } from '@/services/department.service';
import { onMounted, ref } from 'vue';


const allDepartments = ref<Department[]>([])
const isLoaded = ref(false)

onMounted(async () => {

  allDepartments.value = await departmentService.listAllDepartments()
  isLoaded.value = true
})
</script>

