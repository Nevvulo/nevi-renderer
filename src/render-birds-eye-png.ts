import { Resvg } from "@resvg/resvg-js";
import { renderBirdsEyeSVG } from "./render-birds-eye-svg";
import type { BirdsEyeData } from "./types";

export async function renderBirdsEyePNG(data: BirdsEyeData): Promise<Buffer> {
  const svg = await renderBirdsEyeSVG(data);

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 }, // 2x for crisp output
  });

  const rendered = resvg.render();
  return Buffer.from(rendered.asPng());
}
