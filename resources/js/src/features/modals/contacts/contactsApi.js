import { fetchList } from "../../../services/apiClient";

// Stessi schemi accettati dal pannello (Contact::HREF_PATTERN): niente javascript:, data: e simili
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:)\S+$/i;

/**
 * GET /api/contacts: contatti visibili, già ordinati dal backend.
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array>}
 */
export function getContacts(signal) {
    return fetchList("/api/contacts", signal);
}

/**
 * Contatti dell'API → formato atteso dalla finestra (come contactsData.js).
 * Seconda difesa oltre al pannello: un indirizzo con schema non ammesso viene scartato, così non può
 * diventare un link eseguibile.
 * @param {Array} contacts
 * @returns {Array}
 */
export function mapApiContacts(contacts) {
    return contacts.filter((contact) => typeof contact.href === "string" && SAFE_HREF.test(contact.href.trim()));
}
