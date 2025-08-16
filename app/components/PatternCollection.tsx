"use client"

import { useState, useEffect } from "react"
import { type Pattern } from "./CellSelector"

interface CollectionStats {
  totalMined: number
  rarityCount: { [key: number]: number }
  averageDifficulty: number
  bestPattern: Pattern | null
}

interface PatternCollectionProps {
  minedPatterns: Pattern[]
}

export default function PatternCollection({ minedPatterns }: PatternCollectionProps) {
  const [stats, setStats] = useState<CollectionStats>({
    totalMined: 0,
    rarityCount: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    averageDifficulty: 0,
    bestPattern: null,
  })

  useEffect(() => {
    if (minedPatterns.length === 0) return

    const rarityCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalDifficulty = 0
    let bestPattern = minedPatterns[0]

    minedPatterns.forEach((pattern) => {
      rarityCount[pattern.rarity] = (rarityCount[pattern.rarity] || 0) + 1

      // Extract difficulty from description
      const diffMatch = pattern.description.match(/Difficulty (\d+)/)
      if (diffMatch) {
        totalDifficulty += parseInt(diffMatch[1])
      }

      if (pattern.rarity > bestPattern.rarity) {
        bestPattern = pattern
      }
    })

    setStats({
      totalMined: minedPatterns.length,
      rarityCount,
      averageDifficulty: totalDifficulty / minedPatterns.length,
      bestPattern,
    })
  }, [minedPatterns])

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-mono text-gray-400 mb-3">Mining Statistics</h3>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <div className="text-gray-500">Total Mined</div>
          <div className="text-2xl font-mono text-white">{stats.totalMined}</div>
        </div>

        <div>
          <div className="text-gray-500">Avg Difficulty</div>
          <div className="text-2xl font-mono text-white">{stats.averageDifficulty.toFixed(1)}</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-gray-500 text-xs mb-2">Rarity Distribution</div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((rarity) => (
            <div
              key={rarity}
              className="flex-1 text-center"
              title={`Rarity ${rarity}: ${stats.rarityCount[rarity]} patterns`}
            >
              <div className="bg-gray-700 relative overflow-hidden" style={{ height: "40px" }}>
                <div
                  className={`absolute bottom-0 left-0 right-0 transition-all duration-500 ${
                    rarity === 1
                      ? "bg-gray-500"
                      : rarity === 2
                        ? "bg-blue-500"
                        : rarity === 3
                          ? "bg-purple-500"
                          : rarity === 4
                            ? "bg-yellow-500"
                            : "bg-red-500"
                  }`}
                  style={{
                    height: `${Math.min(100, (stats.rarityCount[rarity] / Math.max(1, stats.totalMined)) * 100 * 2)}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-gray-500 mt-1">{"⭐".repeat(rarity)}</div>
            </div>
          ))}
        </div>
      </div>

      {stats.bestPattern && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-gray-500 text-xs mb-2">Best Pattern</div>
          <div className="flex items-center gap-3">
            <div
              className="inline-grid gap-px bg-gray-900 p-1 rounded"
              style={{
                gridTemplateColumns: `repeat(5, 12px)`,
                gridTemplateRows: `repeat(5, 12px)`,
              }}
            >
              {stats.bestPattern.pattern.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={cell ? "bg-white" : "bg-gray-800"}
                    style={{ width: "12px", height: "12px" }}
                  />
                ))
              )}
            </div>
            <div>
              <div className="text-xs text-white font-mono">{stats.bestPattern.name}</div>
              <div className="text-[10px] text-gray-400">
                {"⭐".repeat(stats.bestPattern.rarity)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
