import axios from 'axios'
import router from '@/router'
import { toast } from 'vue-sonner'
import Cookies from 'js-cookie'
import { useUserStore } from '@/stores/user.store'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1',
  timeout: 15000, // 15 Sekunden
  // headers: {
  //   'Content-Type': 'application/json',
  // },
})

// Request Interceptor
api.interceptors.request.use((config) => {
  // Cookies.get liefert den reinen String-Wert des Cookies
  const token = Cookies.get('access_token');
  
  if (token) {
    // Da 'token' bereits der JWT-String ist, setzen wir ihn direkt ein
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message

    // Wenn ein 401 auftritt, ist die Sitzung ungültig: User aus dem Store werfen (löscht auch den Cookie).
    // Nur den Cookie zu löschen reicht nicht - der User bliebe im Store, der Router-Guard würde
    // /login wieder auf / umleiten und die WebSocket-Verbindung (presence.store) bliebe offen.
    if (status === 401) {
      useUserStore().clearUser()
      router.push('/login')
    }

    // Mapping der Status-Codes auf Toast-Nachrichten
    const errorMessages: Record<number, { title: string; desc: string }> = {
      400: { title: 'Ungültige Eingabe', desc: message ?? 'Bitte überprüfe deine Eingaben.' },
      401: { title: 'Nicht autorisiert', desc: message ?? 'Sitzung abgelaufen.' },
      403: { title: 'Kein Zugriff', desc: message ?? 'Keine Berechtigung für diese Aktion.' },
      404: { title: 'Nicht gefunden', desc: message ?? 'Ressource nicht gefunden.' },
      500: { title: 'Serverfehler', desc: message ?? 'Unerwarteter Fehler aufgetreten.' },
    }

    const errorInfo = errorMessages[status] || { 
      title: 'Fehler', 
      desc: message ?? 'Ein unbekannter Fehler ist aufgetreten.' 
    }

    toast.error(errorInfo.title, {
      description: errorInfo.desc,
      duration: 8000,
    })

    return Promise.reject(error)
  }
)

export default api