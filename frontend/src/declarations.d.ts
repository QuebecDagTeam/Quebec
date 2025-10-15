// Allow custom element 'w3m-button' in JSX
declare namespace JSX {
  interface IntrinsicElements {
    'w3m-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}
