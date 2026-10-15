import { defineStore } from 'pinia'
import { ref, readonly, watch } from 'vue'
import { useIdle, useWebSocket, watchThrottled } from '@vueuse/core'
import {
  CLOSE_UNAUTHORIZED,
  HEARTBEAT_MESSAGE,
  PRESENCE_ACTIVE_QUERY_PARAM,
  PRESENCE_ACTIVITY_THROTTLE_MS,
  PRESENCE_INACTIVITY_TIMEOUT_MS,
  parseServerMessage,
  type ClientMessage,
} from '@/lib/websocket/messages'
import { useUserStore } from '@/stores/user.store'

// Gleiche Basis-URL wie in lib/axios.ts. http -> ws, https -> wss.
// Kein Token in der URL: authentifiziert wird über das access_token-Cookie, das der Browser mitschickt.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'
const WS_BASE_URL = `${API_URL.replace(/^http/, 'ws')}/ws`

const MAX_RECONNECT_DELAY_MS = 30_000

/**
 * Hält die WebSocket-Verbindung für den Online-Status.
 * Läuft app-weit, nicht nur im Dashboard - sonst zählt nur, wer gerade das Dashboard offen hat.
 * Verbindet und trennt sich selbst anhand des Logins (siehe watch unten).
 * Muss dafür einmal app-weit angelegt werden (App.vue) - Pinia erzeugt Stores erst beim ersten use...Store().
 */
export const usePresenceStore = defineStore('presence', () => {

  // Anzahl eindeutiger User mit offener Verbindung, die in den letzten 30 Minuten aktiv waren.
  // null = noch keine Zahl vom Server erhalten.
  const online = ref<number | null>(null)
  const lastUpdated = ref<Date | null>(null)

  // Zeitpunkt der letzten Eingabe in diesem Tab (Maus, Tastatur, Touch, Scrollen, Zurückwechseln).
  // Bewusst wird nur lastActive genutzt, nicht das idle-Flag: Dessen Timer läuft im Tab, und
  // Hintergrund-Tabs werden gedrosselt oder eingefroren - ein eingefrorener Tab würde nie "idle" melden.
  // Den Ablauf nach 30 Minuten übernimmt deshalb der Server: Ein Tab, der schweigt, gilt als inaktiv.
  const { lastActive } = useIdle(PRESENCE_INACTIVITY_TIMEOUT_MS)

  // Neue Verbindung (Seitenaufruf, Neuladen, Reconnect): ?active=1 nur, wenn die letzte Eingabe noch frisch ist.
  // Der Server zählt den User dann schon in der ersten Zahl mit - ohne den Parameter käme erst eine Zahl
  // ohne ihn und kurz danach die richtige.
  // Ein vergessener Tab, der sich z. B. nachts nach einem Deploy neu verbindet, schickt den Parameter nicht.
  const buildUrl = () => {
    const isActive = Date.now() - lastActive.value <= PRESENCE_INACTIVITY_TIMEOUT_MS
    return isActive ? `${WS_BASE_URL}?${PRESENCE_ACTIVE_QUERY_PARAM}=1` : WS_BASE_URL
  }

  // Getter statt fester URL: VueUse wertet ihn bei jedem Verbindungsaufbau neu aus, auch beim Reconnect.
  const { status, open, close, send } = useWebSocket(buildUrl, {
    immediate: false,
    // Sonst würde VueUse bei jeder Änderung der URL (aktiv <-> inaktiv) neu verbinden
    autoConnect: false,

    // Anwendungs-Heartbeat: Der Server antwortet mit genau "ping".
    // VueUse filtert diese Antwort selbst heraus, sie landet nicht in onMessage.
    // Die Standardwerte (1 s / 1 s) wären viel zu knapp.
    heartbeat: {
      message: HEARTBEAT_MESSAGE,
      interval: 25_000,
      pongTimeout: 5_000,
    },

    // Unbegrenzt neu verbinden, aber mit wachsendem Abstand (2 s, 4 s, 8 s ... max. 30 s).
    // Damit kommen Clients nach einem Deploy von selbst zurück, ohne den Server im Sekundentakt zu belasten.
    // Gestoppt wird nur bei 4401 (siehe onDisconnected), 1011 und alle anderen Codes verbinden neu.
    autoReconnect: {
      delay: (retries) => Math.min(1000 * 2 ** retries, MAX_RECONNECT_DELAY_MS),
    },

    onDisconnected: (_ws, event) => {
      // Kein oder ungültiger Token: Neu verbinden bringt nichts.
      // close() setzt die Verbindung auf "bewusst geschlossen", VueUse verbindet dann nicht neu.
      if (event.code === CLOSE_UNAUTHORIZED) {
        close()
      }
    },

    onMessage: (_ws, event) => {
      const message = parseServerMessage(event.data)
      if (!message) return // kaputtes JSON oder unbekannter type

      switch (message.type) {
        case 'presence:count':
          online.value = message.payload.online
          lastUpdated.value = new Date()
          break
      }
    },
  })

  function sendActivity() {
    const message: ClientMessage = { type: 'presence:activity' }
    // Ohne Puffer: Ist die Verbindung gerade weg, meldet buildUrl die Aktivität beim Wiederverbinden
    send(JSON.stringify(message), false)
  }

  // Bei Eingaben höchstens einmal pro Minute melden. Die erste Eingabe geht sofort raus.
  watchThrottled(lastActive, sendActivity, { throttle: PRESENCE_ACTIVITY_THROTTLE_MS })

  function connect() {
    // open() würde eine bestehende Verbindung erst schließen und neu aufbauen
    if (status.value !== 'CLOSED') return
    open()
  }

  function disconnect() {
    close()
    // Nach dem Abmelden gehört die Zahl nicht mehr zu diesem Tab
    online.value = null
    lastUpdated.value = null
  }

  // Verbindung folgt dem Login: User gesetzt (Login oder Seitenaufruf mit gültigem Cookie) -> verbinden,
  // User weg (Logout oder 401 aus lib/axios.ts, beide über clearUser) -> trennen.
  // immediate: falls der User beim Anlegen dieses Stores schon geladen ist.
  const userStore = useUserStore()
  watch(
    () => userStore.user,
    (user) => {
      if (user) connect()
      else disconnect()
    },
    { immediate: true },
  )

  return {
    online: readonly(online),
    lastUpdated: readonly(lastUpdated),
    status: readonly(status),
    connect,
    disconnect,
  }
})
