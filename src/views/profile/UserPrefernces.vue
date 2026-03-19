<template lang="pug">

div(class="flex-1 bg-amber-600") hellow world
//- Button(variant="outline") Nested Page

</template>


<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()

onMounted(() => {

})

</script>

<style lang="css" scoped>

</style>
