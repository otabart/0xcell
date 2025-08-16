# Circle CCTP Cross-Chain Transfer

This project implements the functionality of transferring USDC between Ethereum Sepolia and Base Sepolia using Circle’s CCTP (Cross-Chain Transfer Protocol).

## Features

- 🔄 Cross-chain USDC transfer
- 🪙 Supports Ethereum Sepolia → Base Sepolia
- ⚡ Fast transfer
- 🪝 Hook support to execute custom logic on the destination chain

## Install Dependencies

```bash
cd circle-nodejs
npm install
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Configure your private key in the `.env` file:

```env
PRIVATE_KEY=your_private_key_here
```

⚠️ **Important**: Make sure your private key has sufficient testnet ETH and USDC balance.

## Usage

### Run Script

```bash
# Run once
npm start

# Development mode (auto-restart)
npm run dev
```

### Manual Run

```bash
node index.js
```

## Workflow

1. **Approve USDC**: Approve the TokenMessenger contract to use your USDC
2. **Burn USDC**: Burn USDC on the source chain (Ethereum Sepolia)
3. **Obtain Proof**: Wait for Circle’s attestation
4. **Mint USDC**: Mint USDC on the destination chain (Base Sepolia)

## Network Configuration

- **Source Chain**: Ethereum Sepolia Testnet
- **Destination Chain**: Base Sepolia Testnet
- **USDC Contract**: 0x1c7d4b196cb0c7b01d743fbc6116a902379c7238
- **Transfer Amount**: 10 USDC (configurable)

## Notes

- Ensure you have enough testnet ETH to cover gas fees before running the script
- Ensure you have enough USDC balance to transfer
- Cross-chain transfer requires waiting for Circle’s attestation, which may take several minutes
- Do not use testnet private keys in production environments

## Dependencies

- `viem`: Ethereum client library
- `axios`: HTTP request library
- `dotenv`: Environment variable management