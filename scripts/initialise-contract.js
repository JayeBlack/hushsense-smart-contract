import {
    Client,
    PrivateKey,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    AccountId,
    Hbar,
} from "@hashgraph/sdk";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const CONTRACT_ID =process.env.HUSHSENSE_MANAGER_CONTRACT_ID;
const TOKEN_SOLIDITY_ADDRESS =process.env.TOKEN_SOLIDITY_ADDRESS;

const ABI_FILE_PATH = path.resolve(
    process.cwd(),
    "artifacts/contracts/HushSenseManager.sol/HushSenseManager.json"
);

// Load values from .env
const ACCOUNT_ID = process.env.MY_ACCOUNT_ID;
const PRIVATE_KEY = process.env.MY_PRIVATE_KEY_DER;
const NETWORK = process.env.HEDERA_NETWORK || "mainnet";

async function main() {
    // Safety checks
    if (!ACCOUNT_ID || !PRIVATE_KEY) {
        throw new Error(
            "Missing critical .env variables. Check MY_ACCOUNT_ID and MY_PRIVATE_KEY_DER."
        );
    }
    if (!fs.existsSync(ABI_FILE_PATH)) {
        throw new Error(
            `ABI file not found at ${ABI_FILE_PATH}. \nPlease ensure you have compiled your contract with 'npx hardhat compile'.`
        );
    }

    // Load operator credentials
    const operatorId = AccountId.fromString(ACCOUNT_ID);
    const operatorKey = PrivateKey.fromString(PRIVATE_KEY);
    const client = NETWORK === "mainnet" ? Client.forMainnet() : Client.forTestnet();

    client.setOperator(operatorId, operatorKey);

    console.log(`🚀 Initializing Contract ${CONTRACT_ID} on ${NETWORK}...`);
    console.log(`Linking it to Token Address: ${TOKEN_SOLIDITY_ADDRESS}`);

    // Call the "initialize" function on the smart contract
    // This tells the contract which token it is allowed to manage
    const tx = await new ContractExecuteTransaction()
        .setContractId(CONTRACT_ID)
        .setGas(100_000) // Gas for the initialize function call
        .setFunction(
            "initialize",
            new ContractFunctionParameters().addAddress(TOKEN_SOLIDITY_ADDRESS) // Pass the token's address
        )
        .freezeWith(client);

    // The contract owner (you) must sign this transaction
    const signedTx = await tx.sign(operatorKey);
    const submitTx = await signedTx.execute(client);
    const receipt = await submitTx.getReceipt(client);

    console.log("✅ Contract initialized successfully!");
    console.log("Transaction Status:", receipt.status.toString());
    console.log(
        "\n🎉 CONGRATULATIONS! Your system is fully deployed and linked! 🎉"
    );
    console.log(
        "You can now call the 'mintReward' function on your smart contract."
    );
}

main().catch((err) => {
    console.error("❌ Error:", err.message);
});
