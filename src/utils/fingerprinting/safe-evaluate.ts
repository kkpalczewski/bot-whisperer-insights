
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

    // Create a function that will be available inside evaluation scope
    const getClientJSFn = async () => await getClientJS();
    const getFingerprintJSFn = async () => await getFingerprintJS();
    const getCreepJSFn = async () => await getCreepJS();

    // Create a safe async wrapper function to evaluate the code
    const wrappedCode = `
      async function evaluateFeature() {
        try {
          const fn = ${code};
          return typeof fn === 'function' ? await fn() : fn;
        } catch (e) {
          console.error("Error evaluating feature code:", e);
          throw e;
        }
      }
      return evaluateFeature();
    `;

    // Execute the wrapped code with access to the library functions
    const result = await new Function('getClientJS', 'getFingerprintJS', 'getCreepJS', wrappedCode)(
      getClientJSFn,
      getFingerprintJSFn,
      getCreepJSFn
    );
    
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
