import { Resvg } from "@resvg/resvg-js";
import { renderFarmSVG } from "./render-farm-svg";
import type { FarmData } from "./types";

export async function renderFarmPNG(data: FarmData): Promise<Buffer> {
  const svg = await renderFarmSVG(data);

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 }, // 2x for crisp output
  });

  const rendered = resvg.render();
  return Buffer.from(rendered.asPng());
}
