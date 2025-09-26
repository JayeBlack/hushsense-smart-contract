import dotenv from "dotenv";
import {
  PrivateKey,
  AccountId,
} from "@hashgraph/sdk";

dotenv.config();

function generateCorrectKey() {
  console.log("🔧 Generating correct key format for your account...");
  
  const operatorId = process.env.MY_ACCOUNT_ID;
  const operatorKeyDer = process.env.MY_PRIVATE_KEY_DER;
  
  console.log(`📋 Target Account ID: ${operatorId}`);
  console.log(`📋 DER Key: ${operatorKeyDer}`);
  
  try {
    // Parse the DER private key correctly
    const privateKey = PrivateKey.fromString(operatorKeyDer);
    
    console.log("\n✅ Private Key Analysis:");
    console.log(`📋 Private Key (hex): ${privateKey.toString()}`);
    
    // Get the raw bytes (32 bytes for Ed25519)
    const privateKeyBytes = privateKey.toBytes();
    console.log(`📋 Key bytes length: ${privateKeyBytes.length}`);
    
    // For Ed25519, we need the last 32 bytes as the actual private key
    const rawPrivateKey = privateKeyBytes.slice(-32);
    const ethFormatKey = "0x" + Buffer.from(rawPrivateKey).toString('hex');
    
    console.log(`📋 ETH Format Key: ${ethFormatKey}`);
    
    // Verify this key works
    const testPrivateKey = PrivateKey.fromBytes(rawPrivateKey);
    console.log(`📋 Verification - reconstructed key: ${testPrivateKey.toString()}`);
    console.log(`✅ Keys match: ${testPrivateKey.toString() === privateKey.toString()}`);
    
    // Get the expected EVM address for your account
    const accountId = AccountId.fromString(operatorId);
    const expectedEvmAddress = "0x" + accountId.toSolidityAddress();
    
    console.log(`\n📋 Expected EVM Address: ${expectedEvmAddress}`);
    
    console.log(`\n🔧 Update your .env file:`);
    console.log(`MY_ACCOUNT_ID=${operatorId}`);
    console.log(`MY_PRIVATE_KEY_DER=${operatorKeyDer}`);
    console.log(`MY_PRIVATE_KEY_ETH=${ethFormatKey}`);
    
    // Test with the current ETH key to see the difference
    const currentEthKey = process.env.MY_PRIVATE_KEY_ETH;
    console.log(`\n🔍 Comparison:`);
    console.log(`Current ETH key:  ${currentEthKey}`);
    console.log(`Correct ETH key:  ${ethFormatKey}`);
    console.log(`Keys are same:    ${currentEthKey === ethFormatKey}`);
    
  } catch (error) {
    console.error("❌ Error processing keys:", error.message);
    
    console.log("\n💡 Alternative approach:");
    console.log("If your DER key is not working, you may need to:");
    console.log("1. Go to your Hedera account dashboard/portal");
    console.log("2. Export/regenerate the private key for account", operatorId);
    console.log("3. Make sure you have the correct DER format private key");
    console.log("4. The DER key should be 96 characters long (48 bytes in hex)");
    
    // Show what a proper DER key should look like
    console.log("\nA proper ED25519 DER private key format:");
    console.log("302e020100300506032b657004220420[32-byte-private-key]");
    console.log("Your key:", operatorKeyDer);
    console.log(`Length: ${operatorKeyDer.length} characters (should be 96)`);
  }
}

generateCorrectKey();