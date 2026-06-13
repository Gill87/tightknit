import { useQuery } from '@tanstack/react-query'
import { getSupabase } from '@/lib/supabase/client'
import { parseListingRoom, resolveParticipantDisplayName } from '@/lib/messaging/participantDisplayName'
import { getLastRead } from '@/lib/messaging/readStatus'
import { useCurrentUser } from '@/lib/queries/profile'

export type Conversation = {
  id: string
  roomId: string
  participantName: string
  lastMessage: string
  timestamp: string
  unreadCount: number
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export function useConversations(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['conversations', userId] as const,
    queryFn: async (): Promise<Conversation[]> => {
      const supabase = getSupabase()

      const { data: msgs } = await supabase
        .from('messages')
        .select('room_id, content, created_at, sender_id')
        .like('room_id', `%${userId}%`)
        .order('created_at', { ascending: false })

      if (!msgs?.length) return []

      const roomMap = new Map<string, (typeof msgs)[0]>()
      const roomMessages = new Map<string, (typeof msgs)>()
      for (const msg of msgs) {
        if (!roomMap.has(msg.room_id)) roomMap.set(msg.room_id, msg)
        const arr = roomMessages.get(msg.room_id) ?? []
        arr.push(msg)
        roomMessages.set(msg.room_id, arr)
      }

      const rooms = [...roomMap.entries()].map(([roomId, msg]) => {
        const parsed = parseListingRoom(roomId)
        if (!parsed) return { roomId, msg, invalidRoom: true as const }
        const otherUserId = parsed.peerIds.find(uid => uid !== userId) ?? parsed.peerIds[0]
        return { roomId, listingId: parsed.listingId, otherUserId, msg, invalidRoom: false as const }
      })

      const listingIds = [
        ...new Set(rooms.filter(r => !r.invalidRoom).map(r => (r as { listingId: string }).listingId)),
      ]
      const { data: listings } = await supabase
        .from('listings')
        .select('id, posted_by, posted_by_name')
        .in('id', listingIds)

      const listingById = new Map<string, { posted_by: string; posted_by_name: string | null }>(
        (listings ?? []).map((l: { id: string; posted_by: string; posted_by_name: string | null }) => [
          l.id,
          { posted_by: l.posted_by, posted_by_name: l.posted_by_name },
        ])
      )

      const otherIds = [
        ...new Set(rooms.filter(r => !r.invalidRoom).map(r => (r as { otherUserId: string }).otherUserId)),
      ]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username')
        .in('id', otherIds)

      const profileById = new Map(
        (profiles ?? []).map((p: { id: string; full_name: string | null; username: string | null }) => [
          p.id,
          { full_name: p.full_name, username: p.username },
        ])
      )

      return rooms.map((row, i): Conversation => {
        if (row.invalidRoom) {
          const lastRead = getLastRead(userId!, row.roomId)
          const unreadCount = (roomMessages.get(row.roomId) ?? []).filter(
            (m: { sender_id: string; created_at: string }) => m.sender_id !== userId && (!lastRead || new Date(m.created_at) > lastRead)
          ).length
          return {
            id: String(i),
            roomId: row.roomId,
            participantName: 'Invalid conversation',
            lastMessage: row.msg.content,
            timestamp: timeAgo(row.msg.created_at),
            unreadCount,
          }
        }
        const { roomId, listingId, otherUserId, msg } = row as {
          roomId: string
          listingId: string
          otherUserId: string
          msg: { content: string; created_at: string }
          invalidRoom: false
        }
        const listing = listingById.get(listingId)
        const name = resolveParticipantDisplayName({
          listingPostedBy: listing?.posted_by,
          listingPostedByName: listing?.posted_by_name,
          otherUserId,
          profile: profileById.get(otherUserId) ?? null,
        })
        if (name === 'Neighbor') {
          console.warn('[messages] no name resolved', { listingId, otherUserId, listingFound: !!listing })
        }
        const lastRead = getLastRead(userId!, roomId)
        const unreadCount = (roomMessages.get(roomId) ?? []).filter(
          (m: { sender_id: string; created_at: string }) => m.sender_id !== userId && (!lastRead || new Date(m.created_at) > lastRead)
        ).length
        return {
          id: String(i),
          roomId,
          participantName: name,
          lastMessage: msg.content,
          timestamp: timeAgo(msg.created_at),
          unreadCount,
        }
      })
    },
    enabled: !!userId,
    staleTime: 30_000,
  })
}

export function useUnreadChatsCount(): number {
  const { data: user } = useCurrentUser()
  const { data: conversations = [] } = useConversations(user?.id)
  return conversations.filter(c => c.unreadCount > 0).length
}
