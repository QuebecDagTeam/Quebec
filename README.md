# 🧩 Quebec – Decentralized Access-Granted KYC Verification System

> **Hackathon Entry:** October 2025 BlockDAG Challenge  
> **Team Name:** Quebec  
> **Category:** Cyber-Secure Decentralized Identity & Access Management  

---

## 🌍 Live Resources

- 🔗 **Live URL:** [https://quebeq-kyc.vercel.app/](#)
- 🎥 **2-Minute Demo Video:** [https://veed.io/view/10ecf15f-5e4c-4290-ae46-50a3aee73969](#)
<video controls>
  <source src="https://veed.io/view/10ecf15f-5e4c-4290-ae46-50a3aee73969" type="video/mp4">
  Your browser does not support the video tag.
</video>
- 🎨 **Figma Design File:** [https://www.figma.com/design/KAAXwfrYbcnWPeWuYv66mL/Untitled](#)

---

## 💡 Project Overview

**Quebec** is a **privacy-preserving decentralized KYC verification system** built on the **BlockDAG chain**.  
It allows users to securely register their KYC once, store it in encrypted form on IPFS/Web3.Storage, and **grant or revoke** access to third-party apps without revealing any sensitive data.

Instead of sharing actual user information, the system uses a **unique identifier (Unique ID)**.  
Third parties verify a user’s data by submitting the KYC ID and specific details (e.g., name, DOB, NIN). The backend decrypts and compares the information without ever exposing raw data.

---

## ⚙️ How It Works

### 🧠 For Users:
- Register once and upload encrypted KYC details.
- Receive a **unique KYC ID**.
- Manage which apps can access their data through the **Access Dashboard**.

### 🧩 For Third-Party Apps:
- Request verification by providing a user’s **KYC ID** and claimed details.
- If matched, DagKYC requests the **user’s consent** before granting access.
- Access actions (grant/revoke) are recorded both **on-chain** (smart contract) and **off-chain** (database).

---

## 🛠️ Tech Stack

### 🖥️ Frontend
- **React + Tailwind CSS**
- **Fetch API** for HTTP requests
- Core Components:
  - `RegisterKYC.jsx` – Secure registration & file upload  
  - `AccessDashboard.jsx` – Manage granted/revoked access  
  - `ThirdPartyVerify.jsx` – Used by external apps to verify KYC users  

### ⚙️ Backend
- **Node.js + Express + TypeScript**
- **Multer** for file handling
- **Web3.Storage SDK** for decentralized storage
- **Crypto & Eth-Crypto** for AES-GCM and asymmetric encryption
- RESTful APIs for registration, verification, granting, and revoking access

### 🧱 Database
- **MongoDB** (via Mongoose ORM)
- Collections:
  - `KYCRecord` – Stores encrypted data references and access logs  

### ⛓️ Smart Contract
- **Solidity (Deployed on BlockDAG chain)**
- Key Functions:
  - `registerKYCRecord(address user, bytes32 kycHash)`
  - `grantAccess(address user, address app)`
  - `revokeAccess(address user, address app)`
  - `canAccess(address user, address app)`
  - `recordAccess(bytes32 recordId)`

Smart contracts ensure **tamper-proof** audit trails and data integrity.

---

## 🗂️ Repository Structure

```plaintext
DagKYC/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RegisterKYC.jsx
│   │   │   ├── AccessDashboard.jsx
│   │   │   └── ThirdPartyVerify.jsx
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── contracts/
│   ├── KYCRegistry.sol
│   └── hardhat.config.js
│
├── README.md
└── .env.example
```

---

## 🔐 Privacy by Design

- AES-GCM encryption with 256-bit symmetric keys  
- Encrypted symmetric keys shared per authorized recipient  
- Files stored encrypted on IPFS via Web3.Storage  
- Raw user data never leaves the secure backend  
- Only comparison hashes are used during third-party verification  

---

## 🧾 Hackathon Details

- **Event:** BlockDAG October 2025 Challenge  
- **Theme:** “Use the BlockDAG chain to create a secure data transfer platform aligned with NIST security standards.”  
- **Category:** Secure Data Transfer / Decentralized Identity  
- **Submission Date:** October 2025  
- **Focus:** Privacy-preserving data exchange, on-chain access logging, user-controlled verification.

---
'
## 👥 Team Quebec

| Name | Role | Responsibility |
|------|------|----------------|
| **Yakub Shakirudeen Olaide** | Fullstack Developer | Smart contract, backend logic & encryption integration |
| **Babatunde Jamiu** | UI/UX Designer | Figma design & user flow design |
| **Sulyman Haleemah** | UI/UX Designer | Component styling & user experience refinement |
| **Mathias Oluwatoyin** | Project Lead | Coordination, project management & hackathon submission |

---

## 🧩 Core Features

✅ Decentralized KYC registration  
✅ User-controlled access management (grant/revoke)  
✅ On-chain & off-chain synchronization  
✅ Encrypted off-chain storage (IPFS/Web3.Storage)  
✅ Unique KYC ID verification  
✅ Dashboard with activity logs & timestamps  

---

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend Setup
```bash
cd frontendDag
npm install
npm run dev
```
### Blockchain Setup
```bash
cd contracts
cd hardhat
npm install
```

Visit the app at **https://quebeq-kyc.vercel.app/**

---

## 🧱 Environment Variables

```env
PORT=5000
MONGO_URI=mongodb+srv://...
WEB3_STORAGE_TOKEN=...
RPC_URL=https://...
KYC_CONTRACT_ADDRESS=0x...
SECRET_KEY=32-character-secret
```

---

## 🔗 API Endpoints Summary

| Method | Endpoint | Description |
|--------|-----------|-------------|
| `POST` | `/api/kyc/register` | Register user and upload encrypted KYC |
| `POST` | `/api/kyc/verify-by-id` | Verify user by unique KYC ID |
| `POST` | `/api/kyc/grant` | Grant access to a third-party app |
| `POST` | `/api/kyc/revoke` | Revoke access from an app |
| `GET` | `/api/kyc/dashboard/:walletAddress` | Retrieve user's access control data |

---

## 🛡️ Security Compliance

- AES-GCM encryption (256-bit)
- Asymmetric encryption (per recipient)
- On-chain integrity proof
- Web3.Storage decentralized persistence
- NIST-compliant cryptographic primitives

---

## 🧭 Future Improvements

- Integration with Decentralized Identifiers (DIDs)
- Multi-chain interoperability (EVM ↔ BlockDAG)
- zk-SNARK-based privacy proofs
- Biometric authentication for KYC
- Record versioning and data expiration management

---

## 🪙 License

MIT License  
Copyright (c) 2025 Team Quebec

---

## 🙏 Acknowledgments

Special thanks to:
- BlockDAG Team
- OpenAI
- Web3.Storage
- CyperDev Community
- All open-source contributors

---

## 🏁 Conclusion

**DagKYC** empowers users to truly own and control their digital identity —  
allowing third-party applications to **verify**, not **collect**, sensitive data.

> “Own your identity. Control your access. Verify securely.” — *Team Quebec*
