# security.md — KYCChain (Hackathon)

## Summary
KYCChain stores **encrypted KYC data off-chain (IPFS/web3.storage)** and only minimal proofs (sha256 hash and CID) and access controls on-chain (BlockDAG). Users own their KYC: owner wallet keys authorize writes and grant/revoke access.

## Cryptography
- **Data encryption:** AES-256-GCM per-record symmetric keys (K_symmetric), providing confidentiality and integrity.
- **Key protection:** K_symmetric is encrypted with recipient public keys (ECIES/secp256k1 via eth-crypto or `eth_getEncryptionPublicKey` + `eth_decrypt`).
- **Hashes:** SHA-256 used to produce `kycHash` stored on-chain as tamper-proof proof.

## Key Management (Hackathon)
- **Owner private keys** never stored on our servers. MetaMask / wallet providers hold private keys.
- Encrypted symmetric keys are stored in DB per-recipient. In production, use KMS (AWS KMS / Azure Key Vault) for server keys and HSM for key material.

## Access Control & Audit
- On-chain ACL via `KYCRegistry` contract: `grantAccess` / `revokeAccess` functions and `Accessed` event for auditing.
- All grant/revoke/access actions produce both on-chain events and backend logs.

## Logging & Monitoring
- Backend logs access attempts.
- On-chain events enable immutable audit trails viewable via BlockDAG explorer.

## Threats & Mitigations (short)
- **Compromised wallet:** revoke access on-chain; require re-KYC for high-risk operations.
- **Compromised server secret:** store only encrypted symmetric keys; rotate SECRET_KEY; use KMS in production.
- **Malicious verifier:** user consent enforced on-chain; verifier must be granted by owner before access.

## Notes for Production
- Replace `.env` secrets with KMS-managed secrets.
- Use IPFS pinning service and redundancy.
- Implement rate-limiting, WAF, and vulnerability scanning.
