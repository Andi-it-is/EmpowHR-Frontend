import type { DocumentType } from "@/constants/enums/document.enum";
import api from "@/lib/axios";

interface DocumentFilters {
  type: DocumentType[],
  security_level: number[],   // mapped numbers, after applying DocumentSecurityLevelApiMap previously
  date_from: string,
  date_to: string,
}

async function getDocuments(): Promise<any> {

  const result = await api.get(`/document/my`)
  return result.data.data
}

async function getDocumentsByFilters(filters: DocumentFilters): Promise<any> {

  console.log("FILTER DER ANS BACKEND GEHT ", filters)
  const result = await api.post(`/document/my/filter`, filters)
  return result.data.data
}


function getFileUrl (id: string) {
  // gibt eine URL zurück die der Browser direkt aufrufen kann
  return `${api.defaults.baseURL}/document/${id}/file`
}

async function getDocumentFile(id: string): Promise<string> {
  const response = await api.get(`/document/${id}/file`, { responseType: 'blob' })
  const blob = new Blob([response.data], { type: 'application/pdf' })
  return URL.createObjectURL(blob)
}

export const documentService = {
  getDocuments,
  getDocumentsByFilters,
  getFileUrl,
  getDocumentFile
}