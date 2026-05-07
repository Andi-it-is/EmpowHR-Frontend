// src/lib/enums/document.enum.ts

export enum DocumentType {
  CONTRACT = 'CONTRACT',
  FINANCE = 'FINANCE',
  ABSENCE = 'ABSENCE',
  QUALIFICATION = 'QUALIFICATION',
  COMPLIANCE = 'COMPLIANCE',
}

export enum DocumentSecurityLevel {
  RESTRICTED = 'RESTRICTED',
  BUSINESS = 'BUSINESS',
  SECRET = 'CONFIDENTIAL',
  TOP_SECRET = 'TOP_SECRET',
}

export const DocumentTypeLabels: Record<DocumentType, string> = {
  [DocumentType.CONTRACT]: 'Vertrag',
  [DocumentType.FINANCE]: 'Finanzen',
  [DocumentType.ABSENCE]: 'Abwesenheit',
  [DocumentType.QUALIFICATION]: 'Qualifikation',
  [DocumentType.COMPLIANCE]: 'Compliance',
}

export const DocumentSecurityLevelLabels: Record<DocumentSecurityLevel, string> = {
  [DocumentSecurityLevel.RESTRICTED]: 'Dienstgebrauch',
  [DocumentSecurityLevel.BUSINESS]: 'Vertraulich',
  [DocumentSecurityLevel.SECRET]: 'Geheim',
  [DocumentSecurityLevel.TOP_SECRET]: 'Sehr Geheim',
}

export const DocumentSecurityLevelFromApi: Record<number, DocumentSecurityLevel> = {
  1: DocumentSecurityLevel.RESTRICTED,
  2: DocumentSecurityLevel.BUSINESS,
  3: DocumentSecurityLevel.SECRET,
  4: DocumentSecurityLevel.TOP_SECRET,
}

export const DocumentSecurityLevelApiMap: Record<DocumentSecurityLevel, number> = {
  [DocumentSecurityLevel.RESTRICTED]:   1,
  [DocumentSecurityLevel.BUSINESS]:     2,
  [DocumentSecurityLevel.SECRET]: 3,
  [DocumentSecurityLevel.TOP_SECRET]:   4,
}

export const DocumentSecurityLevelVariant: Record<DocumentSecurityLevel, string> = {
  [DocumentSecurityLevel.RESTRICTED]: 'secondary',
  [DocumentSecurityLevel.BUSINESS]: 'outline',
  [DocumentSecurityLevel.SECRET]: 'destructive',
  [DocumentSecurityLevel.TOP_SECRET]: 'destructive',
}