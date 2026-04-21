import { RoleName } from "@/constants/enums/acessControl.enum";
import { DepartmentName } from "@/constants/enums/departmentColors.enum";

//* Roles


/**
 * Übersetzt einen RoleName Enum-Wert in die deutsche Bezeichnung.
 * @param role Der RoleName, der übersetzt werden soll.
 * @returns Die deutsche Übersetzung oder der Originalwert, falls keine Übersetzung existiert.
 */
export function translateRoleName(role: RoleName): string {
  const roleTranslations: Record<RoleName, string> = {
    [RoleName.EMPLOYEE]: 'Mitarbeiter',
    [RoleName.DEPARTMENT_HEAD]: 'Abteilungsleitung',
    [RoleName.HR_MANAGER]: 'Personalreferent',
    [RoleName.ACCOUNTANT]: 'Buchhaltung',
    [RoleName.IT_ADMINISTRATOR]: 'IT-Admin',
    [RoleName.EXECUTIVE]: 'Geschäftsführung',
  };

  return roleTranslations[role] || role;
}

export const RoleColors: Record<RoleName, string> = {
  [RoleName.EMPLOYEE]: '#94a3b8',          // Neutrales Blaugrau (Basis-Rolle)
  [RoleName.DEPARTMENT_HEAD]: '#3b42f6',   // Kräftiges Blau (Management-Fokus)
  [RoleName.HR_MANAGER]: '#ec4899',        // Pink (Menschen/Empathie)
  [RoleName.ACCOUNTANT]: '#f59e0b',        // Bernstein/Gelb (Finanzen/Achtung)
  [RoleName.IT_ADMINISTRATOR]: '#63f6f1',  // Türkis (Technik/Infrastruktur)
  [RoleName.EXECUTIVE]: '#dc2626',         // Gefährliches Rot (Autorität)
};

/**
 * Hilfsfunktion, um die Farbe zu einer Rolle zu erhalten
 */
export function getRoleColor(role: RoleName): string {
  return RoleColors[role] || '#cccccc';
}


//* Departments

export const DepartmentColors: Record<DepartmentName, string> = {
  [DepartmentName.EXECUTIVE]: '#dc2626',  // Gefährliches Rot (Autorität)
  [DepartmentName.LEGAL]: '#94a3b8',      // Slate (Neutral/Seriös)
  [DepartmentName.FINANCE]: '#f59e0b',    // Amber (Geld/Finanzen)
  [DepartmentName.IT]: '#63f6f1',         // Türkis (Technik/Infrastruktur)
  [DepartmentName.HR]: '#ec4899',         // Pink (Menschen/Empathie)
  [DepartmentName.MARKETING]: '#8b5ca6',  // Violett (Kreativität)
  [DepartmentName.SALES]: '#10b981',      // Emerald (Wachstum/Umsatz)
};

/**
 * Hilfsfunktion, um die Farbe zu einer Abteilung zu erhalten
 */
export function getDepartmentColor(deptName: string): string {
  return DepartmentColors[deptName as DepartmentName] || '#64748b';
}


//* TimeEntries

import { TimeEntryType } from "@/constants/enums/timeRecodring.enum";

/**
 * Zentrales Mapping für alle Zeiteintrag-Typen.
 * Alphabetisch nach Label sortiert.
 */
export const TimeEntryTypeMapping: Record<TimeEntryType, { label: string, color: string }> = {
  [TimeEntryType.PARENTAL_LEAVE]: { label: 'Elternzeit', color: 'bg-sky-500' },
  [TimeEntryType.PUBLIC_HOLIDAY]: { label: 'Feiertag', color: 'bg-fuchsia-500' },
  [TimeEntryType.EDUCATION]: { label: 'Fortbildung', color: 'bg-slate-600' },
  [TimeEntryType.SICK_CHILD]: { label: 'Kind krank', color: 'bg-amber-500' },
  [TimeEntryType.SICK]: { label: 'Krankheit', color: 'bg-red-600' },
  [TimeEntryType.WORK]: { label: 'Reguläre Arbeit', color: 'bg-slate-600' },
  [TimeEntryType.SPECIAL_LEAVE]: { label: 'Sonderurlaub', color: 'bg-rose-400' },
  [TimeEntryType.UNPAID_LEAVE]: { label: 'Unbezahlter Urlaub', color: 'bg-stone-400' },
  [TimeEntryType.VACATION]: { label: 'Urlaub', color: 'bg-emerald-500' },
  [TimeEntryType.COMPENSATORY_OFF]: { label: 'Überstundenabbau', color: 'bg-teal-400' },
};

/**
 * Ein reines Mapping der Labels für Selects oder Tabellen-Anzeigen
 */
export const TimeEntryTypeLabels: Record<TimeEntryType, string> = Object.entries(TimeEntryTypeMapping).reduce(
  (acc, [key, value]) => ({ ...acc, [key]: value.label }),
  {} as Record<TimeEntryType, string>
);

/**
 * Ein reines Mapping der Tailwind-Farbklassen
 */
export const TimeEntryTypeColors: Record<TimeEntryType, string> = Object.entries(TimeEntryTypeMapping).reduce(
  (acc, [key, value]) => ({ ...acc, [key]: value.color }),
  {} as Record<TimeEntryType, string>
);

/**
 * Gibt das Label eines Typs zurück oder den Key selbst als Fallback
 */
export function getTimeEntryLabel(type: string): string {
  return TimeEntryTypeLabels[type as TimeEntryType] || type;
}

/**
 * Gibt die Farbe eines Typs zurück oder ein neutrales Slate als Fallback
 */
export function getTimeEntryColor(type: string): string {
  return TimeEntryTypeColors[type as TimeEntryType] || 'bg-slate-400';
}