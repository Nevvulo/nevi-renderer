/** @jsxImportSource react */
import type { ProfileData } from "./types";

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "\u2026";
}

function getBackgroundStyle(bg: ProfileData["background"]): Record<string, string> {
  switch (bg.type) {
    case "solid":
      return { backgroundColor: bg.color ?? "#0a0a0f" };
    case "gradient":
      return {
        backgroundImage: `linear-gradient(${bg.gradientDirection ?? "to bottom right"}, ${bg.gradientFrom ?? "#1a1a2e"}, ${bg.gradientTo ?? "#0a0a0f"})`,
      };
    case "image":
      return {};
    default:
      return { backgroundColor: "#0a0a0f" };
  }
}

export function ProfileCard({ data }: { data: ProfileData }): React.JSX.Element {
  const bgStyle = getBackgroundStyle(data.background);
  const roleColor = data.roleColor === "#000000" ? "#ffffff" : data.roleColor;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 600,
        height: 340,
        borderRadius: 16,
        overflow: "hidden",
        fontFamily: "Geist",
        position: "relative",
        ...bgStyle,
      }}
    >
      {/* Background image */}
      {data.background.type === "image" && data.background.imageUrl && (
        <img
          src={data.background.imageUrl}
          width={600}
          height={340}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 600,
            height: 340,
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      )}

      {/* Dark overlay for image backgrounds */}
      {data.background.type === "image" && (
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(10, 10, 15, 0.72)",
          }}
        />
      )}

      {/* Subtle grain overlay */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.015)",
        }}
      />

      {/* Border */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 16,
          border: "1px solid rgba(144, 116, 242, 0.25)",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "28px 32px",
          position: "relative",
          flex: 1,
        }}
      >
        {/* Top section: Avatar + Name + Level */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Avatar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 36,
              overflow: "hidden",
              border: "2.5px solid #9074f2",
              flexShrink: 0,
            }}
          >
            <img
              src={data.avatarUrl}
              width={72}
              height={72}
              style={{ objectFit: "cover", borderRadius: 36 }}
            />
          </div>

          {/* Name + Role */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: roleColor,
                  lineHeight: 1.2,
                }}
              >
                {truncateText(data.displayName, 24)}
              </span>
              {/* Level pill */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(144, 116, 242, 0.2)",
                  border: "1px solid rgba(144, 116, 242, 0.4)",
                  borderRadius: 12,
                  padding: "3px 10px",
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: "#b8a4f8" }}>
                  LVL {data.level}
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.45)",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {truncateText(data.roleName, 30)}
            </span>
          </div>
        </div>

        {/* XP Progress bar */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 24, gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255, 255, 255, 0.4)" }}>
              EXPERIENCE
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255, 255, 255, 0.55)" }}>
              {formatNumber(data.currentXp)} / {formatNumber(data.xpForNext)} XP
            </span>
          </div>
          {/* Bar track */}
          <div
            style={{
              display: "flex",
              width: "100%",
              height: 10,
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            {/* Bar fill */}
            <div
              style={{
                display: "flex",
                width: `${Math.max(data.progress * 100, 1)}%`,
                height: "100%",
                borderRadius: 5,
                backgroundImage: "linear-gradient(90deg, #7c5ce0, #9074f2, #b8a4f8)",
              }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", marginTop: 20, gap: 40 }}>
          {/* Total XP */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.4)",
                textTransform: "uppercase",
              }}
            >
              Total XP
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#e5e5e5" }}>
              {formatNumber(data.totalXp)}
            </span>
          </div>

          {/* Balance */}
          {data.balance !== undefined && (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: "rgba(255, 255, 255, 0.4)",
                  textTransform: "uppercase",
                }}
              >
                Balance
              </span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#e5e5e5" }}>
                {formatNumber(data.balance)} z
              </span>
            </div>
          )}
        </div>

        {/* Badge Showcase */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto", gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.4)",
              textTransform: "uppercase",
            }}
          >
            Badge Showcase
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {data.equippedBadges.length === 0 ? (
              <span style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.25)", fontStyle: "italic" }}>
                No badges equipped
              </span>
            ) : (
              data.equippedBadges.map((badge, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      backgroundColor: "rgba(255, 255, 255, 0.06)",
                      borderRadius: 8,
                      fontSize: 20,
                    }}
                  >
                    {badge.emoji}
                  </div>
                  {/* Level indicator bar */}
                  <div
                    style={{
                      display: "flex",
                      width: 24,
                      height: 3,
                      borderRadius: 1.5,
                      backgroundColor: badge.color,
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
