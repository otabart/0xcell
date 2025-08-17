import { CCTPConfig } from "./types"

export const CCTP_CONFIG: CCTPConfig = {
  // Authentication
  privateKey: process.env.PRIVATE_KEY || "",

  // Contract Addresses
  ethereumSepoliaUSDC: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
  ethereumSepoliaTokenMessenger: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
  baseSepoliaMessageTransmitter: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
  baseSepoliaCCTPHookWrapper: "0x3e6d114f58980c7ff9D163F4757D4289cFbFd563",

  // Domain IDs
  ethereumSepoliaDomain: 0,
  baseSepoliaDomain: 6,
}

// Game-specific constants
export const GAME_CONFIG = {
  minCoordinate: 1,
  maxCoordinate: 256,
  coordinateBitShift: BigInt(128),
}

// ABI definitions
export const ABIS = {
  approve: [
    {
      type: "function" as const,
      name: "approve",
      stateMutability: "nonpayable" as const,
      inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      outputs: [{ name: "", type: "bool" }],
    },
  ],

  depositForBurnWithHook: [
    {
      type: "function" as const,
      name: "depositForBurnWithHook",
      stateMutability: "nonpayable" as const,
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
  ],

  relay: [
    {
      type: "function" as const,
      name: "relay",
      stateMutability: "nonpayable" as const,
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
  ],

  recordUser: [
    {
      type: "function" as const,
      name: "recordUser",
      stateMutability: "nonpayable" as const,
      inputs: [{ name: "data", type: "bytes" }],
      outputs: [{ name: "success", type: "bool" }],
    },
  ],
}
