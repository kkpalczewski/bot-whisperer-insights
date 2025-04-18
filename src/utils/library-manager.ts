
import { toast } from 'sonner';

// Global store for library instances
interface LibraryStore {
  clientjs?: any;
  fingerprintjs?: any;
  creepjs?: any;
}

// Store instances to avoid recreating them
const libraryInstances: LibraryStore = {};

/**
 * Gets or initializes a ClientJS instance
 */
export const getClientJS = async (): Promise<any> => {
  if (libraryInstances.clientjs) {
    return libraryInstances.clientjs;
  }

  try {
    // First try to load ClientJS from npm
    try {
      const ClientJS = await import('clientjs').then(m => m.default || m);
      if (typeof ClientJS === 'function') {
        const clientjs = new ClientJS();
        libraryInstances.clientjs = clientjs;
        return clientjs;
      }
    } catch (e) {
      console.warn('Failed to load ClientJS from import:', e);
      // Continue to try alternative methods
    }

    // Try to access the global ClientJS
    if (typeof window.ClientJS === 'function') {
      const clientjs = new window.ClientJS();
      libraryInstances.clientjs = clientjs;
      return clientjs;
    }

    // If we couldn't load ClientJS, create a script tag to load it
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/clientjs/dist/client.min.js';
      script.async = true;
      script.onload = () => {
        if (typeof window.ClientJS === 'function') {
          const clientjs = new window.ClientJS();
          libraryInstances.clientjs = clientjs;
          resolve(clientjs);
        } else {
          const error = new Error('ClientJS loaded but ClientJS constructor not found');
          console.error(error);
          reject(error);
        }
      };
      script.onerror = (e) => {
        console.error('Failed to load ClientJS from CDN:', e);
        reject(new Error('Failed to load ClientJS library from CDN'));
      };
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('Error initializing ClientJS:', error);
    toast.error('Failed to initialize ClientJS library');
    return null;
  }
};

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
      // Try to load from npm package
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

/**
 * Safe evaluation function with proper error handling and type validation
 */
export const safeEvaluate = async <T>(
  code: string, 
  expectedType: string,
  dependency?: string
): Promise<{ value: T | null; error?: string }> => {
  try {
    // Check for dependencies first
    if (dependency) {
      if (dependency === 'clientjs') {
        const client = await getClientJS();
        if (!client) {
          return { 
            value: null, 
            error: `Dependency '${dependency}' not available` 
          };
        }
      }
      if (dependency === 'fingerprintjs') {
        const fp = await getFingerprintJS();
        if (!fp) {
          return { 
            value: null, 
            error: `Dependency '${dependency}' not available` 
          };
        }
      }
    }

    // Replace library references in the code with our safe instances
    let modifiedCode = code;
    if (dependency === 'clientjs') {
      modifiedCode = modifiedCode.replace(
        /new ClientJS\(\)/g, 
        'await window.libraryManager.getClientJS()'
      );
    }
    if (dependency === 'fingerprintjs') {
      modifiedCode = modifiedCode.replace(
        /FingerprintJS\.load\(\)/g, 
        'await window.libraryManager.getFingerprintJS()'
      );
    }

    // Create a safe async wrapper function to evaluate the code
    const wrappedCode = `
      async function evaluateFeature() {
        try {
          return ${modifiedCode};
        } catch (e) {
          console.error("Error evaluating feature code:", e);
          throw e;
        }
      }
      return evaluateFeature();
    `;

    // Execute the wrapped code
    const result = await Function('window', wrappedCode)(window);
    
    // Type validation based on expected type
    if (result !== null && result !== undefined) {
      const actualType = Array.isArray(result) ? 'array' : typeof result;
      if (actualType !== expectedType && 
          !(actualType === 'object' && expectedType === 'array' && Array.isArray(result))) {
        console.warn(`Type mismatch: expected ${expectedType}, got ${actualType}`);
        // Return undefined instead of wrong type
        return { value: null, error: `Type mismatch: expected ${expectedType}, got ${actualType}` };
      }
    }

    return { value: result };
  } catch (error) {
    console.error("Feature evaluation error:", error);
    return { 
      value: null, 
      error: (error as Error).message || 'Unknown error' 
    };
  }
};

// Make library manager available globally for feature code execution
if (typeof window !== 'undefined') {
  (window as any).libraryManager = {
    getClientJS,
    getFingerprintJS
  };
}
