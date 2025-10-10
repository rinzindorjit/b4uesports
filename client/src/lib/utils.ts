import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if we're running in the Pi Browser
 * @returns boolean indicating if we're in Pi Browser
 */
export function isPiBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for Pi Browser user agent
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  if (userAgent && (userAgent.indexOf('PiBrowser') !== -1 || userAgent.indexOf('Pi Browser') !== -1)) {
    return true;
  }
  
  // Check for Pi object on window
  if (window.Pi) {
    return true;
  }
  
  return false;
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

/**
 * Dynamically loads the Pi SDK if it's not already loaded
 * @returns Promise that resolves when Pi SDK is available
 */
export async function loadPiSDK(): Promise<void> {
  // If Pi SDK is already loaded, return immediately
  if (typeof window !== 'undefined' && window.Pi) {
    return Promise.resolve();
  }

  // If we're not in a browser environment, reject
  if (typeof window === 'undefined') {
    throw new Error('Pi SDK can only be loaded in a browser environment');
  }

  return new Promise((resolve, reject) => {
    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src="https://sdk.minepi.com/pi-sdk.js"]');
    if (existingScript) {
      // Script is already in the DOM, wait for it to load
      if (existingScript.hasAttribute('data-loaded')) {
        console.log('Pi SDK script already loaded from existing element');
        resolve();
        return;
      }
      
      existingScript.addEventListener('load', () => {
        existingScript.setAttribute('data-loaded', 'true');
        console.log('Pi SDK script loaded from existing element');
        resolve();
      });
      existingScript.addEventListener('error', (error) => {
        console.error('Pi SDK script failed to load from existing element:', error);
        reject(new Error('Pi SDK script failed to load'));
      });
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.async = true;
    script.onload = () => {
      script.setAttribute('data-loaded', 'true');
      console.log('Pi SDK script loaded successfully');
      resolve();
    };
    script.onerror = (error) => {
      console.error('Pi SDK script failed to load:', error);
      reject(new Error('Failed to load Pi SDK. Please check your internet connection and try again.'));
    };
    document.head.appendChild(script);
  });
}