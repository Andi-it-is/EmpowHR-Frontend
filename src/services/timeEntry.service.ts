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
  working_location: WorkingLocation
  type?: TimeEntryType
}

export interface WorkTimeEntriesResponse {
  entries: TimeEntry[]
  timeAccount: UserTimeAccount
  shouldWorkHoursPerDay: number
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

async function createWorkTimeEntry(data: CreateTimeEntryRequest): Promise<TimeEntry> {
  
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

export const timeEntryService = {
  listWorkTimeEntries,
  createWorkTimeEntry,
  updateTimeEntry,
  deleteTimeEntry
}

