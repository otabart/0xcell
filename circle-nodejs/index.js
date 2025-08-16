// Import environment variables
import 'dotenv/config'
import { createWalletClient, http, encodeFunctionData } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia, baseSepolia } from 'viem/chains'
import axios from 'axios'

// ============ Configuration Constants ============

// Authentication
const PRIVATE_KEY = process.env.PRIVATE_KEY
const account = privateKeyToAccount(`0x${PRIVATE_KEY}`)

// Contract Addresses
const ETHEREUM_SEPOLIA_USDC = '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238'
const ETHEREUM_SEPOLIA_TOKEN_MESSENGER =
  '0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa'
const BASE_SEPOLIA_MESSAGE_TRANSMITTER =
  '0xe737e5cebeeba77efe34d4aa090756590b1ce275'
const BASE_SEPOLIA_CCTP_HOOK_WRAPPER = '0x3e6d114f58980c7ff9D163F4757D4289cFbFd563' // Self-deployed CCTP hook wrapper on Base Sepolia

// Transfer Parameters
const DESTINATION_ADDRESS = account.address // Address to receive minted tokens on destination chain
const AMOUNT = 10_000n // Set transfer amount in 10^6 subunits (1 USDC; change as needed)
const maxFee = 500n // Set fast transfer max fee in 10^6 subunits (0.0005 USDC; change as needed)

// Bytes32 Formatted Parameters
const DESTINATION_ADDRESS_BYTES32 = `0x000000000000000000000000${DESTINATION_ADDRESS.slice(2)}` // Destination address in bytes32 format
const DESTINATION_CALLER_BYTES32 =
  '0x0000000000000000000000000000000000000000000000000000000000000000' // Empty bytes32 allows any address to call MessageTransmitterV2.receiveMessage()

// Set up wallet clients
const sepoliaClient = createWalletClient({
        chain: sepolia,
        transport: http(),
        account,
    })
const baseSepoliaClient = createWalletClient({
        chain: baseSepolia,
        transport: http(),
        account,
    })

// Chain-specific Parameters
const ETHEREUM_SEPOLIA_DOMAIN = 0 // Source domain ID for Ethereum Sepolia testnet
const BASE_SEPOLIA_DOMAIN = 6 // Destination domain ID for Avalanche Fuji testnet

async function approveUSDC() {
  console.log('Approving USDC transfer...')
  const approveTx = await sepoliaClient.sendTransaction({
    to: ETHEREUM_SEPOLIA_USDC,
    data: encodeFunctionData({
      abi: [
        {
          type: 'function',
          name: 'approve',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'spender', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          outputs: [{ name: '', type: 'bool' }],
        },
      ],
      functionName: 'approve',
      args: [ETHEREUM_SEPOLIA_TOKEN_MESSENGER, 10_000_000_000n], // Set max allowance in 10^6 subunits (10,000 USDC; change as needed)
    }),
  })
  console.log(`USDC Approval Tx: ${approveTx}`)
}

