import React from 'react';

interface InputProps {
  label: string;
  name: string;
  placeholder: string;
  value: string;
  action: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

export const Input = ({
  label,
  name,
  placeholder,
  value,
  action,
  type = 'text',
}: InputProps) => (
  <div className="flex flex-col w-full">
    <label htmlFor={name} className="text-sm mb-2 text-gray-300">
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={action}
      readOnly={name === 'walletAddress'}
      className={`w-full bg-[#424242] text-white py-3 px-5 rounded-full placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#71627A] transition duration-150 ${
        name === 'walletAddress' ? 'cursor-not-allowed opacity-70' : ''
      }`}
    />
  </div>
);
