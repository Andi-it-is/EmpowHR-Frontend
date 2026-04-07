import api from "@/lib/axios"

interface UserMasterData {
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

async function updateMasterData(data: Partial<UserMasterData>): Promise<Partial<UserMasterData>> {

  const result = (await api.patch('/userMasterData', data)).data.data
  return result
}


export const userMasterDataService = {
  getMasterData,
  updateMasterData
}