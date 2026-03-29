import {
  FileText, Database, Award, GitFork, Users,
  CalendarDays, Armchair, UmbrellaOff, Clock, Home,
  CalendarCheck, Ellipsis, UserRound, Building2, Timer, ShieldCheck
} from 'lucide-vue-next'

export function getColorClasses(color: string) {
  const map: Record<string, string> = {
  'emerald': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200',
  'blue':    'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  'amber':   'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',
  'rose':    'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200',
  }
  return map[color] ?? map['blue']
}

export function getIconColor(color: string) {
  const map: Record<string, string> = {
    'group-emerald': 'text-emerald-700 dark:text-emerald-300',
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
    title: "Für mich",
    url: "#",
    icon: UserRound,
    color: "group-emerald",
    items: [
      { title: "Dokumente", url: "#", icon: FileText, description: "Lohnabrechnungen und vieles Mehr", color: "emerald" },
      { title: "Stammdaten", url: "profile", icon: Database, description: "Persönliche Angaben", color: "emerald" },
      { title: "Zertifikate", url: "#", icon: Award, description: "Deine Nachweise für Schulungen", color: "emerald" },
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
      { title: "Desk Sharing", url: "#", icon: Armchair, description: "Sitzplatz buchen", color: "blue" },
      { title: "Teamkalender", url: "#", icon: CalendarDays, description: "Geteilter Kalender", color: "blue" },
    ],
  },
  {
    title: "Zeitverwaltung",
    url: "#",
    icon: Timer,
    color: "group-amber",
    items: [
      { title: "Abwesenheiten", url: "#", icon: UmbrellaOff, description: "Urlaub und Krankmeldungen", color: "amber" },
      { title: "Zeitbuchung", url: "#", icon: Clock, description: "Stunden erfassen", color: "amber" },
      { title: "Home Office Tracker", url: "#", icon: Home, description: "Remote Tracker", color: "amber" },
    ],
  },
  {
    title: "Manager Self Service (MSS)",
    url: "#",
    icon: ShieldCheck,
    color: "group-rose",
    items: [
      { title: "Urlaubsplanungen", url: "#", icon: CalendarCheck, description: "Abwesenheiten planen und genehmigen", color: "rose" },
      { title: "Sonstiges", url: "#", icon: Ellipsis, description: "Weitere Beschreibung", color: "rose" },
    ],
  },
]