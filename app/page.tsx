"use client"

import { ConnectKitButton } from "connectkit"
import { useState, useEffect } from "react"
import GameOfLife from "./components/GameOfLife"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-20 backdrop-blur-sm bg-black/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-center items-center">
          <ConnectKitButton showBalance={true} />
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-40">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-6xl md:text-8xl font-bold tracking-tight mb-4">EMERGE</h2>
          <p className="text-gray-500 text-sm tracking-widest uppercase">
            Conway&apos;s Game of Life
          </p>
        </div>

        {/* Game */}
        <div className="mb-12">
          <GameOfLife />
        </div>

        {/* Minimal Instructions */}
        <div className="text-center text-gray-600 text-sm max-w-md py-12">
          <p className="mb-2">Click cells to create life</p>
          <p>Watch patterns emerge from simple rules</p>
        </div>
      </main>

      {/* Subtle Background Gradient */}
      <div className="fixed inset-0 -z-10 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-blue-900/20"></div>
      </div>
    </div>
  )
}
