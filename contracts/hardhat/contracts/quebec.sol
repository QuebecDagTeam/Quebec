// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title DAGKYC - encrypted KYC pointer + per-recipient encrypted symmetric key sharing
/// @notice Everything stored on-chain is expected to be encrypted off-chain.
contract QuebecKYC {
    uint256 public nextKycId;
    uint256 public nextRequestId;

    struct User {
        address owner;
        string encryptedDataHash;
        uint256 createdAt;
        bool exists;
    }

    struct ThirdParty {
        address owner;
        uint256 createdAt;
        bool exists;
    }

    struct AccessRequest {
        uint256 requestId;
        uint256 kycId;
        address requestedBY;
        string metadata;
        uint256 timestamp;
        bool exists;
    }

    // Storage mappings
    mapping(uint256 => User) public Users;
    mapping(address => ThirdParty) public ThirdParties;
    mapping(uint256 => mapping(address => bytes)) private encryptedKeys;
    mapping(uint256 => mapping(address => bool)) public isAuthorized;
    mapping(uint256 => AccessRequest) public accessRequests;

    // NEW: Tracking authorized relationships
    mapping(address => uint256[]) public thirdPartyAccess;
    mapping(uint256 => address[]) public userAuthorizedParties;

    // Events
    event KycRegistered(uint256 indexed kycId, address indexed owner, string encryptedDataHash, uint256 timestamp);
    event KycUpdated(uint256 indexed kycId, address indexed owner, string encryptedDataHash, uint256 timestamp);
    event AccessRequested(uint256 indexed requestId, uint256 indexed kycId, address indexed requestedBY, string metadata, uint256 timestamp);
    event AccessGranted(uint256 indexed kycId, address indexed recipient, uint256 timestamp);
    event AccessRevoked(uint256 indexed kycId, address indexed recipient, uint256 timestamp);
    event EncryptedKeyUpdated(uint256 indexed kycId, address indexed recipient, uint256 timestamp);

    modifier onlyOwner(uint256 kycId) {
        require(Users[kycId].exists, "KYC not found");
        require(Users[kycId].owner == msg.sender, "Not authorized: only KYC owner");
        _;
    }

    // Register user
    function Register_User(string calldata encryptedDataHash, bytes calldata ownerEncryptedSymKey, uint256 unique_ID) external returns (uint256) {
        require(!Users[unique_ID].exists, "Already registered");
        uint256 kycId = unique_ID;

        Users[kycId] = User({
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

    function updateKyc(uint256 kycId, string calldata encryptedDataHash) external onlyOwner(kycId) {
        Users[kycId].encryptedDataHash = encryptedDataHash;
        emit KycUpdated(kycId, msg.sender, encryptedDataHash, block.timestamp);
    }

    function requestAccess(uint256 kycId, string calldata metadata) external returns (uint256) {
        require(Users[kycId].exists, "KYC not found");
        require(ThirdParties[msg.sender].exists, "You are not a Registered ThirdParty!");

        uint256 reqId = nextRequestId++;
        accessRequests[reqId] = AccessRequest({
            requestId: reqId,
            kycId: kycId,
            requestedBY: msg.sender,
            metadata: metadata,
            timestamp: block.timestamp,
            exists: true
        });

        emit AccessRequested(reqId, kycId, msg.sender, metadata, block.timestamp);
        return reqId;
    }

    function grantAccess(uint256 kycId, address recipient, bytes calldata recipientEncryptedSymKey) external onlyOwner(kycId) {
        require(recipient != address(0), "Invalid recipient");

        if (!isAuthorized[kycId][recipient]) {
            // Only push if it's the first time
            thirdPartyAccess[recipient].push(kycId);
            userAuthorizedParties[kycId].push(recipient);
        }

        encryptedKeys[kycId][recipient] = recipientEncryptedSymKey;
        isAuthorized[kycId][recipient] = true;

        emit EncryptedKeyUpdated(kycId, recipient, block.timestamp);
        emit AccessGranted(kycId, recipient, block.timestamp);
    }

    function revokeAccess(uint256 kycId, address recipient) external onlyOwner(kycId) {
        require(isAuthorized[kycId][recipient], "Not authorized");

        delete encryptedKeys[kycId][recipient];
        isAuthorized[kycId][recipient] = false;

        // Optional: do NOT remove from array for gas efficiency
        emit AccessRevoked(kycId, recipient, block.timestamp);
    }

    function updateEncryptedKey(uint256 kycId, address recipient, bytes calldata recipientEncryptedSymKey) external onlyOwner(kycId) {
        require(recipient != address(0), "Invalid recipient");

        encryptedKeys[kycId][recipient] = recipientEncryptedSymKey;
        isAuthorized[kycId][recipient] = true;

        emit EncryptedKeyUpdated(kycId, recipient, block.timestamp);
    }

    function getEncryptedSymKey(uint256 kycId, address recipient) external view returns (bytes memory) {
        return encryptedKeys[kycId][recipient];
    }

    function getKyc(uint256 kycId) external view onlyOwner(kycId) returns (address, string memory, uint256, bool) {
        User storage r = Users[kycId];
        return (r.owner, r.encryptedDataHash, r.createdAt, r.exists);
    }

    function getUserAccessRequests(uint256 kycId) external view returns (AccessRequest[] memory) {
        uint256 total = nextRequestId;
        uint256 count = 0;

        for (uint256 i = 0; i < total; i++) {
            if (accessRequests[i].exists && accessRequests[i].kycId == kycId) {
                count++;
            }
        }

        AccessRequest[] memory requests = new AccessRequest[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < total; i++) {
            if (accessRequests[i].exists && accessRequests[i].kycId == kycId) {
                requests[index] = accessRequests[i];
                index++;
            }
        }

        return requests;
    }

    function registerThirdParty() external {
        require(!ThirdParties[msg.sender].exists, "Already registered");

        ThirdParties[msg.sender] = ThirdParty({
            owner: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });
    }

    /// 🆕 Get all kycIds that a third party is authorized to access
    function getKycIdsForThirdParty(address thirdParty) external view returns (uint256[] memory) {
        return thirdPartyAccess[thirdParty];
    }

    /// 🆕 Get all authorized third parties for a user
    function getAuthorizedThirdParties(uint256 kycId) external view returns (address[] memory) {
        return userAuthorizedParties[kycId];
    }
}
