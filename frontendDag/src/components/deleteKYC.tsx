import React, { useState } from 'react';

interface KYCDeleteProps {
  walletAddress: string;
}

const KYCDelete: React.FC<KYCDeleteProps> = ({ walletAddress }) => {
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = async () => {
    setLoading(true);
    setStatusMessage('');
    
    try {
      const response = await fetch(`https://quebec-ur3w.onrender.com/api/kyc/delete-user/${walletAddress}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setStatusMessage('KYC data successfully deleted!');
      } else {
        setStatusMessage(result.message || 'Failed to delete KYC data');
      }
    } catch (error: any) {
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Delete KYC Data</h3>
      <p>Are you sure you want to delete KYC data for wallet address: <strong>{walletAddress}</strong>?</p>
      
      <button onClick={handleDelete} disabled={loading}>
        {loading ? 'Deleting...' : 'Delete KYC Data'}
      </button>

      {statusMessage && (
        <p>{statusMessage}</p>
      )}
    </div>
  );
};

export default KYCDelete;
