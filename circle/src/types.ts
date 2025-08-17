export interface CCTPConfig {
  // Authentication
  privateKey: string

  // Contract Addresses
  ethereumSepoliaUSDC: string
  ethereumSepoliaTokenMessenger: string
  baseSepoliaMessageTransmitter: string
  baseSepoliaCCTPHookWrapper: string

  // Domain IDs
  ethereumSepoliaDomain: number
  baseSepoliaDomain: number
}

export interface TransferParams {
  amount: bigint
  maxFee: bigint
  minFinalityThreshold: number
}

export interface GameCoordinates {
  x: number
  y: number
}

export interface Attestation {
  message: string
  attestation: string
  status: string
}

export interface AttestationResponse {
  messages: Attestation[]
}

export interface RelayResult {
  relaySuccess: boolean
  hookSuccess: boolean
  hookReturnData: string
}
