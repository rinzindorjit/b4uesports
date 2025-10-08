import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Waits for the Pi SDK to be loaded and available on the window object
 * @param timeoutMs Maximum time to wait for the SDK to load (default: 45000ms for better mobile support)
 * @returns Promise that resolves when Pi SDK is available
 */
export function waitForPiSDK(timeoutMs: number = 45000): Promise<void> {
  return new Promise((resolve, reject) => {
    // If Pi SDK is already loaded, resolve immediately
    if (typeof window !== 'undefined' && window.Pi) {
      console.log('Pi SDK already loaded');
      resolve();
      return;
    }

    // Set up a timeout to reject the promise if SDK doesn't load in time
    const timeout = setTimeout(() => {
      console.error(`Pi SDK failed to load within ${timeoutMs}ms`);
      reject(new Error(`Pi SDK failed to load within ${timeoutMs}ms. Please make sure you are using the Pi Browser and refresh the page. On mobile, check for notification banners and ensure you have a stable internet connection.`));
    }, timeoutMs);

    // Poll for Pi SDK availability with adaptive polling intervals
    let pollInterval = 300; // Start with 300ms
    const maxInterval = 1000; // Max interval of 1 second
    let intervalId: NodeJS.Timeout;
    
    const startPolling = () => {
      intervalId = setInterval(() => {
        if (typeof window !== 'undefined' && window.Pi) {
          console.log('Pi SDK loaded successfully');
          clearTimeout(timeout);
          clearInterval(intervalId);
          resolve();
        }
        
        // Gradually increase polling interval to reduce CPU usage
        if (pollInterval < maxInterval) {
          pollInterval += 100;
          clearInterval(intervalId);
          startPolling(); // Restart with new polling rate
        }
      }, pollInterval);
    };
    
    startPolling();
  });
}