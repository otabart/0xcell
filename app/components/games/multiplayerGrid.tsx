import * as React from "react"
import type { MultiplayerGrid } from "./multiplayerLife"

interface IMultiplayerGridProps {
  cells: MultiplayerGrid
  onCellClick?: (row: number, column: number) => void
  disabled?: boolean
}

// Color scheme for players
const CELL_COLORS = {
  0: "bg-black", // Dead cell
  1: "bg-blue-500", // Player 1
  2: "bg-red-500", // Player 2
}

export const MultiplayerGridComponent: React.FC<IMultiplayerGridProps> = ({ cells }) => {
  const cellSize = "w-2 h-2"

  const gridCols = cells[0]?.length || 50

  return (
    <div className="inline-block border border-gray-800 bg-black">
      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
        }}
      >
        {cells.map((row, rowIndex) =>
          row.map((cell, columnIndex) => (
            <div
              key={`${rowIndex}-${columnIndex}`}
              className={`
                ${cellSize} 
                ${CELL_COLORS[cell as 0 | 1 | 2]}
              `}
              aria-label={`Cell at row ${rowIndex}, column ${columnIndex}`}
            />
          ))
        )}
      </div>
    </div>
  )
}
