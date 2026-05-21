import { TimeEntryType, WorkingLocation } from "@/constants/enums/timeRecodring.enum"
import api from "@/lib/axios";

export interface TimeEntry {
  id: string;
  working_location: WorkingLocation | null;
  type: TimeEntryType;
  start_date: Date;
  end_date: Date;
  interruption_hours: number;
  recorded_hours: number;
  is_confirmed: boolean;
  created_at: Date;
  updated_at: Date;
  time_account?: UserTimeAccount;
}

export interface UserTimeAccount {
  id: string;
  contract_hours_per_week: number;
  working_days_per_week: number;
  vacation_days_per_year: number;
  delta_hours: number;
  created_at: Date;
  updated_at: Date;
  
  // Relationships
  time_entries: TimeEntry[];
  // user: User;
}

export interface TimeEntryFilter {
  working_location?: (WorkingLocation | null)[]
  type?: TimeEntryType[]
  start_date?: string        // ISO date
  end_date?: string          // ISO date
  is_confirmed?: boolean
}

export interface CreateTimeEntryRequest {
  start_date: Date
  end_date: Date
  working_location: WorkingLocation | null
  type?: TimeEntryType
  is_confirmed?: boolean
}

export interface WorkTimeEntriesResponse {
  entries: TimeEntry[]
  timeAccount: UserTimeAccount
  shouldWorkHoursPerDay: number
}

export interface AbscenceTimeEntriesResponse {
  entries: TimeEntry[]
  timeAccount: UserTimeAccount
  vacationDaysPerYear: number
}

async function listWorkTimeEntries(): Promise<WorkTimeEntriesResponse> {

  const filter: TimeEntryFilter = {
    working_location: [WorkingLocation.OFFICE, WorkingLocation.REMOTE, WorkingLocation.FIELD_SERVICE],
    type: [TimeEntryType.WORK],
  }

  const result = (await api.post("/timeEntry/my/filter", filter))
  return {
    entries: result.data.data,
    timeAccount: result.data.timeAccount,
    shouldWorkHoursPerDay: result.data.shouldWorkHoursPerDay,
  }
}

async function listAbscenceTimeEntires(): Promise<AbscenceTimeEntriesResponse> {

  const filter: TimeEntryFilter = {
    working_location: [null]
  }
  const result = (await api.post("/timeEntry/my/filter", filter ))
  return {
    entries: result.data.data,
    timeAccount: result.data.timeAccount,
    vacationDaysPerYear: result.data.vacation_days_per_year
  }

}

async function listAllTimeEntriesAvailable(): Promise<TimeEntry[]> {
  
  const result = (await api.post("/timeEntry/my/filter", {}))
  return result.data.data
}

async function listAllTimeEntriesByFilter(filter: TimeEntryFilter): Promise<TimeEntry[]> {
  
  const result = (await api.post("/timeEntry/my/filter", filter))
  return result.data.data
}

async function listUnconfirmedTimeEntriesByDepartment(deptId: string): Promise<any> {

  const result = await api.get(`/timeEntry/unconfirmed/${deptId}`)
  return result.data.data
}

async function changeTimeEntryConfirmation(id: string, is_confirmed: boolean): Promise<void> {
  await api.patch(`/timeEntry/${id}/confirmation`, { is_confirmed })
}

async function createTimeEntry(data: CreateTimeEntryRequest): Promise<TimeEntry> {
  
  const result = await api.post('/timeEntry/my/create', data)
  return result.data.data
}

async function updateTimeEntry(id: string, data: CreateTimeEntryRequest): Promise<TimeEntry> {

  const result = await api.patch(`/timeEntry/my/${id}`, data)
  return result.data.data
}

async function deleteTimeEntry(id: string): Promise<void> {
  await api.delete(`/timeEntry/my/${id}`)
}

async function listAbscenceTimeEntiresByUserId(userId: string): Promise<AbscenceTimeEntriesResponse> {

  const filter: TimeEntryFilter = {
    working_location: [null]
  }
  const result = await api.post(`/timeEntry/other/${userId}/filter`, filter)
  return {
    entries: result.data.data,
    timeAccount: result.data.timeAccount,
    vacationDaysPerYear: result.data.vacation_days_per_year
  }
}

async function createTimeEntryForUserByUserId(userId: string, data: CreateTimeEntryRequest): Promise<TimeEntry> {

  const result = await api.post(`/timeEntry/other/${userId}/create`, data)
  return result.data.data
}

async function updateTimeEntryByUserId(userId: string, entryId: string, data: CreateTimeEntryRequest): Promise<TimeEntry> {
  
  const result = await api.patch(`/timeEntry/other/${userId}/${entryId}`, data)
  return result.data.data
}

async function deleteTimeEntryByUserId(userId: string, entryId: string): Promise<void> {
  await api.delete(`/timeEntry/other/${userId}/${entryId}`)
}


export const timeEntryService = {
  listWorkTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  listAbscenceTimeEntires,
  listAllTimeEntriesAvailable,
  listAllTimeEntriesByFilter,
  listAbscenceTimeEntiresByUserId,
  createTimeEntryForUserByUserId,
  updateTimeEntryByUserId,
  deleteTimeEntryByUserId,
  listUnconfirmedTimeEntriesByDepartment,
  changeTimeEntryConfirmation
}

