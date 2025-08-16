"use client"

import { ConnectKitButton } from "connectkit"
import { useState, useEffect } from "react"
import GameOfLife from "./components/GameOfLife"
import { type Pattern } from "./components/CellSelector"
import SelectedCellDisplay from "./components/SelectedCellDisplay"
import ProofOfWork from "./components/ProofOfWork"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [selectedPattern, setSelectedPattern] = useState<Pattern | undefined>()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Main Content */}
      <main className="min-h-screen flex flex-col items-center px-6 py-12 pb-24">
        {/* Introduction */}
        <div className="text-left max-w-2xl mx-auto mb-12 space-y-2 text-gray-400 text-sm leading-relaxed">
          <p>
            <span className="text-white font-bold font-mono text-lg">0xcell</span> is an{" "}
            <span className="text-blue-400 font-medium">on-chain Conway&apos;s Game of Life</span>.
          </p>

          <p>
            Built on <span className="text-purple-400">proof of work</span>,{" "}
            <span className="text-cyan-400">cross-chain messaging</span>, and{" "}
            <span className="text-pink-400">generative art</span>.
          </p>

          <p>
            Unlocking the possibilities of <span className="text-green-400">Circle's CCTP</span>.
            Beyond payments, CCTP enables applications and games.
            <br />
            <span className="text-orange-400">Solana</span> users can interact with{" "}
            <span className="text-blue-400">Ethereum</span>, passing{" "}
            <span className="text-purple-300">arbitrary messages</span>.
          </p>
        </div>

        {/* Game */}
        <div className="mb-8">
          <GameOfLife />
        </div>

        {/* Mining Section */}
        <div className="w-full max-w-2xl mb-8">
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <ProofOfWork onPatternGenerated={setSelectedPattern} />
          </div>
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
