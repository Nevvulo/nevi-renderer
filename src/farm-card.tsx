/** @jsxImportSource react */
import type { FarmData, SlotData, BirdsEyeData, PlotData } from "./types";

/**
 * Quadrant fill order: the order in which 2x2 quadrants are filled within a 3x3 quadrant grid.
 * Pattern: fill first 2x2 block of quadrants (4x4), extend right (6x4), extend down (6x6).
 *
 *   Q0  Q1  Q4
 *   Q2  Q3  Q5
 *   Q6  Q7  Q8
 */
const QUADRANT_FILL_ORDER: ReadonlyArray<[number, number]> = [
  [0, 0], // Q0: slots 1-4
  [0, 1], // Q1: slots 5-8
  [1, 0], // Q2: slots 9-12
  [1, 1], // Q3: slots 13-16
  [0, 2], // Q4: slots 17-20
  [1, 2], // Q5: slots 21-24
  [2, 0], // Q6: slots 25-28
  [2, 1], // Q7: slots 29-32
  [2, 2], // Q8: slots 33-36
];

/**
 * Map a slot number (1-based) to its grid position using quadrant fill order.
 * Within each 2x2 quadrant, slots fill left-to-right, top-to-bottom.
 */
function slotToGridPosition(slotNumber: number): { row: number; col: number } {
  const quadrantIndex = Math.floor((slotNumber - 1) / 4);
  const posInQuadrant = (slotNumber - 1) % 4;
  const [qRow, qCol] = QUADRANT_FILL_ORDER[quadrantIndex] ?? [0, 0];
  const localRow = Math.floor(posInQuadrant / 2);
  const localCol = posInQuadrant % 2;
  return {
    row: qRow * 2 + localRow,
    col: qCol * 2 + localCol,
  };
}

/**
 * Calculate grid layout based on slot count using quadrant-based growth.
 * Returns { columns, rows, tileSize }
 */
function getGridLayout(totalSlots: number): { columns: number; rows: number; tileSize: number } {
  let maxQRow = 0;
  let maxQCol = 0;
  if (totalSlots > 0) {
    const quadrantsNeeded = Math.ceil(totalSlots / 4);
    for (let i = 0; i < Math.min(quadrantsNeeded, QUADRANT_FILL_ORDER.length); i++) {
      const [qRow, qCol] = QUADRANT_FILL_ORDER[i]!;
      if (qRow > maxQRow) maxQRow = qRow;
      if (qCol > maxQCol) maxQCol = qCol;
    }
  }
  const columns = (maxQCol + 1) * 2;
  const rows = (maxQRow + 1) * 2;

  // Calculate tile size to fit within the available grid area
  // Grid area: ~540px wide x ~280px tall (with padding)
  const maxGridWidth = 540;
  const maxGridHeight = 280;
  const gap = 8;

  const maxTileWidth = (maxGridWidth - gap * (columns - 1)) / columns;
  const maxTileHeight = (maxGridHeight - gap * (rows - 1)) / rows;
  const tileSize = Math.min(72, Math.floor(Math.min(maxTileWidth, maxTileHeight)));

  return { columns, rows, tileSize };
}

/**
 * Build a 2D grid of cells from slot data using quadrant fill order.
 * Returns a flat array of JSX elements (row-major) including empty placeholders.
 */
