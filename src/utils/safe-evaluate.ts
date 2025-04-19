import { FeatureValue } from '@/config/detectionFeatures';
import { checkDependency, getDependencyFunctions, LibraryDependency } from './external-libraries/dependency-manager';

interface ParsedValue<T> {
  value: T;
  type: string;
  isValid: boolean;
  error?: string;
}

type PrimitiveValue = string | number | boolean | null | undefined;
type NestedValue = Record<string, unknown> | unknown[];

/**
 * Validates and parses a value according to the expected type structure
 */
const validateAndParseValue = <T>(
  value: PrimitiveValue | NestedValue,
  expectedType: string,
  outputs?: Record<string, FeatureValue>
): ParsedValue<T> => {
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return {
      value: value as T,
      type: 'null',
      isValid: true
    };
  }

  // Get actual type
  const actualType = Array.isArray(value) ? 'array' : typeof value;

  // Basic type validation
  if (actualType !== expectedType && 
      !(actualType === 'object' && expectedType === 'array' && Array.isArray(value))) {
    return {
      value: value as T,
      type: actualType,
      isValid: false,
      error: `Type mismatch: expected ${expectedType}, got ${actualType}`
    };
  }

  // Handle nested objects
  if (expectedType === 'object' && outputs) {
    const parsedObject: Record<string, unknown> = {};
    let isValid = true;
    let error: string | undefined;

    for (const [key, output] of Object.entries(outputs)) {
      const nestedValue = (value as Record<string, unknown>)[key];
      if (nestedValue !== undefined) {
        const nestedResult = validateAndParseValue<unknown>(
          nestedValue as PrimitiveValue | NestedValue,
          output.type,
          output.outputs
        );
        
        if (!nestedResult.isValid) {
          isValid = false;
          error = `Invalid nested value at '${key}': ${nestedResult.error}`;
        }
        
        parsedObject[key] = nestedResult.value;
      }
    }

    return {
      value: parsedObject as T,
      type: 'object',
      isValid,
      error
    };
  }

  // Handle arrays
  if (expectedType === 'array') {
    if (!Array.isArray(value)) {
      return {
        value: value as T,
        type: actualType,
        isValid: false,
        error: `Expected array, got ${actualType}`
      };
    }

    // If we have output type information for array items
    if (outputs && Object.keys(outputs).length === 1) {
      const arrayItemType = Object.values(outputs)[0].type;
      const parsedArray = value.map(item => 
        validateAndParseValue<unknown>(
          item as PrimitiveValue | NestedValue,
          arrayItemType,
          Object.values(outputs)[0].outputs
        )
      );

      const hasInvalidItems = parsedArray.some(item => !item.isValid);
      if (hasInvalidItems) {
        return {
          value: value as T,
          type: 'array',
          isValid: false,
          error: 'One or more array items have invalid types'
        };
      }

      return {
        value: parsedArray.map(item => item.value) as T,
        type: 'array',
        isValid: true
      };
    }
  }

  // Handle primitive types
  try {
    switch (expectedType) {
      case 'number':
        return {
          value: Number(value) as T,
          type: 'number',
          isValid: !isNaN(Number(value))
        };
      case 'boolean':
        return {
          value: Boolean(value) as T,
          type: 'boolean',
          isValid: true
        };
      case 'string':
        return {
          value: String(value) as T,
          type: 'string',
          isValid: true
        };
      default:
        return {
          value: value as T,
          type: actualType,
          isValid: true
        };
    }
  } catch (e) {
    return {
      value: value as T,
      type: actualType,
      isValid: false,
      error: `Failed to parse value as ${expectedType}: ${(e as Error).message}`
    };
  }
};

/**
 * Safe evaluation function with proper error handling and type validation
 */
export const safeEvaluate = async <T>(
  code: string, 
  expectedType: string,
  dependency?: LibraryDependency,
  outputs?: Record<string, FeatureValue>
): Promise<{ value: T | null; error?: string; parsedValue?: ParsedValue<T> }> => {
  try {
    // Check for dependencies first
    if (dependency) {
      const { available, error } = await checkDependency(dependency);
      if (!available) {
        return { value: null, error };
      }
    }

    // Get functions for library access
    const { getClientJS, getFingerprintJS, getCreepJS } = getDependencyFunctions();

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
      getClientJS,
      getFingerprintJS,
      getCreepJS
    );
    
    // Validate and parse the result
    const parsedValue = validateAndParseValue<T>(result, expectedType, outputs);
    
    if (!parsedValue.isValid) {
      return { 
        value: null, 
        error: parsedValue.error,
        parsedValue
      };
    }

    return { 
      value: result,
      parsedValue
    };
  } catch (error) {
    console.error("Feature evaluation error:", error);
    return { 
      value: null, 
      error: (error as Error).message || 'Unknown error' 
    };
  }
};
