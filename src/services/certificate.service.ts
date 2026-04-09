import api from "@/lib/axios";

async function getCertificateById(entityId: string): Promise<any> {

  const result = await api.get(`/certificate/?entity_id=${entityId}`)
  return result.data.data
}


export const certificateService = {
  getCertificateById
}