import { renderProfilePNG } from "../src";
import type { ProfileData } from "../src";

const data: ProfileData = {
  displayName: "Nevulo",
  roleColor: "#9074f2",
  roleName: "Super Legend II",
  avatarUrl: "https://cdn.discordapp.com/embed/avatars/0.png",
  level: 42,
  currentXp: 3_720,
  xpForNext: 8_100,
  totalXp: 847_250,
  progress: 0.46,
  background: { type: "gradient", gradientFrom: "#1a1a2e", gradientTo: "#e94560", gradientDirection: "to bottom right" },
  equippedBadges: [
    { emoji: "⌨️", level: 3, color: "#e53935" },
    { emoji: "💰", level: 2, color: "#fb8c00" },
    { emoji: "🦋", level: 1, color: "#43a047" },
    { emoji: "🔥", level: 2, color: "#fb8c00" },
    { emoji: "⭐", level: 1, color: "#43a047" },
  ],
  balance: 124_500,
};

const out = process.argv[2] || "test-profile.png";
const png = await renderProfilePNG(data);
await Bun.write(out, png);
console.log(`Wrote ${png.length} bytes to ${out}`);
