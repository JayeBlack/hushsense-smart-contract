require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("@hashgraph/hethers"); // Ensure this is present

const operatorId = process.env.MY_ACCOUNT_ID;
const operatorKey = process.env.MY_PRIVATE_KEY_ETH; // EVM private key from Hashpack

console.log(`🔧 Hardhat Config - Account ID: ${operatorId}`);
console.log(`🔧 Hardhat Config - Private Key: ${operatorKey}`);

// Real EVM address from Hedera account 0.0.9240965
const actualEvmAddress = "0x00000000000000000000000000000000008d0185";
console.log(`🔧 Hardhat Config - EVM Address: ${actualEvmAddress}`);

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hederaMainnet: {
      url: "https://mainnet.hashio.io/api", // Hedera mainnet node
      accounts: [operatorKey],
      chainId: 295,                         // Hedera mainnet chain ID
      gas: 6_000_000,
      gasPrice: 600_000_000_000,            // ~600 gwei
      timeout: 600_000,
    },
  },
  mocha: {
    timeout: 600_000,
  },
};