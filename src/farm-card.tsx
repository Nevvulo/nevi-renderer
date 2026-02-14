/** @jsxImportSource react */
import type { FarmData, SlotData, BirdsEyeData, PlotData } from "./types";

/**
 * Calculate grid layout based on slot count
 * Returns { columns, rows, tileSize }
 */
function getGridLayout(totalSlots: number): { columns: number; rows: number; tileSize: number } {
  // Predefined layouts for specific slot counts
  const layouts: Record<number, { columns: number; rows: number }> = {
    6: { columns: 3, rows: 2 },
    9: { columns: 3, rows: 3 },
    12: { columns: 4, rows: 3 },
    13: { columns: 4, rows: 4 },
    16: { columns: 4, rows: 4 },
    20: { columns: 5, rows: 4 },
    25: { columns: 5, rows: 5 },
    30: { columns: 6, rows: 5 },
    32: { columns: 8, rows: 4 },
    36: { columns: 6, rows: 6 },
  };

  // Find the closest layout that can fit all slots
  let layout = layouts[totalSlots];
  if (!layout) {
    // Find the smallest layout that fits
    const sortedCounts = Object.keys(layouts)
      .map(Number)
      .sort((a, b) => a - b);
    for (const count of sortedCounts) {
      if (count >= totalSlots) {
        layout = layouts[count];
        break;
      }
    }
    // Fall back to largest if still not found
    if (!layout) layout = layouts[36];
  }

  // Calculate tile size to fit within the available grid area
  // Grid area: ~540px wide x ~280px tall (with padding)
  const maxGridWidth = 540;
  const maxGridHeight = 280;
  const gap = 8;

  const maxTileWidth = (maxGridWidth - gap * (layout.columns - 1)) / layout.columns;
  const maxTileHeight = (maxGridHeight - gap * (layout.rows - 1)) / layout.rows;
  const tileSize = Math.min(72, Math.floor(Math.min(maxTileWidth, maxTileHeight)));

  return { ...layout, tileSize };
}

/**
 * Get slot background color based on state
 */
function getSlotColor(state: SlotData["state"]): string {
  switch (state) {
    case "empty":
      return "#4a3c2a"; // Brown for empty
    case "growing":
      return "#5c4a32"; // Light brown for growing
    case "ready":
      return "#2e6b1f"; // Green for ready
  }
}

/**
 * Single farm slot component — progress shown as horizontal background fill
 */
function FarmSlot({
  slot,
  tileSize,
}: {
  slot: SlotData;
  tileSize: number;
}) {
  const bgColor = getSlotColor(slot.state);
  const emojiSize = Math.floor(tileSize * 0.5);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: tileSize,
        height: tileSize,
        backgroundColor: bgColor,
        borderRadius: 8,
        border: "1px solid rgba(255, 255, 255, 0.15)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background fill for growing crops — replaces bottom progress bar */}
      {slot.state === "growing" && (
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: `${Math.max(slot.percentComplete, 2)}%`,
            backgroundColor: "rgba(241, 196, 15, 0.25)",
          }}
        />
      )}

      {/* Crop emoji (if any) */}
      {slot.cropEmoji && (
        <span
          style={{
            fontSize: emojiSize,
            lineHeight: 1,
            position: "relative",
          }}
        >
          {slot.cropEmoji}
        </span>
      )}

      {/* Slot number for empty slots */}
      {slot.state === "empty" && (
        <span
          style={{
            fontSize: Math.floor(tileSize * 0.25),
            color: "rgba(255, 255, 255, 0.3)",
            fontWeight: 700,
          }}
        >
          {slot.slotNumber}
        </span>
      )}
    </div>
  );
}

/**
 * Calculate pixel position for a sprinkler overlay.
 * Positioned at the center intersection of the 4 tiles it covers.
 * chunkCols = floor(gridColumns / 2) determines how positions wrap.
 */
function getSprinklerPixelPosition(
  position: number,
  tileSize: number,
  gap: number,
  gridColumns: number
): { x: number; y: number } {
  const chunkCols = Math.floor(gridColumns / 2);
  const chunkRow = Math.floor((position - 1) / chunkCols);
  const chunkCol = (position - 1) % chunkCols;
  const x = chunkCol * 2 * (tileSize + gap) + tileSize + gap / 2;
  const y = chunkRow * 2 * (tileSize + gap) + tileSize + gap / 2;
  return { x, y };
}

