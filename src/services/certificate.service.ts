import api from "@/lib/axios";

export interface Certificate {
  id: string
  title: string
  description: string
  file_path: string
  issued_at: string | Date
  expires_at: string | Date
  created_at: Date
  updated_at: Date
  userId: string
}

async function getCertificateById(certId: string): Promise<any> {

  const response = await api.get(`/certificate/${certId}/file`, { responseType: 'blob' })
  // const blob = new Blob([response.data], { type: 'application/pdf' })
  return URL.createObjectURL(response.data)
}

async function listCertificates(): Promise<any> {
  const result = await api.get('/certificate')
  return result.data.data
}

async function listCertificatesByUserId(userId: string): Promise<Certificate[]> {

  const response = await api.get(`/certificate/other/${userId}`)
  return response.data.data
}

async function getCertificateByUserId(userId: string, certId: string): Promise<string> {

  const response = await api.get(`/certificate/other/${userId}/${certId}/file`, { responseType: 'blob' })
  return URL.createObjectURL(response.data)
}

async function uploadCertificateForUser(
  userId: string,
  file: File,
  data: { title: string; description?: string; issued_at?: string; expires_at?: string }
): Promise<Certificate> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', data.title)
  if (data.description) formData.append('description', data.description)
  if (data.issued_at) formData.append('issued_at', data.issued_at)
  if (data.expires_at) formData.append('expires_at', data.expires_at)

  const response = await api.post(`/certificate/other/${userId}/create`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data.data
}

async function updateCertificateForUser(
  userId: string,
  certId: string,
  data: { title: string; description?: string; issued_at?: string; expires_at?: string }
): Promise<void> {
  await api.patch(`/certificate/other/${userId}/${certId}`, data)
}

async function deleteCertificateForUser(userId: string, certId: string): Promise<void> {
  await api.delete(`/certificate/other/${userId}/${certId}`)
}

export const certificateService = {
  getCertificateById,
  listCertificates,
  listCertificatesByUserId,
  getCertificateByUserId,
  uploadCertificateForUser,
  updateCertificateForUser,
  deleteCertificateForUser
}