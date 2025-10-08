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
  
  // Check for Pi Browser user agent (more comprehensive check)
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  if (userAgent) {
    const lowerUserAgent = userAgent.toLowerCase();
    if (lowerUserAgent.includes('pi') && 
        (lowerUserAgent.includes('browser') || 
         lowerUserAgent.includes('minepi'))) {
      return true;
    }
  }
  
  // Check for Pi object on window
  if (window.Pi) {
    return true;
  }
  
  // Additional check for Pi Browser environment
  try {
    // Check for specific Pi Browser properties
    if ((window as any).PiBrowser || (window as any).minePi) {
      return true;
    }
  } catch (e) {
    // Ignore errors
  }
  
  return false;
}

/**
 * Waits for the Pi SDK to be loaded and available on the window object
 * @param timeoutMs Maximum time to wait for the SDK to load (default: 30000ms)
 * @returns Promise that resolves when Pi SDK is available
 */
export function waitForPiSDK(timeoutMs: number = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    // If Pi SDK is already loaded, resolve immediately
    if (typeof window !== 'undefined' && window.Pi && typeof window.Pi.init === 'function') {
      console.log('Pi SDK already loaded and ready');
      resolve();
      return;
    }

    // Set up a timeout to reject the promise if SDK doesn't load in time
    const timeout = setTimeout(() => {
      console.error(`Pi SDK failed to load within ${timeoutMs}ms`);
      reject(new Error(`Pi SDK failed to load within ${timeoutMs}ms. Please make sure you are using the Pi Browser app, have a stable internet connection, and refresh the page.`));
    }, timeoutMs);

    // Poll for Pi SDK availability with adaptive polling intervals
    let pollInterval = 200; // Start with 200ms
    const maxInterval = 1000; // Max interval of 1 second
    let intervalId: NodeJS.Timeout;
    
    const startPolling = () => {
      intervalId = setInterval(() => {
        // Check if Pi SDK is available and has the required functions
        if (typeof window !== 'undefined' && window.Pi && typeof window.Pi.init === 'function') {
          console.log('Pi SDK loaded and ready');
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
    
    // Start polling immediately
    startPolling();
  });
}

/**
 * Dynamically loads the Pi SDK if it's not already loaded
 * @returns Promise that resolves when Pi SDK is available
 */
export async function loadPiSDK(): Promise<void> {
  // If we're not in a browser environment, reject
  if (typeof window === 'undefined') {
    throw new Error('Pi SDK can only be loaded in a browser environment');
  }

  // If Pi SDK is already loaded and has the init function, return immediately
  if (window.Pi && typeof window.Pi.init === 'function') {
    console.log('Pi SDK already loaded and initialized');
    return Promise.resolve();
  }

  // Check if we're in Pi Browser - if not, don't try to load SDK
  if (!isPiBrowser()) {
    console.warn('Not running in Pi Browser - skipping SDK load');
    throw new Error('Please open this app in the Pi Browser app for authentication to work properly.');
  }

  return new Promise((resolve, reject) => {
    // Check if script is already being loaded or exists in the DOM
    const existingScript = document.querySelector('script[src*="pi-sdk.js"]');
    if (existingScript) {
      console.log('Pi SDK script already exists in DOM');
      
      // If script is already loaded and marked as loaded, resolve immediately
      if (existingScript.hasAttribute('data-loaded')) {
        console.log('Pi SDK script already loaded');
        resolve();
        return;
      }
      
      // Script is in DOM but not yet loaded, wait for it
      existingScript.addEventListener('load', () => {
        console.log('Pi SDK script loaded from existing element');
        (existingScript as HTMLScriptElement).setAttribute('data-loaded', 'true');
        resolve();
      });
      
      existingScript.addEventListener('error', (error) => {
        console.error('Pi SDK script failed to load from existing element:', error);
        reject(new Error('Pi SDK script failed to load. Please check your internet connection and make sure you are using the Pi Browser app.'));
      });
      
      return;
    }

    // Create and load the script
    console.log('Creating and loading Pi SDK script');
    const script = document.createElement('script');
    script.src = 'https://sdk.minepi.com/pi-sdk.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Pi SDK script loaded successfully');
      script.setAttribute('data-loaded', 'true');
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('Pi SDK script failed to load:', error);
      reject(new Error('Failed to load Pi SDK. Please check your internet connection and make sure you are using the Pi Browser app.'));
    };
    
    document.head.appendChild(script);
  });
}