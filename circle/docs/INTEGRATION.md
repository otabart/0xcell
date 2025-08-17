# DApp Integration Guide

This guide explains how to integrate the 0xCell CCTP SDK into your decentralized application.

## Installation

```bash
# Install from local package (adjust path as needed)
pnpm add file:../circle

# Or if published to npm
pnpm add @0xcell/cctp-sdk
```

## Basic Setup

### 1. Environment Variables

```env
# Not needed if using wallet provider (e.g., MetaMask)
PRIVATE_KEY=your_private_key_without_0x

# Contract addresses
NEXT_PUBLIC_GAME_CORE_RECORD=0x...
```

### 2. Initialize the Service

```typescript
import { CCTPService, CCTP_CONFIG } from "@0xcell/cctp-sdk"
import { privateKeyToAccount } from "viem/accounts"

// Option 1: Using environment variable
const service = new CCTPService(CCTP_CONFIG)

// Option 2: Using wallet provider (recommended for DApps)
const account = await walletClient.requestAddresses()
const customConfig = {
  ...CCTP_CONFIG,
  privateKey: account[0], // Get from wallet provider
}
const service = new CCTPService(customConfig)
```

## React Integration

### Using with wagmi

```typescript
import { useAccount, useWalletClient } from 'wagmi'
import { CCTPService, CCTP_CONFIG } from '@0xcell/cctp-sdk'

function GameTransfer() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()

  const handleTransfer = async (x: number, y: number) => {
    if (!walletClient) return

    // Create service with wallet client
    const service = new CCTPService({
      ...CCTP_CONFIG,
      privateKey: walletClient.account.address,
    })

    // Execute transfer
    const result = await service.executeTransfer(
      process.env.NEXT_PUBLIC_GAME_CORE_RECORD!,
      {
        amount: 100_000_000n, // 100 USDC
        maxFee: 500n,
        minFinalityThreshold: 1000,
      },
      { x, y }
    )

    console.log('Transfer complete:', result)
  }

  return (
    <button onClick={() => handleTransfer(128, 64)}>
      Transfer USDC & Join Game
    </button>
  )
}
```

### Custom React Hook

```typescript
import { useState, useCallback } from "react"
import { CCTPService } from "@0xcell/cctp-sdk"
import type { GameCoordinates } from "@0xcell/cctp-sdk"

export function useCCTPGameTransfer() {
  const [status, setStatus] = useState<
    "idle" | "approving" | "burning" | "attesting" | "minting" | "complete"
  >("idle")
  const [error, setError] = useState<Error | null>(null)
  const [txHashes, setTxHashes] = useState<{ burn?: string; mint?: string }>({})

  const transfer = useCallback(
    async (
      service: CCTPService,
      gameCoreRecord: string,
      coordinates: GameCoordinates,
      amount: bigint
    ) => {
      setStatus("approving")
      setError(null)

      try {
        // Step-by-step execution with status updates
        await service.approveUSDC(amount * 10n)

        setStatus("burning")
        const burnTx = await service.burnUSDCWithGameData(
          gameCoreRecord,
          { amount, maxFee: 500n, minFinalityThreshold: 1000 },
          coordinates
        )
        setTxHashes((prev) => ({ ...prev, burn: burnTx }))

        setStatus("attesting")
        const attestation = await service.retrieveAttestation(burnTx)

        setStatus("minting")
        const mintTx = await service.mintUSDC(attestation)
        setTxHashes((prev) => ({ ...prev, mint: mintTx }))

        setStatus("complete")
        return { burnTx, mintTx }
      } catch (err) {
        setError(err as Error)
        setStatus("idle")
        throw err
      }
    },
    []
  )

  return { transfer, status, error, txHashes }
}
```

## Error Handling

### Common Errors and Solutions

```typescript
try {
  await service.executeTransfer(...)
} catch (error) {
  if (error.message.includes('Coordinates must be in range')) {
    // Invalid coordinates
    alert('Please select coordinates between 1 and 256')
  } else if (error.message.includes('insufficient funds')) {
    // Not enough USDC
    alert('Insufficient USDC balance')
  } else if (error.message.includes('User denied')) {
    // User rejected transaction
    alert('Transaction cancelled')
  } else {
    // Generic error
    console.error('Transfer failed:', error)
  }
}
```

## Best Practices

### 1. Coordinate Validation

Always validate coordinates before submitting:

```typescript
import { validateCoordinates } from "@0xcell/cctp-sdk"

try {
  validateCoordinates({ x: 300, y: 50 }) // Will throw
} catch (error) {
  console.error("Invalid coordinates")
}
```

### 2. Amount Formatting

Use proper decimal handling:

```typescript
// Convert user input to USDC wei
const amountInWei = BigInt(Math.floor(parseFloat(userInput) * 1e6))

// Display wei as USDC
const displayAmount = Number(amountInWei) / 1e6
```

### 3. Transaction Monitoring

Provide feedback during long operations:

```typescript
const { transfer, status } = useCCTPGameTransfer()

// Display status to user
{status === 'approving' && <p>Approving USDC...</p>}
{status === 'burning' && <p>Burning USDC on Ethereum...</p>}
{status === 'attesting' && <p>Waiting for attestation...</p>}
{status === 'minting' && <p>Minting on Base...</p>}
```

### 4. Gas Estimation

Consider gas costs:

```typescript
// Estimate gas before transaction
const gasEstimate = await publicClient.estimateGas({
  account,
  to: contractAddress,
  data: encodedData,
})

// Add 20% buffer
const gasLimit = (gasEstimate * 120n) / 100n
```

## Advanced Usage

### Direct Encoding

For custom implementations:

```typescript
import { encodeGameData, createHookData } from "@0xcell/cctp-sdk"

// Encode game data
const gameData = encodeGameData(
  100_000_000n, // 100 USDC
  userAddress,
  { x: 128, y: 64 }
)

// Create hook data
const hookData = createHookData(gameCoreRecordAddress, 100_000_000n, userAddress, { x: 128, y: 64 })
```

### Batch Operations

Process multiple transfers:

```typescript
const transfers = [
  { coords: { x: 10, y: 20 }, amount: 10_000_000n },
  { coords: { x: 30, y: 40 }, amount: 20_000_000n },
]

for (const { coords, amount } of transfers) {
  await service.executeTransfer(
    gameCoreRecord,
    { amount, maxFee: 500n, minFinalityThreshold: 1000 },
    coords
  )
}
```

## Security Considerations

1. **Never expose private keys in frontend code**
2. **Always validate user inputs**
3. **Use secure RPC endpoints**
4. **Implement proper error handling**
5. **Add transaction confirmation dialogs**

## Testing

```typescript
// Mock service for testing
const mockService = {
  executeTransfer: jest.fn().mockResolvedValue({
    burnTxHash: '0x123...',
    mintTxHash: '0x456...',
  }),
}

// Test component
render(<GameTransfer service={mockService} />)
```

## Support

For issues or questions:

- GitHub: [0xCell/cctp-sdk](https://github.com/...)
- Documentation: [Full API Reference](./API.md)
