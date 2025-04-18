
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
    // Check if ClientJS exists in window
    if (typeof window.ClientJS === 'undefined') {
      // ClientJS not loaded yet
      console.warn('ClientJS not available yet');
      return null;
    }

    // Initialize ClientJS
    const clientjs = new window.ClientJS();
    libraryInstances.clientjs = clientjs;
    return clientjs;
  } catch (error) {
    console.error('Error initializing ClientJS:', error);
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
        console.warn('FingerprintJS not available:', e);
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
      if (dependency === 'clientjs' && !(await getClientJS())) {
        return { 
          value: null, 
          error: `Dependency '${dependency}' not available` 
        };
      }
      if (dependency === 'fingerprintjs' && !(await getFingerprintJS())) {
        return { 
          value: null, 
          error: `Dependency '${dependency}' not available` 
        };
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
    const result = await new Function('window', wrappedCode)(window);
    
    // Type validation based on expected type
    if (result !== null && result !== undefined) {
      const actualType = Array.isArray(result) ? 'array' : typeof result;
      if (actualType !== expectedType && 
          !(actualType === 'object' && expectedType === 'array' && Array.isArray(result))) {
        console.warn(`Type mismatch: expected ${expectedType}, got ${actualType}`);
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
