import { createRoot } from "react-dom/client";
import TestComponent from "./test-component";

// Add debugging logs
console.log("Starting Test React application initialization...");

try {
  console.log("Looking for root element...");
  const rootElement = document.getElementById("root");
  console.log("Root element found:", rootElement);
  
  if (!rootElement) {
    throw new Error("Failed to find the root element. Make sure there is a div with id 'root' in your HTML.");
  }
  
  console.log("Creating React root...");
  const root = createRoot(rootElement);
  console.log("Rendering TestComponent...");
  root.render(<TestComponent />);
  console.log("TestComponent rendered successfully!");
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