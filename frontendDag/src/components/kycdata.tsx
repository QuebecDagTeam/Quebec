import React, { useState, useEffect } from 'react';

// Define types for the decrypted data
interface KYCData {
  fullName: string;
  email: string;
  dob: string;
  govIdType: string;
  NIN: string;
  phone: string;
  walletAddress: string;
  residentialAddress: string;
}

interface APIResponse {
  encryptedData: string;
  [key: string]: any;
}

const KYCComponent: React.FC<{ userAddress: string }> = ({ userAddress }) => {
  const [decryptedData, setDecryptedData] = useState<KYCData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKYCData = async () => {
      try {
        const response = await fetch(`https://quebec-ur3w.onrender.com/api/kyc/user/${userAddress}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch KYC data');
        }

        const data: APIResponse = await response.json();
        
        // Decrypt the data
        const decrypted = decryptData(data.encryptedData);

        setDecryptedData(decrypted);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchKYCData();
  }, [userAddress]);

  // Dummy decrypt function - replace with actual decryption logic
  const decryptData = (encryptedData: string): KYCData => {
    // Example: Assuming decryption returns an object like this
    // Replace with your actual decryption logic
    return {
      fullName: '',
      email: '',
      dob: '',
      govIdType: '',
      NIN: '',
      phone: '',
      walletAddress: '',
      residentialAddress: '',
    };
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h3>KYC Information</h3>
      <p><strong>Full Name:</strong> {decryptedData?.fullName}</p>
      <p><strong>Email:</strong> {decryptedData?.email}</p>
      <p><strong>Date of Birth:</strong> {decryptedData?.dob}</p>
      <p><strong>Gov ID Type:</strong> {decryptedData?.govIdType}</p>
      <p><strong>NIN:</strong> {decryptedData?.NIN}</p>
      <p><strong>Phone:</strong> {decryptedData?.phone}</p>
      <p><strong>Wallet Address:</strong> {decryptedData?.walletAddress}</p>
      <p><strong>Residential Address:</strong> {decryptedData?.residentialAddress}</p>
    </div>
  );
};

export default KYCComponent;
