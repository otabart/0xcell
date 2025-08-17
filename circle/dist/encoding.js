import { encodeFunctionData } from "viem";
import { GAME_CONFIG, ABIS } from "./constants";
/**
 * Validates game coordinates
 */
export function validateCoordinates(coordinates) {
    const { x, y } = coordinates;
    const { minCoordinate, maxCoordinate } = GAME_CONFIG;
    if (x < minCoordinate || x > maxCoordinate || y < minCoordinate || y > maxCoordinate) {
        throw new Error(`Coordinates must be in range [${minCoordinate}, ${maxCoordinate}]`);
    }
}
/**
 * Packs x and y coordinates into a single uint256
 * Format: x in upper 128 bits, y in lower 128 bits
 */
export function packCoordinates(coordinates) {
    const { x, y } = coordinates;
    return (BigInt(x) << GAME_CONFIG.coordinateBitShift) | BigInt(y);
}
/**
 * Unpacks coordinates from a uint256
 */
export function unpackCoordinates(packed) {
    const mask = (1n << GAME_CONFIG.coordinateBitShift) - 1n;
    return {
        x: Number(packed >> GAME_CONFIG.coordinateBitShift),
        y: Number(packed & mask),
    };
}
/**
 * Encodes data for the GameCoreRecord.recordUser function
 */
export function encodeGameData(usdcAmount, userAddress, coordinates) {
    validateCoordinates(coordinates);
    const packedCoordinates = packCoordinates(coordinates);
    // Format: usdcAmount (32 bytes) + userAddress (32 bytes) + coordinates (32 bytes)
    const data = "0x" +
        usdcAmount.toString(16).padStart(64, "0") +
        userAddress.slice(2).toLowerCase().padStart(64, "0") +
        packedCoordinates.toString(16).padStart(64, "0");
    return data;
}
/**
 * Creates hook data for CCTP
 */
export function createHookData(gameCoreRecordAddress, usdcAmount, userAddress, coordinates) {
    const recordUserData = encodeFunctionData({
        abi: ABIS.recordUser,
        functionName: "recordUser",
        args: [encodeGameData(usdcAmount, userAddress, coordinates)],
    });
    // Hook data format: target contract address + function call data
    return "0x" + gameCoreRecordAddress.slice(2) + recordUserData.slice(2);
}
/**
 * Converts an address to bytes32 format
 */
export function addressToBytes32(address) {
    return `0x000000000000000000000000${address.slice(2).toLowerCase()}`;
}
