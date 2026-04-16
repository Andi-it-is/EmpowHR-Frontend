<template lang="pug">
.reporting-shell
  //- Header
  header.report-header
    .header-left
      .report-eyebrow Executive Reporting
      h1.report-title Workforce Intelligence
      p.report-subtitle.
        Echtzeit-Übersicht · Stand: {{ currentDate }}
    .header-right
      .refresh-indicator
        span.pulse-dot
        span.refresh-label Live
      button.export-btn(@click="exportReport")
        svg(xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2")
          path(d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4")
          polyline(points="7 10 12 15 17 10")
          line(x1="12" y1="15" x2="12" y2="3")
        | Export PDF

  //- KPI Row
  section.kpi-grid
    .kpi-card(v-for="kpi in kpiCards" :key="kpi.label")
      .kpi-icon-wrap(:style="{ '--accent': kpi.color }")
        component(:is="kpi.icon")
      .kpi-body
        span.kpi-label {{ kpi.label }}
        .kpi-value-row
          span.kpi-value {{ kpi.value }}
          .kpi-badge(:class="kpi.trend > 0 ? 'badge--up' : 'badge--down'")
            span {{ kpi.trend > 0 ? '▲' : '▼' }} {{ Math.abs(kpi.trend) }}%
      .kpi-sub {{ kpi.sub }}

  //- Main Grid
  .dashboard-grid

    //- Rollenverteilung
    .card.card--roles
      .card-header
        h2.card-title Rollenverteilung
        p.card-desc Mitarbeiter nach Funktion
      .chart-area
        BarChart(
          :data="roleData"
          index="role"
          :categories="['Anzahl']"
          :colors="['#6ee7b7']"
          :rounded-corners="4"
          :show-legend="false"
          :show-grid-lines="true"
          :y-formatter="(v) => v"
        )
      .role-legend
        .role-pill(v-for="r in roleData" :key="r.role")
          span.role-dot(:style="{ background: roleColor(r.role) }")
          span.role-name {{ r.role }}
          span.role-count {{ r.Anzahl }}

    //- Aktivitätsverlauf
    .card.card--activity
      .card-header
        h2.card-title Plattform-Aktivität
        p.card-desc Transaktionen der letzten 30 Tage
      .chart-area
        AreaChart(
          :data="activityData"
          index="tag"
          :categories="['Transaktionen', 'Logins']"
          :colors="['#818cf8', '#34d399']"
          :show-legend="true"
          :curve-type="'monotone'"
        )

    //- Department-Übersicht (Tabelle)
    .card.card--departments
      .card-header
        h2.card-title Departments
        p.card-desc Strukturübersicht aller Abteilungen
      table.dept-table
        thead
          tr
            th Abteilung
            th Leiter
            th Gesamt
            th Anwesend
            th Auslastung
        tbody
          tr(v-for="d in departments" :key="d.name")
            td
              .dept-name-cell
                span.dept-color-dot(:style="{ background: d.color }")
                | {{ d.name }}
            td.dept-lead {{ d.lead }}
            td.text-center {{ d.total }}
            td.text-center {{ d.present }}
            td
              .utilization-wrap
                .utilization-bar
                  .utilization-fill(:style="{ width: utilizationPct(d) + '%', background: d.color }")
                span.utilization-label {{ utilizationPct(d) }}%

    //- Anwesenheit Donut
    .card.card--presence
      .card-header
        h2.card-title Anwesenheit heute
        p.card-desc Belegschaft pro Department
      .chart-area.chart-area--donut
        DonutChart(
          :data="presenceData"
          index="department"
          category="anwesend"
          :colors="presenceColors"
          :show-legend="false"
        )
      .presence-legend
        .presence-row(v-for="(d, i) in presenceData" :key="d.department")
          span.presence-swatch(:style="{ background: presenceColors[i] }")
          span.presence-dept {{ d.department }}
          span.presence-num {{ d.anwesend }} / {{ d.gesamt }}

    //- Offene Vorgänge
    .card.card--requests
      .card-header
        h2.card-title Offene Vorgänge
        p.card-desc Anfragen nach Kategorie
      .request-list
        .request-item(v-for="r in openRequests" :key="r.label")
          .request-left
            span.request-dot(:class="r.urgency")
            span.request-label {{ r.label }}
          .request-right
            span.request-count {{ r.count }}
            .request-bar-bg
              .request-bar-fill(:style="{ width: (r.count / maxRequest * 100) + '%' }")

    //- HR-Metriken
    .card.card--hrmetrics
      .card-header
        h2.card-title HR-Kennzahlen
        p.card-desc Personalqualität auf einen Blick
      .metric-stack
        .metric-row(v-for="m in hrMetrics" :key="m.label")
          .metric-label-wrap
            span.metric-label {{ m.label }}
            span.metric-value {{ m.value }}
          .metric-track
            .metric-progress(:style="{ width: m.pct + '%', background: m.color }")
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BarChart } from '@/components/ui/chart-bar'
import { AreaChart } from '@/components/ui/chart-area'
import { DonutChart } from '@/components/ui/chart-donut'

// ── Datum ─────────────────────────────────────────────
const currentDate = computed(() =>
  new Date().toLocaleDateString('de-DE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
)

// ── KPI-Kacheln ───────────────────────────────────────
const kpiCards = [
  { label: 'Mitarbeiter gesamt', value: '342', trend: 4.2, sub: '+14 diesen Monat', color: '#6ee7b7' },
  { label: 'Heute anwesend',     value: '289', trend: 2.1, sub: '84.5 % Anwesenheitsquote', color: '#818cf8' },
  { label: 'Krankheitsquote',    value: '3.2 %', trend: -0.8, sub: 'Ø Vorjahr: 4.1 %', color: '#f472b6' },
  { label: 'Ø Betriebszugeh.',   value: '4.7 J.', trend: 1.3, sub: 'Stabil seit Q3', color: '#fb923c' },
  { label: 'Offene Anfragen',    value: '27', trend: -12.0, sub: '↓ 4 ggü. Vorwoche', color: '#facc15' },
  { label: 'Neue Mitarbeiter',   value: '14', trend: 8.0, sub: 'Q2 laufend', color: '#38bdf8' },
]

// ── Rollenverteilung ──────────────────────────────────
const roleData = [
  { role: 'Entwickler',    Anzahl: 78 },
  { role: 'HR',            Anzahl: 24 },
  { role: 'IT-Admin',      Anzahl: 18 },
  { role: 'Projektleiter', Anzahl: 31 },
  { role: 'Vertrieb',      Anzahl: 55 },
  { role: 'Finance',       Anzahl: 22 },
  { role: 'Legal',         Anzahl: 11 },
  { role: 'Management',    Anzahl: 9 },
  { role: 'Sonstige',      Anzahl: 94 },
]

const roleColors: Record<string, string> = {
  'Entwickler': '#6ee7b7', 'HR': '#818cf8', 'IT-Admin': '#38bdf8',
  'Projektleiter': '#fb923c', 'Vertrieb': '#f472b6', 'Finance': '#facc15',
  'Legal': '#a78bfa', 'Management': '#34d399', 'Sonstige': '#94a3b8',
}
const roleColor = (role: string) => roleColors[role] ?? '#94a3b8'

// ── Aktivitätsverlauf ─────────────────────────────────
const activityData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() - (29 - i))
  return {
    tag: d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
    Transaktionen: Math.floor(60 + Math.random() * 120),
    Logins: Math.floor(40 + Math.random() * 90),
  }
})

