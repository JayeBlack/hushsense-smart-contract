import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

async function verifyKeyMatch() {
  console.log("🔍 Verifying if your private key matches your account...");
  
  const accountId = process.env.MY_ACCOUNT_ID;
  const privateKeyEth = process.env.MY_PRIVATE_KEY_ETH;
  const expectedEvmAddress =process.env.expectedEvmAddress; 
  
  console.log(`📋 Account ID: ${accountId}`);
  console.log(`📋 Expected EVM Address: ${expectedEvmAddress}`);
  console.log(`🔑 Private Key: ${privateKeyEth}`);
  
  try {
    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKeyEth);
    const actualAddress = wallet.address;
    
    console.log(`\n✅ Address derived from private key: ${actualAddress}`);
    console.log(`✅ Expected address from HashPack: ${expectedEvmAddress}`);
    console.log(`✅ Addresses match: ${actualAddress.toLowerCase() === expectedEvmAddress.toLowerCase()}`);
    
    if (actualAddress.toLowerCase() !== expectedEvmAddress.toLowerCase()) {
      console.log(`\n❌ MISMATCH DETECTED!`);
      console.log(`\n🔧 Solutions:`);
      console.log(`1. Get the correct private key for account ${accountId}`);
      console.log(`2. OR find which Hedera account has address ${actualAddress} and fund it`);
      console.log(`3. OR use a new account created with your current private key`);
      
      // Try to figure out what Hedera account the private key might belong to
      console.log(`\n🔍 Your private key controls address: ${actualAddress}`);
      console.log(`💰 You need to fund this address's corresponding Hedera account with testnet HBAR`);
    } else {
      console.log(`\n✅ Perfect! Your private key matches your account.`);
      console.log(`📋 You can proceed with deployment.`);
    }
    
  } catch (error) {
    console.error(`❌ Error verifying keys: ${error.message}`);
  }
}

verifyKeyMatch();