export function FarmCard({ data }: { data: FarmData }) {
  // Support both new plot-based and legacy flat shapes
  const plotData = data.plot ?? {
    plotNumber: 1,
    slots: data.slots ?? [],
    totalSlots: data.totalSlots ?? 0,
  };

  const { columns, rows, tileSize } = getGridLayout(plotData.totalSlots);
  const gap = 8;
  const gridWidth = columns * tileSize + (columns - 1) * gap;
  const gridHeight = rows * tileSize + (rows - 1) * gap;
  const sprinklerPositions = plotData.sprinklerPositions ?? [];
  const hasSprinklers = sprinklerPositions.length > 0;

  const headerLabel = data.totalPlots > 1
    ? `Plot ${plotData.plotNumber}`
    : `${data.username}'s Farm`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 600,
        height: 400,
        borderRadius: 16,
        overflow: "hidden",
        fontFamily: "Geist",
        position: "relative",
        backgroundImage: "linear-gradient(135deg, #2d5016, #1a3309)",
      }}
    >
      {/* Subtle texture overlay */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.1)",
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
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "24px 30px",
          position: "relative",
          flex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>🌻</span>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              {headerLabel}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: 12,
              padding: "6px 12px",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              {plotData.totalSlots} slots
            </span>
          </div>
        </div>

        {/* Grid container - centered */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Farm grid with optional sprinkler overlays */}
          <div
            style={{
              display: "flex",
              position: "relative",
              width: gridWidth,
              height: gridHeight,
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                width: gridWidth,
                gap,
              }}
            >
              {plotData.slots.map((slot) => (
                <FarmSlot key={slot.slotNumber} slot={slot} tileSize={tileSize} />
              ))}
            </div>
            {/* Sprinkler overlays — only on 6-column grids */}
            {hasSprinklers &&
              sprinklerPositions.map((pos) => {
                const { x, y } = getSprinklerPixelPosition(pos, tileSize, gap, columns);
                const size = 22;
                return (
                  <div
                    key={`sprinkler-${pos}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "absolute",
                      left: x - size / 2,
                      top: y - size / 2,
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                      backgroundColor: "rgba(59, 130, 246, 0.7)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      fontSize: 12,
                    }}
                  >
                    💦
                  </div>
                );
              })}</div>
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            marginTop: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                display: "flex",
                width: 12,
                height: 12,
                backgroundColor: "#4a3c2a",
                borderRadius: 3,
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            />
            <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.6)" }}>Empty</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                display: "flex",
                width: 12,
                height: 12,
                backgroundColor: "#5c4a32",
                borderRadius: 3,
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            />
            <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.6)" }}>Growing</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                display: "flex",
                width: 12,
                height: 12,
                backgroundColor: "#2e6b1f",
                borderRadius: 3,
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            />
            <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.6)" }}>Ready</span>
          </div>
          {hasSprinklers && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 12,
                  height: 12,
                  backgroundColor: "rgba(59, 130, 246, 0.7)",
                  borderRadius: 6,
                  fontSize: 8,
                }}
              >
                💦
              </div>
              <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.6)" }}>Sprinkler</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Mini plot card for birds-eye view — small colored squares, no emojis
 */
function MiniPlotCard({ plot }: { plot: PlotData }) {
  // Calculate grid for mini plot
  const cols = Math.ceil(Math.sqrt(plot.totalSlots));
  const rows = Math.ceil(plot.totalSlots / cols);
  const squareSize = Math.min(12, Math.floor(90 / Math.max(cols, rows)));
  const miniGap = 2;

  // Max height for a full 36-slot grid (6 rows)
  const maxRows = 6;
  const maxGridHeight = maxRows * squareSize + (maxRows - 1) * miniGap;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 105,
        height: 8 + 11 + 6 + maxGridHeight + 4 + 9 + 8, // padding + label + gap + grid + gap + count + padding
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderRadius: 8,
        border: "1px solid rgba(255, 255, 255, 0.12)",
        padding: "8px 6px",
      }}
    >
      {/* Plot label */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "rgba(255, 255, 255, 0.8)",
          marginBottom: 6,
        }}
      >
        Plot {plot.plotNumber}
      </span>

      {/* Mini grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          width: cols * squareSize + (cols - 1) * miniGap,
          gap: miniGap,
        }}
      >
        {plot.slots.map((slot, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              width: squareSize,
              height: squareSize,
              backgroundColor: getSlotColor(slot.state),
              borderRadius: 2,
            }}
          />
        ))}
        {/* Fill empty slot placeholders up to totalSlots */}
        {Array.from({ length: plot.totalSlots - plot.slots.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{
              display: "flex",
              width: squareSize,
              height: squareSize,
              backgroundColor: "#4a3c2a",
              borderRadius: 2,
            }}
          />
        ))}
      </div>

      {/* Slot count — pinned to bottom */}
      <span
        style={{
          fontSize: 9,
          color: "rgba(255, 255, 255, 0.5)",
          marginTop: "auto",
        }}
      >
        {plot.slots.filter((s) => s.state !== "empty").length}/{plot.totalSlots}
      </span>
    </div>
  );
}

export function BirdsEyeCard({ data }: { data: BirdsEyeData }) {
  const plotCount = data.plots.length;
  // 1-5 plots: single row, 6-10: 2 rows of 5
  const topRow = data.plots.slice(0, 5);
  const bottomRow = plotCount > 5 ? data.plots.slice(5) : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 600,
        height: 400,
        borderRadius: 16,
        overflow: "hidden",
        fontFamily: "Geist",
        position: "relative",
        backgroundImage: "linear-gradient(135deg, #2d5016, #1a3309)",
      }}
    >
      {/* Overlay */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.1)",
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
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "24px 30px",
          position: "relative",
          flex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 24 }}>🏝️</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#ffffff" }}>
            {data.username}'s farm
          </span>
        </div>

        {/* Plot grid */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {/* Top row */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {topRow.map((plot) => (
              <MiniPlotCard key={plot.plotNumber} plot={plot} />
            ))}
          </div>

          {/* Bottom row */}
          {bottomRow && (
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {bottomRow.map((plot) => (
                <MiniPlotCard key={plot.plotNumber} plot={plot} />
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            marginTop: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                display: "flex",
                width: 10,
                height: 10,
                backgroundColor: "#4a3c2a",
                borderRadius: 2,
              }}
            />
            <span style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.6)" }}>Empty</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                display: "flex",
                width: 10,
                height: 10,
                backgroundColor: "#5c4a32",
                borderRadius: 2,
              }}
            />
            <span style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.6)" }}>Growing</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                display: "flex",
                width: 10,
                height: 10,
                backgroundColor: "#2e6b1f",
                borderRadius: 2,
              }}
            />
            <span style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.6)" }}>Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
