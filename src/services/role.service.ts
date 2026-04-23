import { RoleName, ExistingEntityNames, PermissionAction, PermissionScope } from '@/constants/enums/acessControl.enum'
import { DocumentSecurityLevel } from '@/constants/enums/document.enum'
import api from '@/lib/axios'

export interface Permission {
  id: string
  entity: ExistingEntityNames
  action: PermissionAction
  scope: PermissionScope
  created_at: Date
  updated_at: Date
}

export interface Role {
  id: string
  name: RoleName
  max_security_level: DocumentSecurityLevel
  permissions: Permission[]
  created_at: Date
  updated_at: Date
}

async function listRoles(): Promise<Role[]> {

  const result = await api.get("/role/all")
  return result.data.data
} 

async function listPermissions(): Promise<Permission[]> {

  const result = await api.get("/permission/all")
  return result.data.data
} 

async function updateRolesPermissions(roleId: string, permissionIds: string[]) {
  const response = await api.patch(`/role/${roleId}/permissions`, { permissionIds })
  return response.data
}
  
export const roleService = {
  listRoles,
  listPermissions,
  updateRolesPermissions
}