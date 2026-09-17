/** Short unique id, prefixed so ids stay readable in stored JSON. */
export const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
