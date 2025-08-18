import * as React from "react"
import type { MultiplayerGrid } from "./multiplayerLife"

interface IMultiplayerGridProps {
  cells: MultiplayerGrid
  onCellClick?: (row: number, column: number) => void
  disabled?: boolean
}

// Color scheme for players - clean and modern
const CELL_COLORS = {
  0: "bg-slate-900", // Dead cell - deep slate
  1: "bg-cyan-500", // Player 1 - vibrant cyan
  2: "bg-amber-500", // Player 2 - warm amber
}

export const MultiplayerGridComponent: React.FC<IMultiplayerGridProps> = ({ cells }) => {
  const gridCols = cells[0]?.length || 50

  return (
    <div className="inline-block border border-gray-700 bg-gray-700">
      <div
        className="grid gap-[1px]"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        }}
      >
        {cells.map((row, rowIndex) =>
          row.map((cell, columnIndex) => (
            <div
              key={`${rowIndex}-${columnIndex}`}
              className={`
                w-3 h-3
                ${CELL_COLORS[cell as 0 | 1 | 2]}
                transition-colors duration-150
              `}
              aria-label={`Cell at row ${rowIndex}, column ${columnIndex}`}
            />
          ))
        )}
      </div>
    </div>
  )
}
