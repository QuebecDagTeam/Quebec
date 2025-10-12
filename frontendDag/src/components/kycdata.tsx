import React, { useState, useEffect } from 'react';
import { decryptData } from './encrypt';
import { Input } from './input';

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

const KYCComponent: React.FC<{ userAddress: string }> = ({ userAddress }) => {
  const [Data, setDecryptedData] = useState<KYCData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKYCData = async () => {
      try {
        const response = await fetch(`https://quebec-ur3w.onrender.com/api/kyc/user/${userAddress}`);

        if (!response.ok) {
          throw new Error('Failed to fetch KYC data');
        }

        const data = await response.json();

        // Decrypt the data
        const decrypted = decryptData(data.kycDetails.encryptedData);
        console.log("Decrypted Data:", decrypted);

        setDecryptedData(decrypted);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchKYCData();
  }, [userAddress]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h3 className="font-semibold mb-4">Stored KYC Data</h3>
      <div className="space-y-4">
        {/* Full Name */}
        <Input 
          label="Full Name" 
          value={Data?.fullName || ''} 
          name="fullName" 
          placeholder=''
          action={() => {}} 
        />
        
        {/* Date of Birth */}
        <Input 
         placeholder=''
          label="Date of Birth" 
          value={Data?.dob || ''} 
          name="dob" 
          action={() => {}} 
        />
        
        {/* Government ID Type */}
        <Input 
          label="Government ID Type" 
          value={Data?.govIdType || ''} 
            placeholder=''
          name="govIdType" 
          action={() => {}} 
        />

        {/* Email */}
        <Input 
          label="Email" 
                    placeholder=''
          value={Data?.email || ''} 
          name="email" 
          action={() => {}} 
        />

        {/* NIN */}
        <Input 
          label="NIN" 
          value={Data?.NIN || ''} 
            placeholder=''
          name="NIN" 
          action={() => {}} 
        />

        {/* Phone */}
        <Input 
          label="Phone" 
          value={Data?.phone || ''} 
            placeholder=''
          name="phone" 
          action={() => {}} 
        />

        {/* Wallet Address */}
        <Input 
          label="Wallet Address" 
          value={Data?.walletAddress || ''} 
          name="walletAddress" 
          placeholder=''
          action={() => {}} 
        />

        {/* Residential Address */}
        <Input 
          label="Residential Address" 
          value={Data?.residentialAddress || ''} 
          name="residentialAddress" 
          placeholder=''
          action={() => {}} 
        />
      </div>
    </div>
  );
};

export default KYCComponent;
