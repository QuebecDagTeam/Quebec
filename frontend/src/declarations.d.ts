// src/custom-elements.d.ts
import React from 'react';

// Add this line to ensure the file is treated as a module
export {}; 

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}