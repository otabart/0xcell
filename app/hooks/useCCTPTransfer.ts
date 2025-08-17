import { useState, useCallback } from "react"
import { useAccount, useWalletClient, usePublicClient, useChainId, useSwitchChain } from "wagmi"
import { encodeFunctionData } from "viem"
import { sepolia, baseSepolia } from "viem/chains"
import axios from "axios"
import type { GameCoordinates } from "../../circle/src"

// Contract addresses
const ETHEREUM_SEPOLIA_USDC = "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238"
const ETHEREUM_SEPOLIA_TOKEN_MESSENGER = "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa"
const BASE_SEPOLIA_CCTP_HOOK_WRAPPER = "0x3e6d114f58980c7ff9D163F4757D4289cFbFd563"
const BASE_SEPOLIA_DOMAIN = 6

// ABI fragments
const APPROVE_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const

const DEPOSIT_FOR_BURN_WITH_HOOK_ABI = [
  {
    name: "depositForBurnWithHook",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "destinationDomain", type: "uint32" },
      { name: "mintRecipient", type: "bytes32" },
      { name: "burnToken", type: "address" },
      { name: "destinationCaller", type: "bytes32" },
      { name: "maxFee", type: "uint256" },
      { name: "minFinalityThreshold", type: "uint32" },
      { name: "hookData", type: "bytes" },
    ],
    outputs: [],
  },
] as const

const RELAY_ABI = [
  {
    name: "relay",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "message", type: "bytes" },
      { name: "attestation", type: "bytes" },
    ],
    outputs: [
      { name: "relaySuccess", type: "bool" },
      { name: "hookSuccess", type: "bool" },
      { name: "hookReturnData", type: "bytes" },
    ],
  },
] as const

export interface CCTPTransferParams {
  gameCoreRecordAddress: string
  coordinates: GameCoordinates
  amount: bigint // in USDC wei (6 decimals)
}

export function useCCTPTransfer() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [status, setStatus] = useState<
    "idle" | "approving" | "burning" | "attesting" | "minting" | "complete"
  >("idle")
  const [error, setError] = useState<string | null>(null)
  const [txHashes, setTxHashes] = useState<{ burn?: string; mint?: string }>({})

  const encodeGameData = useCallback(
    (amount: bigint, userAddress: string, coordinates: GameCoordinates): string => {
      const packedCoordinates = (BigInt(coordinates.x) << 128n) | BigInt(coordinates.y)
      return (
        "0x" +
        amount.toString(16).padStart(64, "0") +
        userAddress.slice(2).toLowerCase().padStart(64, "0") +
        packedCoordinates.toString(16).padStart(64, "0")
      )
    },
    []
  )

  const transfer = useCallback(
    async ({ gameCoreRecordAddress, coordinates, amount }: CCTPTransferParams) => {
      if (!address || !walletClient || !publicClient) {
        throw new Error("Wallet not connected")
      }

      setStatus("approving")
      setError(null)
      setTxHashes({})

      try {
        // Ensure we're on Ethereum Sepolia
        if (chainId !== sepolia.id) {
          try {
            await switchChain({ chainId: sepolia.id })
          } catch (error: any) {
            // Chain not added to wallet, add it first
            if (error.code === 4902 || error.message?.includes("Unrecognized chain")) {
              await walletClient.addChain({ chain: sepolia })
              await switchChain({ chainId: sepolia.id })
            } else {
              throw error
            }
          }
        }

        // Step 1: Approve USDC
        const approveTx = await walletClient.sendTransaction({
          account: address,
          chain: sepolia,
          to: ETHEREUM_SEPOLIA_USDC,
          data: encodeFunctionData({
            abi: APPROVE_ABI,
            functionName: "approve",
            args: [ETHEREUM_SEPOLIA_TOKEN_MESSENGER, amount * 10n], // Approve 10x for convenience
          }),
        })

        await publicClient.waitForTransactionReceipt({
          hash: approveTx,
          confirmations: 1,
        })

        // Step 2: Burn USDC with hook data
        setStatus("burning")
        const hookData = encodeGameData(amount, address, coordinates)
        const destinationAddress = `0x000000000000000000000000${address.slice(2).toLowerCase()}`
        const destinationCaller = "0x" + "0".repeat(64)

        const burnTx = await walletClient.sendTransaction({
          account: address,
          chain: sepolia,
          to: ETHEREUM_SEPOLIA_TOKEN_MESSENGER,
          data: encodeFunctionData({
            abi: DEPOSIT_FOR_BURN_WITH_HOOK_ABI,
            functionName: "depositForBurnWithHook",
            args: [
              amount,
              BASE_SEPOLIA_DOMAIN,
              destinationAddress as `0x${string}`,
              ETHEREUM_SEPOLIA_USDC,
              destinationCaller as `0x${string}`,
              BigInt(500), // maxFee
              1000, // minFinalityThreshold
              hookData as `0x${string}`,
            ],
          }),
        })

        setTxHashes((prev) => ({ ...prev, burn: burnTx }))
        await publicClient.waitForTransactionReceipt({
          hash: burnTx,
          confirmations: 2,
        })

        // Step 3: Wait for attestation
        setStatus("attesting")
        const attestation = await waitForAttestation(burnTx)

        // Step 4: Switch to Base Sepolia and mint
        setStatus("minting")

        // Try to switch chain, if it fails, add the chain first
        try {
          await walletClient.switchChain({ id: baseSepolia.id })
        } catch (error: any) {
          // Chain not added to wallet, add it first
          if (error.code === 4902 || error.message?.includes("Unrecognized chain")) {
            await walletClient.addChain({ chain: baseSepolia })
            await walletClient.switchChain({ id: baseSepolia.id })
          } else {
            throw error
          }
        }

        const mintTx = await walletClient.sendTransaction({
          account: address,
          chain: baseSepolia,
          to: BASE_SEPOLIA_CCTP_HOOK_WRAPPER,
          data: encodeFunctionData({
            abi: RELAY_ABI,
            functionName: "relay",
            args: [attestation.message as `0x${string}`, attestation.attestation as `0x${string}`],
          }),
        })

        setTxHashes((prev) => ({ ...prev, mint: mintTx }))
        await publicClient.waitForTransactionReceipt({
          hash: mintTx,
          confirmations: 1,
        })

        setStatus("complete")
        return { burnTx, mintTx }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Transfer failed")
        setStatus("idle")
        throw err
      }
    },
    [address, walletClient, publicClient, encodeGameData, chainId, switchChain]
  )

  return { transfer, status, error, txHashes }
}

// Helper function to wait for Circle attestation
async function waitForAttestation(
  txHash: string
): Promise<{ message: string; attestation: string }> {
  const url = `https://iris-api-sandbox.circle.com/v2/messages/0?transactionHash=${txHash}`

  while (true) {
    try {
      const response = await axios.get(url)
      if (response.data?.messages?.[0]?.status === "complete") {
        return response.data.messages[0]
      }
    } catch (error) {
      // 404 is expected while waiting
    }
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
}
