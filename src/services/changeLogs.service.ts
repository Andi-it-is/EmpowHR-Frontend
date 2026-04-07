import api from "@/lib/axios";

async function getLogsById(entityId: string): Promise<any> {

  const result = await api.get(`/changelog/entity?entity_id=${entityId}`)
  return result.data.data
}


export const changeLogsService = {
  getLogsById
}