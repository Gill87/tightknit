const key = (userId: string, roomId: string) => `tightknit:read:${userId}:${roomId}`

export function getLastRead(userId: string, roomId: string): Date | null {
  if (typeof window === 'undefined') return null
  const val = localStorage.getItem(key(userId, roomId))
  return val ? new Date(val) : null
}

export function markRoomRead(userId: string, roomId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key(userId, roomId), new Date().toISOString())
}
