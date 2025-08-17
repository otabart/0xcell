"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import Image from "next/image"
import { Button } from "./ui/Button"

// Sample contract code snippets
const contractSnippets = {
  encode: `// Solana: Burn USDC and attach game data
const hookData = encodeGameData(amount * 10**6, userAddress, x, y);
const tx = await cctpContract.depositForBurnWithHook(
  amount, ETHEREUM_DOMAIN, hookRecipient, usdc.address, hookData
);`,
  decode: `// CCTP Hook: Auto-execute when USDC arrives on Ethereum
function handleReceiveMessage(uint32 sourceDomain, bytes32 sender, bytes calldata messageBody) external {
  (address token, uint256 amount, bytes memory hookData) = abi.decode(messageBody, (address, uint256, bytes));
  
  IGameCoreRecord(gameContract).initGame(hookData);
  IERC20(token).transfer(treasury, amount);
}`,
  process: `// Game Contract: Initialize player on-chain
function initGame(bytes calldata data) external returns (bool) {
  require(msg.sender == cctpHookWrapper, "Unauthorized");
  
  (uint256 usdcAmount, address user, uint256 coords) = _decodeData(data);
  (uint256 x, uint256 y) = _extractCoordinates(coords);
  uint256 level = _calculateBaseLevel(usdcAmount);
  
  _initGame(user, level, x, y);
  _requestRandomNumber(); // VRF for randomness
  emit GameInitialized(user, block.timestamp);
}`,
}

export default function CCTPMessage() {
  const { address } = useAccount()
  const [selectedTab, setSelectedTab] = useState<"encode" | "decode" | "process">("encode")
  const [isProcessing, setIsProcessing] = useState(false)
  const [txStatus, setTxStatus] = useState<string>("")

  // Demo data
  // const demoData = {
  //   usdcAmount: 100 * 1e6, // 100 USDC with 6 decimals
  //   userAddress: address || "0x742d35Cc6634C0532925a3b844Bc9e7595f7Fd1f",
  //   coordinates: { x: 30, y: 30 },
  // }

  // Generate encoded message
  // const getEncodedMessage = (): string => {
  //   const coordinates = (BigInt(demoData.coordinates.x) << 128n) | BigInt(demoData.coordinates.y)
  //   return `0x${demoData.usdcAmount.toString(16).padStart(64, "0")}${demoData.userAddress
  //     .slice(2)
  //     .padStart(64, "0")}${coordinates.toString(16).padStart(64, "0")}`
  // }

  // Simulate sending CCTP message
  const sendCCTPMessage = async () => {
    if (!address) return

    setIsProcessing(true)
    setTxStatus("🎯 Preparing to enter the game world...")

    // Simulate CCTP V2 Hook steps with game flavor
    const steps = [
      "🔥  Burning 100 USDC on Solana...",
      "⏳  Circle wizards verifying your journey...",
      "✨  Materializing USDC on Ethereum...",
      "🎮  Game portal detecting your arrival...",
      "🎲  Rolling dice for your starting position...",
      "🌟  Chainlink oracle blessing your fate...",
      "🏆  Welcome! You spawned at (30,30) as Level 7 player!",
    ]

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setTxStatus(steps[i])
    }

    setIsProcessing(false)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-gray-700">
          {[
            { id: "encode", label: "1. Burn", icon: "/solana.png" },
            { id: "decode", label: "2. Mint", icon: "/circle.svg" },
            { id: "process", label: "3. Play", icon: "/ethereum.png" },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as "encode" | "decode" | "process")}
              variant="tab"
              active={selectedTab === tab.id}
              className="py-2 w-24 text-left"
            >
              <div className="flex items-center gap-2 uppercase tracking-wider font-bold">
                {tab.label}
                <div className="border border-gray-700/50 rounded-full">
                  <Image src={tab.icon} alt={tab.label} width={16} height={16} />
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Code Display */}
        <div className="overflow-hidden">
          <SyntaxHighlighter
            language="solidity"
            style={tomorrow}
            showLineNumbers={false}
            customStyle={{
              backgroundColor: "transparent",
              padding: "1.5rem",
              fontSize: "0.8rem",
              lineHeight: "1.6",
              margin: 0,
              letterSpacing: "0.025em",
              borderRadius: 0,
            }}
            codeTagProps={{
              style: {
                backgroundColor: "transparent",
                fontSize: "inherit",
              },
            }}
            PreTag="div"
          >
            {contractSnippets[selectedTab as keyof typeof contractSnippets]}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Send Transaction Button */}
      <Button
        onClick={sendCCTPMessage}
        disabled={!address || isProcessing}
        fullWidth
        size="lg"
        variant="primary"
      >
        {!address ? "🔗 Connect Wallet to Play" : isProcessing ? txStatus : "Send CCTP Message"}
      </Button>
    </div>
  )
}
