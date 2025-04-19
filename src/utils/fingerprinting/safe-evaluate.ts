
import { getClientJS } from './clientjs-manager';
import { getFingerprintJS } from './fingerprintjs-manager';
import { getCreepJS } from './creepjs-manager';

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
      if (dependency === 'creepjs') {
        const creep = await getCreepJS();
        if (!creep) {
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
        'await getClientJS()'
      );
    }
    if (dependency === 'fingerprintjs') {
      modifiedCode = modifiedCode.replace(
        /FingerprintJS\.load\(\)/g, 
        'await getFingerprintJS()'
      );
    }
    if (dependency === 'creepjs') {
      modifiedCode = modifiedCode.replace(
        /CreepJS/g, 
        'await getCreepJS()'
      );
    }

    // Create a safe async wrapper function to evaluate the code
    const wrappedCode = `
      async function evaluateFeature() {
        try {
          // Make library functions available within the evaluated code
          const getClientJS = ${getClientJS.toString()};
          const getFingerprintJS = ${getFingerprintJS.toString()};
          const getCreepJS = ${getCreepJS.toString()};
          
          // Define libraryManager so it's available within the code
          const libraryManager = {
            getClientJS,
            getFingerprintJS,
            getCreepJS
          };
          
          const fn = ${modifiedCode};
          return typeof fn === 'function' ? await fn() : fn;
        } catch (e) {
          console.error("Error evaluating feature code:", e);
          throw e;
        }
      }
      return evaluateFeature();
    `;

    // Fix: Don't pass window as a parameter to Function constructor
    const evalFunction = new Function(wrappedCode);
    const result = await evalFunction();
    
    // Type validation based on expected type
    if (result !== null && result !== undefined) {
      const actualType = Array.isArray(result) ? 'array' : typeof result;
      if (actualType !== expectedType && 
          !(actualType === 'object' && expectedType === 'array' && Array.isArray(result))) {
        console.warn(`Type mismatch: expected ${expectedType}, got ${actualType}`);
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
