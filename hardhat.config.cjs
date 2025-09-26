require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const operatorId = process.env.MY_ACCOUNT_ID;
const operatorKey = process.env.MY_PRIVATE_KEY_ETH;

console.log(`🔧 Hardhat Config - Account ID: ${operatorId}`);
console.log(`🔧 Hardhat Config - Private Key: ${operatorKey}`);

// Real EVM address from HashPack for account 0.0.6428773
const actualEvmAddress = "0x57B4F54d2f2F3Cc8b8A587827e4198d17C718acf";
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
    hederaTestnet: {
      url: "https://testnet.hashio.io/api",
      accounts: [operatorKey],
      chainId: 296,
      gas: 3000000,
      gasPrice: 420000000000, // 400 gwei
      timeout: 600000,
    },
  },
  mocha: {
    timeout: 600000,
  },
};