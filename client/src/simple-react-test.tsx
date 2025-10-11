// Temporary simple react test file to prevent Vercel build errors
// This file will be removed once we identify the root cause

import React from 'react';
import ReactDOM from 'react-dom/client';

const SimpleReactTest = () => {
  return (
    <div>
      <h1>Simple React Test</h1>
      <p>This is a simple test page for the B4U Esports application.</p>
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <SimpleReactTest />
  </React.StrictMode>
);

export default SimpleReactTest;