<template lang="pug">

pre Ich bin die UserPreferences.vue Datei
//- Button(variant="outline") Nested Page

</template>


<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import ThemeToggle from '@/components/app/ThemeToggle.vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()

onMounted(() => {

})

</script>

<style lang="css" scoped>

</style>
