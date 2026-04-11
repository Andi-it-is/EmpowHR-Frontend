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

/**
 * Formatiert einen Datumsstring in das deutsche Format DD.MM.YYYY
 * @param dateInput - Das Datum als String (z.B. "2004-04-13") oder Date-Objekt
 * @returns Formatierter String "13.04.2004"
 */
export function isoToGermanDate(dateInput: string | Date): string {
  if (!dateInput) return '—';

  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(dateInput));
}