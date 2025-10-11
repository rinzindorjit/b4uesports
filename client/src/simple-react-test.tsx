import { createRoot } from "react-dom/client";
import { useState } from "react";

function SimpleComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', textAlign: 'center' }}>
      <h1>Simple React Test</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

// Add debugging logs
console.log("Starting Simple React application initialization...");

// Add a global error handler
window.addEventListener('error', (event) => {
  console.error('Global error handler:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Add error handling
try {
  console.log("Looking for root element...");
  const rootElement = document.getElementById("root");
  console.log("Root element found:", rootElement);
  
  if (!rootElement) {
    throw new Error("Failed to find the root element. Make sure there is a div with id 'root' in your HTML.");
  }
  
  console.log("Creating React root...");
  const root = createRoot(rootElement);
  console.log("Rendering SimpleComponent...");
  root.render(<SimpleComponent />);
  console.log("SimpleComponent rendered successfully!");
} catch (error) {
  console.error("Failed to render React app:", error);
  
  // Create a simple error display
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background-color: #fee; border: 1px solid #fcc; color: #c33;">
        <h2 style="margin-top: 0;">Failed to load the application</h2>
        <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p>Please check the browser console for more details.</p>
      </div>
    `;
  }
}