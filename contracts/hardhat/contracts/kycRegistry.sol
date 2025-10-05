// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title KYCRegistry
 * @dev KYC records per fileId; minimal on-chain data (hash + CID pointer), ACL, and access events.
 */
contract KYCRegistry {
    struct Record {
        address owner;
        bytes32 kycHash;       // SHA-256 of plaintext or encrypted blob (off-chain)
        string cid;            // IPFS/Web3Storage CID or BlockDAG storage pointer of encrypted blob
        uint256 registeredAt;
        bool exists;
    }

    // recordId counter
    uint256 public recordCounter;

    // recordId => Record
    mapping(uint256 => Record) public records;

    // recordId => (grantee => bool)
    mapping(uint256 => mapping(address => bool)) public accessGranted;

    event KYCRegistered(uint256 indexed recordId, address indexed owner, bytes32 kycHash, string cid);
    event AccessGranted(uint256 indexed recordId, address indexed owner, address indexed grantee);
    event AccessRevoked(uint256 indexed recordId, address indexed owner, address indexed grantee);
    event Accessed(uint256 indexed recordId, address indexed requester, uint256 at);

    modifier onlyOwner(uint256 recordId) {
        require(records[recordId].exists, "Record not found");
        require(records[recordId].owner == msg.sender, "Not owner");
        _;
    }

    function registerKYC(bytes32 kycHash, string calldata cid) external returns (uint256) {
        recordCounter++;
        records[recordCounter] = Record({
            owner: msg.sender,
            kycHash: kycHash,
            cid: cid,
            registeredAt: block.timestamp,
            exists: true
        });

        emit KYCRegistered(recordCounter, msg.sender, kycHash, cid);
        return recordCounter;
    }

    function grantAccess(uint256 recordId, address grantee) external onlyOwner(recordId) {
        accessGranted[recordId][grantee] = true;
        emit AccessGranted(recordId, msg.sender, grantee);
    }

    function revokeAccess(uint256 recordId, address grantee) external onlyOwner(recordId) {
        accessGranted[recordId][grantee] = false;
        emit AccessRevoked(recordId, msg.sender, grantee);
    }

    // Called by a grantee to record access attempt (emits Accessed); requires they have permission (owner or granted)
    function recordAccess(uint256 recordId) external {
        require(records[recordId].exists, "Record not found");
        require(
            records[recordId].owner == msg.sender || accessGranted[recordId][msg.sender],
            "No access"
        );
        emit Accessed(recordId, msg.sender, block.timestamp);
    }

    // View helpers
    function isVerified(uint256 recordId) external view returns (bool) {
        return records[recordId].exists;
    }

    function canAccess(uint256 recordId, address user) external view returns (bool) {
        if (!records[recordId].exists) return false;
        return records[recordId].owner == user || accessGranted[recordId][user];
    }

    function getRecordMeta(uint256 recordId) external view returns (address owner, bytes32 kycHash, string memory cid, uint256 registeredAt) {
        Record memory r = records[recordId];
        require(r.exists, "Record not found");
        return (r.owner, r.kycHash, r.cid, r.registeredAt);
    }
}
