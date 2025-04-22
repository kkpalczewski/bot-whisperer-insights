
import { toast } from 'sonner';
import { libraryInstances } from './types';

/**
 * Gets or initializes a FingerprintJS instance
 */
export const getFingerprintJS = async (): Promise<any> => {
  if (libraryInstances.fingerprintjs) {
    return libraryInstances.fingerprintjs;
  }

  try {
    // Check if FingerprintJS exists in window
    if (typeof window.FingerprintJS === 'undefined') {
      try {
        const fpjs = await import('@fingerprintjs/fingerprintjs');
        const fpPromise = fpjs.load();
        const fp = await fpPromise;
        libraryInstances.fingerprintjs = fp;
        return fp;
      } catch (e) {
        console.error('Failed to load FingerprintJS:', e);
        toast.error('Failed to load FingerprintJS library');
        return null;
      }
    } else {
      // Use window.FingerprintJS
      const fp = await window.FingerprintJS.load();
      libraryInstances.fingerprintjs = fp;
      return fp;
    }
  } catch (error) {
    console.error('Error initializing FingerprintJS:', error);
    return null;
  }
};
