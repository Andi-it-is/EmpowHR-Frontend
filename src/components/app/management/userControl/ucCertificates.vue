<template lang="pug">

  pre ich bin die ucCertificates (uc = userControl)
  pre {{ props.user }}
  pre {{ props.user }} 
  pre {{ props.user }} 
  
</template>

<script setup lang="ts">
import { userService, type User } from '@/services/user.service'
import { onMounted, ref } from 'vue';

const props = defineProps<{
  user: User
}>()

const affectedUser = ref<User>() 

onMounted( async() => {

  affectedUser.value = await userService.getUserById(props.user.id)
})

</script>