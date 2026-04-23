import api from "@/lib/axios";


export interface UserTimeAccount {
  id: string
  contract_hours_per_week: number
  working_days_per_week: number
  vacation_days_per_year: number
  delta_hours: number
  valid_from: string
  created_at: string
  updated_at: string
}

export interface TimeAccountResponse {
  success: boolean
  shouldWorkHoursPerWeek: number
  data: UserTimeAccount
}


async function getMyTimeAccount(): Promise<TimeAccountResponse> {
  const result = await (await api.get("/userTimeAccount/my")).data
  console.log(result)
  return result
}

export const userTimeAccountService = {
  getMyTimeAccount
}