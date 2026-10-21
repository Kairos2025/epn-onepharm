/**
 * Generates an 11-character DHIS2-compatible UID:
 * First character is a letter [a-zA-Z], followed by 10 alphanumeric characters.
 */
export function generateUid(): string {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  let result = letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function isValidUid(uid: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9]{10}$/.test(uid);
}
