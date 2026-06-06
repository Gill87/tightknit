"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ClockIcon,
  PinIcon,
} from "../components/icons";
import { tkRequest } from "../formStyles";
import { useCurrentUser, useProfile } from "@/lib/queries/profile";
import { useListingDetail } from "@/lib/queries/listings";

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  const addr = data.address ?? {};
  const street = addr.road ?? addr.pedestrian ?? "";
  const area = addr.neighbourhood ?? addr.suburb ?? addr.city ?? addr.town ?? "";
  return street && area ? `${street}, ${area}` : area || street || "Nearby";
}

function formatNeededBy(dateStr: string | null): string {
  if (!dateStr) return "Flexible";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatHours(totalMins: number): string {
  const hours = totalMins / 60;
  if (Number.isInteger(hours)) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${hours.toFixed(1)} hours`;
}

function formatMinutes(totalMins: number): string {
  if (totalMins < 60) return `${totalMins} min`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (m === 0) return h === 1 ? "1 hr" : `${h} hrs`;
  return `${h} hr ${m} min`;
}

function LoadingShell() {
  return (
    <div className={tkRequest.shell}>
      <main className={tkRequest.main}>
        <header className={tkRequest.headerRow}>
          <Link href="/home" className={tkRequest.backButton} aria-label="Back to home">
            <ChevronLeftIcon className="text-tk-forest" />
          </Link>
          <h1 className={tkRequest.headerTitle}>Request</h1>
        </header>
      </main>
    </div>
  );
}

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [helpLoading, setHelpLoading] = useState(false);

  const { data: user } = useCurrentUser();
  const { data: listing, isPending: listingPending } = useListingDetail(id);
  const { data: myProfile } = useProfile(user?.id);

  // Reverse-geocode the listing's location
  useEffect(() => {
    if (!listing?.lat || !listing?.lng) {
      setAddress("Location not specified");
      return;
    }
    reverseGeocode(listing.lat, listing.lng).then(setAddress);
  }, [listing?.lat, listing?.lng]);

  const data = useMemo(() => {
    if (!listing || address === null) return null;
    const fullName = listing.posted_by_name || "Neighbor";
    let distance = "Nearby";
    if (myProfile?.lat && myProfile?.lng && listing.lat && listing.lng) {
      const d = haversine(myProfile.lat, myProfile.lng, listing.lat, listing.lng);
      distance = d < 0.1 ? "Same block" : `${d.toFixed(1)} mi away`;
    }
    return {
      name: fullName,
      initials: getInitials(fullName),
      postedAgo: timeAgo(listing.created_at),
      distance,
      description: listing.description,
      durationMins: listing.duration_minutes,
      address,
      scheduledFor: formatNeededBy(listing.needed_by),
      requesterId: listing.posted_by,
    };
  }, [listing, myProfile, address]);

  const handleHelp = async () => {
    if (!data) return;
    setHelpLoading(true);
    try {
      const supabase = getSupabase();
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const sortedIds = [authUser.id, data.requesterId].sort();
      const roomId = `listing_${id}_${sortedIds[0]}_${sortedIds[1]}`;

      const { data: existing } = await supabase
        .from("messages")
        .select("id")
        .eq("room_id", roomId)
        .eq("sender_id", authUser.id)
        .limit(1)
        .maybeSingle();

      if (!existing) {
        await supabase.from("messages").insert({
          room_id: roomId,
          sender_id: authUser.id,
          content: "Hey there, I want to help you out",
        });
      }

      router.push(`/messages/${roomId}`);
    } finally {
      setHelpLoading(false);
    }
  };

  if (listingPending || address === null) return <LoadingShell />;
  if (!listing || !data) return notFound();

  const firstName = data.name.split(" ")[0]?.replace(/\.$/, "") ?? data.name;

  return (
    <div className={tkRequest.shell}>
      <main className={tkRequest.main}>
        <header className={tkRequest.headerRow}>
          <Link href="/home" className={tkRequest.backButton} aria-label="Back to home">
            <ChevronLeftIcon className="text-tk-forest" />
          </Link>
          <h1 className={tkRequest.headerTitle}>Request</h1>
        </header>

        <section className={tkRequest.profileCard} aria-label="Requester">
          <div className={tkRequest.profileAvatar} aria-hidden>{data.initials}</div>
          <div className={tkRequest.profileBody}>
            <div className={tkRequest.profileTopRow}>
              <p className={tkRequest.profileName}>{data.name}</p>
            </div>
            <div className={tkRequest.profileMetaRow}>
              <PinIcon className={tkRequest.profileMetaIcon} />
              <span>{data.distance}</span>
              <span className={tkRequest.profileMetaDot} aria-hidden>·</span>
              <span>{data.postedAgo}</span>
            </div>
          </div>
        </section>

        <section className={tkRequest.descriptionCard} aria-label="Request details">
          <p className={tkRequest.descriptionText}>{data.description}</p>
        </section>

        <section className={tkRequest.pillRow} aria-label="Request summary">
          <span className={tkRequest.pill}>
            <ClockIcon className={tkRequest.pillIconClock} />~{formatMinutes(data.durationMins)}
          </span>
          <span className={tkRequest.pill}>
            <PinIcon className={tkRequest.pillIconPin} />{data.address}
          </span>
          <span className={tkRequest.pill}>
            <CalendarIcon className={tkRequest.pillIconCalendar} />{data.scheduledFor}
          </span>
        </section>

        <section className={tkRequest.earnCard} aria-label="Earnings">
          <span className={tkRequest.earnIconWrap} aria-hidden>
            <ClockIcon className="text-tk-forest" />
          </span>
          <div className="min-w-0 flex-1">
            <p className={tkRequest.earnTitle}>Earn ~{formatHours(data.durationMins)}</p>
            <p className={tkRequest.earnHint}>
              Added to your balance when {firstName} marks it complete
            </p>
          </div>
        </section>

        <button
          type="button"
          className={tkRequest.primaryCta}
          onClick={handleHelp}
          disabled={helpLoading}
        >
          <span>{helpLoading ? "Opening…" : "I can help"}</span>
          <span className={tkRequest.emojiInline} aria-hidden>🙌</span>
        </button>
      </main>
    </div>
  );
}
