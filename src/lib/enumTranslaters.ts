import { PermissionAction, PermissionScope, RoleName } from "@/constants/enums/acessControl.enum";
import { DepartmentName } from "@/constants/enums/departmentNames.enum";

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
    [RoleName.HR_MANAGER]: 'HR',
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

import { TimeEntryType, WorkingLocation } from "@/constants/enums/timeRecodring.enum";

export const workingLocationColorMap: Record<WorkingLocation, string> = {
  [WorkingLocation.OFFICE]:        '#3b82f6',
  [WorkingLocation.REMOTE]:        '#a855f7',
  [WorkingLocation.FIELD_SERVICE]: '#f43f5e',
}

export const workingLocationLabels: Record<WorkingLocation, string> = {
  [WorkingLocation.OFFICE]: 'Büro',
  [WorkingLocation.REMOTE]: 'Remote',
  [WorkingLocation.FIELD_SERVICE]: 'Dienstreise',
}

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

export const TimeEntryTypeColorMap: Record<TimeEntryType, string> = {
  [TimeEntryType.PARENTAL_LEAVE]:   '#0ea5e9', // sky-500
  [TimeEntryType.PUBLIC_HOLIDAY]:   '#d946ef', // fuchsia-500
  [TimeEntryType.EDUCATION]:        '#475569', // slate-600
  [TimeEntryType.SICK_CHILD]:       '#f59e0b', // amber-500
  [TimeEntryType.SICK]:             '#dc2626', // red-600
  [TimeEntryType.WORK]:             '#475569', // slate-600
  [TimeEntryType.SPECIAL_LEAVE]:    '#fb7185', // rose-400
  [TimeEntryType.UNPAID_LEAVE]:     '#a8a29e', // stone-400
  [TimeEntryType.VACATION]:         '#10b981', // emerald-500
  [TimeEntryType.COMPENSATORY_OFF]: '#2dd4bf', // teal-400
}

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

//* Permissions
// --- Permission Action ---
export const PermissionActionLabels: Record<PermissionAction, string> = {
  [PermissionAction.READ]:   'Lesen',
  [PermissionAction.CREATE]: 'Erstellen',
  [PermissionAction.UPDATE]: 'Bearbeiten',
  [PermissionAction.DELETE]: 'Löschen',
}

export const PermissionActionColors: Record<PermissionAction, string> = {
  [PermissionAction.READ]:   '#3b82f6', // blue-500
  [PermissionAction.CREATE]: '#10b981', // emerald-500
  [PermissionAction.UPDATE]: '#f59e0b', // amber-500
  [PermissionAction.DELETE]: '#ef4444', // red-500
}

// --- Permission Scope ---
export const PermissionScopeLabels: Record<PermissionScope, string> = {
  [PermissionScope.ALL]:         'Alle',
  [PermissionScope.DEPARTMENT]:  'Abteilung',
  [PermissionScope.SUBORDINATE]: 'Untergebene',
  [PermissionScope.SELF]:        'Eigene',
}

// export const PermissionScopeColors: Record<PermissionScope, string> = {
//   [PermissionScope.ALL]:         '#ef4444', // red-500
//   [PermissionScope.DEPARTMENT]:  '#f97316', // orange-500
//   [PermissionScope.SUBORDINATE]: '#eab308', // yellow-500
//   [PermissionScope.SELF]:        '#94a3b8', // slate-400
// }

export const PermissionScopeColors: Record<PermissionScope, string> = {
  [PermissionScope.SELF]:        '#94a3b8', // slate-400
  [PermissionScope.SUBORDINATE]: '#3b82f6', // blue-500
  [PermissionScope.DEPARTMENT]:  '#8b5cf6', // violet-500
  [PermissionScope.ALL]:         '#ec4899', // pink-500
}

export const PermissionActionClasses: Record<PermissionAction, string> = {
  [PermissionAction.READ]:   'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
  [PermissionAction.CREATE]: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
  [PermissionAction.UPDATE]: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
  [PermissionAction.DELETE]: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
}