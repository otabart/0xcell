"use client"

import { useState, useEffect } from "react"

export interface Pattern {
  id: string
  name: string
  category: "still-life" | "oscillator" | "spaceship" | "gun" | "methuselah"
  pattern: number[][]
  period: number
  description: string
  rarity: number // 1-5, higher is rarer
  color: string
  glowColor: string
}

// Classic Game of Life patterns - Essential 7
const patterns: Pattern[] = [
  {
    id: "block",
    name: "Block",
    category: "still-life",
    pattern: [
      [1, 1],
      [1, 1],
    ],
    period: 0,
    description: "Most stable pattern",
    rarity: 1,
    color: "rgba(156, 163, 175, 0.9)",
    glowColor: "rgba(156, 163, 175, 0.3)",
  },
  {
    id: "blinker",
    name: "Blinker",
    category: "oscillator",
    pattern: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
    period: 2,
    description: "Flips between horizontal and vertical",
    rarity: 1,
    color: "rgba(147, 197, 253, 0.9)",
    glowColor: "rgba(59, 130, 246, 0.4)",
  },
  {
    id: "toad",
    name: "Toad",
    category: "oscillator",
    pattern: [
      [0, 1, 1, 1],
      [1, 1, 1, 0],
    ],
    period: 2,
    description: "Shifts between two states",
    rarity: 2,
    color: "rgba(147, 197, 253, 0.9)",
    glowColor: "rgba(59, 130, 246, 0.4)",
  },
  {
    id: "beacon",
    name: "Beacon",
    category: "oscillator",
    pattern: [
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 1, 1],
      [0, 0, 1, 1],
    ],
    period: 2,
    description: "Two blocks that blink",
    rarity: 2,
    color: "rgba(147, 197, 253, 0.9)",
    glowColor: "rgba(59, 130, 246, 0.4)",
  },
  {
    id: "glider",
    name: "Glider",
    category: "spaceship",
    pattern: [
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1],
    ],
    period: 4,
    description: "Moves diagonally across the grid",
    rarity: 3,
    color: "rgba(167, 139, 250, 0.9)",
    glowColor: "rgba(139, 92, 246, 0.4)",
  },
  {
    id: "lwss",
    name: "Spaceship",
    category: "spaceship",
    pattern: [
      [0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0],
    ],
    period: 4,
    description: "Lightweight spaceship",
    rarity: 4,
    color: "rgba(251, 191, 36, 0.9)",
    glowColor: "rgba(245, 158, 11, 0.5)",
  },
  {
    id: "r-pentomino",
    name: "R-pentomino",
    category: "methuselah",
    pattern: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 1, 0],
    ],
    period: 1103,
    description: "Chaotic evolution pattern",
    rarity: 5,
    color: "rgba(239, 68, 68, 0.9)",
    glowColor: "rgba(220, 38, 38, 0.6)",
  },
]

interface PatternSelectorProps {
  selectedPattern?: Pattern
  onSelectPattern?: (pattern: Pattern) => void
}

// Component to render a grid preview of a pattern with animations
function PatternPreview({
  pattern,
  isActive = false,
  isAnimated = false,
  patternId = "",
}: {
  pattern: number[][]
  isActive?: boolean
  isAnimated?: boolean
  patternId?: string
}) {
  const [animationFrame, setAnimationFrame] = useState(0)

  // Cell size optimized for consistent button sizing
  const cellSize = 12 // Size of each cell in pixels
  const gap = 1 // Gap between cells

  // Animation for oscillators
  useEffect(() => {
    if (!isAnimated || !isActive) return

    const interval = setInterval(() => {
      setAnimationFrame((prev) => prev + 1)
    }, 600) // Change every 600ms

    return () => clearInterval(interval)
  }, [isAnimated, isActive])

  const width = pattern[0]?.length || 0
  const height = pattern.length

  // Fixed container size for all patterns
  const containerSize = 100 // 100px x 100px container

  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        backgroundColor: isActive ? "rgba(31, 41, 55, 0.3)" : "transparent",
        border: isActive ? "1px solid rgba(156, 163, 175, 0.5)" : "1px solid transparent",
      }}
    >
      <div
        className="inline-grid"
        style={{
          gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
          gap: `${gap}px`,
        }}
      >
        {pattern.map((row, y) =>
          row.map((cell, x) => {
            // For animations, we change opacity instead of changing which cells exist
            let opacity = 1

            if (isAnimated && isActive && cell) {
              if (patternId === "blinker" || patternId === "toad" || patternId === "beacon") {
                // Simple pulse animation for oscillators
                opacity = animationFrame % 2 === 0 ? 1 : 0.2
              }
            }

            return (
              <div
                key={`${x}-${y}`}
                className={`transition-opacity duration-300 ${
                  cell ? (isActive ? "bg-white" : "bg-gray-400") : "bg-gray-800/30"
                }`}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  opacity: cell ? opacity : 1,
                }}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

export default function CellSelector({ selectedPattern, onSelectPattern }: PatternSelectorProps) {
  const [hoveredPattern, setHoveredPattern] = useState<string | null>(null)

  return (
    <div className="flex items-center gap-4 justify-center">
      {patterns.map((pattern) => (
        <button
          key={pattern.id}
          onClick={() => onSelectPattern?.(pattern)}
          onMouseEnter={() => setHoveredPattern(pattern.id)}
          onMouseLeave={() => setHoveredPattern(null)}
          className={`
            relative group transition-all duration-200 p-2
            ${selectedPattern?.id === pattern.id ? "bg-gray-700" : "bg-gray-800 hover:bg-gray-700"}
          `}
          title={`${pattern.name} - ${pattern.description}`}
        >
          <PatternPreview
            pattern={pattern.pattern}
            isActive={selectedPattern?.id === pattern.id}
            isAnimated={pattern.category === "oscillator"}
            patternId={pattern.id}
          />

          {/* Rarity Indicator */}
          <div className="absolute -top-2 -right-2 text-[10px] font-bold bg-gray-900 rounded-full w-5 h-5 flex items-center justify-center border border-gray-600 shadow-sm">
            {pattern.rarity}
          </div>

          {/* Simple border for selected state */}
          {selectedPattern?.id === pattern.id && (
            <div className="absolute inset-0 pointer-events-none border-2 border-gray-500" />
          )}

          {/* Hover Info */}
          {hoveredPattern === pattern.id && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
              <div className="bg-gray-800 text-white text-xs rounded px-3 py-2 whitespace-nowrap border border-gray-700">
                <div className="font-semibold">{pattern.name}</div>
                <div className="text-gray-400 text-[10px]">{pattern.description}</div>
                <div className="text-gray-400 text-[10px] mt-1">
                  {pattern.category} •{" "}
                  {pattern.period > 0 ? `Period ${pattern.period}` : "Still life"} • Rarity{" "}
                  {pattern.rarity}
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                  <div className="border-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

export { patterns, type Pattern }
