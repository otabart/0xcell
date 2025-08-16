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
    <div className="min-h-screen text-gray-100" style={{ backgroundColor: "lch(2.467 0 272)" }}>
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

        {/* Proof of Work */}
        <div className="w-full max-w-2xl mb-8">
          <h2 className="text-lg font-mono uppercase">#1 Mining</h2>
          <ProofOfWork onPatternGenerated={setSelectedPattern} />
        </div>

        {/* Game */}
        <div className="mb-8">
          <GameOfLife />
        </div>
      </main>

      {/* Fixed Bottom Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 backdrop-blur-sm border-t border-gray-700"
        style={{ backgroundColor: "lch(2.467 0 272 / 0.9)" }}
      >
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