// ── Departments ───────────────────────────────────────
const departments = [
  { name: 'Engineering',  lead: 'M. Fischer',  total: 82,  present: 71, color: '#6ee7b7' },
  { name: 'Vertrieb',     lead: 'S. Wagner',   total: 58,  present: 50, color: '#f472b6' },
  { name: 'HR',           lead: 'K. Bauer',    total: 24,  present: 22, color: '#818cf8' },
  { name: 'Finance',      lead: 'T. Richter',  total: 22,  present: 18, color: '#facc15' },
  { name: 'IT-Ops',       lead: 'L. Schäfer',  total: 19,  present: 17, color: '#38bdf8' },
  { name: 'Legal',        lead: 'A. Hoffmann', total: 11,  present: 8,  color: '#a78bfa' },
  { name: 'Management',   lead: 'J. Müller',   total: 9,   present: 9,  color: '#fb923c' },
  { name: 'Marketing',    lead: 'C. Klein',    total: 42,  present: 37, color: '#34d399' },
  { name: 'Sonstige',     lead: '—',           total: 75,  present: 57, color: '#94a3b8' },
]
const utilizationPct = (d: typeof departments[0]) =>
  Math.round((d.present / d.total) * 100)

// ── Anwesenheit Donut ─────────────────────────────────
const presenceData = departments.map(d => ({
  department: d.name, anwesend: d.present, gesamt: d.total,
}))
const presenceColors = departments.map(d => d.color)

