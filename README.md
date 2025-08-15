# Emerge - Web3 DApp

A modern Web3 application built with Next.js, wagmi, viem, and ConnectKit.

## Features

- 🔗 Wallet connection with ConnectKit
- 💰 Display wallet balance and information
- 📊 Real-time block number updates
- 🔄 Smart contract interaction ready
- 🎨 Beautiful UI with Tailwind CSS
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 20.12+
- pnpm, npm or yarn
- A Web3 wallet (MetaMask, WalletConnect, etc.)

### Installation

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Create a `.env.local` file in the root directory:

```bash
# Get your project ID from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

3. Run the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Smart Contract Integration

To integrate your smart contracts:

1. Create a new file in `app/contracts/` with your contract ABI
2. Create hooks in `app/hooks/` for contract interactions
3. Use the hooks in your components

Example contract hook:

```typescript
import { useContractRead, useContractWrite } from "wagmi"
import { abi } from "../contracts/YourContract.json"

const contractAddress = "0x..." // Your contract address

export function useYourContract() {
  const { data: readData } = useContractRead({
    address: contractAddress,
    abi,
    functionName: "yourReadFunction",
  })

  const { write } = useContractWrite({
    address: contractAddress,
    abi,
    functionName: "yourWriteFunction",
  })

  return { readData, write }
}
```

## Project Structure

```
emerge/
├── app/
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Home page with wallet connection
│   ├── providers.tsx   # Web3 providers configuration
│   ├── wagmi.ts        # Wagmi configuration
│   └── globals.css     # Global styles
├── public/             # Static assets
└── package.json        # Dependencies
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Technologies Used

- **Next.js 15** - React framework with App Router
- **wagmi** - React hooks for Ethereum
- **viem** - TypeScript interface for Ethereum
- **ConnectKit** - Beautiful wallet connection UI
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety

## Resources

- [wagmi Documentation](https://wagmi.sh)
- [viem Documentation](https://viem.sh)
- [ConnectKit Documentation](https://docs.family.co/connectkit)
- [Next.js Documentation](https://nextjs.org/docs)

## License

MIT
