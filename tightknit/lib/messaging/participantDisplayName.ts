export type ListingRoomParsed = { listingId: string; peerIds: [string, string] };

/**
 * Parse `listing_{listingId}_{userId1}_{userId2}` (UUIDs use hyphens, not underscores).
 */
export function parseListingRoom(roomId: string): ListingRoomParsed | null {
  const parts = roomId.split("_");
  if (parts.length !== 4 || parts[0] !== "listing") return null;
  return { listingId: parts[1], peerIds: [parts[2], parts[3]] };
}

/**
 * Normalize display strings so whitespace-only values are treated as empty.
 */
export function cleanName(value: string | null | undefined): string {
  return (value ?? "").trim();
}

/**
 * Deterministic fallback when profile name/username are unavailable.
 * Keeps anonymity without exposing user-id fragments.
 */
export function shortUserIdLabel(userId: string): string {
  const id = cleanName(userId);
  if (!id) return "";
  return "Community member";
}

export type ParticipantProfileLite = {
  full_name?: string | null;
  username?: string | null;
};

/**
 * Resolve chat peer label:
 * - If the other user is the listing poster: posted_by_name → profile → id → Neighbor.
 * - Otherwise (accepter / helper): profile → id → Neighbor (never use listing poster name).
 */
export function resolveParticipantDisplayName(args: {
  listingPostedBy: string | null | undefined;
  listingPostedByName: string | null | undefined;
  otherUserId: string;
  profile: ParticipantProfileLite | null | undefined;
}): string {
  const postedName = cleanName(args.listingPostedByName);
  const fullName = cleanName(args.profile?.full_name);
  const username = cleanName(args.profile?.username);
  const fromProfile = fullName || username || shortUserIdLabel(args.otherUserId);

  const isOtherThePoster =
    !!args.listingPostedBy && args.otherUserId === args.listingPostedBy;

  if (isOtherThePoster) {
    return postedName || fromProfile || "Neighbor";
  }
  return fromProfile || "Neighbor";
}
