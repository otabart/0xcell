'use client'

import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { parseAbi } from 'viem'

export function ContractReader() {
  const [contractAddress, setContractAddress] = useState('')
  const [functionName, setFunctionName] = useState('')
  const [functionArgs, setFunctionArgs] = useState('')
  const [abi, setAbi] = useState('')
  const [shouldRead, setShouldRead] = useState(false)

  const { data, error, isLoading } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: abi ? parseAbi([abi]) : undefined,
    functionName,
    args: functionArgs ? JSON.parse(`[${functionArgs}]`) : undefined,
    query: {
      enabled: shouldRead && !!contractAddress && !!functionName && !!abi,
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShouldRead(true)
  }

  const handleInputChange = () => {
    setShouldRead(false)
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
      <h2 className="text-2xl font-semibold mb-4">Read from Contract</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Contract Address
          </label>
          <input
            type="text"
            value={contractAddress}
            onChange={(e) => {
              setContractAddress(e.target.value)
              handleInputChange()
            }}
            placeholder="0x..."
            className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Function ABI
          </label>
          <input
            type="text"
            value={abi}
            onChange={(e) => {
              setAbi(e.target.value)
              handleInputChange()
            }}
            placeholder='function balanceOf(address owner) view returns (uint256)'
            className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Function Name
          </label>
          <input
            type="text"
            value={functionName}
            onChange={(e) => {
              setFunctionName(e.target.value)
              handleInputChange()
            }}
            placeholder="balanceOf"
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
            onChange={(e) => {
              setFunctionArgs(e.target.value)
              handleInputChange()
            }}
            placeholder='"0x123..."'
            className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
        >
          {isLoading ? 'Reading...' : 'Read Contract'}
        </button>
      </form>

      {shouldRead && data !== undefined && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-400 mb-2">Result:</p>
          <p className="font-mono text-sm break-all">{JSON.stringify(data, null, 2)}</p>
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
