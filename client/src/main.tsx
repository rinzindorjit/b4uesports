import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add debugging for main entry point
console.log('Main entry point loaded');

// Add error boundary for the entire app
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('App crashed with error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Application Error</h2>
          <p className="text-muted-foreground mb-6">
            Something went wrong. Please check the console for more details.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
if (rootElement) {
  console.log('Root element found, rendering app');
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} else {
  console.error('Root element not found');
}