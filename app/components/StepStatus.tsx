"use client"

import { useChainId, useChains } from "wagmi"

interface StepStatusProps {
  // Mining status
  miningStatus: "idle" | "mining" | "complete"
  minedHashValue?: string
  // CCTP status
  cctpStatus: string
  // Game status
  gameStatus: "idle" | "playing" | "complete"
  gameGeneration?: number
}

export default function StepStatus({
  miningStatus,
  cctpStatus,
  gameStatus,
  gameGeneration,
}: StepStatusProps) {
  const chainId = useChainId()
  const chains = useChains()
  const currentChain = chains.find((chain) => chain.id === chainId)
  // Determine overall progress
  const getOverallStep = () => {
    if (miningStatus === "idle") return "mining-start"
    if (miningStatus === "mining") return "mining-progress"
    if (miningStatus === "complete" && cctpStatus === "idle") return "cctp-start"
    if (cctpStatus === "approving") return "cctp-approve"
    if (cctpStatus === "burning") return "cctp-burn"
    if (cctpStatus === "attesting") return "cctp-attest"
    if (cctpStatus === "minting") return "cctp-mint"
    if (cctpStatus === "complete" && gameStatus === "idle") return "game-start"
    if (gameStatus === "playing") return "game-playing"
    if (gameStatus === "complete") return "game-complete"
    return "unknown"
  }

  const currentStep = getOverallStep()

  // Get guidance message based on current step
  const getGuidanceMessage = () => {
    switch (currentStep) {
      case "mining-start":
        return {
          icon: "⛏️",
          title: "Start Mining",
          message: 'Click "Start Mining" to generate your unique hash pattern',
          action: "Start proof-of-work mining",
        }
      case "mining-progress":
        return {
          icon: "⚡",
          title: "Mining in Progress",
          message: "Finding a valid hash with leading zeros...",
          action: "Please wait",
        }
      case "cctp-start":
        const isEthereumSepolia = chainId === 11155111
        return {
          icon: "💰",
          title: "Ready to Transfer",
          message: isEthereumSepolia
            ? "Send 0.1 USDC from Ethereum to Base to initialize your game"
            : `Switch to Ethereum Sepolia (current: ${currentChain?.name || "Unknown"})`,
          action: isEthereumSepolia ? "Send USDC" : "Switch network",
        }
      case "cctp-approve":
        return {
          icon: "✅",
          title: "Approving USDC",
          message: "Granting permission to transfer USDC...",
          action: "Confirm in wallet",
        }
      case "cctp-burn":
        return {
          icon: "🔥",
          title: "Burning USDC",
          message: "Burning USDC on Ethereum Sepolia...",
          action: "Transaction processing",
        }
      case "cctp-attest":
        return {
          icon: "⏳",
          title: "Waiting for Attestation",
          message: "Circle is attesting your cross-chain message...",
          action: "This takes ~15 minutes",
        }
      case "cctp-mint":
        return {
          icon: "✨",
          title: "Minting on Base",
          message: "Minting USDC and initializing game on Base Sepolia...",
          action: "Almost done",
        }
      case "game-start":
        return {
          icon: "🎮",
          title: "Ready to Play",
          message: "Your player is initialized at (30,30). Start the game!",
          action: "Click Play to begin",
        }
      case "game-playing":
        return {
          icon: "🏃",
          title: "Game Running",
          message: `Generation ${gameGeneration || 0}/100 - Watch your cells evolve!`,
          action: "Game in progress",
        }
      case "game-complete":
        return {
          icon: "🏆",
          title: "Game Complete!",
          message: `Finished at generation ${gameGeneration || 100}. Well played!`,
          action: "Reset to play again",
        }
      default:
        return {
          icon: "🎮",
          title: "0xcell",
          message: "On-chain Conway's Game of Life",
          action: "Start your journey",
        }
    }
  }

  const guidance = getGuidanceMessage()

  // Progress indicators
  const steps = [
    {
      name: "Mining",
      status:
        miningStatus === "complete" ? "complete" : miningStatus === "mining" ? "active" : "pending",
    },
    {
      name: "CCTP",
      status:
        cctpStatus === "complete"
          ? "complete"
          : cctpStatus !== "idle"
            ? "active"
            : miningStatus === "complete"
              ? "ready"
              : "pending",
    },
    {
      name: "Game",
      status:
        gameStatus === "complete"
          ? "complete"
          : gameStatus === "playing"
            ? "active"
            : cctpStatus === "complete"
              ? "ready"
              : "pending",
    },
  ]

  return (
    <div className="flex items-center gap-4 text-sm">
      {/* Current Step Guidance */}
      <div className="flex-1 flex items-center gap-3">
        <div className="text-2xl">{guidance.icon}</div>
        <div className="flex-1">
          <div className="font-semibold text-white">{guidance.title}</div>
          <div className="text-gray-400 text-xs">{guidance.message}</div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-3">
        {steps.map((step) => (
          <div key={step.name} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  step.status === "complete"
                    ? "bg-green-400"
                    : step.status === "active"
                      ? "bg-yellow-400 animate-pulse"
                      : step.status === "ready"
                        ? "bg-blue-400"
                        : "bg-gray-600"
                }`}
              />
              <span
                className={`font-medium ${
                  step.status === "complete"
                    ? "text-green-400"
                    : step.status === "active"
                      ? "text-yellow-400"
                      : step.status === "ready"
                        ? "text-blue-400"
                        : "text-gray-500"
                }`}
              >
                {step.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
