// src/custom-elements.d.ts

// Must be a module for global augmentation to work in most setups
export {}; 

declare global {
  namespace JSX {
    // ... inside src/custom-elements.d.ts
    interface IntrinsicElements {
      // Use a known element's type definition
      'w3m-button': JSX.IntrinsicElements['button'];
    }
  }
}