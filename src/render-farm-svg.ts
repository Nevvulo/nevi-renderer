import satori from "satori";
import { FarmCard } from "./farm-card";
import { loadFonts } from "./fonts";
import { loadEmoji } from "./render-svg";
import type { FarmData } from "./types";

export async function renderFarmSVG(data: FarmData): Promise<string> {
  const fonts = await loadFonts();

  return satori(FarmCard({ data }), {
    width: 600,
    height: 400,
    fonts: [
      { name: "Geist", data: fonts.regular, weight: 400, style: "normal" },
      { name: "Geist", data: fonts.bold, weight: 700, style: "normal" },
    ],
    loadAdditionalAsset: async (code: string, segment: string) => {
      if (code === "emoji") {
        return loadEmoji(segment);
      }
      return "";
    },
  });
}
