import { RoleName } from "@/constants/enums/acessControl.enum";
import { DepartmentName } from "@/constants/enums/departmentColors.enum";


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