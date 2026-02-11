/**
 * Serialize a value to a plain object/array/primitive so it can be safely passed
 * from Server Components to Client Components in Next.js (no classes or null prototypes).
 */
export function serializeForClient(value) {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return value
  }
}
