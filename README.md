# 0xCell 🧬

A cross-chain Game of Life powered by Circle's CCTP. Mine unique cellular patterns through proof-of-work simulation, bringing Ethereum games to Solana users and beyond.

> **Beyond Payments**: Circle's CCTP isn't just a payment protocol - it's a powerful primitive for building any cross-chain application or game.



https://github.com/user-attachments/assets/8f4433cc-254a-4848-a3b0-0d97770fec0d




## 🎮 What is 0xCell?

- **PoW → Cells**: Hash your way to unique patterns
- **Any Chain**: Solana users playing on Ethereum? Yes.
- **One Click**: Send tx. Watch cells evolve. Done.

## How

```
User (Any Chain) → CCTP Message → PoW Hash → Cell Pattern → Evolution
```

## Run

```bash
# Clone the repository
git clone https://github.com/yourusername/0xcell.git
cd 0xcell

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Add your Alchemy API key and WalletConnect project ID

# Run development server
pnpm dev
```

Visit `http://localhost:3000` to start playing!

## 🎯 Game Flow

1. **Mining Phase**: Click "Start Mining" to generate a unique hash through proof-of-work
2. **CCTP Transfer**: Send 0.1 USDC from Ethereum Sepolia to Base Sepolia
   - Approve USDC spending
   - Burn USDC on source chain
   - Wait for Circle attestation (~15 min)
   - Mint USDC on destination chain
3. **Game Phase**: Your hash generates unique patterns for both you and the bot
4. **Evolution**: Watch 100 generations of cellular evolution
5. **Victory**: Player with most living cells wins!

## 🔗 Network Configuration

### Ethereum Sepolia

- Chain ID: 11155111
- USDC Contract: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- Token Messenger: `0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5`

### Base Sepolia

- Chain ID: 84532
- CCTP Hook Wrapper: `0x3e6d114f58980c7ff9D163F4757D4289cFbFd563`
- RPC: https://sepolia.base.org

## 📚 Project Structure

```
0xcell/
├── app/              # Next.js app directory
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   └── wagmi.ts      # Wagmi configuration
├── circle/           # CCTP SDK integration
├── contracts/        # Smart contracts
└── public/           # Static assets
```

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/0xashu/0xcell)

## Stack

- Next.js + TypeScript
- CCTP Hooks
- Solidity + Rust
- Conway's Rules

## 🔗 Links

- [Live Demo](https://0xcell.vercel.app)
- [Circle CCTP Docs](https://developers.circle.com/stablecoins/docs/cctp-getting-started)
- [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)

---

Permissionless. Cross-chain. Beautiful chaos.
