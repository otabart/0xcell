'use client'

import { ConnectKitButton } from 'connectkit'
import { useAccount, useBalance, useBlockNumber } from 'wagmi'
import { useState, useEffect } from 'react'
import { formatEther } from 'viem'

export default function Home() {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Emerge
          </h1>
          <p className="text-xl text-gray-300">
            Your Web3 DApp built with Next.js, wagmi, and viem
          </p>
        </header>



        {/* Wallet Info */}
        {isConnected && address && (
          <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-8 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6">Wallet Information</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-400">Address</p>
                <p className="font-mono text-sm break-all">{address}</p>
              </div>

              {balance && (
                <div>
                  <p className="text-gray-400">Balance</p>
                  <p className="text-xl font-semibold">
                    {formatEther(balance.value)} {balance.symbol}
                  </p>
                </div>
              )}

              {blockNumber && (
                <div>
                  <p className="text-gray-400">Current Block</p>
                  <p className="font-mono">{blockNumber.toString()}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-blue-400">Read Contract</h3>
            <p className="text-gray-400">
              Read data from smart contracts using wagmi hooks
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-purple-400">Write Contract</h3>
            <p className="text-gray-400">
              Send transactions and interact with smart contracts
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-green-400">Events</h3>
            <p className="text-gray-400">
              Listen to blockchain events in real-time
            </p>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-semibold mb-6">Getting Started</h2>
          <div className="max-w-2xl mx-auto text-left bg-gray-800 rounded-lg p-6">
            <p className="mb-4 text-gray-300">To start interacting with smart contracts:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-400">
              <li>Connect your wallet using the button above</li>
              <li>Deploy your smart contract or use an existing one</li>
              <li>Update the contract address and ABI in your code</li>
              <li>Start building your DApp features!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}