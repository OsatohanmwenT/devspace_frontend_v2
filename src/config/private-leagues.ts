export const LEAGUE_KINDS = {
  friends: { label: "Friends", seats: 6, description: "Up to 7 people. A quick race with your study group." },
  class: { label: "Class or school", seats: 40, description: "Up to 40 participants, with an organizer dashboard. For a class, school, or bootcamp competition." },
} as const;

export const LEAGUE_EMOJIS = ["🚀", "🔥", "🌟", "⚡", "🎯", "🧠", "🐝", "🏆", "🎮", "🌊", "🍕", "🎨"];

export const LEAGUE_CHANNELS = [
  { id: "announcements", name: "announcements", topic: "Updates from the lead", leadOnly: true },
  { id: "general", name: "general", topic: "Chat with the whole class", leadOnly: false },
  { id: "help", name: "help", topic: "Stuck on something? Ask here", leadOnly: false },
  { id: "wins", name: "wins", topic: "Share what you finished or shipped", leadOnly: false },
] as const;
