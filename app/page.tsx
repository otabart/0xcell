"use client"

import { ConnectKitButton } from "connectkit"
import { useState, useEffect } from "react"
import GameOfLife from "./components/GameOfLife"
import ProofOfWork from "./components/ProofOfWork"
import CCTPMessage from "./components/CCTPMessage"
import StepStatus from "./components/StepStatus"
import Image from "next/image"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  // const [selectedPattern, setSelectedPattern] = useState<Pattern | undefined>()
  const [minedHashValue, setMinedHashValue] = useState<string | undefined>()
  const [miningStatus, setMiningStatus] = useState<"idle" | "mining" | "complete">("idle")
  const [cctpStatus, setCctpStatus] = useState("idle")
  const [gameStatus, setGameStatus] = useState<"idle" | "playing" | "complete">("idle")
  const [gameGeneration, setGameGeneration] = useState<number>(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen text-gray-100">
      <header className="w-full max-w-2xl mx-auto mt-16 h-[200px] relative">
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <Image src="/logo.png" alt="0xcell" width={500} height={500} />
        </div>
      </header>
      {/* Main Content */}
      <main className="min-h-screen flex flex-col items-center px-6 py-12">
        {/* Introduction */}
        <div className="text-left max-w-2xl mx-auto mb-24 space-y-2 text-gray-400 text-sm leading-relaxed">
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
            Unlocking the possibilities of{" "}
            <span className="text-green-400">Circle&apos;s CCTP</span>. Beyond payments, CCTP
            enables applications and games.
            <br />
            <span className="text-orange-400">Solana</span> users can interact with{" "}
            <span className="text-blue-400">Ethereum</span>, passing arbitrary messages .
          </p>
          <p className="py-6">
            To play the game, you&apos;ll need to get some USDC from the{" "}
            <a
              href="https://faucet.circle.com/"
              target="_blank"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Circle faucet
            </a>
            .
          </p>
          <hr className="border-gray-700/50" />
          <p className="flex justify-between font-mono items-center">
            <span>
              Built by{" "}
              <a
                href="https://x.com/ashu_mest"
                target="_blank"
                className="text-yellow-400 hover:text-yellow-300 hover:underline font-semibold"
              >
                Ashu
              </a>
              ,{"  "}
              <a
                href="https://github.com/Attens1423"
                target="_blank"
                className="text-yellow-400 hover:text-yellow-300 hover:underline font-semibold"
              >
                Attens
              </a>
              , and{"  "}
              <a
                href="https://x.com/MonsterSea7"
                target="_blank"
                className="text-yellow-400 hover:text-yellow-300 hover:underline font-semibold"
              >
                Yiran
              </a>
              .
            </span>
            <a
              href="https://github.com/0xashu/0xcell"
              target="_blank"
              className="text-blue-400 hover:text-blue-300 hover:underline font-semibold"
            >
              GitHub
            </a>
          </p>
        </div>

        {/* Proof of Work */}
        <div className="w-full max-w-2xl mb-24">
          <h2 className="text-lg font-mono uppercase">#1 Mining</h2>
          <ProofOfWork
            onPatternGenerated={() => {}}
            onHashMined={(hash) => {
              setMinedHashValue(hash)
              setMiningStatus("complete")
            }}
            onMiningStatusChange={setMiningStatus}
          />
        </div>

        {/* CCTP Message Section */}
        <div className="w-full max-w-2xl mb-24">
          <h2 className="text-lg font-mono uppercase mb-4">#2 CCTP Message</h2>
          <CCTPMessage
            minedHashValue={minedHashValue}
            onStatusChange={(status) => {
              setCctpStatus(status)
            }}
          />
        </div>

        {/* Game */}
        <div className="mb-24 max-w-2xl w-full">
          <h2 className="text-lg w-full font-mono uppercase mb-4">#3 Play Game</h2>
          <GameOfLife
            onGameStatusChange={(status, generation) => {
              setGameStatus(status)
              if (generation !== undefined) {
                setGameGeneration(generation)
              }
            }}
          />
        </div>
      </main>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-700/50 bg-black/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Left Side - Step Status */}
            <div className="flex-1">
              <StepStatus
                miningStatus={miningStatus}
                minedHashValue={minedHashValue}
                cctpStatus={cctpStatus}
                gameStatus={gameStatus}
                gameGeneration={gameGeneration}
              />
            </div>

            {/* Right Side - Wallet */}
            <div className="flex-shrink-0 ml-6">
              <ConnectKitButton showBalance={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
