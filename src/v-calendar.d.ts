// src/v-calendar.d.ts (oder in env.d.ts)

declare module 'v-calendar' {
  import { DefineComponent } from 'vue'
  const Calendar: DefineComponent<{}, {}, any>
  const DatePicker: DefineComponent<{}, {}, any>
  const setupCalendar: any
  
  export { Calendar, DatePicker, setupCalendar }
}