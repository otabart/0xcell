"use client"

import { MultiplayerGame } from "./games/multiplayerLife"
import { MultiplayerGridComponent } from "./games/multiplayerGrid"
import { useEffect, useState, useCallback } from "react"
import { Button } from "./ui/Button"

type GamePhase = "ready" | "playing" | "complete"

interface GameOfLifeProps {
  minedHash?: string
  onGameStatusChange?: (status: "idle" | "playing" | "complete", generation?: number) => void
}

const MAX_GENERATIONS = 100
const GRID_SIZE = 50

// Patterns categorized by behavior - prioritize dynamic patterns
const DYNAMIC_PATTERNS = {
  // Moving patterns
  glider: [
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 1],
  ],
  lightweight_spaceship: [
    [0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  // Oscillators
  blinker: [[1, 1, 1]],
  toad: [
    [0, 1, 1, 1],
    [1, 1, 1, 0],
  ],
  beacon: [
    [1, 1, 0, 0],
    [1, 0, 0, 0],
    [0, 0, 0, 1],
    [0, 0, 1, 1],
  ],
  pulsar: [
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
  ],
  // Methuselahs (patterns that evolve for many generations)
  r_pentomino: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 1, 0],
  ],
  diehard: [
    [0, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 1, 1],
  ],
  acorn: [
    [0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [1, 1, 0, 0, 1, 1, 1],
  ],
}

// Static patterns (use sparingly)
const STATIC_PATTERNS = {
  block: [
    [1, 1],
    [1, 1],
  ],
  beehive: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  loaf: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 1, 0, 1],
    [0, 0, 1, 0],
  ],
}

// Generate default patterns when no hash is available
function generateDefaultPatterns(
  player: 1 | 2
): Array<{ pattern: number[][]; position: [number, number] }> {
  const patterns: Array<{ pattern: number[][]; position: [number, number] }> = []
  const dynamicPatterns = Object.values(DYNAMIC_PATTERNS)

  // Place 3-5 random dynamic patterns
  const patternCount = 3 + Math.floor(Math.random() * 3)

  for (let i = 0; i < patternCount; i++) {
    const pattern = dynamicPatterns[Math.floor(Math.random() * dynamicPatterns.length)]
    const row = 10 + Math.floor(Math.random() * (GRID_SIZE - 20 - pattern.length))
    const col = 10 + Math.floor(Math.random() * (GRID_SIZE - 20 - (pattern[0]?.length || 0)))

    const playerPattern = pattern.map((row) => row.map((cell) => (cell ? player : 0)))
    patterns.push({ pattern: playerPattern, position: [row, col] })
  }

  return patterns
}

// Convert hash to deterministic pattern placement
function generatePatternFromHash(
  hash: string,
  player: 1 | 2
): Array<{ pattern: number[][]; position: [number, number] }> {
  const patterns: Array<{ pattern: number[][]; position: [number, number] }> = []

  // Use hash segments for different properties
  const hashSegments = hash.match(/.{1,8}/g) || []

  // Number of patterns to place (4-8 for more activity)
  const patternCount = 4 + (parseInt(hashSegments[0] || "0", 16) % 5)

  // Combine patterns with 80% dynamic, 20% static
  const dynamicPatterns = Object.values(DYNAMIC_PATTERNS)
  const staticPatterns = Object.values(STATIC_PATTERNS)

  for (let i = 0; i < patternCount && i < hashSegments.length - 1; i++) {
    const segment = hashSegments[i + 1]
    const value = parseInt(segment, 16)

    // 80% chance for dynamic pattern
    const useDynamic = value % 100 < 80
    const patternPool = useDynamic ? dynamicPatterns : staticPatterns

    // Select pattern
    const patternIndex = value % patternPool.length
    const pattern = patternPool[patternIndex]

    // Calculate position with more spread
    const gridSection = i % 4 // Divide grid into 4 sections
    const sectionSize = Math.floor(GRID_SIZE / 2)
    const baseRow = (gridSection < 2 ? 0 : sectionSize) + (value % (sectionSize - 15))
    const baseCol = (gridSection % 2 === 0 ? 0 : sectionSize) + ((value >> 8) % (sectionSize - 15))

    // Add some randomness to position
    const row = Math.max(5, Math.min(GRID_SIZE - pattern.length - 5, baseRow + 5))
    const col = Math.max(5, Math.min(GRID_SIZE - (pattern[0]?.length || 0) - 5, baseCol + 5))

    // Convert pattern to player's cells
    const playerPattern = pattern.map((row) => row.map((cell) => (cell ? player : 0)))

    patterns.push({ pattern: playerPattern, position: [row, col] })
  }

  // Add a few random cells for extra chaos
  const chaosCount = 5 + (parseInt(hashSegments[hashSegments.length - 1] || "0", 16) % 10)
  for (let i = 0; i < chaosCount; i++) {
    const chaosValue = parseInt(hashSegments[i % hashSegments.length] || "0", 16)
    const row = 10 + (chaosValue % (GRID_SIZE - 20))
    const col = 10 + ((chaosValue >> 8) % (GRID_SIZE - 20))
    patterns.push({
      pattern: [[player]],
      position: [row, col],
    })
  }

  return patterns
}

