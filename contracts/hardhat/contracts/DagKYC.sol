// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title DAGKYC - encrypted KYC pointer + per-recipient encrypted symmetric key sharing
/// @notice Everything stored on-chain is expected to be encrypted off-chain.
/// - Users register KYC pointers (IPFS CIDs or encryptedBase64).
/// - Users can grant or revoke access to third-party addresses by storing recipient-specific encryptedSymKey bytes.
/// - Third parties can emit access requests (events) that users react to off-chain.
/// - Backend/frontends listen to events to sync DB/UI.
contract DAGKYC {
    uint256 public nextKycId;
    uint256 public nextRequestId;

    struct KycRecord {
        address owner;
        string encryptedDataHash; // pointer (IPFS CID, or base64 identifier)
        uint256 createdAt;
        bool exists;
    }

    // kycId => recipient => encryptedSymKey (opaque bytes)
    mapping(uint256 => mapping(address => bytes)) private encryptedKeys;

    // kycId => recipient => authorized
    mapping(uint256 => mapping(address => bool)) public isAuthorized;

    // kycId => record
    mapping(uint256 => KycRecord) public kycs;

    // Access requests
    struct AccessRequest {
        uint256 requestId;
        uint256 kycId;
        address requester; // third party address
        string metadata;   // optional encrypted metadata about request
        uint256 timestamp;
        bool exists;
    }

    mapping(uint256 => AccessRequest) public accessRequests;

    event KycRegistered(uint256 indexed kycId, address indexed owner, string encryptedDataHash, uint256 timestamp);
    event KycUpdated(uint256 indexed kycId, address indexed owner, string encryptedDataHash, uint256 timestamp);
    event AccessRequested(uint256 indexed requestId, uint256 indexed kycId, address indexed requester, string metadata, uint256 timestamp);
    event AccessGranted(uint256 indexed kycId, address indexed recipient, uint256 timestamp);
    event AccessRevoked(uint256 indexed kycId, address indexed recipient, uint256 timestamp);
    event EncryptedKeyUpdated(uint256 indexed kycId, address indexed recipient, uint256 timestamp);

    modifier onlyOwner(uint256 kycId) {
        require(kycs[kycId].exists, "KYC not found");
        require(kycs[kycId].owner == msg.sender, "Only owner");
        _;
    }

    /// @notice Register a new KYC record
    /// @param encryptedDataHash pointer to encrypted blob (IPFS CID or other)
    /// @param ownerEncryptedSymKey sym key encrypted for owner (optional)
    function registerKyc(string calldata encryptedDataHash, bytes calldata ownerEncryptedSymKey) external returns (uint256) {
        uint256 kycId = nextKycId++;
        kycs[kycId] = KycRecord({
            owner: msg.sender,
            encryptedDataHash: encryptedDataHash,
            createdAt: block.timestamp,
            exists: true
        });

        if (ownerEncryptedSymKey.length > 0) {
            encryptedKeys[kycId][msg.sender] = ownerEncryptedSymKey;
            isAuthorized[kycId][msg.sender] = true;
            emit EncryptedKeyUpdated(kycId, msg.sender, block.timestamp);
            emit AccessGranted(kycId, msg.sender, block.timestamp);
        }

        emit KycRegistered(kycId, msg.sender, encryptedDataHash, block.timestamp);
        return kycId;
    }

    /// @notice Owner updates encrypted data pointer (e.g., re-uploaded encrypted blob)
    function updateKyc(uint256 kycId, string calldata encryptedDataHash) external onlyOwner(kycId) {
        kycs[kycId].encryptedDataHash = encryptedDataHash;
        emit KycUpdated(kycId, msg.sender, encryptedDataHash, block.timestamp);
    }

    /// @notice Third-party requests access; creates an on-chain request event for user to see off-chain
    function requestAccess(uint256 kycId, string calldata metadata) external returns (uint256) {
        require(kycs[kycId].exists, "KYC not found");
        uint256 reqId = nextRequestId++;
        accessRequests[reqId] = AccessRequest({
            requestId: reqId,
            kycId: kycId,
            requester: msg.sender,
            metadata: metadata,
            timestamp: block.timestamp,
            exists: true
        });
        emit AccessRequested(reqId, kycId, msg.sender, metadata, block.timestamp);
        return reqId;
    }

    /// @notice Owner grants access by supplying recipient's encrypted symmetric key bytes
    function grantAccess(uint256 kycId, address recipient, bytes calldata recipientEncryptedSymKey) external onlyOwner(kycId) {
        require(recipient != address(0), "Invalid recipient");
        encryptedKeys[kycId][recipient] = recipientEncryptedSymKey;
        isAuthorized[kycId][recipient] = true;
        emit EncryptedKeyUpdated(kycId, recipient, block.timestamp);
        emit AccessGranted(kycId, recipient, block.timestamp);
    }

    /// @notice Owner revokes access (delete stored key and set authorized false)
    function revokeAccess(uint256 kycId, address recipient) external onlyOwner(kycId) {
        require(isAuthorized[kycId][recipient], "Not authorized");
        delete encryptedKeys[kycId][recipient];
        isAuthorized[kycId][recipient] = false;
        emit AccessRevoked(kycId, recipient, block.timestamp);
    }

    /// @notice Update encrypted key for recipient (owner)
    function updateEncryptedKey(uint256 kycId, address recipient, bytes calldata recipientEncryptedSymKey) external onlyOwner(kycId) {
        require(recipient != address(0), "Invalid recipient");
        encryptedKeys[kycId][recipient] = recipientEncryptedSymKey;
        isAuthorized[kycId][recipient] = true;
        emit EncryptedKeyUpdated(kycId, recipient, block.timestamp);
    }

    /// @notice Get opaque encrypted symmetric key for kycId + recipient
    function getEncryptedSymKey(uint256 kycId, address recipient) external view returns (bytes memory) {
        return encryptedKeys[kycId][recipient];
    }

    /// @notice Get KYC metadata
    function getKyc(uint256 kycId) external view returns (address owner, string memory encryptedDataHash, uint256 createdAt, bool exists) {
        KycRecord storage r = kycs[kycId];
        return (r.owner, r.encryptedDataHash, r.createdAt, r.exists);
    }
}
