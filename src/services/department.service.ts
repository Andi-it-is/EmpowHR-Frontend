import api from "@/lib/axios"
import type { User } from "./user.service"

export interface CreateDepartment {
  name: string
  cost_center: string
  headId?: string
  parentId?: string
}

export interface UpdateDepartment {
  name: string
  cost_center?: string
  headId?: string
  parentId?: string
}

export interface Department {
  id: string
  name: string
  cost_center?: string
  created_at: Date
  updated_at: Date
  parent?: Department,
  children?: Department[]
  head?: Pick<User, 'id' | 'firstname' | 'lastname' | 'email'>
  users: User[]
}

async function listAllDepartments(): Promise<Department[]>{

  const result = await api.get('/department/all')
  return result.data.data
}

export interface DepartmentTimeEntriesRequest {
  month: number
  year: number
}

// used for management layer
async function listDepartmentCalendarWithUsers(deptId: string, data: DepartmentTimeEntriesRequest): Promise<any> {

  const result = await api.post(`/department/list/teamcalendar/${deptId}`, data)
  return result.data.data
}

// used for user layer
async function listDepartmentCalendarAnonymized(departmentId: string, data: DepartmentTimeEntriesRequest): Promise<any> {
  
  const result = await api.post(`/department/list/teamcalendar/${departmentId}/anonymized`, data)
  return result.data.data
}

async function createDepartment(data: CreateDepartment): Promise<Department> {

  const result = await api.post('/department/create', data)
  return result.data.data
}

async function updateDepartmentById(deptId: string, data: UpdateDepartment): Promise<Department> {
  
  const result = await api.patch(`/department/${deptId}`, data)
  return result.data.data
}

async function deleteDepartmentById(deptId: string): Promise<boolean> {
  
  const result = await api.delete(`/department/${deptId}`)
  return result.data.success
}

export const departmentService = {
  listAllDepartments,
  createDepartment,
  updateDepartmentById,
  deleteDepartmentById,
  listDepartmentCalendarWithUsers,
  listDepartmentCalendarAnonymized
}