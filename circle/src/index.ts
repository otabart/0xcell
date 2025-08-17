import { CCTPService } from "./CCTPService"
import { CCTP_CONFIG } from "./constants"
import { TransferParams, GameCoordinates } from "./types"

// Default transfer parameters
const DEFAULT_PARAMS: TransferParams = {
  amount: BigInt(10_000), // 0.01 USDC (6 decimals)
  maxFee: BigInt(500), // 0.0005 USDC max fee for fast transfer
  minFinalityThreshold: 1000, // For fast transfer
}

// Parse command line arguments
function parseArgs(): {
  coordinates: GameCoordinates
  amount?: bigint
  gameCoreRecordAddress?: string
} {
  const args = process.argv.slice(2)

  // Default values
  let x = 128
  let y = 64
  let amount: bigint | undefined
  let gameCoreRecordAddress: string | undefined

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--x":
        x = parseInt(args[++i])
        break
      case "--y":
        y = parseInt(args[++i])
        break
      case "--amount":
        amount = BigInt(Math.floor(parseFloat(args[++i]) * 1e6))
        break
      case "--game-contract":
        gameCoreRecordAddress = args[++i]
        break
      case "--help":
        printHelp()
        process.exit(0)
    }
  }

  return {
    coordinates: { x, y },
    amount,
    gameCoreRecordAddress,
  }
}

function printHelp(): void {
  console.log(`
CCTP Game Transfer Script

Usage: pnpm start [options]

Options:
  --x <number>              X coordinate (1-256, default: 128)
  --y <number>              Y coordinate (1-256, default: 64)
  --amount <number>         USDC amount to transfer (default: 0.01)
  --game-contract <address> GameCoreRecord contract address (required)
  --help                    Show this help message

Examples:
  pnpm start --game-contract 0x123... --x 100 --y 150
  pnpm start --game-contract 0x123... --amount 1.5 --x 50 --y 50
`)
}

async function main() {
  try {
    const { coordinates, amount, gameCoreRecordAddress } = parseArgs()

    if (!gameCoreRecordAddress) {
      console.error("❌ Error: GameCoreRecord contract address is required")
      console.log("Use --game-contract <address> to specify the contract address")
      process.exit(1)
    }

    // Initialize CCTP service
    const cctpService = new CCTPService(CCTP_CONFIG)

    // Prepare transfer parameters
    const params: TransferParams = {
      ...DEFAULT_PARAMS,
      amount: amount || DEFAULT_PARAMS.amount,
    }

    console.log("🎮 0xCell CCTP Transfer")
    console.log("=====================")
    console.log(`🏦 Wallet: ${cctpService.getAddress()}`)
    console.log(`📍 Coordinates: (${coordinates.x}, ${coordinates.y})`)
    console.log(`💵 Amount: ${Number(params.amount) / 1e6} USDC`)
    console.log(`📝 Game Contract: ${gameCoreRecordAddress}`)
    console.log("=====================\n")

    // Execute transfer
    const result = await cctpService.executeTransfer(gameCoreRecordAddress, params, coordinates)

    console.log("\n🎉 Transfer Complete!")
    console.log("=====================")
    console.log(`🔥 Burn Tx: https://sepolia.etherscan.io/tx/${result.burnTxHash}`)
    console.log(`💰 Mint Tx: https://sepolia.basescan.org/tx/${result.mintTxHash}`)
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

// Export for use as a library
export { CCTPService } from "./CCTPService"
export { CCTP_CONFIG, ABIS } from "./constants"
export { DEFAULT_PARAMS }
export * from "./types"
export * from "./encoding"
