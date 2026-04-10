import api from "@/lib/axios";

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