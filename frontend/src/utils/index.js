export function generateRandomString(size = 16) {
  return [...Array(size)].map(() => Math.random().toString(36)[2]).join('')
}