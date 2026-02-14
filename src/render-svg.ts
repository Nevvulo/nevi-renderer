import satori from "satori";
import { ProfileCard } from "./card";
import { loadFonts } from "./fonts";
import type { ProfileData } from "./types";

const emojiCache = new Map<string, string>();

export async function loadEmoji(segment: string): Promise<string> {
  // Build the Twemoji code point string (e.g. "1f4b0" or "2328-fe0f")
  const codePoint = [...segment]
    .map((c) => c.codePointAt(0)!.toString(16))
    .join("-")
    // Twemoji strips trailing fe0f variation selectors in some cases
    .replace(/-fe0f$/, "");

  if (emojiCache.has(codePoint)) return emojiCache.get(codePoint)!;

  // Try with the full code point first, then without trailing fe0f
  for (const cp of [codePoint, codePoint.replace(/-fe0f/, "")]) {
    const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${cp}.svg`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const svg = await res.text();
        const dataUri = `data:image/svg+xml,${encodeURIComponent(svg)}`;
        emojiCache.set(codePoint, dataUri);
        return dataUri;
      }
    } catch {
      // Try next variant
    }
  }

  return "";
}

export async function renderProfileSVG(data: ProfileData): Promise<string> {
  const fonts = await loadFonts();

  return satori(ProfileCard({ data }), {
    width: 600,
    height: 340,
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
