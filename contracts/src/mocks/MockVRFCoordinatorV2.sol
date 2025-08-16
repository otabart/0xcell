// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockVRFCoordinatorV2
 * @dev Mock VRF Coordinator for testing purposes
 */
contract MockVRFCoordinatorV2 is Ownable {
    
    // Events
    event RandomWordsRequested(
        bytes32 indexed keyHash,
        uint256 requestId,
        uint256 preSeed,
        uint64 indexed subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        address indexed sender
    );
    
    event RandomWordsFulfilled(
        uint256 indexed requestId,
        uint256 outputSeed,
        uint96 payment,
        bool success
    );
    
    // State variables
    mapping(uint256 => bool) public pendingRequests;
    mapping(uint256 => uint256[]) public requestToRandomWords;
    uint256 public nextRequestId = 1;
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Request random words (mock implementation)
     */
    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 requestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId) {
        requestId = nextRequestId++;
        pendingRequests[requestId] = true;
        
        emit RandomWordsRequested(
            keyHash,
            requestId,
            0, // preSeed
            subId,
            requestConfirmations,
            callbackGasLimit,
            numWords,
            msg.sender
        );
        
        // Automatically fulfill the request with mock random numbers
        _fulfillRandomWords(requestId, numWords);
    }
    
    /**
     * @dev Fulfill random words with mock data
     */
    function _fulfillRandomWords(uint256 requestId, uint32 numWords) internal {
        require(pendingRequests[requestId], "Request not found");
        
        uint256[] memory randomWords = new uint256[](numWords);
        for (uint256 i = 0; i < numWords; i++) {
            // Generate deterministic but seemingly random numbers
            randomWords[i] = uint256(keccak256(abi.encodePacked(
                requestId,
                i,
                block.timestamp,
                block.difficulty
            )));
        }
        
        requestToRandomWords[requestId] = randomWords;
        pendingRequests[requestId] = false;
        
        emit RandomWordsFulfilled(requestId, 0, 0, true);
    }
    
    /**
     * @dev Manually fulfill a specific request (for testing)
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external onlyOwner {
        require(pendingRequests[requestId], "Request not found");
        
        requestToRandomWords[requestId] = randomWords;
        pendingRequests[requestId] = false;
        
        emit RandomWordsFulfilled(requestId, 0, 0, true);
    }
    
    /**
     * @dev Get random words for a request
     */
    function getRandomWords(uint256 requestId) external view returns (uint256[] memory) {
        return requestToRandomWords[requestId];
    }
    
    /**
     * @dev Check if request is pending
     */
    function isRequestPending(uint256 requestId) external view returns (bool) {
        return pendingRequests[requestId];
    }
} 