// ── Offene Vorgänge ───────────────────────────────────
const openRequests = [
  { label: 'Urlaubsanträge',        count: 11, urgency: 'urg--low' },
  { label: 'Gehaltsanpassungen',    count: 5,  urgency: 'urg--mid' },
  { label: 'Onboarding-Tasks',      count: 6,  urgency: 'urg--low' },
  { label: 'IT-Zugriffsanfragen',   count: 3,  urgency: 'urg--high' },
  { label: 'Krankmeldungen offen',  count: 2,  urgency: 'urg--high' },
]
const maxRequest = Math.max(...openRequests.map(r => r.count))

// ── HR-Kennzahlen ─────────────────────────────────────
const hrMetrics = [
  { label: 'Mitarbeiterzufriedenheit', value: '82 %',  pct: 82, color: '#6ee7b7' },
  { label: 'Weiterbildungsquote',      value: '61 %',  pct: 61, color: '#818cf8' },
  { label: 'Fluktuationsrate',         value: '7.3 %', pct: 7.3, color: '#f472b6' },
  { label: 'Onboarding-Completion',    value: '94 %',  pct: 94, color: '#34d399' },
  { label: 'Überstundenquote',         value: '18 %',  pct: 18, color: '#fb923c' },
]

// ── Export ─────────────────────────────────────────────
const exportReport = () => {
  console.log('Export triggered — hier PDF-Logik einbauen')
}
</script>

<style scoped>
/* ── Tokens ─────────────────────────────────────────── */
.reporting-shell {
  --bg:          #0b0f1a;
  --surface:     #111827;
  --surface-2:   #1a2236;
  --border:      rgba(255,255,255,0.07);
  --text:        #e2e8f0;
  --text-muted:  #64748b;
  --accent:      #6ee7b7;
  --radius:      14px;
  --font-display: 'DM Serif Display', 'Georgia', serif;
  --font-body:    'DM Sans', 'Segoe UI', sans-serif;

  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  padding: 2rem 2.5rem 4rem;
  box-sizing: border-box;
}

/* ── Header ─────────────────────────────────────────── */
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border);
}

.report-eyebrow {
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 0.5rem;
}

.report-title {
  font-family: var(--font-display);
  font-size: 2.4rem;
  font-weight: 400;
  margin: 0 0 0.4rem;
  letter-spacing: -0.02em;
  color: #f8fafc;
}

.report-subtitle {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.refresh-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  color: var(--accent);
}

.pulse-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.7); }
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  font-size: 0.8rem;
  font-family: var(--font-body);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.export-btn:hover {
  border-color: var(--accent);
  background: var(--surface-2);
}

/* ── KPI Grid ───────────────────────────────────────── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.kpi-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.2rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  transition: border-color 0.2s;
  position: relative;
  overflow: hidden;
}
.kpi-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 0% 0%, color-mix(in srgb, var(--accent) 8%, transparent), transparent 60%);
  pointer-events: none;
}

.kpi-icon-wrap {
  width: 32px; height: 32px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
}

.kpi-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.kpi-value {
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #f1f5f9;
}

.kpi-badge {
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 20px;
  font-weight: 600;
}
.badge--up   { background: rgba(110,231,183,0.15); color: #6ee7b7; }
.badge--down { background: rgba(244, 114, 182,0.15); color: #f472b6; }

.kpi-sub {
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* ── Dashboard Grid ─────────────────────────────────── */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  grid-template-rows: auto auto auto;
  gap: 1.2rem;
}

