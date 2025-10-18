// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title QuebecKYC - Encrypted KYC Pointer with Access Control
/// @notice All data is encrypted off-chain before storage
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
        address requestedBy;
        string metadata;
        uint256 timestamp;
        bool exists;
    }

    // Storage
    mapping(uint256 => User) public users;
    mapping(address => ThirdParty) public thirdParties;
    mapping(uint256 => mapping(address => bytes)) private encryptedKeys;
    mapping(uint256 => mapping(address => bool)) public isAuthorized;
    mapping(uint256 => AccessRequest) public accessRequests;

    // Access tracking
    mapping(address => uint256[]) public thirdPartyAccess;
    mapping(uint256 => address[]) public userAuthorizedParties;

    // Events
    event KycRegistered(uint256 indexed kycId, address indexed owner, string encryptedDataHash, uint256 timestamp);
    event KycUpdated(uint256 indexed kycId, address indexed owner, string encryptedDataHash, uint256 timestamp);
    event AccessRequested(uint256 indexed requestId, uint256 indexed kycId, address indexed requestedBy, string metadata, uint256 timestamp);
    event AccessGranted(uint256 indexed kycId, address indexed recipient, uint256 timestamp);
    event AccessRevoked(uint256 indexed kycId, address indexed recipient, uint256 timestamp);
    event EncryptedKeyUpdated(uint256 indexed kycId, address indexed recipient, uint256 timestamp);

    modifier onlyOwner(uint256 kycId) {
        require(users[kycId].exists, "KYC not found");
        require(users[kycId].owner == msg.sender, "Not the KYC owner");
        _;
    }

    /// @notice Register a user with encrypted data. KYC ID is generated automatically.
    function registerUser(string calldata encryptedDataHash) external returns (uint256) {
        uint256 kycId = nextKycId++;

        users[kycId] = User({
            owner: msg.sender,
            encryptedDataHash: encryptedDataHash,
            createdAt: block.timestamp,
            exists: true
        });

        emit KycRegistered(kycId, msg.sender, encryptedDataHash, block.timestamp);
        return kycId;
    }

    /// @notice Update encrypted KYC data (only by the owner)
    function updateKyc(uint256 kycId, string calldata encryptedDataHash) external onlyOwner(kycId) {
        users[kycId].encryptedDataHash = encryptedDataHash;
        emit KycUpdated(kycId, msg.sender, encryptedDataHash, block.timestamp);
    }

    /// @notice Third party requests access to user's KYC data
    function requestAccess(uint256 kycId, string calldata metadata) external returns (uint256) {
        require(users[kycId].exists, "KYC not found");
        require(thirdParties[msg.sender].exists, "Not a registered third party");

        uint256 requestId = nextRequestId++;

        accessRequests[requestId] = AccessRequest({
            requestId: requestId,
            kycId: kycId,
            requestedBy: msg.sender,
            metadata: metadata,
            timestamp: block.timestamp,
            exists: true
        });

        emit AccessRequested(requestId, kycId, msg.sender, metadata, block.timestamp);
        return requestId;
    }

    /// @notice Grant access to a third party (sends encrypted symmetric key)
    function grantAccess(uint256 kycId, address recipient, bytes calldata encryptedSymKey) external onlyOwner(kycId) {
        require(recipient != address(0), "Invalid recipient");

        if (!isAuthorized[kycId][recipient]) {
            thirdPartyAccess[recipient].push(kycId);
            userAuthorizedParties[kycId].push(recipient);
        }

        encryptedKeys[kycId][recipient] = encryptedSymKey;
        isAuthorized[kycId][recipient] = true;

        emit EncryptedKeyUpdated(kycId, recipient, block.timestamp);
        emit AccessGranted(kycId, recipient, block.timestamp);
    }

    /// @notice Revoke access from a third party
    function revokeAccess(uint256 kycId, address recipient) external onlyOwner(kycId) {
        require(isAuthorized[kycId][recipient], "Not authorized");

        delete encryptedKeys[kycId][recipient];
        isAuthorized[kycId][recipient] = false;

        emit AccessRevoked(kycId, recipient, block.timestamp);
    }

    /// @notice Update the encrypted key for an authorized third party
    function updateEncryptedKey(uint256 kycId, address recipient, bytes calldata newEncryptedSymKey) external onlyOwner(kycId) {
        require(recipient != address(0), "Invalid recipient");

        encryptedKeys[kycId][recipient] = newEncryptedSymKey;
        isAuthorized[kycId][recipient] = true;

        emit EncryptedKeyUpdated(kycId, recipient, block.timestamp);
    }

    /// @notice Get encrypted symmetric key for a recipient
    function getEncryptedSymKey(uint256 kycId, address recipient) external view returns (bytes memory) {
        return encryptedKeys[kycId][recipient];
    }

    /// @notice View KYC data (only by owner)
    function getKyc(uint256 kycId) external view onlyOwner(kycId) returns (User memory) {
        return users[kycId];
    }

    /// @notice Get access requests made for a user's KYC
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
                requests[index++] = accessRequests[i];
            }
        }

        return requests;
    }

    /// @notice Register a third-party data requester (KYC verifier)
    function registerThirdParty() external {
        require(!thirdParties[msg.sender].exists, "Already registered");

        thirdParties[msg.sender] = ThirdParty({
            owner: msg.sender,
            createdAt: block.timestamp,
            exists: true
        });
    }

    /// @notice Get list of KYC IDs a third party can access
    function getKycIdsForThirdParty(address thirdParty) external view returns (uint256[] memory) {
        return thirdPartyAccess[thirdParty];
    }

    /// @notice Get list of third parties authorized for a specific KYC ID
    function getAuthorizedThirdParties(uint256 kycId) external view returns (address[] memory) {
        return userAuthorizedParties[kycId];
    }
}
