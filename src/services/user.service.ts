import api from "@/lib/axios";
import type { Role } from "./role.service";
import type { Department } from "./department.service";

interface SimpleUserObject {
  id: string,
  firstname: string,
  lastname: string,
  email: string,
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

export const userService = {
  getSimpleUserInfo,
  getUserById,
  listAllUsers
}