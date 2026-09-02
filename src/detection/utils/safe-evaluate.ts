import { RootDetectionFeatureSchema, DetectionFeatureSchema } from "@/detection/types/detectionSchema";
import { withTimeout } from "@/detection/utils/with-timeout";
import {
  checkDependency,
  getDependencyFunctions,
} from "./external-libraries/dependency-manager";

/** Upper bound for a single rule evaluation, including any library loading it triggers. */
const EVALUATION_TIMEOUT_MS = 15_000;

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
  outputs?: Record<string, DetectionFeatureSchema>
): ParsedValue<T> => {
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return {
      value: value as T,
      type: "null",
      isValid: true,
    };
  }

  // Get actual type
  const actualType = Array.isArray(value) ? "array" : typeof value;

  // Basic type validation
  if (
    actualType !== expectedType &&
    !(
      actualType === "object" &&
      expectedType === "array" &&
      Array.isArray(value)
    )
  ) {
    return {
      value: value as T,
      type: actualType,
      isValid: false,
      error: `Type mismatch: expected ${expectedType}, got ${actualType}`,
    };
  }

  // Handle nested objects
  if (expectedType === "object" && outputs) {
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
      type: "object",
      isValid,
      error,
    };
  }

  // Handle arrays
  if (expectedType === "array") {
    if (!Array.isArray(value)) {
      return {
        value: value as T,
        type: actualType,
        isValid: false,
        error: `Expected array, got ${actualType}`,
      };
    }

    // If we have output type information for array items
    if (outputs && Object.keys(outputs).length === 1) {
      const arrayItemType = Object.values(outputs)[0].type;
      const parsedArray = value.map((item) =>
        validateAndParseValue<unknown>(
          item as PrimitiveValue | NestedValue,
          arrayItemType,
          Object.values(outputs)[0].outputs
        )
      );

      const hasInvalidItems = parsedArray.some((item) => !item.isValid);
      if (hasInvalidItems) {
        return {
          value: value as T,
          type: "array",
          isValid: false,
          error: "One or more array items have invalid types",
        };
      }

      return {
        value: parsedArray.map((item) => item.value) as T,
        type: "array",
        isValid: true,
      };
    }
  }

  return {
    value: value as T,
    type: actualType,
    isValid: true,
  };
};

/**
 * Evaluates a rule's `code` with the library getters in scope, bounded by a
 * timeout, and validates the result against the rule's declared outputs.
 *
 * Note: this is `new Function`, not a sandbox. Rules are trusted build-time
 * assets and have full access to the page.
 */
export const safeEvaluate = async <T>(
  rootDetectionFeature: RootDetectionFeatureSchema
): Promise<{
  value: T | null;
  error?: string;
  parsedValue?: ParsedValue<T>;
}> => {
  try {
    // Check for dependencies first
    if (rootDetectionFeature.dependency) {
      const { available, error } = await withTimeout(
        checkDependency(rootDetectionFeature.dependency),
        EVALUATION_TIMEOUT_MS,
        `Loading '${rootDetectionFeature.dependency}'`
      );
      if (!available) {
        return { value: null, error };
      }
    }

    if (typeof rootDetectionFeature.code !== "string" || !rootDetectionFeature.code.trim()) {
      return { value: null, error: "Rule has no code to evaluate" };
    }

    const { getClientJS, getFingerprintJS, getDeviceDetector } =
      getDependencyFunctions();

    // Create an async wrapper function to evaluate the code
    const wrappedCode = `
      async function evaluateFeature() {
        const fn = ${rootDetectionFeature.code};
        return typeof fn === 'function' ? await fn() : fn;
      }
      return evaluateFeature();
    `;

    const result = await withTimeout(
      new Function(
        "getClientJS",
        "getFingerprintJS",
        "getDeviceDetector",
        wrappedCode
      )(getClientJS, getFingerprintJS, getDeviceDetector) as Promise<
        PrimitiveValue | NestedValue
      >,
      EVALUATION_TIMEOUT_MS,
      `Evaluating '${rootDetectionFeature.featureKey}'`
    );

    // Validate and parse the result
    const parsedValue = validateAndParseValue<T>(
      result,
      rootDetectionFeature.type,
      rootDetectionFeature.outputs
    );

    if (!parsedValue.isValid) {
      return {
        value: null,
        error: parsedValue.error,
        parsedValue,
      };
    }

    return {
      value: result as T,
      parsedValue,
    };
  } catch (error) {
    console.error(`Feature evaluation error (${rootDetectionFeature.featureKey}):`, error);
    return {
      value: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
