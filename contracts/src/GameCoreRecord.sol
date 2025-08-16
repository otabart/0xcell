// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "chainlink-brownie-contracts/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "chainlink-brownie-contracts/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "chainlink-brownie-contracts/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title GameCoreRecord
 * @dev CCTP Wrapped Hook contract for recording user game data
 * Features include: user level calculation, coordinate recording, key management and encrypted viewing
 */
contract GameCoreRecord is VRFConsumerBaseV2, Ownable, ReentrancyGuard {
    
    // Chainlink VRF Configuration
    VRFCoordinatorV2Interface private immutable COORDINATOR;
    bytes32 private immutable keyHash;
    uint64 private immutable subscriptionId;
    uint32 private immutable callbackGasLimit;
    
    // Game Configuration
    uint256 public constant MAX_USERS = 15;
    uint256 public constant MIN_LEVEL = 1;
    uint256 public constant MAX_LEVEL = 10;
    
    // User Data Structure
    struct UserRecord {
        address userAddress;
        uint256 level;
        uint256 x;
        uint256 y;
        uint256 timestamp;
        bool exists;
    }
    
    // State Variables
    UserRecord[] public userRecords;
    mapping(address => bytes32) public userKeys;
    mapping(address => bool) public hasKey;
    mapping(uint256 => bool) public requestIdToPending;
    mapping(uint256 => address) public requestIdToUser;
    
    // Events
    event UserRecorded(
        address indexed user,
        uint256 timestamp
    );
    
    event KeyGenerated(address indexed user);
    event RandomNumberRequested(uint256 indexed requestId, address indexed user);
    
    // Error Definitions
    error InvalidAmount();
    error InvalidCoordinates();
    error MaxUsersReached();
    error UserAlreadyExists();
    error InvalidRequestId();
    error InsufficientKey();
    error InvalidLevel();
    
    /**
     * @dev Constructor, initializes Chainlink VRF
     * @param _vrfCoordinator VRF Coordinator address
     * @param _keyHash Key hash
     * @param _subscriptionId Subscription ID
     * @param _callbackGasLimit Callback gas limit
     */
    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        uint32 _callbackGasLimit
    ) VRFConsumerBaseV2(_vrfCoordinator) Ownable(msg.sender) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        callbackGasLimit = _callbackGasLimit;
    }
    
    /**
     * @dev Main Hook function, called by CCTP Wrapped Hook
     * @param data Packed data containing USDC amount, user address and coordinates
     * @return success Whether the processing was successful
     */
    function recordUser(bytes calldata data) external returns (bool success) {
        // Parse data
        (uint256 usdcAmount, address userAddress, uint256 coordinates) = _decodeData(data);
        
        // Validate data
        if (usdcAmount == 0) revert InvalidAmount();
        if (userAddress == address(0)) revert InvalidAmount();
        if (coordinates == 0) revert InvalidCoordinates();
        
        // Check if user already exists
        if (hasKey[userAddress]) revert UserAlreadyExists();
        
        // Check if maximum users reached
        if (userRecords.length >= MAX_USERS) revert MaxUsersReached();
        
        // Extract coordinates
        (uint256 x, uint256 y) = _extractCoordinates(coordinates);
        
        // Calculate base level (based on USDC amount)
        uint256 baseLevel = _calculateBaseLevel(usdcAmount);
        
        // Request Chainlink random number
        uint256 requestId = _requestRandomNumber();
        requestIdToPending[requestId] = true;
        requestIdToUser[requestId] = userAddress;
        
        // Temporarily record user data (waiting for random number callback to complete)
        _addUserRecord(userAddress, baseLevel, x, y);

        // Request Chainlink VRF random number
        // The random number will be processed in fulfillRandomWords callback
        // For now, we record the user with base level
        
        // Generate user key
        // bytes32 userKey = _generateUserKey(userAddress);
        hasKey[userAddress] = true;
        
        emit KeyGenerated(userAddress);
        emit RandomNumberRequested(requestId, userAddress);
        
        return true;
    }
    
    /**
     * @dev Chainlink VRF callback function
     * @param requestId Request ID
     * @param randomWords Random words array
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        if (!requestIdToPending[requestId]) revert InvalidRequestId();
        
        address user = requestIdToUser[requestId];
        uint256 randomNumber = randomWords[0];
        
        // Calculate final level (base level + random offset)
        uint256 finalLevel = _calculateFinalLevel(user, randomNumber);
        
        // Update user level
        _updateUserLevel(user, finalLevel);
        
        // Clean up state
        delete requestIdToPending[requestId];
        delete requestIdToUser[requestId];
    }
    
    /**
     * @dev View all user information using key
     * @return All user records
     */
    function viewAllUsersWithKey() external view returns (UserRecord[] memory) {
        if (!_isValidKeyForAll()) revert InsufficientKey();
        return userRecords;
    }
    
    /**
     * @dev Owner view all user information (no key required)
     * @return All user records
     */
    function viewAllUsersAsOwner() external view onlyOwner returns (UserRecord[] memory) {
        return userRecords;
    }
    
    /**
     * @dev Get user count
     * @return Current user count
     */
    function getUserCount() external view returns (uint256) {
        return userRecords.length;
    }
    
    /**
     * @dev Check if user exists
     * @param user User address
     * @return Whether user exists
     */
    function userExists(address user) external view returns (bool) {
        return hasKey[user];
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Decode input data
     * @param data Packed data
     * @return usdcAmount USDC amount
     * @return userAddress User address
     * @return coordinates Coordinates
     */
    function _decodeData(bytes calldata data) internal pure returns (
        uint256 usdcAmount,
        address userAddress,
        uint256 coordinates
    ) {
        require(data.length >= 84, "Invalid data length");
        
        assembly {
            usdcAmount := calldataload(add(data.offset, 0))
            userAddress := calldataload(add(data.offset, 32))
            coordinates := calldataload(add(data.offset, 64))
        }
    }
    
    /**
     * @dev Extract x, y coordinates from uint256
     * @param coordinates Coordinate data
     * @return x X coordinate
     * @return y Y coordinate
     */
    function _extractCoordinates(uint256 coordinates) internal pure returns (uint256 x, uint256 y) {
        x = coordinates >> 128;
        y = coordinates & ((1 << 128) - 1);
    }
    
    /**
     * @dev Calculate base level based on USDC amount
     * @param usdcAmount USDC amount (in 6 decimal places)
     * @return Base level
     */
    function _calculateBaseLevel(uint256 usdcAmount) internal pure returns (uint256) {
        // Convert USDC amount to integer (remove 6 decimal places)
        uint256 amountInUnits = usdcAmount / 1e6;
        
        if (amountInUnits >= 1000) return 10;      // 1000+ USDC = Level 10
        if (amountInUnits >= 500) return 9;        // 500+ USDC = Level 9
        if (amountInUnits >= 250) return 8;        // 250+ USDC = Level 8
        if (amountInUnits >= 100) return 7;        // 100+ USDC = Level 7
        if (amountInUnits >= 50) return 6;         // 50+ USDC = Level 6
        if (amountInUnits >= 25) return 5;         // 25+ USDC = Level 5
        if (amountInUnits >= 10) return 4;         // 10+ USDC = Level 4
        if (amountInUnits >= 5) return 3;          // 5+ USDC = Level 3
        if (amountInUnits >= 1) return 2;          // 1+ USDC = Level 2
        return 1;                                   // <1 USDC = Level 1
    }
    
    /**
     * @dev Request Chainlink random number
     * @return requestId Request ID
     */
    function _requestRandomNumber() internal returns (uint256 requestId) {
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            subscriptionId,
            REQUEST_CONFIRMATIONS,
            callbackGasLimit,
            NUM_WORDS
        );
    }
    
    /**
     * @dev Calculate final level (base level + random offset)
     * @param user User address
     * @param randomNumber Random number
     * @return Final level
     */
    function _calculateFinalLevel(address user, uint256 randomNumber) internal view returns (uint256) {
        // find user record
        uint256 userIndex = type(uint256).max;
        for (uint256 i = 0; i < userRecords.length; i++) {
            if (userRecords[i].userAddress == user) {
                userIndex = i;
                break;
            }
        }
        
        require(userIndex != type(uint256).max, "User not found");
        
        uint256 baseLevel = userRecords[userIndex].level;
        
        // random offset：add 0-0.9 to base level
        uint256 randomOffset = randomNumber % 10; // 0-9
        
        // final level = base level + (random offset / 10)
        // eg：base level 5 + offset 7 = final level 5.7
        uint256 finalLevel = baseLevel * 10 + randomOffset;
        
        // make sure valid level
        if (finalLevel > MAX_LEVEL * 10) {
            finalLevel = MAX_LEVEL * 10;
        }
        
        return finalLevel;
    }
    
    /**
     * @dev add user record
     * @param user user address
     * @param level level
     * @param x X coordination
     * @param y Y coordination
     */
    function _addUserRecord(address user, uint256 level, uint256 x, uint256 y) internal {
        UserRecord memory newRecord = UserRecord({
            userAddress: user,
            level: level,
            x: x,
            y: y,
            timestamp: block.timestamp,
            exists: true
        });
        
        userRecords.push(newRecord);
        
        emit UserRecorded(user, block.timestamp);
    }
    
    /**
     * @dev update user level
     * @param user user address
     * @param newLevel new level
     */
    function _updateUserLevel(address user, uint256 newLevel) internal {
        for (uint256 i = 0; i < userRecords.length; i++) {
            if (userRecords[i].userAddress == user) {
                userRecords[i].level = newLevel;
                emit UserRecorded(user, userRecords[i].timestamp);
                break;
            }
        }
    }

    function _isValidKeyForAll() internal view returns (bool) {
        return hasKey[msg.sender];
    }
    
    // Chainlink VRF constant
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    
    // /**
    //  * @dev general user key
    //  * @param user user address
    //  * @return user key
    //  */
    // function _generateUserKey(address user) internal view returns (bytes32) {
    //     return keccak256(abi.encodePacked(
    //         user,
    //         block.timestamp,
    //         block.difficulty,
    //         blockhash(block.number - 1)
    //     ));
    // }
}
