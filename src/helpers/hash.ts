export function hashCode(t: string) {
  let hash = 0,
    i = 0;
  const len = t.length;
  while (i < len) {
    hash = ((hash << 5) - hash + t.charCodeAt(i++)) << 0;
  }
  return hash + 2147483647 + 1;
}
