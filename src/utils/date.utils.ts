/**
 * Utilitaire pour gérer les dates en UTC
 */

/**
 * Retourne la date actuelle en UTC sous forme de string ISO
 * @returns Date en UTC au format ISO string
 */
export function getUtcDate(): string {
  return new Date().toISOString();
}

/**
 * Retourne un objet Date en UTC
 * @returns Date en UTC
 */
export function getUtcDateObject(): Date {
  const isoString = new Date().toISOString();
  return new Date(isoString);
}

/**
 * Convertit une date en UTC pour comparaison
 * @param date - Date à convertir
 * @returns Date en UTC
 */
export function toUtcDate(date: Date | string | number): Date {
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
}

/**
 * Compare deux dates en UTC
 * @param date1 - Première date
 * @param date2 - Deuxième date
 * @returns Retourne true si date1 < date2
 */
export function compareDatesUtc(
  date1: Date | string,
  date2: Date | string,
): boolean {
  const d1 = toUtcDate(date1).getTime();
  const d2 = toUtcDate(date2).getTime();
  return d1 < d2;
}
