// scripts/final-deploy.cjs
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Final deployment with corrected account mapping...");

  try {
    // Get signers - this should now use the correct account
    const [deployer] = await ethers.getSigners();
    console.log(`📋 Deploying with address: ${deployer.address}`);
    
    // Expected EVM address from your account
    const expectedAddress = "0x00000000000000000000000000000000005f4c7e";
    console.log(`📋 Expected address: ${expectedAddress}`);
    console.log(`✅ Addresses match: ${deployer.address.toLowerCase() === expectedAddress.toLowerCase()}`);
    
    if (deployer.address.toLowerCase() !== expectedAddress.toLowerCase()) {
      console.warn("⚠️ Address mismatch! This might cause issues.");
    }
    
    // Check balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log(`💰 Account balance: ${ethers.formatEther(balance)} HBAR`);
    
    if (balance === 0n) {
      throw new Error(`Account ${deployer.address} has no balance. Fund it with testnet HBAR.`);
    }
    
    // Get network info
    const network = await deployer.provider.getNetwork();
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Get the contract factory
    const HushSense = await ethers.getContractFactory("HushSense");
    console.log("📦 Contract factory created");
    
    // Estimate gas
    const deployTx = await HushSense.getDeployTransaction();
    const gasEstimate = await deployer.estimateGas(deployTx);
    console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
    
    // Deploy with explicit gas settings
    console.log("🚀 Deploying contract...");
    const hushSense = await HushSense.deploy({
      gasLimit: Math.ceil(Number(gasEstimate) * 1.2), // 20% buffer
    });
    
    console.log("⏳ Waiting for deployment confirmation...");
    
    // Wait for deployment
    await hushSense.waitForDeployment();
    
    const contractAddress = await hushSense.getAddress();
    const deploymentTx = hushSense.deploymentTransaction();
    
    console.log("🎉 Contract deployed successfully!");
    console.log(`📋 Contract Address: ${contractAddress}`);
    console.log(`🔗 Transaction Hash: ${deploymentTx.hash}`);
    
    // Wait for transaction receipt
    const receipt = await deploymentTx.wait();
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`💰 Gas Price: ${receipt.gasPrice.toString()}`);
    
    // Update .env file
    updateEnvFile(contractAddress);
    
    // Verify deployment by calling contract functions
    console.log("\n🔍 Verifying deployment...");
    
    try {
      const name = await hushSense.name();
      const symbol = await hushSense.symbol();
      const totalSupply = await hushSense.totalSupply();
      const owner = await hushSense.owner();
      
      console.log(`✅ Token Name: ${name}`);
      console.log(`✅ Token Symbol: ${symbol}`);
      console.log(`✅ Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
      console.log(`✅ Owner: ${owner}`);
      console.log(`✅ Owner matches deployer: ${owner.toLowerCase() === deployer.address.toLowerCase()}`);
      
    } catch (verifyError) {
      console.warn("⚠️ Could not verify contract functions:", verifyError.message);
    }
    
    return {
      contractAddress,
      transactionHash: deploymentTx.hash,
      gasUsed: receipt.gasUsed.toString(),
      deployer: deployer.address,
      network: network.name,
      chainId: network.chainId.toString()
    };
    
  } catch (error) {
    console.error("❌ Deployment failed!");
    console.error("Error:", error.message);
    
    // Specific error handling
    if (error.message.includes("insufficient funds")) {
      console.error("💰 Solution: Get more testnet HBAR from https://portal.hedera.com/faucet");
    } else if (error.message.includes("nonce")) {
      console.error("🔄 Solution: Wait a moment and try again (nonce issue)");
    } else if (error.message.includes("gas")) {
      console.error("⛽ Solution: Gas issue - try increasing gas limit");
    } else if (error.message.includes("revert")) {
      console.error("🔄 Solution: Contract execution reverted - check constructor parameters");
    }
    
    throw error;
  }
}

function updateEnvFile(contractAddress) {
  try {
    const envPath = ".env";
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Update contract address
    const contractLine = `HUSHSENSE_CONTRACT_ADDRESS=${contractAddress}`;
    
    if (envContent.includes("HUSHSENSE_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /HUSHSENSE_CONTRACT_ADDRESS=.*/,
        contractLine
      );
    } else {
      envContent += `\n${contractLine}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("📝 Updated .env file with contract address");
    
  } catch (error) {
    console.warn("⚠️ Could not update .env file:", error.message);
  }
}

// Execute deployment
main()
  .then((result) => {
    console.log("\n🎊 Deployment completed successfully!");
    console.log("📋 Final Result:");
    Object.entries(result).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    console.log("\n🎯 Next steps:");
    console.log("1. Your HushSense token contract is now live on Hedera testnet");
    console.log("2. You can mint rewards using the mintReward function");
    console.log("3. Users can burn tokens using the burn function");
    console.log("4. The contract address has been saved to your .env file");
    
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Deployment failed");
    process.exit(1);
  });