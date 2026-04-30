import api from "@/lib/axios"

export interface UserMasterData {
  id: string,
  company_alias: string,
  street: string,
  zipcode: string,
  city: string,
  country: string,
  date_of_birth: string,
  telephone_business: string,
  telephone_private: string,
  banking_detail: string,
  job_title: string,
  started_working_date: string,
  created_at: Date,
  updated_at: Date,
  user: {
    id: string,
    firstname: string,
    lastname: string,
    email: string,
    disabled: boolean,
    failed_login_attempts: number,
    created_at: Date,
    updated_at: Date
  }
}

async function getMasterData(): Promise<UserMasterData> {

  const result = await (await api.get('/userMasterData')).data.data
  return result
}

async function getMasterDataById(userId: string): Promise<UserMasterData> {

  const result = await api.get(`/userMasterData/${userId}`)
  return result.data.data
}

async function updateMasterData(data: Partial<UserMasterData>): Promise<Partial<UserMasterData>> {

  const result = (await api.patch('/userMasterData', data)).data.data
  return result
}

async function updateMasterDataById(userId: string, data: Partial<UserMasterData>): Promise<UserMasterData> {

  const result = await api.patch(`/userMasterData/${userId}`, data)
  return result.data.data
}



export const userMasterDataService = {
  getMasterData,
  updateMasterData,
  getMasterDataById,
  updateMasterDataById
}