async function burnUSDC(x, y) {
  // Validate coordinates range [1, 256]
  if (x < 1 || x > 256 || y < 1 || y > 256) {
    throw new Error('Coordinates must be in range [1, 256]');
  }
  
  console.log(`Preparing to burn USDC with coordinates: (${x}, ${y})`);
  
  // GameCoreRecord contract address on Base Sepolia
  // IMPORTANT: Replace with your actual deployed GameCoreRecord contract address
  const gameCoreRecordAddress = '0x...'; // Replace with actual deployed address
  
  // Encode data for recordUser function
  // Format: (usdcAmount, userAddress, coordinates)
  // coordinates = (x << 128) | y
  const coordinates = (BigInt(x) << 128n) | BigInt(y);
  
  const recordUserData = encodeFunctionData({
    abi: [
      {
        type: 'function',
        name: 'recordUser',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'data', type: 'bytes' }
        ],
        outputs: [{ name: 'success', type: 'bool' }]
      }
    ],
    functionName: 'recordUser',
    args: [
      // Pack data: usdcAmount, userAddress, coordinates
      '0x' + 
      AMOUNT.toString(16).padStart(64, '0') + // usdcAmount (32 bytes)
      account.address.slice(2).padStart(64, '0') + // userAddress (32 bytes)
      coordinates.toString(16).padStart(64, '0') // coordinates (32 bytes)
    ]
  });
  
  // Create hook data that calls recordUser function on GameCoreRecord
  const hookData = '0x' + gameCoreRecordAddress.slice(2) + recordUserData.slice(2);
  
  // Debug: Log the encoded data
  console.log('Encoded data for recordUser:');
  console.log('  - USDC Amount:', AMOUNT.toString());
  console.log('  - User Address:', account.address);
  console.log('  - Coordinates:', `(${x}, ${y})`);
  console.log('  - Packed Coordinates:', coordinates.toString(16));
  console.log('  - Hook Data Length:', hookData.length - 2, 'bytes');

  console.log('Burning USDC on Ethereum Sepolia...')
  const burnTx = await sepoliaClient.sendTransaction({
    to: ETHEREUM_SEPOLIA_TOKEN_MESSENGER,
    data: encodeFunctionData({
      abi: [
        {
          type: 'function',
          name: 'depositForBurnWithHook',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'amount', type: 'uint256' },
            { name: 'destinationDomain', type: 'uint32' },
            { name: 'mintRecipient', type: 'bytes32' },
            { name: 'burnToken', type: 'address' },
            { name: 'destinationCaller', type: 'bytes32' },
            { name: 'maxFee', type: 'uint256' },
            { name: 'minFinalityThreshold', type: 'uint32' },
            { name: 'hookData', type: 'bytes' }
          ],
          outputs: [],
        },
      ],
      functionName: 'depositForBurnWithHook',
      args: [
        AMOUNT,
        BASE_SEPOLIA_DOMAIN,
        DESTINATION_ADDRESS_BYTES32,
        ETHEREUM_SEPOLIA_USDC,
        DESTINATION_CALLER_BYTES32,
        maxFee,
        1000, // minFinalityThreshold (1000 or less for Fast Transfer)
        hookData
      ],
    }),
  })
  console.log(`Burn Tx: ${burnTx}`)
  return burnTx
}

async function retrieveAttestation(transactionHash) {
  console.log('Retrieving attestation...')
  const url = `https://iris-api-sandbox.circle.com/v2/messages/${ETHEREUM_SEPOLIA_DOMAIN}?transactionHash=${transactionHash}`
  while (true) {
    try {
      const response = await axios.get(url)
      if (response.status === 404) {
        console.log('Waiting for attestation...')
      }
      if (response.data?.messages?.[0]?.status === 'complete') {
        console.log('Attestation retrieved successfully!')
        return response.data.messages[0]
      }
      console.log('Waiting for attestation...')
      await new Promise((resolve) => setTimeout(resolve, 5000))
    } catch (error) {
      console.error('Error fetching attestation:', error.message)
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}

async function mintUSDC(attestation) {
  console.log('Minting USDC on Base Sepolia...')
  const mintTx = await baseSepoliaClient.sendTransaction({
    to: BASE_SEPOLIA_CCTP_HOOK_WRAPPER,
    data: encodeFunctionData({
      abi: [
        {
          type: 'function',
          name: 'relay',
          stateMutability: 'nonpayable',
          inputs: [
            { name: 'message', type: 'bytes' },
            { name: 'attestation', type: 'bytes' },
          ],
          outputs: [
            { name: 'relaySuccess', type: 'bool' },
            { name: 'hookSuccess', type: 'bool' },
            { name: 'hookReturnData', type: 'bytes' }
          ],
        },
      ],
      functionName: 'relay',
      args: [attestation.message, attestation.attestation],
    }),
  })
  console.log(`Mint Tx: https://sepolia.basescan.org/tx/${mintTx}`)
}

async function main() {
  // Example coordinates - you can modify these or pass them as command line arguments
  const x = 128; // X coordinate [1, 256]
  const y = 64;  // Y coordinate [1, 256]
  
  console.log(`Starting USDC transfer with coordinates: (${x}, ${y})`);
  
  await approveUSDC()
  const burnTx = await burnUSDC(x, y)
  const attestation = await retrieveAttestation(burnTx)
  await mintUSDC(attestation)
  console.log('USDC transfer completed!')
}

main().catch(console.error)