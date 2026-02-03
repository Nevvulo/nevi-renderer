import { join } from "path";

let fontCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

export async function loadFonts(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  if (fontCache) return fontCache;

  const fontsDir = join(import.meta.dir, "../fonts");
  const [regular, bold] = await Promise.all([
    Bun.file(join(fontsDir, "Geist-Regular.ttf")).arrayBuffer(),
    Bun.file(join(fontsDir, "Geist-Bold.ttf")).arrayBuffer(),
  ]);

  fontCache = { regular, bold };
  return fontCache;
}
