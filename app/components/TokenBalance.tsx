"use client"

import { useAccount, useBalance, useToken } from "wagmi"
import { formatUnits } from "viem"
import { useState } from "react"

export function TokenBalance() {
  const { address } = useAccount()
  const [tokenAddress, setTokenAddress] = useState("")
  const [inputAddress, setInputAddress] = useState("")

  // Get token information
  const { data: tokenInfo } = useToken({
    address: tokenAddress as `0x${string}`,
    enabled: !!tokenAddress && tokenAddress.startsWith("0x"),
  })

  // Get token balance
  const { data: tokenBalance } = useBalance({
    address,
    token: tokenAddress as `0x${string}`,
    enabled: !!address && !!tokenAddress && tokenAddress.startsWith("0x"),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputAddress.startsWith("0x") && inputAddress.length === 42) {
      setTokenAddress(inputAddress)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      <h2 className="text-2xl font-semibold mb-4">ERC20 Token Balance</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
            placeholder="Enter token contract address (0x...)"
            className="flex-1 px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Check
          </button>
        </div>
      </form>

      {tokenInfo && tokenBalance && (
        <div className="space-y-3">
          <div>
            <p className="text-gray-400 text-sm">Token Name</p>
            <p className="font-semibold">{tokenInfo.name}</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Symbol</p>
            <p className="font-semibold">{tokenInfo.symbol}</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Your Balance</p>
            <p className="font-semibold text-xl">
              {formatUnits(tokenBalance.value, tokenInfo.decimals)} {tokenInfo.symbol}
            </p>
          </div>
        </div>
      )}

      {!address && <p className="text-gray-400 text-center">Please connect your wallet first</p>}
    </div>
  )
}
