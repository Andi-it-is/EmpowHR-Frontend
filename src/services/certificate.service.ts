import api from "@/lib/axios";

export interface Certificate {
  id: string
  title: string
  description: string
  file_path: string
  issued_at: string | Date
  expires_at: string | Date
  created_at: string | Date
  updated_at: string | Date
  userId: string
}

async function getCertificateById(certId: string): Promise<any> {

  const response = await api.get(`/certificate/${certId}/file`, { responseType: 'blob' })
  const blob = new Blob([response.data], { type: 'application/pdf' })
  return URL.createObjectURL(blob)
}

async function listCertificates(): Promise<any> {
  const result = await api.get('/certificate')
  return result.data.data
}


export const certificateService = {
  getCertificateById,
  listCertificates
}