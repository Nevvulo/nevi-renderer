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

// Farm types
export type SlotState = "empty" | "growing" | "ready";

export interface SlotData {
  slotNumber: number;
  state: SlotState;
  cropEmoji?: string;
  cropName?: string;
  percentComplete: number; // 0-100
}

export interface PlotData {
  plotNumber: number;
  slots: SlotData[];
  totalSlots: number; // 0-36
  sprinklerPositions?: number[];
}

export interface FarmData {
  plot: PlotData;
  username: string;
  totalPlots: number;
  // Legacy compat
  slots?: SlotData[];
  totalSlots?: number;
}

export interface BirdsEyeData {
  plots: PlotData[];
  username: string;
}