export default function GameOfLife({ minedHash, onGameStatusChange }: GameOfLifeProps) {
  const [game, setGame] = useState<MultiplayerGame | null>(null)
  const [phase, setPhase] = useState<GamePhase>("ready")
  const [generation, setGeneration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [winner, setWinner] = useState<"player" | "bot" | "tie" | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Initialize game
  useEffect(() => {
    setGame(new MultiplayerGame(GRID_SIZE, GRID_SIZE))
  }, [])

  // Initialize patterns (with hash or default)
  useEffect(() => {
    if (!game || hasInitialized) return

    // Reset game first
    game.reset()

    if (minedHash) {
      // Use hash-based patterns
      const playerPatterns = generatePatternFromHash(minedHash, 1)
      playerPatterns.forEach(({ pattern, position }) => {
        const [startRow, startCol] = position
        pattern.forEach((row, rowIdx) => {
          row.forEach((cell, colIdx) => {
            if (cell && startRow + rowIdx < GRID_SIZE && startCol + colIdx < GRID_SIZE) {
              game.placeCell(startRow + rowIdx, startCol + colIdx, 1)
            }
          })
        })
      })

      // Generate bot patterns with strategic placement
      const botHash = minedHash.substring(32) + minedHash.substring(0, 32)
      const botPatterns = generatePatternFromHash(botHash, 2)

      botPatterns.forEach(({ pattern, position }, index) => {
        const [baseRow, baseCol] = position
        let finalRow = baseRow
        let finalCol = baseCol

        if (index % 3 === 0) {
          finalCol = GRID_SIZE - baseCol - (pattern[0]?.length || 0)
        } else if (index % 3 === 1) {
          finalRow = GRID_SIZE - baseRow - pattern.length
        } else {
          const centerOffset = GRID_SIZE / 2
          finalRow = Math.floor(centerOffset + (baseCol - centerOffset))
          finalCol = Math.floor(centerOffset - (baseRow - centerOffset))
        }

        finalRow = Math.max(0, Math.min(GRID_SIZE - pattern.length, finalRow))
        finalCol = Math.max(0, Math.min(GRID_SIZE - (pattern[0]?.length || 0), finalCol))

        pattern.forEach((row, rowIdx) => {
          row.forEach((cell, colIdx) => {
            if (
              cell &&
              finalRow + rowIdx < GRID_SIZE &&
              finalCol + colIdx < GRID_SIZE &&
              finalRow + rowIdx >= 0 &&
              finalCol + colIdx >= 0
            ) {
              game.placeCell(finalRow + rowIdx, finalCol + colIdx, 2)
            }
          })
        })
      })
    } else {
      // Use default patterns
      const playerPatterns = generateDefaultPatterns(1)
      playerPatterns.forEach(({ pattern, position }) => {
        const [startRow, startCol] = position
        pattern.forEach((row, rowIdx) => {
          row.forEach((cell, colIdx) => {
            if (cell && startRow + rowIdx < GRID_SIZE && startCol + colIdx < GRID_SIZE) {
              game.placeCell(startRow + rowIdx, startCol + colIdx, 1)
            }
          })
        })
      })

      const botPatterns = generateDefaultPatterns(2)
      botPatterns.forEach(({ pattern, position }) => {
        const [startRow, startCol] = position
        // Mirror bot positions for variety
        const mirroredCol = GRID_SIZE - startCol - (pattern[0]?.length || 0)
        pattern.forEach((row, rowIdx) => {
          row.forEach((cell, colIdx) => {
            if (cell && startRow + rowIdx < GRID_SIZE && mirroredCol + colIdx < GRID_SIZE) {
              game.placeCell(startRow + rowIdx, mirroredCol + colIdx, 2)
            }
          })
        })
      })
    }

    setHasInitialized(true)
    setPhase("ready")
  }, [game, minedHash, hasInitialized])

  // Start the game
  const handleStartGame = useCallback(() => {
    if (!game || phase !== "ready") return
    setPhase("playing")
    setIsPlaying(true)
    onGameStatusChange?.("playing", 0)
  }, [game, phase, onGameStatusChange])

  // Handle game end
  const handleGameEnd = useCallback(() => {
    if (!game) return

    setIsPlaying(false)
    setPhase("complete")

    const finalCounts = game.getCellCounts()
    if (finalCounts.player1 > finalCounts.player2) {
      setWinner("player")
    } else if (finalCounts.player2 > finalCounts.player1) {
      setWinner("bot")
    } else {
      setWinner("tie")
    }

    onGameStatusChange?.("complete", generation)
  }, [game, generation, onGameStatusChange])

  // Auto-evolve when playing
  useEffect(() => {
    if (isPlaying && generation < MAX_GENERATIONS && game) {
      const timer = setTimeout(() => {
        game.evolve()
        setGeneration((prev) => prev + 1)

        const counts = game.getCellCounts()
        if (counts.player1 === 0 || counts.player2 === 0) {
          handleGameEnd()
        }
      }, 200)
      return () => clearTimeout(timer)
    } else if (generation >= MAX_GENERATIONS) {
      handleGameEnd()
    }
  }, [isPlaying, generation, game, handleGameEnd])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const handleResume = useCallback(() => {
    setIsPlaying(true)
  }, [])

  const handleReset = useCallback(() => {
    if (!game) return
    game.reset()
    setPhase("ready")
    setGeneration(0)
    setIsPlaying(false)
    setWinner(null)
    setHasInitialized(false)
    onGameStatusChange?.("idle")
  }, [game, onGameStatusChange])

  if (!game) {
    return <div>Loading game...</div>
  }

  const currentCounts = game.getCellCounts()

  return (
    <div className="w-full space-y-6">
      {/* Minimalist Stats Display */}
      <div className="flex justify-between items-center text-sm font-mono">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-cyan-500"></div>
            <span className="text-gray-400">{currentCounts.player1}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-amber-500"></div>
            <span className="text-gray-400">{currentCounts.player2}</span>
          </div>
        </div>

        {/* Generation Counter */}
        {phase === "playing" && (
          <div className="text-gray-500">
            {generation}/{MAX_GENERATIONS}
          </div>
        )}
      </div>

      {/* Game Grid - Clean presentation */}
      <div className="flex justify-center">
        <div className="inline-block">
          <MultiplayerGridComponent cells={game.cells} disabled={true} />
        </div>
      </div>

      {/* Status Display */}
      <div className="text-center">
        {phase === "ready" && (
          <p className="text-gray-400 text-sm font-mono">
            {minedHash ? "patterns from hash" : "random patterns"}
          </p>
        )}
        {phase === "complete" && (
          <p className="text-sm font-mono">
            {winner === "player" && <span className="text-blue-300">you win</span>}
            {winner === "bot" && <span className="text-red-300">bot wins</span>}
            {winner === "tie" && <span className="text-gray-400">tie</span>}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        {phase === "ready" && (
          <Button onClick={handleStartGame} variant="primary" size="md">
            Start
          </Button>
        )}

        {phase === "playing" && (
          <Button onClick={isPlaying ? handlePause : handleResume} variant="primary" size="md">
            {isPlaying ? "Pause" : "Resume"}
          </Button>
        )}

        <Button onClick={handleReset} variant="secondary" size="md">
          Reset
        </Button>
      </div>
    </div>
  )
}
