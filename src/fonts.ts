import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

let fontCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

export async function loadFonts(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  if (fontCache) return fontCache;

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const fontsDir = join(__dirname, "../fonts");
  const [regular, bold] = await Promise.all([
    readFile(join(fontsDir, "Geist-Regular.ttf")),
    readFile(join(fontsDir, "Geist-Bold.ttf")),
  ]);

  fontCache = { regular: regular.buffer, bold: bold.buffer };
  return fontCache;
}
