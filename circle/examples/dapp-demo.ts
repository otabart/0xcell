/**
 * Standalone demo for CCTP SDK integration
 * Run: pnpm tsx examples/dapp-demo.ts
 */

import { CCTPService, CCTP_CONFIG, encodeGameData, packCoordinates } from "../src"
import type { TransferParams, GameCoordinates } from "../src"

// Mock React for demo purposes
const React = {
  useState: <T>(initial: T): [T, (value: T) => void] => {
    let state = initial
    return [
      state,
      (value: T) => {
        state = value
      },
    ]
  },
  useCallback: <T extends Function>(fn: T, deps?: any[]): T => fn,
}

// Example 1: Initialize service with custom config
function initializeCCTPService(privateKey: string) {
  const config = {
    ...CCTP_CONFIG,
    privateKey,
  }

  return new CCTPService(config)
}

// Example 2: Execute transfer from application
async function handleGameTransfer(
  cctpService: CCTPService,
  gameCoreRecordAddress: string,
  coordinates: GameCoordinates,
  usdcAmount: number
) {
  try {
    // Convert USDC amount to wei (6 decimals)
    const params: TransferParams = {
      amount: BigInt(Math.floor(usdcAmount * 1e6)),
      maxFee: BigInt(500), // 0.0005 USDC
      minFinalityThreshold: 1000,
    }

    console.log(`\n📊 Transfer Details:`)
    console.log(`  Amount: ${usdcAmount} USDC`)
    console.log(`  Coordinates: (${coordinates.x}, ${coordinates.y})`)
    console.log(`  Game Contract: ${gameCoreRecordAddress}`)

    // Execute transfer
    const result = await cctpService.executeTransfer(gameCoreRecordAddress, params, coordinates)

    return {
      success: true,
      burnTxHash: result.burnTxHash,
      mintTxHash: result.mintTxHash,
    }
  } catch (error) {
    console.error("Transfer failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Example 3: React Hook simulation
function useCCTPTransfer() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const transfer = React.useCallback(
    async (
      privateKey: string,
      gameCoreRecordAddress: string,
      coordinates: GameCoordinates,
      amount: number
    ) => {
      setIsLoading(true)
      setError(null)

      try {
        const service = initializeCCTPService(privateKey)
        const result = await handleGameTransfer(service, gameCoreRecordAddress, coordinates, amount)

        if (!result.success) {
          throw new Error(result.error)
        }

        return result
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Transfer failed"
        setError(errorMsg)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { transfer, isLoading, error }
}

// Example 4: Encode data only (for custom implementations)
function prepareGameData(userAddress: string, coordinates: GameCoordinates, usdcAmount: number) {
  const amountInWei = BigInt(Math.floor(usdcAmount * 1e6))

  // Option 1: Get packed coordinates
  const packed = packCoordinates(coordinates)
  console.log(`\n📦 Packed coordinates: ${packed.toString()}`)
  console.log(`  Hex: 0x${packed.toString(16)}`)

  // Option 2: Get fully encoded data
  const encoded = encodeGameData(amountInWei, userAddress, coordinates)
  console.log(`\n🔐 Encoded game data (${encoded.length / 2 - 1} bytes):`)
  console.log(`  ${encoded}`)

  // Show breakdown
  console.log(`\n📋 Data breakdown:`)
  console.log(`  USDC Amount: ${encoded.slice(0, 66)}`)
  console.log(`  User Address: 0x${encoded.slice(66, 130)}`)
  console.log(`  Coordinates: 0x${encoded.slice(130)}`)

  return { packed, encoded }
}

// Demo runner
async function runDemo() {
  console.log("🎮 CCTP SDK Integration Demo")
  console.log("============================\n")

  // Demo 1: Data encoding
  console.log("1️⃣ Data Encoding Example")
  console.log("-------------------------")
  const userAddress = "0x1234567890123456789012345678901234567890"
  const coordinates = { x: 128, y: 64 }
  const amount = 100 // 100 USDC

  prepareGameData(userAddress, coordinates, amount)

  // Demo 2: Mock transfer (without actual blockchain interaction)
  console.log("\n\n2️⃣ Transfer Simulation")
  console.log("----------------------")

  // For demo purposes, we'll just show what would happen
  if (!process.env.PRIVATE_KEY) {
    console.log("⚠️  No PRIVATE_KEY found in environment")
    console.log("   In a real application, this would come from the user's wallet")
    console.log("\n📝 Example .env file:")
    console.log("   PRIVATE_KEY=your_private_key_without_0x")

    // Simulate the transfer flow
    console.log("\n🔄 Simulated transfer flow:")
    console.log("   1. Initialize CCTP service with wallet")
    console.log("   2. Approve USDC spending")
    console.log("   3. Burn USDC on Ethereum with game data")
    console.log("   4. Wait for Circle attestation")
    console.log("   5. Mint USDC on Base and execute game logic")

    // Demo 3: React Hook usage
    console.log("\n\n3️⃣ React Hook Usage")
    console.log("-------------------")
    const { transfer, isLoading, error } = useCCTPTransfer()
    console.log("Hook state:")
    console.log(`  isLoading: ${isLoading}`)
    console.log(`  error: ${error}`)
    console.log("\nIn a React component, you would use:")
    console.log(`
    const { transfer, isLoading, error } = useCCTPTransfer()
    
    const handleClick = async () => {
      await transfer(
        walletPrivateKey,
        gameContractAddress,
        { x: 100, y: 150 },
        50 // 50 USDC
      )
    }
    `)
  } else {
    // If private key exists, show actual service initialization
    console.log("✅ Private key found, initializing service...")
    const service = initializeCCTPService(process.env.PRIVATE_KEY)
    console.log(`   Wallet address: ${service.getAddress()}`)
    console.log("\n⚠️  Not executing actual transfer in demo mode")
    console.log("   Use the main CLI to execute real transfers:")
    console.log("   pnpm start --game-contract 0x... --x 100 --y 150")
  }

  // Demo 4: API integration example
  console.log("\n\n4️⃣ API Route Example")
  console.log("--------------------")
  console.log("In a Next.js API route (app/api/cctp/route.ts):")
  console.log(`
    export async function POST(request: Request) {
      const { coordinates, amount } = await request.json()
      
      const service = new CCTPService(CCTP_CONFIG)
      const result = await service.executeTransfer(
        process.env.GAME_CONTRACT!,
        { amount: BigInt(amount * 1e6), maxFee: BigInt(500), minFinalityThreshold: 1000 },
        coordinates
      )
      
      return Response.json(result)
    }
  `)

  console.log("\n✨ Demo complete!")
}

// Run the demo
runDemo().catch(console.error)
