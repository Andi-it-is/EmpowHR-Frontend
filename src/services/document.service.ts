import type { DocumentType, DocumentSecurityLevel } from "@/constants/enums/document.enum";
import api from "@/lib/axios";


interface DocumentFilters {
  type: DocumentType[],
  security_level: number[],   // mapped numbers, after applying DocumentSecurityLevelApiMap previously
  date_from: string,
  date_to: string,
}

export interface Document {
  id: string
  
  // used in frontend stuff
  name: string
  date: string | Date
  
  title: string
  type: DocumentType
  security_level: DocumentSecurityLevel
  
  // file_path senden wir im Frontend meistens nicht mit (Sicherheit),
  // aber falls die API ihn liefert, ist er hier ein string:
  file_path?: string

  // Im Frontend kommen Dates von der API meist als ISO-Strings an
  created_at: string | Date
  updated_at: string | Date

  // Die Relation zum User (oft optional oder nur die ID, je nach API-Serialisierung)
  user?: string
}

async function getDocuments(): Promise<any> {

  const result = await api.get(`/document/my`)
  return result.data.data
}

async function getDocumentsByFilters(filters: DocumentFilters): Promise<any> {

  const result = await api.post(`/document/my/filter`, filters)
  return result.data.data
}


function getFileUrl (id: string) {
  // gibt eine URL zurück die der Browser direkt aufrufen kann
  return `${api.defaults.baseURL}/document/${id}/file`
}

async function getDocumentFile(id: string): Promise<string> {
  const response = await api.get(`/document/${id}/file`, { responseType: 'blob' })
  // const blob = new Blob([response.data], { type: 'application/pdf' })
  return URL.createObjectURL(response.data)
}

export const documentService = {
  getDocuments,
  getDocumentsByFilters,
  getFileUrl,
  getDocumentFile
}