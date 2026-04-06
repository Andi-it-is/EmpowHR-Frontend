import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services/user.service'
import Cookies from 'js-cookie'

export const useUserStore = defineStore('auth', () => {
    
  const user = ref<any>(null)
  const isLoaded = ref(false)
  const isInitializing = ref(true)
  
  async function fetchUser() {
    
    if (isLoaded.value) return
    
    try {
      
      const token = Cookies.get('access_token');

      if (!token) {
        isInitializing.value = false
        isLoaded.value = false
        user.value = null
        return // early return. no token/cookie => not logged in. no need to ask api
      }

      const response = await userService.getSimpleUserInfo()
      user.value = response
      isLoaded.value = true
    
    } catch {
      user.value = null
      isLoaded.value = false
    
    } finally {
      // Egal ob Erfolg oder Fehler: Die Initialisierungsphase ist vorbei
      isInitializing.value = false
    }
  }

  function clearUser() {
    user.value = null
    isLoaded.value = false
    isInitializing.value = false 
    Cookies.remove('access_token', { path: '/' })
  }

  return { 
    user, 
    isLoaded, 
    isInitializing,
    fetchUser, 
    clearUser 
  }
})