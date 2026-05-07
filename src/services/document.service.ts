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

async function uploadDocument(
  file: File,
  meta: {
    title: string
    type: DocumentType
    security_level: DocumentSecurityLevel | number
  }
): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', meta.title)
  formData.append('type', meta.type)
  formData.append('security_level', String(meta.security_level))

  const result = await api.post('/document/my/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return result.data.data
}

async function listDocumentsByUserId(userId: string): Promise<Document[]> {
  
  const result = await api.get(`/document/other/${userId}`)
  return result.data.data
}

async function uploadDocumentByUserId(
  userId: string,
  file: File,
  meta: {
    title: string
    type: DocumentType
    security_level: DocumentSecurityLevel | number
  }
): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', meta.title)
  formData.append('type', meta.type)
  formData.append('security_level', String(meta.security_level))

  const result = await api.post(`/document/other/${userId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return result.data.data
}

async function updateDocumentByUserId(
  userId: string,
  documentId: string,
  meta: {
    title?: string
    type?: DocumentType
    security_level?: DocumentSecurityLevel | number
  }
): Promise<any> {
  const result = await api.patch(`/document/other/${userId}/${documentId}`, meta)
  return result.data.data
}

async function deleteDocumentByUserId(
  userId: string,
  documentId: string
): Promise<any> {
  const result = await api.delete(`/document/other/${userId}/${documentId}`)
  return result.data
}

export const documentService = {
  getDocuments,
  getDocumentsByFilters,
  getFileUrl,
  getDocumentFile,
  uploadDocument,
  listDocumentsByUserId,
  uploadDocumentByUserId,
  updateDocumentByUserId,
  deleteDocumentByUserId
}