const { Client, ContractCreateFlow, PrivateKey, AccountId, Hbar } = require("@hashgraph/sdk");
const fs = require("fs");
require("dotenv").config();

async function main() {
  console.log("🚀 Deploying HushSenseManager contract...");

  // --- 1. Configure Client ---
  const operatorId = AccountId.fromString(process.env.MY_ACCOUNT_ID);
  
  // CHANGED: Using MY_PRIVATE_KEY to be consistent with your other scripts
  const operatorKey = PrivateKey.fromString(process.env.MY_PRIVATE_KEY_DER); 
  
  const client = Client.forMainnet();
  client.setOperator(operatorId, operatorKey);
  client.setDefaultMaxTransactionFee(new Hbar(10)); // 10 HBAR cap

  // --- 2. Load Contract Bytecode ---
  // CHANGED: Make sure your new contract is named HushSenseManager.sol
  const contractName = "HushSenseManager"; 
  const contractArtifact = require(`../artifacts/contracts/${contractName}.sol/${contractName}.json`);
  const bytecode = contractArtifact.bytecode;

  console.log(`📋 Deploying ${contractName} with operator: ${operatorId.toString()}`);

  // --- 3. Deploy Contract ---
  const contractCreateTx = new ContractCreateFlow()
    .setBytecode(bytecode)
    .setGas(800_000) 
    .setAdminKey(operatorKey.publicKey); 

  const txResponse = await contractCreateTx.execute(client);
  const receipt = await txResponse.getReceipt(client);
  const contractId = receipt.contractId;

  // NEW: Simplified and more reliable way to get the EVM address
  const evmAddress = contractId.toSolidityAddress();

  console.log(`🎉 Contract deployed successfully!`);
  console.log(`📋 Contract ID: ${contractId.toString()}`);
  console.log(`📋 EVM Address: ${evmAddress}`);
  console.log(`🔗 Transaction ID: ${txResponse.transactionId.toString()}`);

  // NEW: Pass both values to the update function
  updateEnvFile(contractId.toString(), evmAddress);

  return {
    contractId: contractId.toString(),
    evmAddress,
  };
}

// CHANGED: This function now saves BOTH the ID and the EVM Address
function updateEnvFile(contractId, evmAddress) {
  try {
    const envPath = ".env";
    let envContent = fs.readFileSync(envPath, "utf8");

    const idLine = `HUSHSENSE_MANAGER_CONTRACT_ID=${contractId}`;
    const addressLine = `HUSHSENSE_MANAGER_EVM_ADDRESS=${evmAddress}`;

    // Update Contract ID
    if (envContent.includes("HUSHSENSE_MANAGER_CONTRACT_ID=")) {
      envContent = envContent.replace(/HUSHSENSE_MANAGER_CONTRACT_ID=.*/, idLine);
    } else {
      envContent += `\n${idLine}`;
    }

    // Update EVM Address
    if (envContent.includes("HUSHSENSE_MANAGER_EVM_ADDRESS=")) {
      envContent = envContent.replace(/HUSHSENSE_MANAGER_EVM_ADDRESS=.*/, addressLine);
    } else {
      envContent += `\n${addressLine}`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log("📝 Updated .env file with Contract ID and EVM Address.");
  } catch (error) {
    console.warn("⚠️ Could not update .env file:", error.message);
  }
}

main()
  .then((result) => {
    console.log("\n🎊 Deployment completed successfully!");
    console.log("📋 Final Result:", result);
    console.log("\n🎯 Next steps:");
    console.log("1. Your Contract Manager is now live on Hedera mainnet.");
    console.log("2. Run 'create-token.js' to create your HTS token and link it.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deployment failed");
    console.error(error);
    process.exit(1);
  });