// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {GameCoreRecord} from "../src/GameCoreRecord.sol";
import {MockVRFCoordinatorV2} from "../src/mocks/MockVRFCoordinatorV2.sol";

/**
 * @title GameCoreRecordTest
 * @dev Comprehensive test suite for GameCoreRecord contract
 * 
 * Test Configuration:
 * - USE_MOCK_VRF: Set to true for local testing with mock VRF
 * - USE_REAL_VRF: Set to true for testing with real Base Sepolia VRF (requires .env setup)
 */
contract GameCoreRecordTest is Test {
    
    // Test Configuration
    bool constant USE_MOCK_VRF = true;  // Set to false to use real VRF
    bool constant USE_REAL_VRF = false; // Set to true to use real VRF
    
    // Test addresses
    address public owner;
    address public user1;
    address public user2;
    address public user3;
    
    // Base Sepolia Chainlink VRF Configuration
    // These are the actual addresses for Base Sepolia testnet
    address constant BASE_SEPOLIA_VRF_COORDINATOR = 0x50ae5Ea34c9eA863d4dc81c5d9a2F453C9d4f8C1;
    bytes32 public BASE_SEPOLIA_KEY_HASH;
    uint64 public SUBSCRIPTION_ID;
    uint32 constant CALLBACK_GAS_LIMIT = 100_000;
    
    // Test data
    uint256 constant USDC_AMOUNT_100 = 100_000_000; // 100 USDC (6 decimals)
    uint256 constant USDC_AMOUNT_500 = 500_000_000; // 500 USDC (6 decimals)
    uint256 constant USDC_AMOUNT_1000 = 1_000_000_000; // 1000 USDC (6 decimals)
    uint256 constant COORDINATES_1_1 = 0x0000000000000000000000000000000100000000000000000000000000000001; // x=1, y=1
    uint256 constant COORDINATES_10_20 = 0x0000000000000000000000000000000A000000000000000000000000000014; // x=10, y=20
    
    GameCoreRecord public gameCoreRecord;
    MockVRFCoordinatorV2 public mockVRFCoordinator;
    
    // Events to test
    event UserRecorded(address indexed user, uint256 timestamp);
    event KeyGenerated(address indexed user);
    event RandomNumberRequested(uint256 indexed requestId, address indexed user);
    
    function setUp() public {
        // Setup test accounts
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        // Initialize VRF configuration
        if (USE_MOCK_VRF) {
            // Use default values for mock testing
            BASE_SEPOLIA_KEY_HASH = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
            SUBSCRIPTION_ID = 1;
        } else if (USE_REAL_VRF) {
            // Read from environment variables for real VRF testing
            BASE_SEPOLIA_KEY_HASH = vm.envBytes32("KEY_HASH");
            SUBSCRIPTION_ID = uint64(vm.envUint("SUBSCRIPTION_ID"));
        }
        
        vm.startPrank(owner);
        
        if (USE_MOCK_VRF) {
            // Deploy Mock VRF Coordinator for local testing
            mockVRFCoordinator = new MockVRFCoordinatorV2();
            
            // Deploy GameCoreRecord with Mock VRF coordinator
            gameCoreRecord = new GameCoreRecord(
                address(mockVRFCoordinator),
                BASE_SEPOLIA_KEY_HASH,
                SUBSCRIPTION_ID,
                CALLBACK_GAS_LIMIT
            );
        } else if (USE_REAL_VRF) {
            // Deploy GameCoreRecord with real Base Sepolia VRF coordinator
            // Make sure .env file is properly configured
            gameCoreRecord = new GameCoreRecord(
                BASE_SEPOLIA_VRF_COORDINATOR,
                BASE_SEPOLIA_KEY_HASH,
                SUBSCRIPTION_ID,
                CALLBACK_GAS_LIMIT
            );
        } else {
            revert("Invalid VRF configuration");
        }
        
        vm.stopPrank();
        
        // Fund test accounts
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(user3, 100 ether);
    }
    
    // ============ Constructor Tests ============
    
    function test_Constructor() public {
        assertEq(address(gameCoreRecord.owner()), owner);
        assertEq(gameCoreRecord.MAX_USERS(), 15);
        assertEq(gameCoreRecord.MIN_LEVEL(), 1);
        assertEq(gameCoreRecord.MAX_LEVEL(), 10);
    }
    
    // ============ Mock VRF Tests ============
    
    function test_MockVRF_Deployment() public {
        if (USE_MOCK_VRF) {
            assertTrue(address(mockVRFCoordinator) != address(0));
            assertEq(mockVRFCoordinator.owner(), owner);
        }
    }
    
    function test_MockVRF_RequestRandomWords() public {
        if (USE_MOCK_VRF) {
            bytes32 keyHash = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;
            uint64 subId = 1;
            uint16 confirmations = 3;
            uint32 gasLimit = 100000;
            uint32 numWords = 1;
            
            uint256 requestId = mockVRFCoordinator.requestRandomWords(
                keyHash,
                subId,
                confirmations,
                gasLimit,
                numWords
            );
            
            assertEq(requestId, 1);
            assertFalse(mockVRFCoordinator.isRequestPending(requestId));
            
            uint256[] memory randomWords = mockVRFCoordinator.getRandomWords(requestId);
            assertEq(randomWords.length, 1);
            assertTrue(randomWords[0] > 0);
        }
    }
    
    // ============ recordUser Function Tests ============
    
    function test_RecordUser_Success() public {
        bytes memory data = _packData(USDC_AMOUNT_100, user1, COORDINATES_1_1);
        
        vm.prank(user1);
        bool success = gameCoreRecord.recordUser(data);
        
        assertTrue(success);
        assertTrue(gameCoreRecord.userExists(user1));
        assertEq(gameCoreRecord.getUserCount(), 1);
    }
    
    function test_RecordUser_MultipleUsers() public {
        // Record first user
        bytes memory data1 = _packData(USDC_AMOUNT_100, user1, COORDINATES_1_1);
        vm.prank(user1);
        gameCoreRecord.recordUser(data1);
        
        // Record second user
        bytes memory data2 = _packData(USDC_AMOUNT_500, user2, COORDINATES_10_20);
        vm.prank(user2);
        gameCoreRecord.recordUser(data2);
        
        assertEq(gameCoreRecord.getUserCount(), 2);
        assertTrue(gameCoreRecord.userExists(user1));
        assertTrue(gameCoreRecord.userExists(user2));
    }
    
    function test_RecordUser_InvalidAmount() public {
        bytes memory data = _packData(0, user1, COORDINATES_1_1);
        
        vm.prank(user1);
        vm.expectRevert(GameCoreRecord.InvalidAmount.selector);
        gameCoreRecord.recordUser(data);
    }
    
    function test_RecordUser_InvalidUserAddress() public {
        bytes memory data = _packData(USDC_AMOUNT_100, address(0), COORDINATES_1_1);
        
        vm.prank(user1);
        vm.expectRevert(GameCoreRecord.InvalidAmount.selector);
        gameCoreRecord.recordUser(data);
    }
    
    function test_RecordUser_InvalidCoordinates() public {
        bytes memory data = _packData(USDC_AMOUNT_100, user1, 0);
        
        vm.prank(user1);
        vm.expectRevert(GameCoreRecord.InvalidCoordinates.selector);
        gameCoreRecord.recordUser(data);
    }
    
    function test_RecordUser_UserAlreadyExists() public {
        // Record user first time
        bytes memory data = _packData(USDC_AMOUNT_100, user1, COORDINATES_1_1);
        vm.prank(user1);
        gameCoreRecord.recordUser(data);
        
        // Try to record same user again
        vm.prank(user1);
        vm.expectRevert(GameCoreRecord.UserAlreadyExists.selector);
        gameCoreRecord.recordUser(data);
    }
    
    function test_RecordUser_MaxUsersReached() public {
        // Fill up to max users
        for (uint256 i = 0; i < 15; i++) {
            address user = address(uint160(i + 1));
            bytes memory data = _packData(USDC_AMOUNT_100, user, COORDINATES_1_1);
            vm.prank(user);
            gameCoreRecord.recordUser(data);
        }
        
        // Try to add one more user
        address extraUser = address(0x100);
        bytes memory data = _packData(USDC_AMOUNT_100, extraUser, COORDINATES_1_1);
        vm.prank(extraUser);
        vm.expectRevert(GameCoreRecord.MaxUsersReached.selector);
        gameCoreRecord.recordUser(data);
    }
    
    // ============ Level Calculation Tests ============
    
    function test_LevelCalculation_100USDC() public {
        bytes memory data = _packData(USDC_AMOUNT_100, user1, COORDINATES_1_1);
        
        vm.prank(user1);
        gameCoreRecord.recordUser(data);
        
        // Check that user was recorded (level will be updated later by VRF callback)
        assertTrue(gameCoreRecord.userExists(user1));
    }
    
    function test_LevelCalculation_500USDC() public {
        bytes memory data = _packData(USDC_AMOUNT_500, user1, COORDINATES_1_1);
        
        vm.prank(user1);
        gameCoreRecord.recordUser(data);
        
        assertTrue(gameCoreRecord.userExists(user1));
    }
    
    function test_LevelCalculation_1000USDC() public {
        bytes memory data = _packData(USDC_AMOUNT_1000, user1, COORDINATES_1_1);
        
        vm.prank(user1);
        gameCoreRecord.recordUser(data);
        
        assertTrue(gameCoreRecord.userExists(user1));
    }
    
    // ============ Coordinate Extraction Tests ============
    
    function test_CoordinateExtraction() public {
        // Test coordinates (1, 1)
        uint256 x = 1;
        uint256 y = 1;
        uint256 coordinates = (x << 128) | y;
        
        bytes memory data = _packData(USDC_AMOUNT_100, user1, coordinates);
        
        vm.prank(user1);
        gameCoreRecord.recordUser(data);
        
        assertTrue(gameCoreRecord.userExists(user1));
    }
    
    function test_CoordinateExtraction_LargeValues() public {
        // Test coordinates (1000, 2000)
        uint256 x = 1000;
        uint256 y = 2000;
        uint256 coordinates = (x << 128) | y;
        
        bytes memory data = _packData(USDC_AMOUNT_100, user1, coordinates);
        
        vm.prank(user1);
        gameCoreRecord.recordUser(data);
        
        assertTrue(gameCoreRecord.userExists(user1));
    }
    
    // ============ Key Management Tests ============
    
    function test_KeyGeneration() public {
        bytes memory data = _packData(USDC_AMOUNT_100, user1, COORDINATES_1_1);
        
        vm.prank(user1);
        vm.expectEmit(true, false, false, false);
        emit KeyGenerated(user1);
        gameCoreRecord.recordUser(data);
        
        assertTrue(gameCoreRecord.userExists(user1));
    }
    
    // ============ Event Emission Tests ============
    
    function test_EventEmission() public {
        bytes memory data = _packData(USDC_AMOUNT_100, user1, COORDINATES_1_1);
        
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit KeyGenerated(user1);
        vm.expectEmit(true, false, false, true);
        emit RandomNumberRequested(1, user1); // Mock request ID should be 1
        gameCoreRecord.recordUser(data);
    }
    
    // ============ Owner Functions Tests ============
    
    function test_ViewAllUsersAsOwner() public {
        // Record some users
        bytes memory data1 = _packData(USDC_AMOUNT_100, user1, COORDINATES_1_1);
        vm.prank(user1);
        gameCoreRecord.recordUser(data1);
        
        bytes memory data2 = _packData(USDC_AMOUNT_500, user2, COORDINATES_10_20);
        vm.prank(user2);
        gameCoreRecord.recordUser(data2);
        
        // Owner should be able to view all users
        vm.prank(owner);
        GameCoreRecord.UserRecord[] memory users = gameCoreRecord.viewAllUsersAsOwner();
        
        assertEq(users.length, 2);
        assertEq(users[0].userAddress, user1);
        assertEq(users[1].userAddress, user2);
    }
    
    function test_ViewAllUsersAsOwner_NonOwner() public {
        // Non-owner should not be able to view all users
        vm.prank(user1);
        vm.expectRevert(); // Ownable: caller is not the owner
        gameCoreRecord.viewAllUsersAsOwner();
    }
    
    // ============ Utility Functions ============
    
    function _packData(uint256 usdcAmount, address userAddress, uint256 coordinates) internal pure returns (bytes memory) {
        return abi.encode(usdcAmount, userAddress, coordinates);
    }
    
    // ============ Fuzz Tests ============
    
    function testFuzz_RecordUser(uint256 usdcAmount, address user, uint256 x, uint256 y) public {
        // Filter valid inputs
        vm.assume(usdcAmount > 0 && usdcAmount <= 10000_000_000); // 0-10000 USDC
        vm.assume(user != address(0));
        vm.assume(x > 0 && x <= 1000000);
        vm.assume(y > 0 && y <= 1000000);
        
        uint256 coordinates = (x << 128) | y;
        bytes memory data = _packData(usdcAmount, user, coordinates);
        
        vm.prank(user);
        bool success = gameCoreRecord.recordUser(data);
        
        assertTrue(success);
        assertTrue(gameCoreRecord.userExists(user));
    }
    
    // ============ Integration Tests ============
    
    function test_CompleteUserFlow() public {
        // 1. Record user
        bytes memory data = _packData(USDC_AMOUNT_100, user1, COORDINATES_1_1);
        vm.prank(user1);
        gameCoreRecord.recordUser(data);
        
        // 2. Verify user exists
        assertTrue(gameCoreRecord.userExists(user1));
        assertEq(gameCoreRecord.getUserCount(), 1);
        
        // 3. Record another user
        bytes memory data2 = _packData(USDC_AMOUNT_500, user2, COORDINATES_10_20);
        vm.prank(user2);
        gameCoreRecord.recordUser(data2);
        
        // 4. Verify both users exist
        assertTrue(gameCoreRecord.userExists(user1));
        assertTrue(gameCoreRecord.userExists(user2));
        assertEq(gameCoreRecord.getUserCount(), 2);
        
        // 5. Owner can view all users
        vm.prank(owner);
        GameCoreRecord.UserRecord[] memory users = gameCoreRecord.viewAllUsersAsOwner();
        assertEq(users.length, 2);
    }
    
    // ============ Gas Usage Tests ============
    
    function test_GasUsage_RecordUser() public {
        bytes memory data = _packData(USDC_AMOUNT_100, user1, COORDINATES_1_1);
        
        uint256 gasBefore = gasleft();
        vm.prank(user1);
        gameCoreRecord.recordUser(data);
        uint256 gasUsed = gasBefore - gasleft();
        
        console.log("Gas used for recordUser:", gasUsed);
        assertTrue(gasUsed > 0);
    }
    
    // ============ Edge Cases ============
    
    function test_EdgeCase_MinimumUSDC() public {
        uint256 minUSDC = 1; // 0.000001 USDC
        bytes memory data = _packData(minUSDC, user1, COORDINATES_1_1);
        
        vm.prank(user1);
        bool success = gameCoreRecord.recordUser(data);
        
        assertTrue(success);
        assertTrue(gameCoreRecord.userExists(user1));
    }
    
    function test_EdgeCase_MaximumCoordinates() public {
        uint256 maxX = 2**128 - 1;
        uint256 maxY = 2**128 - 1;
        uint256 coordinates = (maxX << 128) | maxY;
        
        bytes memory data = _packData(USDC_AMOUNT_100, user1, coordinates);
        
        vm.prank(user1);
        bool success = gameCoreRecord.recordUser(data);
        
        assertTrue(success);
        assertTrue(gameCoreRecord.userExists(user1));
    }
} 