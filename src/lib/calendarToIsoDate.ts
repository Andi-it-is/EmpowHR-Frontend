/**
 * 
 * @param calendarDate V-model from the generic CalendarInput Component
 * @returns Iso String, without taking hours etc. into consideration
 * @example 2026-04-08T00:00:00.000Z
 */
export function calendarToIsoDate(calendarDate: any): string | undefined {
    if (!calendarDate) return undefined
    const { year, month, day } = calendarDate
    const mm = String(month).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    return `${year}-${mm}-${dd}T00:00:00.000Z`
}