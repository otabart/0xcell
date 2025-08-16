"use client"

import { useState, useEffect, useCallback } from "react"
import { type Pattern } from "./CellSelector"

interface PoWState {
  isHashing: boolean
  currentHash: string
  nonce: number
  difficulty: number
  generatedPattern: number[][] | null
  matchedPattern: Pattern | null
  startTime?: number
  miningTime?: number
}

// Generate a longer hash-like string for better visual effect
function generateHash(input: string): string {
  let hash1 = 0
  let hash2 = 0
  let hash3 = 0

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash1 = (hash1 << 5) - hash1 + char
    hash2 = (hash2 << 3) + hash2 + char * 31
    hash3 = (hash3 << 7) - hash3 + char * 17
    hash1 = hash1 & hash1
    hash2 = hash2 & hash2
    hash3 = hash3 & hash3
  }

  // Create a 64-character hash for visual impact
  const part1 = Math.abs(hash1).toString(16).padStart(8, "0")
  const part2 = Math.abs(hash2).toString(16).padStart(8, "0")
  const part3 = Math.abs(hash3).toString(16).padStart(8, "0")
  const part4 = Math.abs(hash1 ^ hash2)
    .toString(16)
    .padStart(8, "0")
  const part5 = Math.abs(hash2 ^ hash3)
    .toString(16)
    .padStart(8, "0")
  const part6 = Math.abs(hash1 ^ hash3)
    .toString(16)
    .padStart(8, "0")
  const part7 = Math.abs(hash1 + hash2)
    .toString(16)
    .padStart(8, "0")
  const part8 = Math.abs(hash2 + hash3)
    .toString(16)
    .padStart(8, "0")

  return part1 + part2 + part3 + part4 + part5 + part6 + part7 + part8
}

// Convert hash to a cell pattern with more interesting rules
function hashToPattern(hash: string): number[][] {
  // Fixed size to prevent layout shifts
  const size = 5
  const pattern: number[][] = []

  // Different pattern generation rules based on hash characteristics
  const rule = parseInt(hash[1], 16) % 8 // More pattern varieties

  for (let y = 0; y < size; y++) {
    const row: number[] = []
    for (let x = 0; x < size; x++) {
      const index = (y * size + x) % hash.length
      const charCode = hash.charCodeAt(index)

      let alive = 0
      switch (rule) {
        case 0: // Diagonal pattern
          alive = (x === y || x === size - 1 - y) && charCode % 2 ? 1 : 0
          break
        case 1: // Center-heavy pattern
          const centerDist = Math.abs(x - size / 2) + Math.abs(y - size / 2)
          alive = centerDist < size / 2 && charCode % 3 !== 0 ? 1 : 0
          break
        case 2: // Edge pattern
          alive = (x === 0 || x === size - 1 || y === 0 || y === size - 1) && charCode % 2 ? 1 : 0
          break
        case 3: // Glider-like pattern
          const gliderPositions = [
            [0, 1],
            [1, 2],
            [2, 0],
            [2, 1],
            [2, 2],
          ]
          alive = gliderPositions.some(([gy, gx]) => y === gy && x === gx) && charCode % 2 ? 1 : 0
          break
        case 4: // Symmetric pattern
          alive = (charCode + x + y) % 3 === 0 && (x <= 2 || y <= 2) ? 1 : 0
          break
        case 5: // Cross pattern
          alive = (x === 2 || y === 2) && charCode % 2 === 0 ? 1 : 0
          break
        case 6: // Corners pattern
          alive = (x === 0 || x === 4) && (y === 0 || y === 4) && charCode % 2 ? 1 : 0
          break
        case 7: // Random clusters
          const cluster = Math.floor(index / 3) % 3
          alive = cluster === 1 && charCode % 2 === 0 ? 1 : 0
          break
      }

      row.push(alive)
    }
    pattern.push(row)
  }

  return pattern
}

