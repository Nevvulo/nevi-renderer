import satori from "satori";
import { BirdsEyeCard } from "./farm-card";
import { loadFonts } from "./fonts";
import { loadEmoji } from "./render-svg";
import type { BirdsEyeData } from "./types";

export async function renderBirdsEyeSVG(data: BirdsEyeData): Promise<string> {
  const fonts = await loadFonts();

  return satori(BirdsEyeCard({ data }), {
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
