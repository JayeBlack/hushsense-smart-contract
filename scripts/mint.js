import dotenv from "dotenv";
import {
  Client,
  ContractExecuteTransaction,
  ContractCallQuery,
  ContractFunctionParameters,
  PrivateKey,
  ContractId,
  AccountId,
  Hbar,
} from "@hashgraph/sdk";

dotenv.config();

// Load operator credentials
const operatorId = process.env.MY_ACCOUNT_ID;
const operatorKeyInput = process.env.MY_PRIVATE_KEY_DER;
const network = process.env.HEDERA_NETWORK || "testnet";

if (!operatorId || !operatorKeyInput) {
  throw new Error("❌ Please set MY_ACCOUNT_ID and MY_PRIVATE_KEY_DER in your .env file");
}

// Convert DER key into Hedera PrivateKey
let operatorKey;
try {
  operatorKey = PrivateKey.fromString(operatorKeyInput);
} catch (e) {
  console.error("❌ Failed to parse DER private key:", e.message);
  console.error("💡 Make sure your DER key is in the correct format");
  process.exit(1);
}

// Create Hedera client
const client = network === "mainnet" 
  ? Client.forMainnet() 
  : Client.forTestnet();

client.setOperator(operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(100));

// Load contract + mint info
const contractAddress = process.env.HUSHSENSE_CONTRACT_ADDRESS;
const userWallet = process.env.USER_WALLET;
const mintAmount = process.env.MINT_AMOUNT || "100";

if (!contractAddress) {
  throw new Error("❌ HUSHSENSE_CONTRACT_ADDRESS is not set in your .env file");
}

console.log("📋 Contract address from .env:", contractAddress);
console.log("📋 User wallet:", userWallet);
console.log("📋 Mint amount:", mintAmount);

// Convert contract address to ContractId
let contractId;
try {
  // Handle both EVM format (0x...) and Hedera format (0.0.xxx)
  if (contractAddress.startsWith("0x")) {
    // Convert EVM address to Hedera Contract ID - this is complex, so we'll use a workaround
    console.log("⚠️  EVM address detected. You may need to provide the Hedera Contract ID instead.");
    console.log("💡 Find your contract on HashScan and use the Hedera ID (0.0.xxxxxx)");
    throw new Error("Please update HUSHSENSE_CONTRACT_ADDRESS to use Hedera format (0.0.xxxxxx)");
  } else {
    contractId = ContractId.fromString(contractAddress);
  }
} catch (e) {
  console.error("❌ Invalid contract address:", e.message);
  process.exit(1);
}

console.log("📋 Using Hedera Contract ID:", contractId.toString());

// Handle decimals with BigInt
const DECIMALS = 18;
const mintAmountBigInt = BigInt(mintAmount) * (10n ** BigInt(DECIMALS));

// Convert user wallet to proper address format
function formatRecipientAddress(wallet) {
  if (wallet.startsWith("0x")) {
    return wallet; // Already EVM format
  } else if (wallet.startsWith("0.0.")) {
    // Convert Hedera account to EVM address
    const accountId = AccountId.fromString(wallet);
    return "0x" + accountId.toSolidityAddress();
  } else {
    throw new Error("Invalid wallet format. Use EVM address (0x...) or Hedera ID (0.0....)");
  }
}

async function checkBalance(address, description) {
  try {
    const balanceQuery = new ContractCallQuery()
      .setContractId(contractId)
      .setGas(100_000)
      .setFunction("balanceOf", new ContractFunctionParameters().addAddress(address));
    
    const result = await balanceQuery.execute(client);
    const balance = result.getUint256(0);
    const balanceFormatted = (balance / (10n ** 18n)).toString();
    
    console.log(`💰 ${description}: ${balanceFormatted} HUSH`);
    return balance;
  } catch (error) {
    console.log(`⚠️  Could not check ${description}: ${error.message}`);
    return 0n;
  }
}

async function main() {
  try {
    // Format recipient address
    const recipientAddress = formatRecipientAddress(userWallet);
    console.log("📋 Recipient EVM address:", recipientAddress);

    console.log(`\n🎨 Minting ${mintAmount} HUSH tokens...`);
    console.log(`   Recipient: ${userWallet} → ${recipientAddress}`);
    console.log(`   Amount: ${mintAmountBigInt.toString()} units (with 18 decimals)`);

    // Check balance before minting
    await checkBalance(recipientAddress, "Balance before minting");

    // Create mint transaction
    const mintTx = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(300_000)
      .setMaxTransactionFee(new Hbar(10))
      .setFunction(
        "mintReward",
        new ContractFunctionParameters()
          .addAddress(recipientAddress)
          .addUint256(mintAmountBigInt.toString())
      );

    console.log("\n🚀 Submitting mint transaction...");
    const txResponse = await mintTx.execute(client);
    console.log("⏳ Transaction submitted, waiting for receipt...");

    const receipt = await txResponse.getReceipt(client);
    console.log("✅ Transaction status:", receipt.status.toString());

    if (receipt.status.toString() === "SUCCESS") {
      console.log("🎉 Mint successful!");
      console.log("🔗 Transaction ID:", txResponse.transactionId.toString());
      
      // Get transaction record for more details
      try {
        const record = await txResponse.getRecord(client);
        console.log("💰 Gas used:", record.gasUsed ? record.gasUsed.toString() : "N/A");
        
        // Check for events/logs
        if (record.contractFunctionResult?.logs?.length > 0) {
          console.log("📜 Events emitted:", record.contractFunctionResult.logs.length);
        }
      } catch (recordError) {
        console.log("⚠️  Could not fetch transaction record:", recordError.message);
      }

      // Check balance after minting
      console.log("\n💰 Checking updated balance...");
      await checkBalance(recipientAddress, "Balance after minting");

      console.log("\n📋 Summary:");
      console.log(`   ✅ Minted ${mintAmount} HUSH to ${userWallet}`);
      console.log(`   🔗 View on HashScan: https://hashscan.io/testnet/transaction/${txResponse.transactionId.toString()}`);
      
    } else {
      console.error("❌ Transaction failed with status:", receipt.status.toString());
    }

  } catch (error) {
    console.error("❌ Mint failed:", error.message);
    
    // Provide specific error guidance
    if (error.message.includes("CONTRACT_REVERT_EXECUTED")) {
      console.error("💡 Contract reverted - possible issues:");
      console.error("   • You're not the contract owner");
      console.error("   • Invalid recipient address");
      console.error("   • Contract has a bug");
    } else if (error.message.includes("INSUFFICIENT_ACCOUNT_BALANCE")) {
      console.error("💡 Not enough HBAR for gas fees");
    } else if (error.message.includes("INVALID_CONTRACT_ID")) {
      console.error("💡 Contract ID is invalid or contract doesn't exist");
    }
    
    throw error;
  } finally {
    client.close();
  }
}

main().catch((err) => {
  console.error("💥 Script failed:", err.message);
  process.exit(1);
});