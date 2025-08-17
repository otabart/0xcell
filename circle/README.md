# 0xCell CCTP SDK

TypeScript SDK for integrating Circle's Cross-Chain Transfer Protocol (CCTP) with the 0xCell Game.

## Features

- 🔐 Type-safe implementation with full TypeScript support
- 🎮 Game coordinate encoding for on-chain Game of Life
- 🌉 Cross-chain USDC transfers from Ethereum Sepolia to Base Sepolia
- 🪝 CCTP V2 Hook integration for automatic game data recording
- 📦 Modular architecture for easy DApp integration

## Installation

```bash
# Install dependencies
pnpm install

# Build the SDK
pnpm build
```

## Configuration

1. Copy the environment template:

```bash
cp env.example .env
```

2. Configure your environment variables:

```env
# Required
PRIVATE_KEY=your_private_key_without_0x_prefix

# Optional (see env.example for all options)
GAME_CORE_RECORD_ADDRESS=0x...
```

## Usage

### Command Line Interface

```bash
# Basic usage
pnpm start --game-contract 0x123... --x 100 --y 150

# With custom amount
pnpm start --game-contract 0x123... --amount 1.5 --x 50 --y 50

# Show help
pnpm start --help
```

### As a Library

```typescript
import { CCTPService, CCTP_CONFIG } from "@0xcell/cctp-sdk"

// Initialize the service
const cctpService = new CCTPService(CCTP_CONFIG)

// Execute a transfer with game data
const result = await cctpService.executeTransfer(
  gameCoreRecordAddress,
  {
    amount: 100_000_000n, // 100 USDC
    maxFee: 500n,
    minFinalityThreshold: 1000,
  },
  { x: 128, y: 64 } // Game coordinates
)

console.log("Burn Tx:", result.burnTxHash)
console.log("Mint Tx:", result.mintTxHash)
```

### Encoding Game Data

```typescript
import { encodeGameData, packCoordinates } from "@0xcell/cctp-sdk"

// Pack coordinates
const packed = packCoordinates({ x: 30, y: 30 })

// Encode full game data
const encoded = encodeGameData(
  100_000_000n, // 100 USDC
  "0x1234...", // User address
  { x: 30, y: 30 }
)
```

## Architecture

```
src/
├── CCTPService.ts  # Core CCTP service implementation
├── constants.ts    # Configuration and constants
├── encoding.ts     # Utility functions for data encoding
├── types.ts        # TypeScript type definitions
└── index.ts        # Main entry point
```

## Data Encoding Format

The SDK encodes game data for the CCTP hook as follows:

```
Total: 96 bytes
├── USDC Amount (32 bytes)     - uint256
├── User Address (32 bytes)    - address (padded)
└── Coordinates (32 bytes)     - uint256 (x << 128 | y)
```

## Development

```bash
# Run in development mode
pnpm dev

# Type checking
pnpm typecheck

# Build for production
pnpm build

# Clean build artifacts
pnpm clean
```

## Contract Integration

The SDK is designed to work with:

- **CCTP Hook Wrapper**: Receives USDC and forwards hook data
- **GameCoreRecord**: Records game data and manages user levels

## Error Handling

The SDK includes comprehensive error handling for:

- Invalid coordinates (must be 1-256)
- Missing private key
- Network errors
- Attestation retrieval failures

## License

MIT
