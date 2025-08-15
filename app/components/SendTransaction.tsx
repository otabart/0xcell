'use client'

import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { useState } from 'react'

export function SendTransaction() {
  const { address } = useAccount()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  
  const { 
    data: hash,
    error,
    isPending,
    sendTransaction 
  } = useSendTransaction()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient || !amount) return

    try {
      sendTransaction({
        to: recipient as `0x${string}`,
        value: parseEther(amount),
      })
    } catch (err) {
      console.error('Transaction error:', err)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      <h2 className="text-2xl font-semibold mb-4">Send Transaction</h2>

      {!address ? (
        <p className="text-gray-400 text-center">Please connect your wallet first</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Amount (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.01"
              className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isPending || isConfirming || !recipient || !amount}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            {isPending ? 'Confirming...' : isConfirming ? 'Waiting for confirmation...' : 'Send Transaction'}
          </button>
        </form>
      )}

      {hash && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-400">Transaction Hash:</p>
          <p className="font-mono text-xs break-all">{hash}</p>
        </div>
      )}

      {isSuccess && (
        <div className="mt-4 p-4 bg-green-800 rounded-lg">
          <p className="text-green-200">Transaction confirmed successfully!</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-800 rounded-lg">
          <p className="text-red-200">Error: {error.message}</p>
        </div>
      )}
    </div>
  )
}