/* ── Card Base ──────────────────────────────────────── */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.4rem 1.5rem;
}

.card-header {
  margin-bottom: 1.2rem;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 0.25rem;
  letter-spacing: -0.01em;
}

.card-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

/* ── Chart Area ─────────────────────────────────────── */
.chart-area {
  height: 220px;
}
.chart-area--donut {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

/* ── Role Legend ────────────────────────────────────── */
.role-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.8rem;
  margin-top: 1rem;
}
.role-pill {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: var(--text-muted);
}
.role-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.role-count {
  color: var(--text);
  font-weight: 600;
  margin-left: 0.15rem;
}

/* ── Card Layout Assignment ─────────────────────────── */
.card--roles      { grid-column: 1; grid-row: 1; }
.card--activity   { grid-column: 2; grid-row: 1; }
.card--departments{ grid-column: 1 / -1; grid-row: 2; }
.card--presence   { grid-column: 1; grid-row: 3; }
.card--requests   { grid-column: 2; grid-row: 3; }
.card--hrmetrics  { grid-column: 1 / -1; grid-row: 4; }

/* ── Department Table ───────────────────────────────── */
.dept-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
}

.dept-table thead th {
  text-align: left;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
  padding: 0 0.75rem 0.75rem;
  border-bottom: 1px solid var(--border);
}

.dept-table tbody tr {
  transition: background 0.15s;
}
.dept-table tbody tr:hover {
  background: var(--surface-2);
}

.dept-table tbody td {
  padding: 0.7rem 0.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  color: var(--text);
}

.dept-name-cell {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-weight: 500;
}

.dept-color-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dept-lead {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.text-center { text-align: center; }

.utilization-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.utilization-bar {
  flex: 1;
  height: 5px;
  background: rgba(255,255,255,0.07);
  border-radius: 99px;
  overflow: hidden;
}

.utilization-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
}

.utilization-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  width: 3em;
  text-align: right;
}

/* ── Presence Legend ─────────────────────────────────── */
.presence-legend {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.3rem 1rem;
}

.presence-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.75rem;
}

.presence-swatch {
  width: 8px; height: 8px;
  border-radius: 2px;
  flex-shrink: 0;
}

.presence-dept {
  flex: 1;
  color: var(--text-muted);
}

.presence-num {
  font-weight: 600;
  color: var(--text);
}

/* ── Open Requests ──────────────────────────────────── */
.request-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.request-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.request-left {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
}

.request-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.urg--low  { background: #6ee7b7; }
.urg--mid  { background: #facc15; }
.urg--high { background: #f472b6; }

.request-label {
  font-size: 0.82rem;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.request-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.request-count {
  font-size: 0.9rem;
  font-weight: 600;
  width: 2em;
  text-align: right;
}

.request-bar-bg {
  width: 80px;
  height: 5px;
  background: rgba(255,255,255,0.07);
  border-radius: 99px;
  overflow: hidden;
}
.request-bar-fill {
  height: 100%;
  background: #818cf8;
  border-radius: 99px;
  transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
}

/* ── HR Metrics ─────────────────────────────────────── */
.metric-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.card--hrmetrics .metric-stack {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.2rem;
}

.metric-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-label-wrap {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.metric-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
}

.metric-track {
  height: 6px;
  background: rgba(255,255,255,0.07);
  border-radius: 99px;
  overflow: hidden;
}

.metric-progress {
  height: 100%;
  border-radius: 99px;
  transition: width 0.7s cubic-bezier(0.4,0,0.2,1);
}

/* ── Responsive ─────────────────────────────────────── */
@media (max-width: 1200px) {
  .kpi-grid { grid-template-columns: repeat(3, 1fr); }
  .dashboard-grid { grid-template-columns: 1fr; }
  .card--roles,
  .card--activity,
  .card--departments,
  .card--presence,
  .card--requests,
  .card--hrmetrics { grid-column: 1; grid-row: auto; }
  .card--hrmetrics .metric-stack { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .reporting-shell { padding: 1rem 1rem 3rem; }
  .report-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .card--hrmetrics .metric-stack { grid-template-columns: 1fr; }
  .presence-legend { grid-template-columns: 1fr; }
}
</style>