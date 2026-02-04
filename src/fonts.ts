let fontCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

const FONT_URLS = {
  regular: "https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/Geist-Regular.ttf",
  bold: "https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/Geist-Bold.ttf",
};

export async function loadFonts(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  if (fontCache) return fontCache;

  const [regular, bold] = await Promise.all([
    fetch(FONT_URLS.regular).then((res) => res.arrayBuffer()),
    fetch(FONT_URLS.bold).then((res) => res.arrayBuffer()),
  ]);

  fontCache = { regular, bold };
  return fontCache;
}