function buildGridCells(
  slots: SlotData[],
  totalSlots: number,
  columns: number,
  rows: number,
  tileSize: number,
): React.JSX.Element[] {
  const slotMap = new Map<number, SlotData>();
  for (const slot of slots) {
    slotMap.set(slot.slotNumber, slot);
  }

  // Build set of valid slot positions for quick lookup
  const slotPositions = new Map<string, number>();
  for (let s = 1; s <= totalSlots; s++) {
    const pos = slotToGridPosition(s);
    slotPositions.set(`${pos.row},${pos.col}`, s);
  }

  const cells: React.JSX.Element[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const slotNum = slotPositions.get(`${row},${col}`);
      if (slotNum !== undefined) {
        const slot = slotMap.get(slotNum) ?? {
          slotNumber: slotNum,
          state: "empty" as const,
          percentComplete: 0,
        };
        cells.push(<FarmSlot key={`slot-${slotNum}`} slot={slot} tileSize={tileSize} />);
      } else {
        // Empty grid cell (no slot here)
        cells.push(
          <div
            key={`empty-${row}-${col}`}
            style={{ display: "flex", width: tileSize, height: tileSize }}
          />,
        );
      }
    }
  }
  return cells;
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
      {/* Background fill for growing crops */}
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

      {/* Crop image (custom) or emoji (unicode) */}
      {slot.cropImage ? (
        <img
          src={slot.cropImage}
          width={emojiSize}
          height={emojiSize}
          style={{ position: "relative" }}
        />
      ) : slot.cropEmoji ? (
        <span
          style={{
            fontSize: emojiSize,
            lineHeight: 1,
            position: "relative",
          }}
        >
          {slot.cropEmoji}
        </span>
      ) : null}

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
 * Position N covers the Nth quadrant in fill order.
 */
function getSprinklerPixelPosition(
  position: number,
  tileSize: number,
  gap: number,
): { x: number; y: number } {
  const [qRow, qCol] = QUADRANT_FILL_ORDER[position - 1] ?? [0, 0];
  const x = qCol * 2 * (tileSize + gap) + tileSize + gap / 2;
  const y = qRow * 2 * (tileSize + gap) + tileSize + gap / 2;
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

  const gridCells = buildGridCells(plotData.slots, plotData.totalSlots, columns, rows, tileSize);

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
              {gridCells}
            </div>
            {/* Sprinkler overlays */}
            {hasSprinklers &&
              sprinklerPositions.map((pos) => {
                const { x, y } = getSprinklerPixelPosition(pos, tileSize, gap);
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
              })}
          </div>
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
  const layout = getGridLayout(plot.totalSlots);
  const cols = layout.columns;
  const rows = layout.rows;
  const squareSize = Math.min(12, Math.floor(90 / Math.max(cols, rows)));
  const miniGap = 2;

  // Max height for a full 36-slot grid (6 rows)
  const maxRows = 6;
  const maxGridHeight = maxRows * squareSize + (maxRows - 1) * miniGap;

  // Build slot lookup
  const slotMap = new Map<number, SlotData>();
  for (const slot of plot.slots) {
    slotMap.set(slot.slotNumber, slot);
  }

  // Build set of valid slot positions
  const slotPositions = new Map<string, number>();
  for (let s = 1; s <= plot.totalSlots; s++) {
    const pos = slotToGridPosition(s);
    slotPositions.set(`${pos.row},${pos.col}`, s);
  }

  const miniCells: React.JSX.Element[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const slotNum = slotPositions.get(`${row},${col}`);
      if (slotNum !== undefined) {
        const slot = slotMap.get(slotNum);
        miniCells.push(
          <div
            key={`mini-${row}-${col}`}
            style={{
              display: "flex",
              width: squareSize,
              height: squareSize,
              backgroundColor: slot ? getSlotColor(slot.state) : "#4a3c2a",
              borderRadius: 2,
            }}
          />,
        );
      } else {
        // Empty grid cell (no slot mapped here)
        miniCells.push(
          <div
            key={`mini-empty-${row}-${col}`}
            style={{
              display: "flex",
              width: squareSize,
              height: squareSize,
              backgroundColor: "transparent",
              borderRadius: 2,
            }}
          />,
        );
      }
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 105,
        height: 8 + 11 + 6 + maxGridHeight + 4 + 9 + 8,
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderRadius: 8,
        border: "1px solid rgba(255, 255, 255, 0.12)",
        padding: "8px 6px",
      }}
    >
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

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          width: cols * squareSize + (cols - 1) * miniGap,
          gap: miniGap,
        }}
      >
        {miniCells}
      </div>

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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "24px 30px",
          position: "relative",
          flex: 1,
        }}
      >
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
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {topRow.map((plot) => (
              <MiniPlotCard key={plot.plotNumber} plot={plot} />
            ))}
          </div>
          {bottomRow && (
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {bottomRow.map((plot) => (
                <MiniPlotCard key={plot.plotNumber} plot={plot} />
              ))}
            </div>
          )}
        </div>

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
