"use client"

import { type Pattern } from "./CellSelector"

interface SelectedCellDisplayProps {
  selectedPattern?: Pattern
}

// Simple grid preview component
function SimplePatternPreview({ pattern }: { pattern: number[][] }) {
  const cellSize = 4
  const maxSize = 8

  // Limit display size for large patterns
  const displayPattern =
    pattern.length > maxSize || (pattern[0]?.length || 0) > maxSize
      ? pattern.slice(0, maxSize).map((row) => row.slice(0, maxSize))
      : pattern

  return (
    <div
      className="inline-grid gap-px bg-gray-700 p-1 rounded"
      style={{
        gridTemplateColumns: `repeat(${displayPattern[0]?.length || 1}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${displayPattern.length}, ${cellSize}px)`,
      }}
    >
      {displayPattern.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className={`${cell ? "bg-gray-100" : "bg-gray-800"}`}
            style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
          />
        ))
      )}
    </div>
  )
}

export default function SelectedCellDisplay({ selectedPattern }: SelectedCellDisplayProps) {
  if (!selectedPattern) {
    return (
      <div className="flex items-center gap-3 text-gray-500 text-sm">
        <span className="text-xs uppercase tracking-wider">No pattern selected</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400 text-xs uppercase tracking-wider">Selected:</span>

      <div className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2">
        <SimplePatternPreview pattern={selectedPattern.pattern} />

        <div className="text-sm">
          <div className="text-gray-100 font-medium">{selectedPattern.name}</div>
          <div className="text-gray-500 text-xs">
            {selectedPattern.category} • Rarity {selectedPattern.rarity}
          </div>
        </div>
      </div>
    </div>
  )
}
