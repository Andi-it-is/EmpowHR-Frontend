<template lang="pug">


Card(v-if="isLoaded")
  CardHeader
    CardTitle Organigramm
    CardDescription Aufbau des Unternehmens
  CardContent
    DepartmentChart(
      :departments="allDepartments"
    )


</template>

<script setup lang="ts">
import DepartmentChart from '@/components/app/organisation/DepartmentChart.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type Department, departmentService } from '@/services/department.service';
import { onMounted, ref } from 'vue';


const allDepartments = ref<Department[]>([])
const isLoaded = ref(false)

onMounted(async () => {

  allDepartments.value = await departmentService.listAllDepartments()
  isLoaded.value = true
})
</script>

