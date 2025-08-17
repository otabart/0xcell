import { createWalletClient, http, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia, baseSepolia } from "viem/chains";
import axios from "axios";
import { ABIS } from "./constants";
import { createHookData, addressToBytes32 } from "./encoding";
export class CCTPService {
    config;
    account;
    sepoliaClient;
    baseSepoliaClient;
    constructor(config) {
        this.config = config;
        if (!config.privateKey) {
            throw new Error("Private key is required");
        }
        this.account = privateKeyToAccount(`0x${config.privateKey}`);
        this.sepoliaClient = createWalletClient({
            chain: sepolia,
            transport: http(),
            account: this.account,
        });
        this.baseSepoliaClient = createWalletClient({
            chain: baseSepolia,
            transport: http(),
            account: this.account,
        });
    }
    /**
     * Get the wallet address
     */
    getAddress() {
        return this.account.address;
    }
    /**
     * Approve USDC spending
     */
    async approveUSDC(amount) {
        console.log("🔄 Approving USDC transfer...");
        const hash = await this.sepoliaClient.sendTransaction({
            account: this.account,
            chain: sepolia,
            to: this.config.ethereumSepoliaUSDC,
            data: encodeFunctionData({
                abi: ABIS.approve,
                functionName: "approve",
                args: [this.config.ethereumSepoliaTokenMessenger, amount],
            }),
        });
        console.log(`✅ USDC Approval Tx: ${hash}`);
        return hash;
    }
    /**
     * Burn USDC with game data hook
     */
    async burnUSDCWithGameData(gameCoreRecordAddress, params, coordinates) {
        console.log(`🔥 Preparing to burn USDC with coordinates: (${coordinates.x}, ${coordinates.y})`);
        // Create hook data for GameCoreRecord
        const hookData = createHookData(gameCoreRecordAddress, params.amount, this.account.address, coordinates);
        // Debug logging
        console.log("📊 Encoded data for recordUser:");
        console.log(`  - USDC Amount: ${params.amount.toString()} (${Number(params.amount) / 1e6} USDC)`);
        console.log(`  - User Address: ${this.account.address}`);
        console.log(`  - Coordinates: (${coordinates.x}, ${coordinates.y})`);
        console.log(`  - Hook Data Length: ${(hookData.length - 2) / 2} bytes`);
        const destinationAddressBytes32 = addressToBytes32(this.account.address);
        const destinationCallerBytes32 = "0x" + "0".repeat(64); // Allow any caller
        console.log("🚀 Burning USDC on Ethereum Sepolia...");
        const hash = await this.sepoliaClient.sendTransaction({
            account: this.account,
            chain: sepolia,
            to: this.config.ethereumSepoliaTokenMessenger,
            data: encodeFunctionData({
                abi: ABIS.depositForBurnWithHook,
                functionName: "depositForBurnWithHook",
                args: [
                    params.amount,
                    this.config.baseSepoliaDomain,
                    destinationAddressBytes32,
                    this.config.ethereumSepoliaUSDC,
                    destinationCallerBytes32,
                    params.maxFee,
                    params.minFinalityThreshold,
                    hookData,
                ],
            }),
        });
        console.log(`✅ Burn Tx: ${hash}`);
        return hash;
    }
    /**
     * Retrieve attestation from Circle's API
     */
    async retrieveAttestation(transactionHash) {
        console.log("⏳ Retrieving attestation...");
        const url = `https://iris-api-sandbox.circle.com/v2/messages/${this.config.ethereumSepoliaDomain}?transactionHash=${transactionHash}`;
        while (true) {
            try {
                const response = await axios.get(url);
                if (response.status === 404) {
                    console.log("⏳ Waiting for attestation...");
                }
                else if (response.data?.messages?.[0]?.status === "complete") {
                    console.log("✅ Attestation retrieved successfully!");
                    return response.data.messages[0];
                }
                else {
                    console.log("⏳ Attestation not ready yet...");
                }
                await this.delay(5000);
            }
            catch (error) {
                console.error("❌ Error fetching attestation:", error instanceof Error ? error.message : error);
                await this.delay(5000);
            }
        }
    }
    /**
     * Mint USDC on destination chain using attestation
     */
    async mintUSDC(attestation) {
        console.log("💰 Minting USDC on Base Sepolia...");
        const hash = await this.baseSepoliaClient.sendTransaction({
            account: this.account,
            chain: baseSepolia,
            to: this.config.baseSepoliaCCTPHookWrapper,
            data: encodeFunctionData({
                abi: ABIS.relay,
                functionName: "relay",
                args: [attestation.message, attestation.attestation],
            }),
        });
        console.log(`✅ Mint Tx: https://sepolia.basescan.org/tx/${hash}`);
        return hash;
    }
    /**
     * Execute full CCTP transfer with game data
     */
    async executeTransfer(gameCoreRecordAddress, params, coordinates) {
        console.log("🎮 Starting CCTP transfer with game data...");
        console.log(`📍 Coordinates: (${coordinates.x}, ${coordinates.y})`);
        console.log(`💵 Amount: ${Number(params.amount) / 1e6} USDC`);
        // Step 1: Approve USDC
        await this.approveUSDC(params.amount * 10n); // Approve 10x for convenience
        // Step 2: Burn USDC with hook data
        const burnTxHash = await this.burnUSDCWithGameData(gameCoreRecordAddress, params, coordinates);
        // Step 3: Retrieve attestation
        const attestation = await this.retrieveAttestation(burnTxHash);
        // Step 4: Mint USDC on destination chain
        const mintTxHash = await this.mintUSDC(attestation);
        console.log("🎉 CCTP transfer completed successfully!");
        return {
            burnTxHash,
            mintTxHash,
        };
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
