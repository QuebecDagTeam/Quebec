import React, { useState } from 'react';
import axios from 'axios';

type AccessAction = 'grant' | 'revoke';

const GrantRevokeAccess: React.FC = () => {
  const [uniqueId, setUniqueId] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');
  const [ownerAddress, setOwnerAddress] = useState<string>('');
  const [action, setAction] = useState<AccessAction>('grant');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const apiUrl = action === 'grant' ? '/api/grantAccess' : '/api/revokeAccess';
    
    try {
      const response = await axios.post(apiUrl, {
        uniqueId,
        recipient,
        txHash,
        ownerAddress,
      });

      setMessage(response.data.success ? 'Success!' : 'Error: Could not process the request');
    } catch (err) {
    //   setMessage('Error: ' + (err.response?.data?.error || 'Something went wrong.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>{action === 'grant' ? 'Grant Access' : 'Revoke Access'}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Unique ID:</label>
          <input
            type="text"
            value={uniqueId}
            onChange={(e) => setUniqueId(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Recipient Address:</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Transaction Hash:</label>
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Owner Address:</label>
          <input
            type="text"
            value={ownerAddress}
            onChange={(e) => setOwnerAddress(e.target.value)}
            required
          />
        </div>

        <div>
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : action === 'grant' ? 'Grant Access' : 'Revoke Access'}
          </button>
        </div>
      </form>

      {message && <p>{message}</p>}

      <div>
        <button onClick={() => setAction(action === 'grant' ? 'revoke' : 'grant')}>
          Switch to {action === 'grant' ? 'Revoke' : 'Grant'} Access
        </button>
      </div>
    </div>
  );
};

export default GrantRevokeAccess;
