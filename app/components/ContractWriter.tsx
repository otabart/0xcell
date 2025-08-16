"use client"

import { useState } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseAbi } from "viem"

export function ContractWriter() {
  const { address } = useAccount()
  const [contractAddress, setContractAddress] = useState("")
  const [functionName, setFunctionName] = useState("")
  const [functionArgs, setFunctionArgs] = useState("")
  const [abi, setAbi] = useState("")

  const { data: hash, error, isPending, writeContract } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Parse ABI and arguments
      const parsedAbi = parseAbi([abi])
      const args = functionArgs ? JSON.parse(`[${functionArgs}]`) : []

      writeContract({
        address: contractAddress as `0x${string}`,
        abi: parsedAbi,
        functionName,
        args,
      })
    } catch (err) {
      console.error("Contract write error:", err)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      <h2 className="text-2xl font-semibold mb-4">Write to Contract</h2>

      {!address ? (
        <p className="text-gray-400 text-center">Please connect your wallet first</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Contract Address</label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Function ABI</label>
            <input
              type="text"
              value={abi}
              onChange={(e) => setAbi(e.target.value)}
              placeholder="function transfer(address to, uint256 amount)"
              className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Function Name</label>
            <input
              type="text"
              value={functionName}
              onChange={(e) => setFunctionName(e.target.value)}
              placeholder="transfer"
              className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Arguments (comma separated)
            </label>
            <input
              type="text"
              value={functionArgs}
              onChange={(e) => setFunctionArgs(e.target.value)}
              placeholder='"0x123...", "1000000000000000000"'
              className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isPending || isConfirming}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            {isPending
              ? "Confirming..."
              : isConfirming
                ? "Waiting for confirmation..."
                : "Write Contract"}
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