// Create a custom pattern object from the generated pattern
function createCustomPattern(
  generatedPattern: number[][],
  hash: string,
  difficulty: number
): Pattern {
  // Calculate rarity based on pattern characteristics
  const cellCount = generatedPattern.flat().reduce((sum, cell) => sum + cell, 0)
  const totalCells = generatedPattern.length * generatedPattern[0].length
  const density = cellCount / totalCells

  let rarity = 1
  if (density > 0.7 || density < 0.2) rarity = 2
  if (density > 0.8 || density < 0.1) rarity = 3
  if (hash.includes("000")) rarity = Math.min(5, rarity + 1)
  if (hash.includes("0000")) rarity = 5

  // Determine category based on pattern structure
  let category: Pattern["category"] = "methuselah"
  if (cellCount <= 4) category = "still-life"
  else if (cellCount <= 8) category = "oscillator"
  else if (density < 0.3) category = "spaceship"

  // Color based on rarity
  const colors = [
    { color: "rgba(156, 163, 175, 0.9)", glow: "rgba(156, 163, 175, 0.3)" },
    { color: "rgba(147, 197, 253, 0.9)", glow: "rgba(59, 130, 246, 0.4)" },
    { color: "rgba(167, 139, 250, 0.9)", glow: "rgba(139, 92, 246, 0.4)" },
    { color: "rgba(251, 191, 36, 0.9)", glow: "rgba(245, 158, 11, 0.5)" },
    { color: "rgba(239, 68, 68, 0.9)", glow: "rgba(220, 38, 38, 0.6)" },
  ]

  const colorSet = colors[Math.min(rarity - 1, colors.length - 1)]

  return {
    id: `mined-${hash}`,
    name: `Mined #${hash.slice(0, 4).toUpperCase()}`,
    category,
    pattern: generatedPattern,
    period: 0,
    description: `PoW generated (Difficulty ${difficulty})`,
    rarity,
    color: colorSet.color,
    glowColor: colorSet.glow,
  }
}

