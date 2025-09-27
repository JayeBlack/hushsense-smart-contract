# HushSense Contract  

A smart contract project for the **HushSense ecosystem**, deployed on Hedera via Hardhat. It defines, deploys, and manages the **HushSense smart contract** with full support for mainnet deployment.  

---

## 📌 Features  
- Smart contract written in **Solidity** (`hushsense.sol`)  
- Hardhat-based deployment scripts  
- **npx-compatible execution** for smooth workflow  
- Mainnet-ready with `--network hederamainnet` flag  
- Script to mint tokens from the deployed contract  

---

## 📂 Project Structure  
```
hushsense-contract/
├── contracts/
│   └── hushsense.sol        # Core smart contract
├── scripts/
│   ├── deploy-hardhat.cjs   # Deployment script (mainnet/testnet ready)
│   └── mint.js              # Minting script
├── hardhat.config.cjs       # Hardhat configuration
├── package.json             # Project dependencies
└── README.md                # Documentation
```  

---

## ⚙️ Prerequisites  
- **Node.js** v18 or later  
- **npm** or **yarn**  
- Hardhat installed (`npm install --save-dev hardhat`)  
- Hedera account with sufficient HBAR for deployment  

---

## 📥 Installation  
Clone the repository and install dependencies:  

```bash
git clone https://github.com/your-username/hushsense-contract.git
cd hushsense-contract
npm install
```

---

## 🔑 Environment Setup  
Create a `.env` file in the root directory:  

```env
MY_ACCOUNT_ID=0.0.xxxxx
MY_PRIVATE_KEY=302e020100300506032b6570...
HEDERA_NETWORK=hederamainnet
```  

---

## 🚀 Usage  

### 1️⃣ Compile Contracts  
```bash
npx hardhat compile
```  

### 2️⃣ Deploy Contract (Mainnet)  
```bash
npx hardhat run scripts/deploy-hardhat.cjs --network hederamainnet
```  

### 3️⃣ Mint via Contract  
```bash
npx hardhat run scripts/mint.js --network hederamainnet
```  

---

## 📦 Deployment Notes  
- Always double-check `.env` to ensure `hederamainnet` is set for production runs  
- Maintain sufficient HBAR in the deployer account for gas fees  
- Contracts can be upgraded or extended using standard Solidity patterns  

---

## 🛠️ Scripts Details  

### **hushsense.sol**  
Defines the core smart contract logic for HushSense.  

### **deploy-hardhat.cjs**  
Deploys the contract to Hedera, with full support for mainnet deployment via `npx`.  

### **mint.js**  
Mints tokens from the deployed smart contract.  

---

## 📜 License  

This project is licensed under the **Apache License 2.0**.  

```
Copyright 2025 HushSense

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
