# GameCoreRecord Smart Contract

A CCTP Wrapped Hook contract for recording user game data with Chainlink VRF integration.

## Features

- **User Level Calculation**: Based on USDC amount with random offset
- **Coordinate Recording**: Store user placement coordinates (x, y)
- **Key Management**: Encrypted viewing system for user data
- **Chainlink VRF**: Secure random number generation
- **Owner Controls**: Admin functions for data access

## Contract Structure

```
GameCoreRecord
├── User Management (max 15 users)
├── Level Calculation (1-10 with random offset)
├── Coordinate System (x, y coordinates)
├── Key-based Access Control
└── Chainlink VRF Integration
```

## Testing

### Run All Tests
```bash
forge test
```

### Run Specific Test
```bash
forge test --match-test test_RecordUser_Success
```

### Run Tests with Verbose Output
```bash
forge test -vv
```

### Run Tests with Gas Reporting
```bash
forge test --gas-report
```

### Run Fuzz Tests
```bash
forge test --match-test testFuzz_RecordUser
```

### Environment Setup for Testing

#### Option 1: Mock VRF Testing (Recommended for Development)

The test suite includes a Mock VRF Coordinator that allows you to test locally without real network calls:

```bash
# Tests will use Mock VRF by default
forge test
```

#### Option 2: Real VRF Testing (Requires Base Sepolia Setup)

To test with real Chainlink VRF on Base Sepolia:

1. **Update test configuration** in `test/GameCoreRecord.t.sol`:
   ```solidity
   bool constant USE_MOCK_VRF = false;  // Set to false
   bool constant USE_REAL_VRF = true;   // Set to true
   ```

2. **Set up environment variables**:
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit with your actual values
   nano .env
   
   # Or export directly
   export KEY_HASH=your_actual_key_hash
   export SUBSCRIPTION_ID=your_actual_subscription_id
   export CALLBACK_GAS_LIMIT=100000
   ```

3. **Run tests with real VRF**:
   ```bash
   source .env && forge test
   ```

## Test Coverage

The test suite covers:

- ✅ Constructor and initialization
- ✅ User recording functionality
- ✅ Level calculation logic
- ✅ Coordinate extraction
- ✅ Key management
- ✅ Event emissions
- ✅ Owner functions
- ✅ Error handling
- ✅ Edge cases
- ✅ Gas usage
- ✅ Integration scenarios
- ✅ Fuzz testing

## Deployment

### Prerequisites

1. **Environment Setup**
   ```bash
   # Create .env file
   echo "PRIVATE_KEY=your_private_key_here" > .env
   ```

2. **Base Sepolia Configuration**
   - Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
   - Set up Chainlink VRF subscription on Base Sepolia
   - Update deployment script with your VRF parameters

### Deploy to Base Sepolia

```bash
# Load environment variables and deploy
source .env && forge script script/DeployGameCoreRecord.s.sol:DeployGameCoreRecord \
    --rpc-url https://sepolia.base.org \
    --broadcast \
    --verify \
    -vvvv
```

**Note**: Make sure your `.env` file contains the required environment variables before deployment.

### Environment Variables

Create a `.env` file in the contracts directory with your configuration:

```bash
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Base Sepolia RPC URL
RPC_URL=https://sepolia.base.org

# Chainlink VRF Configuration for Base Sepolia
VRF_COORDINATOR=0x50ae5Ea34c9eA863d4dc81c5d9a2F453C9d4f8C1
KEY_HASH=your_actual_key_hash_here
SUBSCRIPTION_ID=your_actual_subscription_id_here
CALLBACK_GAS_LIMIT=100000

# Etherscan API Key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**Important**: Make sure to replace the placeholder values with your actual VRF configuration from Base Sepolia.

### Update VRF Configuration

The deployment script now reads VRF configuration from environment variables, making it more secure and flexible.

## Contract Functions

### Public Functions

- `recordUser(bytes calldata data)`: Main hook function for recording users
- `getUserCount()`: Get total number of users
- `userExists(address user)`: Check if user exists

### Owner Functions

- `viewAllUsersAsOwner()`: View all user records (owner only)

### View Functions

- `userRecords(uint256 index)`: Get user record by index
- `userKeys(address user)`: Get user's key
- `hasKey(address user)`: Check if user has key

## Data Encoding

The `recordUser` function expects packed data:

```solidity
bytes memory data = abi.encodePacked(
    usdcAmount,    // uint256 (6 decimals)
    userAddress,   // address
    coordinates    // uint256 (x << 128 | y)
);
```

## Level Calculation

User levels are calculated based on USDC amount:

| USDC Amount | Base Level |
|-------------|------------|
| < 1 USDC   | 1          |
| 1+ USDC    | 2          |
| 5+ USDC    | 3          |
| 10+ USDC   | 4          |
| 25+ USDC   | 5          |
| 50+ USDC   | 6          |
| 100+ USDC  | 7          |
| 250+ USDC  | 8          |
| 500+ USDC  | 9          |
| 1000+ USDC | 10         |

Final level = Base level + random offset (0-0.9)

## Security Features

- **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
- **Access Control**: Owner-only functions for admin operations
- **Input Validation**: Comprehensive parameter validation
- **Secure Randomness**: Chainlink VRF for unpredictable random numbers

## Gas Optimization

- Efficient data structures
- Optimized loops and conditionals
- Minimal storage operations
- Gas-efficient event emissions

## Development

### Install Dependencies
```bash
forge install OpenZeppelin/openzeppelin-contracts
forge install smartcontractkit/chainlink-brownie-contracts
```

### Compile
```bash
forge build
```

### Format Code
```bash
forge fmt
```

### Lint
```bash
forge lint
```

## Network Configuration

### Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **VRF Coordinator**: 0x50AE5Ea34C9eA863d4Dc81C5d9a2f453c9D4f8C1

## License

MIT License
