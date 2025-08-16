// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {GameCoreRecord} from "../src/GameCoreRecord.sol";

/**
 * @title DeployGameCoreRecord
 * @dev Deployment script for GameCoreRecord contract on Base Sepolia
 */
contract DeployGameCoreRecord is Script {
    
    // Base Sepolia Chainlink VRF Configuration
    // IMPORTANT: Update these values with your actual configuration
    address constant VRF_COORDINATOR = 0x50ae5Ea34c9eA863d4dc81c5d9a2F453C9d4f8C1;
    uint32 constant CALLBACK_GAS_LIMIT = 100000;
    
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying GameCoreRecord contract...");
        console.log("Deployer:", deployer);
        // Get VRF configuration from environment variables
        bytes32 keyHash = vm.envBytes32("KEY_HASH");
        uint64 subscriptionId = uint64(vm.envUint("SUBSCRIPTION_ID"));
        
        console.log("VRF Coordinator:", VRF_COORDINATOR);
        console.log("Key Hash:");
        console.logBytes32(keyHash);
        console.log("Subscription ID:", subscriptionId);
        console.log("Callback Gas Limit:", CALLBACK_GAS_LIMIT);
        
        vm.startBroadcast(deployerPrivateKey);
        
        GameCoreRecord gameCoreRecord = new GameCoreRecord(
            VRF_COORDINATOR,
            keyHash,
            subscriptionId,
            CALLBACK_GAS_LIMIT
        );
        
        vm.stopBroadcast();
        
        console.log("GameCoreRecord deployed at:", address(gameCoreRecord));
        console.log("Contract owner:", gameCoreRecord.owner());
        console.log("Max users:", gameCoreRecord.MAX_USERS());
        console.log("Min level:", gameCoreRecord.MIN_LEVEL());
        console.log("Max level:", gameCoreRecord.MAX_LEVEL());
        
        // Verify deployment
        require(gameCoreRecord.owner() == deployer, "Owner mismatch");
        require(gameCoreRecord.MAX_USERS() == 15, "Max users mismatch");
        require(gameCoreRecord.MIN_LEVEL() == 1, "Min level mismatch");
        require(gameCoreRecord.MAX_LEVEL() == 10, "Max level mismatch");
        
        console.log("Deployment successful!");
    }
} 