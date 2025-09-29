export function timeAgo(date: Date | number): string {
  const timestamp = typeof date === "number" ? date : date.getTime()
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  const intervals = [
    { label: "y", secs: 31536000 },
    { label: "mo", secs: 2592000 },
    { label: "w", secs: 604800 },
    { label: "d", secs: 86400 },
    { label: "h", secs: 3600 },
    { label: "m", secs: 60 },
    { label: "s", secs: 1 },
  ]
  for (const i of intervals) {
    const v = Math.floor(seconds / i.secs)
    if (v >= 1) return `${v}${i.label}`
  }
  return "just now"
}

/** Returns all leaf values of an arbitrary object as strings. */
export function* allLeafValues(
  obj: any,
  visited = new Set()
): Generator<string> {
  if (visited.has(obj) || obj == null) return
  if (typeof obj === "string") yield obj
  else if (typeof obj === "number") yield String(obj)
  else if (typeof obj === "object") {
    visited.add(obj)
    for (const key in obj) {
      yield* allLeafValues(obj[key], visited)
    }
  }
}
