const longDate = new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Rome',
});

/**
 * Data in italiano per esteso ("12 ottobre 2026") a partire da una data ISO.
 * @param {string|null|undefined} value
 * @returns {string|null} null se manca o non è una data valida
 */
export function formatLongDate(value) {
    if (typeof value !== 'string' || value === '') return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : longDate.format(date);
}
