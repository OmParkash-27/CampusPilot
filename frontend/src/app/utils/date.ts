
/**
    Convert a Date to UTC (00:00:00 time)
 */
export function toUTCDate(date: Date | string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();
}

/**
    Convert UTC string to local Date (for display or form control)
 */
export function fromUTCDate(utcString: string | null | Date): Date | null {
  if (!utcString) return null;
  return new Date(utcString); // Angular DatePipe or p-datepicker handles local display
}

/**
    Extract numeric year from date (safe for batchYear)
 */
export function extractYear(value: string | Date | number | null): number | null {
  if (!value) return null;
  const date = new Date(value);
  return date.getUTCFullYear();
}

/**
    Format date for user interface (optional)
 */
export function formatDateForDisplay(date: string | Date | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}