export default function ProofOfWork({
  onPatternGenerated,
}: {
  onPatternGenerated?: (pattern: Pattern) => void
}) {
  const [state, setState] = useState<PoWState>({
    isHashing: false,
    currentHash: "",
    nonce: 0,
    difficulty: 2, // Fixed difficulty - lowered for better success rate
    generatedPattern: null,
    matchedPattern: null,
  })

  const startHashing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isHashing: true,
      nonce: 0,
      currentHash: "",
      generatedPattern: null,
      matchedPattern: null,
      startTime: Date.now(),
      miningTime: undefined,
    }))
  }, [])

  const stopHashing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isHashing: false,
    }))
  }, [])

  // Hashing animation
  useEffect(() => {
    if (!state.isHashing) return

    const interval = setInterval(() => {
      setState((prev) => {
        const newNonce = prev.nonce + 1
        const input = `0xcell-${Date.now()}-${newNonce}-${prev.difficulty}`
        const hash = generateHash(input)
        const pattern = hashToPattern(hash)

        // Check if we found a "valid" hash
        // More flexible validation: check for patterns of zeros
        const hasDoubleZero = hash.includes("00")
        const hasTripleZero = hash.includes("000")
        const endsWithZero = hash.endsWith("0")

        // Progressive difficulty: easier targets have higher chance
        const isValid =
          prev.difficulty === 2
            ? hasTripleZero || (hasDoubleZero && endsWithZero)
            : hash.endsWith("0".repeat(prev.difficulty))

        if (isValid || newNonce > 120) {
          // Found valid hash or timeout after 120 attempts
          const customPattern = createCustomPattern(pattern, hash, prev.difficulty)
          const miningTime = prev.startTime ? (Date.now() - prev.startTime) / 1000 : 0

          return {
            ...prev,
            isHashing: false,
            currentHash: hash,
            nonce: newNonce,
            generatedPattern: pattern,
            matchedPattern: customPattern,
            miningTime: miningTime,
          }
        }

        return {
          ...prev,
          currentHash: hash,
          nonce: newNonce,
          generatedPattern: pattern,
        }
      })
    }, 200) // Update every 200ms for more realistic mining speed

    return () => clearInterval(interval)
  }, [state.isHashing])

  // Notify parent component when a pattern is successfully mined
  useEffect(() => {
    if (state.matchedPattern && !state.isHashing && onPatternGenerated) {
      onPatternGenerated(state.matchedPattern)
    }
  }, [state.matchedPattern, state.isHashing, onPatternGenerated])

  return (
    <div className="space-y-2">
      {/* Controls */}
      <div className="flex items-center justify-left py-4">
        <button
          onClick={state.isHashing ? stopHashing : startHashing}
          className={`
            px-8 py-3 text-sm font-mono uppercase tracking-wider transition-all
            ${
              state.isHashing
                ? "bg-red-900 hover:bg-red-800 text-red-100"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }
          `}
        >
          {state.isHashing ? "Stop Mining" : "Start Mining"}
        </button>
      </div>

      {/* Hash Display */}
      <div className="text-left">
        <div className="font-mono text-3xl break-all leading-tight">
          {state.currentHash ? (
            <>
              <span className="text-gray-400">{state.currentHash.slice(0, 16)}</span>
              <span className="text-gray-500">{state.currentHash.slice(16, 32)}</span>
              <span className="text-gray-400">{state.currentHash.slice(32, 48)}</span>
              <span className="text-gray-500">
                {state.currentHash.slice(48, -state.difficulty)}
              </span>
              <span className="text-yellow-400 font-bold">
                {state.currentHash.slice(-state.difficulty)}
              </span>
            </>
          ) : (
            <span className="text-gray-600">{"0".repeat(64)}</span>
          )}
        </div>
      </div>

      {/* Fixed Size Pattern Display Area */}
      <div className="flex justify-center mt-12">
        <div
          className="border border-gray-700/50 flex items-center justify-center"
          style={{ width: "200px", height: "200px" }}
        >
          <div
            className="inline-grid gap-1"
            style={{
              gridTemplateColumns: `repeat(5, 24px)`,
              gridTemplateRows: `repeat(5, 24px)`,
            }}
          >
            {(
              state.generatedPattern || [
                [0, 1, 0, 0, 0],
                [0, 0, 1, 0, 0],
                [1, 1, 1, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
              ]
            ).map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className="transition-all duration-200"
                  style={{
                    backgroundColor: cell
                      ? state.isHashing
                        ? "rgba(156, 163, 175, 0.8)"
                        : "rgba(229, 231, 235, 0.9)"
                      : "lch(15 0 272)",
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Result - Minimalist single line */}
      <div className="h-12 flex items-center justify-center text-xs font-mono">
        {state.matchedPattern && !state.isHashing ? (
          <div className="flex items-center gap-4 text-gray-400 font-mono">
            <span className="text-green-400">✓</span>
            <span className="text-gray-500">NFT</span>
            <span className="text-white uppercase">#{state.matchedPattern.id.slice(0, 8)}</span>
            <span className="text-gray-600">|</span>
            <span>
              <span className="text-gray-500">Nonce</span>{" "}
              <span className="text-gray-300">{state.nonce}</span>
            </span>
            <span className="text-gray-600">|</span>
            <span>
              <span className="text-gray-500">Time</span>{" "}
              <span className="text-gray-300">{state.miningTime?.toFixed(1)}s</span>
            </span>
            <span className="text-gray-600">|</span>
            <span>
              <span className="text-gray-500">Rarity</span>{" "}
              <span
                className={state.matchedPattern.rarity >= 4 ? "text-yellow-400" : "text-gray-300"}
              >
                {"★".repeat(state.matchedPattern.rarity)}
              </span>
            </span>
          </div>
        ) : (
          <span className="text-gray-500">{state.isHashing ? "Mining..." : "Ready to Mine"}</span>
        )}
      </div>
    </div>
  )
}
