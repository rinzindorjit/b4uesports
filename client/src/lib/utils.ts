import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Waits for the Pi SDK to be loaded and available on the window object
 * @param timeoutMs Maximum time to wait for the SDK to load (default: 5000ms)
 * @returns Promise that resolves when Pi SDK is available
 */
export function waitForPiSDK(timeoutMs: number = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    // If Pi SDK is already loaded, resolve immediately
    if (typeof window !== 'undefined' && window.Pi) {
      resolve();
      return;
    }

    // Set up a timeout to reject the promise if SDK doesn't load in time
    const timeout = setTimeout(() => {
      reject(new Error(`Pi SDK failed to load within ${timeoutMs}ms. Please make sure you are using the Pi Browser and refresh the page.`));
    }, timeoutMs);

    // Poll for Pi SDK availability
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.Pi) {
        clearTimeout(timeout);
        clearInterval(interval);
        resolve();
      }
    }, 200); // Check more frequently for better responsiveness
  });
}