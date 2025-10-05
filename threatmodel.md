Actors:
 - Owner (user) — has wallet
 - Verifier (third-party app)
 - Attacker (malicious verifier, backend compromise, network attacker)

Assets:
 - KYC plaintext (images, PII)
 - Symmetric key K_symmetric
 - On-chain proofs (CID, kycHash)

Threats:
 - Unauthorized access (mitigation: on-chain ACL + encrypted symmetric key per-grantee)
 - Data tampering (mitigation: ciphertext + kycHash on-chain)
 - Private key compromise (mitigation: revoke, re-enroll)
 - Server compromise (mitigation: minimal secret storage, KMS in prod)
