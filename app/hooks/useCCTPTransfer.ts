import { useState, useCallback } from "react"
import { useAccount, useWalletClient, usePublicClient, useChainId, useSwitchChain } from "wagmi"
import { encodeFunctionData } from "viem"
import { sepolia, baseSepolia } from "viem/chains"
import axios from "axios"

// Import from Circle SDK
import {
  CCTP_CONFIG,
  ABIS,
  type GameCoordinates,
  type Attestation,
  encodeGameData,
  addressToBytes32,
} from "../../circle/src"

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

  // Helper function to handle chain switching with user rejection
  const ensureChain = useCallback(
    async (targetChainId: number, chainName: string) => {
      if (chainId === targetChainId || !walletClient) return true

      try {
        await switchChain({ chainId: targetChainId })
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return true
      } catch (error) {
        const errorWithCode = error as { code?: number; message?: string }

        // User rejected - silent fail
        if (errorWithCode.code === 4001) {
          setStatus("idle")
          return false
        }

        // Chain not in wallet - try to add it
        if (errorWithCode.code === 4902 || errorWithCode.message?.includes("Unrecognized chain")) {
          try {
            const chain = targetChainId === sepolia.id ? sepolia : baseSepolia
            await walletClient.addChain({ chain })
            await switchChain({ chainId: targetChainId })
            await new Promise((resolve) => setTimeout(resolve, 1000))
            return true
          } catch (addError) {
            const addErrorMessage = addError instanceof Error ? addError.message : String(addError)
            if (!addErrorMessage.toLowerCase().includes("reject")) {
              setError(`Failed to add ${chainName} network. Please add it manually in your wallet.`)
            }
            return false
          }
        }

        // Other errors
        setError(`Failed to switch to ${chainName}. Please switch manually.`)
        return false
      }
    },
    [chainId, walletClient, switchChain]
  )

  // Helper function to wait for Circle attestation
  const waitForAttestation = useCallback(async (txHash: string): Promise<Attestation> => {
    const url = `https://iris-api-sandbox.circle.com/v2/messages/${CCTP_CONFIG.ethereumSepoliaDomain}?transactionHash=${txHash}`

    while (true) {
      try {
        const response = await axios.get(url)
        if (response.data?.messages?.[0]?.status === "complete") {
          return response.data.messages[0]
        }
      } catch {
        // 404 is expected while waiting
      }
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }, [])

  const transfer = useCallback(
    async ({ coordinates, amount }: CCTPTransferParams) => {
      if (!address || !walletClient || !publicClient) {
        throw new Error("Wallet not connected")
      }

      setError(null)
      setTxHashes({})

      try {
        // Ensure we're on Ethereum Sepolia
        const onCorrectChain = await ensureChain(sepolia.id, "Ethereum Sepolia")
        if (!onCorrectChain) return

        setStatus("approving")

        // Step 1: Approve USDC using SDK constants
        const approveTx = await walletClient.sendTransaction({
          account: address,
          chain: sepolia,
          to: CCTP_CONFIG.ethereumSepoliaUSDC as `0x${string}`,
          data: encodeFunctionData({
            abi: ABIS.approve,
            functionName: "approve",
            args: [CCTP_CONFIG.ethereumSepoliaTokenMessenger as `0x${string}`, amount * BigInt(10)],
          }),
        })

        await publicClient.waitForTransactionReceipt({
          hash: approveTx,
          confirmations: 1,
        })

        // Step 2: Burn USDC with hook data using SDK encoding
        setStatus("burning")

        // Use SDK's encoding function
        const hookData = encodeGameData(amount, address, coordinates)
        const destinationAddress = addressToBytes32(address)
        const destinationCaller = "0x" + "0".repeat(64)

        const burnTx = await walletClient.sendTransaction({
          account: address,
          chain: sepolia,
          to: CCTP_CONFIG.ethereumSepoliaTokenMessenger as `0x${string}`,
          data: encodeFunctionData({
            abi: ABIS.depositForBurnWithHook,
            functionName: "depositForBurnWithHook",
            args: [
              amount,
              CCTP_CONFIG.baseSepoliaDomain,
              destinationAddress as `0x${string}`,
              CCTP_CONFIG.ethereumSepoliaUSDC as `0x${string}`,
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
        const onBaseSepolia = await ensureChain(baseSepolia.id, "Base Sepolia")
        if (!onBaseSepolia) return

        setStatus("minting")

        const mintTx = await walletClient.sendTransaction({
          account: address,
          chain: baseSepolia,
          to: CCTP_CONFIG.baseSepoliaCCTPHookWrapper as `0x${string}`,
          data: encodeFunctionData({
            abi: ABIS.relay,
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
        const errorMessage = err instanceof Error ? err.message : "Transfer failed"
        // Don't show error if user rejected the transaction
        if (!errorMessage.toLowerCase().includes("reject")) {
          setError(errorMessage)
        }
        setStatus("idle")
        throw err
      }
    },
    [address, walletClient, publicClient, ensureChain, waitForAttestation]
  )

  return { transfer, status, error, txHashes }
}
