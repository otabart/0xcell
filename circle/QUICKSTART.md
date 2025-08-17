# Quick Start Guide

## Installation

```bash
# Clone and install
cd circle
pnpm install
```

## Setup

1. Copy the example environment file:

```bash
cp env.example .env
```

2. Edit `.env` and add your private key:

```env
PRIVATE_KEY=your_private_key_without_0x
```

## Run Examples

### 1. Data Encoding Demo

See how game data is encoded for CCTP:

```bash
pnpm tsx examples/dapp-demo.ts
```

### 2. Execute Transfer

Run a real CCTP transfer with game data:

```bash
# Basic usage
pnpm start --game-contract 0x... --x 100 --y 150

# With custom amount
pnpm start --game-contract 0x... --amount 10 --x 50 --y 50
```

## Integration in Your DApp

### 1. Copy the SDK

```bash
cp -r circle/src your-dapp/lib/cctp-sdk
```

### 2. Use in React

```tsx
import { CCTPService, CCTP_CONFIG } from "@/lib/cctp-sdk"

function GameTransfer() {
  const handleTransfer = async () => {
    const service = new CCTPService(CCTP_CONFIG)

    const result = await service.executeTransfer(
      gameContractAddress,
      { amount: 100_000_000n, maxFee: 500n, minFinalityThreshold: 1000 },
      { x: 128, y: 64 }
    )

    console.log("Success!", result)
  }

  return <button onClick={handleTransfer}>Play Game</button>
}
```

### 3. Use in API Route

```ts
// app/api/cctp/route.ts
import { CCTPService, CCTP_CONFIG } from "@/lib/cctp-sdk"

export async function POST(request: Request) {
  const { coordinates, amount } = await request.json()

  const service = new CCTPService(CCTP_CONFIG)
  const result = await service.executeTransfer(
    process.env.GAME_CONTRACT!,
    { amount: BigInt(amount * 1e6), maxFee: 500n, minFinalityThreshold: 1000 },
    coordinates
  )

  return Response.json(result)
}
```

## Core Functions

### Initialize Service

```ts
const service = new CCTPService(CCTP_CONFIG)
```

### Execute Transfer

```ts
const result = await service.executeTransfer(gameCoreRecordAddress, params, coordinates)
```

### Encode Data Only

```ts
import { encodeGameData } from "@/lib/cctp-sdk"

const encoded = encodeGameData(
  100_000_000n, // 100 USDC
  userAddress,
  { x: 30, y: 30 }
)
```

## Need Help?

- Check `examples/dapp-demo.ts` for working examples
- Read `docs/INTEGRATION.md` for detailed integration guide
- See the main `README.md` for full documentation
