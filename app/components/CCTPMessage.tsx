"use client"

import { useState, useEffect } from "react"
import { useAccount, useChainId, useChains } from "wagmi"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import Image from "next/image"
import { Button } from "./ui/Button"
import { useCCTPTransfer } from "../hooks/useCCTPTransfer"

// Sample contract code snippets with dynamic content
const getContractSnippets = (hashValue?: string) => ({
  encode: `// Ethereum: Burn USDC and attach game data
const amount = 0.1 * 10**6; // 0.1 USDC (100,000 in 6 decimals)
${hashValue ? `const minedHash = "${hashValue}"; // From Step 1 Mining` : "// Complete Step 1 to get your mined hash"}
const hookData = encodeGameData(amount, userAddress, x, y, minedHash);
const tx = await cctpContract.depositForBurnWithHook(
  amount, BASE_DOMAIN, hookRecipient, usdc.address, hookData
);`,
  decode: `// CCTP Hook: Auto-execute when USDC arrives on Base
function handleReceiveMessage(uint32 sourceDomain, bytes32 sender, bytes calldata messageBody) external {
  (address token, uint256 amount, bytes memory hookData) = abi.decode(messageBody, (address, uint256, bytes));
  
  // 0.1 USDC received, forward to game contract
  IGameCoreRecord(gameContract).initGame(hookData);
  IERC20(token).transfer(treasury, amount);
}`,
  process: `// Game Contract: Initialize player on-chain
function initGame(bytes calldata data) external returns (bool) {
  require(msg.sender == cctpHookWrapper, "Unauthorized");
  
  (uint256 usdcAmount, address user, uint256 coords, bytes32 minedHash) = _decodeData(data);
  (uint256 x, uint256 y) = _extractCoordinates(coords);
  uint256 level = _calculateBaseLevel(usdcAmount);
  
  // Use mined hash for additional randomness
  uint256 seed = uint256(minedHash);
  _initGame(user, level, x, y, seed);
  
  emit GameInitialized(user, block.timestamp);
}`,
})

// Constants
const GAME_CORE_RECORD_ADDRESS =
  process.env.NEXT_PUBLIC_GAME_CORE_RECORD || "0x3e6d114f58980c7ff9D163F4757D4289cFbFd563" // Replace with actual deployed address
const DEFAULT_COORDINATES = { x: 30, y: 30 }
const DEFAULT_AMOUNT = 0.1 // 0.1 USDC

interface CCTPMessageProps {
  minedHashValue?: string
  onStatusChange?: (status: string, selectedTab: string) => void
}

export default function CCTPMessage({ minedHashValue, onStatusChange }: CCTPMessageProps) {
  const { address } = useAccount()
  const [selectedTab, setSelectedTab] = useState<"encode" | "decode" | "process">("encode")
  const { transfer, status, error, txHashes } = useCCTPTransfer()

  // Get contract snippets with current hash value
  const contractSnippets = getContractSnippets(minedHashValue)

  // Notify parent component of status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status, selectedTab)
    }
  }, [status, selectedTab, onStatusChange])

  // Status messages
  const statusMessages = {
    idle: "🎮 Send 0.1 USDC to Play",
    approving: "🔄 Approving 0.1 USDC...",
    burning: "🔥 Burning 0.1 USDC on Ethereum Sepolia...",
    attesting: "⏳ Waiting for Circle attestation...",
    minting: "✨ Minting 0.1 USDC on Base Sepolia...",
    complete: "🏆 Welcome! You spawned at (30,30) as Level 1 player!",
  }

  // Send CCTP message using wagmi wallet
  const sendCCTPMessage = async () => {
    if (!address) return

    try {
      await transfer({
        gameCoreRecordAddress: GAME_CORE_RECORD_ADDRESS,
        coordinates: DEFAULT_COORDINATES,
        amount: BigInt(DEFAULT_AMOUNT * 1e6), // 100 USDC
      })
    } catch (err) {
      console.error("Transfer failed:", err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Content Area */}
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
            language={selectedTab === "encode" ? "typescript" : "solidity"}
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
            wrapLongLines={true}
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

      {/* Results Area - Transaction Hashes */}
      {(txHashes.burn || txHashes.mint) && (
        <div className="p-3 border border-green-500/50 uppercase font-mono rounded bg-green-500/10 text-green-400 text-sm space-y-1">
          {txHashes.burn && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-green-400 flex-shrink-0">🔥 Burn</span>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHashes.burn}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-green-300 truncate min-w-0"
                title={txHashes.burn}
              >
                {txHashes.burn.slice(0, 10)}...{txHashes.burn.slice(-8)}
              </a>
            </div>
          )}
          {txHashes.mint && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-green-400 flex-shrink-0">💰 Mint</span>
              <a
                href={`https://sepolia.basescan.org/tx/${txHashes.mint}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-green-300 truncate min-w-0"
                title={txHashes.mint}
              >
                {txHashes.mint.slice(0, 10)}...{txHashes.mint.slice(-8)}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 border border-red-500/50 rounded bg-red-500/10 text-red-400 text-sm break-words">
          ❌ {error}
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={sendCCTPMessage}
        disabled={!address || status !== "idle"}
        fullWidth
        size="lg"
        variant="primary"
      >
        {!address ? "🔗 Connect Wallet to Play" : statusMessages[status]}
      </Button>
    </div>
  )
}
