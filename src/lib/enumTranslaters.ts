import { RoleName } from "@/constants/enums/acessControl.enum";

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
  [RoleName.HR_MANAGER]: '#10b981',        // Smaragdgrün (Personal/Wachstum)
  [RoleName.ACCOUNTANT]: '#f59e0b',        // Bernstein/Gelb (Finanzen/Achtung)
  [RoleName.IT_ADMINISTRATOR]: '#63f6f1',  // Indigo (Technik/Infrastruktur)
  [RoleName.EXECUTIVE]: '#dc2626',         // Gefährliches Rot (Autorität)
};

/**
 * Hilfsfunktion, um die Farbe zu einer Rolle zu erhalten
 */
export function getRoleColor(role: RoleName): string {
  return RoleColors[role] || '#cccccc';
}