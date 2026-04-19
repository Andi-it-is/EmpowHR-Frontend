

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

/**
 * 
 * @returns Wochentag und formattierten Tagesaktuellen String.
 * @example Donnerstag, den 16.04.2026
 */
export function getFormattedTodayDate(): string {
  const now = new Date();

  const weekday = now.toLocaleDateString('de-DE', { weekday: 'long' });
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  return `${weekday}, den ${day}.${month}.${year}`;
}


/**
 * 
 * @returns Aktuelle Kalenderwoche
 */
export function getCalendarWeek(): number {
  const heute = new Date();
  
  // Ein neues Datumsobjekt erstellen, um das Original nicht zu verändern
  const d = new Date(Date.UTC(heute.getFullYear(), heute.getMonth(), heute.getDate()));
  
  // Den Wochentag auf den nächsten Donnerstag setzen:
  // (Donnerstag ist der Anker für die ISO-Wochenrechnung)
  const tagNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - tagNum);
  
  // Start des Jahres finden
  const jahrStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  
  // Differenz in Tagen berechnen und durch 7 teilen
  const woche = Math.ceil((((d.getTime() - jahrStart.getTime()) / 86400000) + 1) / 7);
  
  return woche;
}