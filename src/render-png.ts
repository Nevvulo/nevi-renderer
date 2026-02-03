import { Resvg } from "@resvg/resvg-js";
import { renderProfileSVG } from "./render-svg";
import type { ProfileData } from "./types";

export async function renderProfilePNG(data: ProfileData): Promise<Buffer> {
  const svg = await renderProfileSVG(data);

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 }, // 2x for crisp output
  });

  const rendered = resvg.render();
  return Buffer.from(rendered.asPng());
}
