"use client"

import { ConnectKitButton } from "connectkit"
import { useState, useEffect } from "react"
import GameOfLife from "./components/GameOfLife"
import { type Pattern } from "./components/CellSelector"
import SelectedCellDisplay from "./components/SelectedCellDisplay"
import ProofOfWork from "./components/ProofOfWork"
import PatternCollection from "./components/PatternCollection"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<Pattern | undefined>()
  const [minedPatterns, setMinedPatterns] = useState<Pattern[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Main Content */}
      <main className="min-h-screen flex flex-col items-center px-6 py-12 pb-24">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-6xl md:text-8xl font-bold font-mono tracking-tight mb-4">0XCELL</h2>
          <p className="text-gray-500 text-sm tracking-widest uppercase">
            Conway&apos;s Game of Life
          </p>
        </div>

        {/* Mining Section */}
        <div className="w-full max-w-4xl mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Proof of Work Mining */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <ProofOfWork
              onPatternGenerated={(pattern) => {
                setSelectedPattern(pattern)
                setMinedPatterns((prev) => [...prev, pattern])
              }}
            />
          </div>

          {/* Pattern Collection Stats */}
          <PatternCollection minedPatterns={minedPatterns} />
        </div>

        {/* Game */}
        <div className="mb-8">
          <GameOfLife />
        </div>

        {/* Minimal Instructions */}
        <div className="text-center text-gray-600 text-sm max-w-md">
          <p className="mb-2">Mine patterns using Proof of Work hashing</p>
          <p>Click on the grid to place your mined patterns</p>
        </div>
      </main>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 backdrop-blur-sm bg-gray-900/90 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Left Side - Selected Cell Display */}
          <div className="flex-1">
            <SelectedCellDisplay selectedPattern={selectedPattern} />
          </div>

          {/* Right Side - Wallet */}
          <div className="flex-1 flex justify-end">
            <ConnectKitButton showBalance={true} />
          </div>
        </div>
      </div>

      {/* Subtle Background Gradient */}
      <div className="fixed inset-0 -z-10 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20"></div>
      </div>
    </div>
  )
}
