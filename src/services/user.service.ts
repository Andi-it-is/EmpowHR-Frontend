import api from "@/lib/axios";
import type { Role } from "./role.service";
import type { Department } from "./department.service";
import type { RoleName } from "@/constants/enums/acessControl.enum";
import type { Gender } from "@/constants/enums/componentHelpers.enum";

interface RoleNameObject {
  roles: RoleName[]
}
interface SimpleUserObject {
  id: string,
  firstname: string,
  lastname: string,
  email: string,
  department: Department
}

export interface User {
  id: string
  firstname: string
  lastname: string
  email: string
  disabled: boolean
  supervisor: User | null
  roles: Role[] 
  department: Department | null
}

async function getSimpleUserInfo(): Promise<SimpleUserObject> {

  const result = await (await api.get("/user/simple")).data.data
  return result
}

async function getUserById(userId: string): Promise<User> {

  const result = (await api.get(`/user/${userId}`))
  return result.data.data
}

async function listAllUsers(): Promise<User[]> {

  const result = await api.get('/user/all')
  return result.data.data

}

async function updateUserById(userId: string, data: Partial<User>): Promise<User> {

  const result = await api.patch(`/user/${userId}`, data)
  return result.data.data
}

async function deleteUserById(userId: string): Promise<boolean> {

  const result = await api.delete(`/user/${userId}`)
  return result.data.success
}

async function updateUserRolesByUserId(userId: string, roles: RoleNameObject): Promise<void> {
  
  const result = await api.patch(`/user/${userId}/roles`, roles)
  return result.data.data
}


export interface CreateEmployeeForm {
  // Step 1 – Basis Daten
  firstname:    string
  lastname:     string
  email:        string
  departmentId: string
  location:     string
  entryDate:    string
  job_title:    string

  // Step 2 – Stammdaten
  birthDate:          string
  birthPlace:         string
  nationality:        string
  gender:             Gender
  banking_detail:     string
  street:             string
  zipcode:            string
  city:               string
  country:            string
  company_alias:      string
  telephone_business: string
  telephone_private:  string

  // Step 3 – Zeitkonto
  contract_hours_per_week: number
  working_days_per_week:   number
  vacation_days_per_year:  number
  delta_hours:             number
}

async function createFullNewUser(data: CreateEmployeeForm): Promise<boolean> {

  const result = await api.post('/user/create', data)
  return result.data.success
}


async function resetUserPassword(id: string, new_password: string, new_password_confirm: string): Promise<boolean> {
  const result = await api.patch(`/user/${id}/reset-password`, {
    new_password,
    new_password_confirm,
  })
  return result.data.success
}

async function listPeopleFinderInformations(): Promise<any> {
  
  const result = await api.get('/user/peopleFinder')
  return result.data
}

export const userService = {
  getSimpleUserInfo,
  getUserById,
  listAllUsers,
  updateUserById,
  deleteUserById,
  updateUserRolesByUserId,
  createFullNewUser,
  resetUserPassword,
  listPeopleFinderInformations
}