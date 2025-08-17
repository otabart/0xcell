"use client"

import { Game, type Grid } from "./games/life"
import { Grid as GridComponent } from "./games/grid"
import { useEffect, useState } from "react"
import { Button } from "./ui/Button"

interface GameOfLifeProps {
  onGameStatusChange?: (status: "idle" | "playing" | "complete", generation?: number) => void
}

export default function GameOfLife({ onGameStatusChange }: GameOfLifeProps) {
  const [game, setGame] = useState<Game | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  // Notify parent of status changes
  useEffect(() => {
    if (!hasStarted) {
      onGameStatusChange?.("idle")
    } else if (generation >= 100) {
      onGameStatusChange?.("complete", generation)
      setIsPlaying(false)
    } else if (isPlaying) {
      onGameStatusChange?.("playing", generation)
    } else {
      onGameStatusChange?.("idle", generation)
    }
  }, [isPlaying, generation, hasStarted, onGameStatusChange])

  useEffect(() => {
    const rows: number = 50
    const cols: number = 50

    const seed: Grid = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    ]

    // Creating the game
    setGame(new Game(rows, cols, seed))
  }, [])

  // Auto-evolve when playing
  useEffect(() => {
    if (isPlaying && generation < 100 && game) {
      const timer = setTimeout(() => {
        setGeneration((prev) => prev + 1)
        game.evolve()
      }, 200) // 200ms per generation
      return () => clearTimeout(timer)
    }
  }, [isPlaying, generation, game])

  // Enhanced App wrapper with generation tracking
  const EnhancedApp = () => {
    if (!game) return <div>Loading...</div>

    const handlePlay = () => {
      setIsPlaying(true)
      setHasStarted(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleNext = () => {
      if (!hasStarted) setHasStarted(true)
      if (generation < 100) {
        setGeneration((prev) => prev + 1)
        game.evolve()
      }
    }

    const handleReset = () => {
      setGeneration(0)
      setIsPlaying(false)
      game.reset()
    }

    return (
      <div className="w-full space-y-4">
        {/* Game stats */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div>
            Generation: <span className="text-white font-mono">{generation}</span>/100
          </div>
          {generation >= 100 && (
            <div className="text-green-400 font-semibold">🏆 Game Complete!</div>
          )}
        </div>

        {/* Controls */}
        <div className="mb-8 flex justify-start gap-8 flex-wrap">
          <div className="flex w-full items-center gap-4 justify-between">
            <Button
              onClick={isPlaying ? handlePause : handlePlay}
              disabled={generation >= 100}
              variant="primary"
              size="lg"
              className="flex-1"
            >
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <div className="flex gap-4">
              <Button onClick={handleReset} variant="secondary" size="md">
                Reset
              </Button>
              <Button
                onClick={handleNext}
                disabled={isPlaying || generation >= 100}
                variant="secondary"
                size="md"
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <GridComponent
          cells={game.cells}
          onMouseDown={(row: number, col: number) => () => game.flip(row, col)}
        />
      </div>
    )
  }

  return (
    <div>
      <EnhancedApp />
    </div>
  )
}
