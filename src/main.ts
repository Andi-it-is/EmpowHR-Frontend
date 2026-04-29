import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import VCalendar from 'v-calendar'
import 'v-calendar/dist/style.css'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
// import '@vue-flow/background/dist/style.css'

const app = createApp(App)

app.use(VCalendar as any, {})
app.use(createPinia())
app.use(router)

app.mount('#app')
