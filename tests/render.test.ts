import { test, expect, describe } from "bun:test";
import { renderProfileSVG, renderProfilePNG } from "../src";
import type { ProfileData } from "../src";

const BASE_DATA: ProfileData = {
  displayName: "TestUser",
  roleColor: "#9074f2",
  roleName: "Member",
  avatarUrl: "https://cdn.discordapp.com/embed/avatars/0.png",
  level: 12,
  currentXp: 2450,
  xpForNext: 5000,
  totalXp: 12345,
  progress: 0.49,
  background: { type: "default" },
  equippedBadges: [
    { emoji: "⌨️", level: 2, color: "#fb8c00" },
    { emoji: "💰", level: 1, color: "#43a047" },
  ],
  balance: 5000,
};

describe("renderProfileSVG", () => {
  test("renders SVG string for default background", async () => {
    const svg = await renderProfileSVG(BASE_DATA);
    expect(svg).toBeString();
    expect(svg).toStartWith("<svg");
    // Satori converts text to SVG paths, so we just verify valid SVG output
    expect(svg).toContain("</svg>");
  });

  test("renders SVG for solid background", async () => {
    const svg = await renderProfileSVG({
      ...BASE_DATA,
      background: { type: "solid", color: "#1a1a2e" },
    });
    expect(svg).toBeString();
    expect(svg).toStartWith("<svg");
  });

  test("renders SVG for gradient background", async () => {
    const svg = await renderProfileSVG({
      ...BASE_DATA,
      background: {
        type: "gradient",
        gradientFrom: "#1a1a2e",
        gradientTo: "#e94560",
        gradientDirection: "to bottom right",
      },
    });
    expect(svg).toBeString();
    expect(svg).toStartWith("<svg");
  });

  test("renders SVG with no badges", async () => {
    const svg = await renderProfileSVG({
      ...BASE_DATA,
      equippedBadges: [],
    });
    // Satori converts text to SVG paths, so just verify it renders successfully
    expect(svg).toBeString();
    expect(svg).toStartWith("<svg");
    expect(svg).toContain("</svg>");
  });

  test("renders SVG without balance", async () => {
    const data = { ...BASE_DATA };
    delete data.balance;
    const svg = await renderProfileSVG(data);
    expect(svg).toBeString();
    expect(svg).toStartWith("<svg");
  });
});

describe("renderProfilePNG", () => {
  test("renders PNG buffer for default background", async () => {
    const png = await renderProfilePNG(BASE_DATA);
    expect(png).toBeInstanceOf(Buffer);
    expect(png.length).toBeGreaterThan(1000);
    // PNG magic bytes
    expect(png[0]).toBe(0x89);
    expect(png[1]).toBe(0x50); // P
    expect(png[2]).toBe(0x4e); // N
    expect(png[3]).toBe(0x47); // G
  });
});
