export interface BackgroundConfig {
  type: "solid" | "gradient" | "image" | "default";
  color?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: string;
  imageUrl?: string;
}

export interface BadgeDisplay {
  emoji: string;
  level: number;
  color: string;
}

export interface ProfileData {
  displayName: string;
  roleColor: string;
  roleName: string;
  avatarUrl: string;
  level: number;
  currentXp: number;
  xpForNext: number;
  totalXp: number;
  progress: number; // 0-1
  background: BackgroundConfig;
  equippedBadges: BadgeDisplay[];
  balance?: number;
}
