import React, { useState } from 'react';

interface KYCData {
  fullName: string;
  email: string;
  idNumber: string;
  image: File | null;
}

export default function KYCForm() {
  const [formData, setFormData] = useState<KYCData>({
    fullName: '',
    email: '',
    idNumber: '',
    image: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('email', formData.email);
    data.append('idNumber', formData.idNumber);
    if (formData.image) data.append('image', formData.image);

    try {
    //   await fetch(`/kyc/register`, 
    //     method:"POST",
    //     {
    //     headers: { 'Content-Type': 'multipart/form-data' },
    //     body: data, 
    //   });
      alert('KYC submitted successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit KYC');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">KYC Registration</h2>

      <input
        type="text"
        name="fullName"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
        required
      />

      <input
        type="text"
        name="idNumber"
        placeholder="National ID Number"
        value={formData.idNumber}
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
        required
      />

      <input
        type="file"
        name="image"
        accept="image/*"
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Submit KYC
      </button>
    </form>
  );
}
