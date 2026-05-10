/**
 * Shared mock data for Tightknit help requests.
 * Used by the home feed and the request detail page.
 */

export type RequestItem = {
  id: string;
  initials: string;
  name: string;
  postedAgo: string;
  task: string;
  distance: string;
  durationMins: number;
  nearbyOnly?: boolean;
  rating: number;
  address: string;
  scheduledFor: string;
  description: string;
};

export const MOCK_REQUESTS: RequestItem[] = [
  {
    id: "1",
    initials: "S",
    name: "Sarah K.",
    postedAgo: "4m ago",
    task: "Need help carrying groceries up 3 flights",
    distance: "2 doors down",
    durationMins: 30,
    nearbyOnly: true,
    rating: 4.9,
    address: "Maple Ave, Apt 4B",
    scheduledFor: "Now",
    description:
      "Need help carrying groceries up 3 flights of stairs. I just got back from the market and have about 8 bags. Would really appreciate the help!",
  },
  {
    id: "2",
    initials: "M",
    name: "Marcus T.",
    postedAgo: "15m ago",
    task: "Can someone walk my dog this afternoon?",
    distance: "0.3 mi away",
    durationMins: 45,
    nearbyOnly: true,
    rating: 4.8,
    address: "Birch St, Apt 2A",
    scheduledFor: "This afternoon",
    description:
      "My golden retriever Biscuit needs about a 30-45 min walk this afternoon. He's friendly with people and other dogs. Leash and treats are by the door.",
  },
  {
    id: "3",
    initials: "P",
    name: "Priya D.",
    postedAgo: "1h ago",
    task: "Looking for help assembling a bookshelf",
    distance: "0.8 mi away",
    durationMins: 90,
    nearbyOnly: false,
    rating: 5.0,
    address: "Oak Lane, Unit 7",
    scheduledFor: "Tomorrow",
    description:
      "Just got a new IKEA bookshelf and could use a second pair of hands to put it together. Tools and instructions are all here — should take about an hour and a half.",
  },
  {
    id: "4",
    initials: "J",
    name: "Jordan L.",
    postedAgo: "2h ago",
    task: "Pick up a package from the lobby",
    distance: "Same building",
    durationMins: 15,
    nearbyOnly: true,
    rating: 4.7,
    address: "Cedar Court, Apt 12C",
    scheduledFor: "Today",
    description:
      "I'm stuck on a work call and a package just arrived in the lobby. Could someone grab it and drop it at my door? It's a small box, nothing heavy.",
  },
  {
    id: "5",
    initials: "A",
    name: "Alex R.",
    postedAgo: "3h ago",
    task: "Garden weeding — tools provided",
    distance: "1.1 mi away",
    durationMins: 120,
    nearbyOnly: false,
    rating: 4.9,
    address: "Willow Way, House 3",
    scheduledFor: "This weekend",
    description:
      "Front garden has gotten a bit out of hand. Looking for someone to help weed the beds for a couple of hours. I have gloves, kneeling pads, and all the tools.",
  },
];

export function getRequestById(id: string): RequestItem | undefined {
  return MOCK_REQUESTS.find((r) => r.id === id);
}
