export interface Department {
  id: string
  name: string
  cost_center?: string
  created_at: Date
  updated_at: Date
  parentId?: string
}