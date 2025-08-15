'use client'

import { ConnectKitButton } from 'connectkit'
import { TokenBalance } from '../components/TokenBalance'
import { SendTransaction } from '../components/SendTransaction'
import { ContractReader } from '../components/ContractReader'
import { ContractWriter } from '../components/ContractWriter'
import { useAccount } from 'wagmi'

export default function ContractsPage() {
  const { isConnected } = useAccount()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Contract Interactions
          </h1>
        </header>

        {/* Content */}
        {isConnected ? (
          <div className="space-y-8">
            {/* Basic Interactions */}
            <div className="grid lg:grid-cols-2 gap-8">
              <TokenBalance />
              <SendTransaction />
            </div>
            
            {/* Advanced Contract Interactions */}
            <h2 className="text-3xl font-semibold mt-12 mb-6">Advanced Contract Interaction</h2>
            <div className="grid lg:grid-cols-2 gap-8">
              <ContractReader />
              <ContractWriter />
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-8">
              Please connect your wallet to interact with smart contracts
            </p>
          </div>
        )}

        {/* Example Contract Info */}
        <div className="mt-16 bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Example Token Addresses</h2>
          <p className="text-gray-400 mb-4">
            You can try these token addresses on Ethereum Mainnet:
          </p>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span className="text-gray-400">USDC:</span>{' '}
              <span className="text-blue-400">0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48</span>
            </div>
            <div>
              <span className="text-gray-400">DAI:</span>{' '}
              <span className="text-blue-400">0x6B175474E89094C44Da98b954EedeAC495271d0F</span>
            </div>
            <div>
              <span className="text-gray-400">USDT:</span>{' '}
              <span className="text-blue-400">0xdAC17F958D2ee523a2206206994597C13D831ec7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
