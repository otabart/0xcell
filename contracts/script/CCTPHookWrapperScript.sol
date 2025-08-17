// // SPDX-License-Identifier: UNLICENSED
// pragma solidity 0.7.6;

// import {Script, console} from "forge-std/Script.sol";
// import {CCTPHookWrapper} from "evm-cctp-contracts/src/examples/CCTPHookWrapper.sol";

// contract CCTPHookWrapperScript is Script {
//     CCTPHookWrapper public cctpHookWrapper;

//     function setUp() public {}

//     function run() public {
//         uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
//         address deployer = vm.addr(deployerPrivateKey);
//         vm.startBroadcast(deployerPrivateKey);

//         cctpHookWrapper = new CCTPHookWrapper(0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275);

//         vm.stopBroadcast();
//     }
// }