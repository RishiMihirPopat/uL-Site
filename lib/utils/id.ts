/**
 * Short random event ID generator (SRP).
 * Produces collision-resistant IDs like "evt_k7xPq2mR" using Web Crypto.
 * No external dependencies.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const ID_LENGTH = 8;
const PREFIX = 'evt_';

export function generateEventId(): string {
  const bytes = new Uint8Array(ID_LENGTH);
  crypto.getRandomValues(bytes);
  let id = PREFIX;
  for (let i = 0; i < ID_LENGTH; i++) {
    id += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return id;
}
