import {
  FileText, Database, Award, GitFork, Users,
  CalendarDays, Armchair, UmbrellaOff, Clock,
  CalendarCheck, UserRound, Building2, Timer, ShieldCheck,
  UserRoundKey, UserRoundCog, Clipboard, MonitorCloud
} from 'lucide-vue-next'

export function getColorClasses(color: string) {
  const map: Record<string, string> = {
  'green':   'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  'blue':    'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  'amber':   'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',
  'rose':    'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200',
  }
  return map[color] ?? map['blue']
}

export function getIconColor(color: string) {
  const map: Record<string, string> = {
    'group-green':   'text-green-700 dark:text-green-300',
    'group-blue':    'text-blue-700 dark:text-blue-300',
    'group-amber':   'text-amber-700 dark:text-amber-300',
    'group-rose':    'text-rose-700 dark:text-rose-300',
  }
  return map[color] ?? ''
}

/**
 ** Tailwindclasses can not be abstracted using css variables.
 ** Thats why we need a map function to help with it
 */
export const navigationData = [
  {
    title: "Persönlich",
    url: "#",
    icon: UserRound,
    color: "group-green",
    items: [
      { title: "Stammdaten", url: "/profile/master-data", icon: Database, description: "Persönliche Angaben", color: "green" },
      { title: "Dokumente", url: "/profile/documents", icon: FileText, description: "Lohnabrechnungen und vieles Mehr", color: "green" },
      { title: "Zertifikate", url: "/profile/certificates", icon: Award, description: "Deine Nachweise für Schulungen", color: "green" },
    ],
  },
  {
    title: "Organisation",
    url: "#",
    icon: Building2,
    color: "group-blue",
    items: [
      { title: "Organigramm", url: "#", icon: GitFork, description: "Unternehmensstruktur", color: "blue" },
      { title: "Personenregister", url: "#", icon: Users, description: "Mitarbeiter finden", color: "blue" },
      { title: "Teamkalender", url: "#", icon: CalendarDays, description: "Geteilter Kalender deiner Abteilung", color: "blue" },
      { title: "Desk Sharing", url: "#", icon: Armchair, description: "Sitzplatz buchen", color: "blue" },
    ],
  },
  {
    title: "Zeitverwaltung",
    url: "#",
    icon: Timer,
    color: "group-amber",
    items: [
      { title: "Abwesenheiten", url: "/times/absences", icon: UmbrellaOff, description: "Urlaub und Krankmeldungen", color: "amber" },
      { title: "Zeitbuchung", url: "/times/booking", icon: Clock, description: "Stunden erfassen", color: "amber" },
      { title: "Zeiten Monitor", url: "/times/monitor", icon: MonitorCloud, description: "Remote Arbeit Übersicht", color: "amber" },
    ],
  },
  {
    title: "Management",
    url: "#",
    icon: ShieldCheck,
    color: "group-rose",
    items: [
      { title: "Urlaubsplanungen", url: "#", icon: CalendarCheck, description: "Abwesenheiten planen und genehmigen", color: "rose" },
      { title: "Reportings", url: "/management/reportings", icon: Clipboard, description: "Statusbericht über die Applikation EmpowHR", color: "rose" },
      { title: "Mitarbeiterverwaltung", url: "#", icon: UserRoundCog, description: "Mitarbeiter und deren Inhalte konfigurieren", color: "rose" },
      { title: "Zugriff", url: "#", icon: UserRoundKey, description: "Rollen und Berechtigungen verwalten", color: "rose" },
      // { title: "Sonstiges", url: "#", icon: Ellipsis, description: "Weitere Beschreibung", color: "rose" },
    ],
  },
]