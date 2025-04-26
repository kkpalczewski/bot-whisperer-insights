import { LibraryDependency } from '../utils/external-libraries/types';

/**
 * Base feature structure that defines the common properties for all detection features.
 * This interface serves as the foundation for both root and nested features.
 */

export interface FeatureValue {
  value: string | boolean | number | object | Array<unknown>;
  error?: string;
}

export interface BaseDetectionFeatureSchema {
  /**
   * The complete path to the feature in dot notation.
   * Example: "browser.features.webGL" for a nested feature
   * Example: "browser" for a root feature
   * 
   * Best practices:
   * - Use lowercase with dots as separators
   * - Keep paths concise but descriptive
   * - Use consistent naming conventions
   */
  fullKey: string;

  /**
   * The key of the parent feature, or empty string for root features.
   * Example: "browser.features" for a feature with key "webGL"
   * 
   * Best practices:
   * - Empty string for root features
   * - Full path of parent for nested features
   */
  parentKey?: string;

  /**
   * The feature's own identifier, without the parent path.
   * Example: "webGL" for a feature with fullKey "browser.features.webGL"
   * 
   * Best practices:
   * - Use camelCase for single words
   * - Use descriptive names that reflect the feature's purpose
   * - Avoid special characters except underscores
   */
  featureKey: string;

  /**
   * Human-readable name of the feature.
   * Example: "WebGL Support" for a feature with key "webGL"
   * 
   * Best practices:
   * - Use proper capitalization
   * - Be descriptive but concise
   * - Use consistent naming patterns
   */
  name: string;

  /**
   * The data type of the feature's value.
   * 
   * Best practices:
   * - Use "string" for text values
   * - Use "number" for numeric values
   * - Use "boolean" for true/false values
   * - Use "array" for lists of values
   * - Use "object" for nested structures
   */
  type: "string" | "number" | "array" | "object" | "boolean";

  /**
   * Detailed description of what the feature represents and how it's detected.
   * 
   * Best practices:
   * - Be clear and concise
   * - Explain the purpose and detection method
   * - Include any relevant technical details
   * - Use proper grammar and punctuation
   */
  description: string;

  /**
   * Information about potential bot/automation detection.
   * 
   * Best practices:
   * - Be specific about what constitutes suspicious behavior
   * - Include clear indicators of automation
   * - Keep descriptions factual and objective
   */
  abuseIndication: {
    /**
     * Description of how this feature can indicate bot/automation.
     * 
     * Best practices:
     * - Be specific about the suspicious pattern
     * - Include clear indicators
     * - Avoid false positives
     */
    bot: string;
  };

  /**
   * Example values that demonstrate typical or expected values.
   * 
   * Best practices:
   * - Include both legitimate and suspicious values
   * - Provide a range of examples
   * - Keep examples realistic and relevant
   */
  exemplaryValues: Array<string | boolean | number | object | Array<unknown>>;

  /**
   * Indicates whether this is a leaf node (end node) in the feature tree.
   * 
   * Best practices:
   * - Set to true for features without outputs
   * - Set to false for features with outputs
   * - This is automatically determined by the presence of outputs
   */
  isLeaf: boolean;

  rootKey: string | undefined;
  level: number;
}

/**
 * Feature value interface for nested nodes.
 * This is a discriminated union type that ensures type safety based on whether the feature has outputs.
 */
export type DetectionFeatureSchema = 
  | (BaseDetectionFeatureSchema & { 
      /**
       * Child features of this feature.
       * Only present for non-leaf nodes.
       */
      outputs: Record<string, DetectionFeatureSchema>; 
      isLeaf: false;
      parentKey: string;
    })
  | (BaseDetectionFeatureSchema & { 
      /**
       * Child features of this feature.
       * Undefined for leaf nodes.
       */
      outputs?: undefined; 
      isLeaf: true;
      parentKey: string;
    });

/**
 * Detection feature interface for top-level features.
 * Root features are always non-leaf nodes and have required code.
 */
export interface RootDetectionFeatureSchema extends BaseDetectionFeatureSchema {
  /**
   * The detection code that evaluates this feature.
   * 
   * Best practices:
   * - Use clear, well-documented code
   * - Include error handling
   * - Follow consistent coding style
   * - Keep code focused and maintainable
   */
  code: string;

  /**
   * Optional dependency on another feature.
   * 
   * Best practices:
   * - Use fullKey of the dependent feature
   * - Only specify if there's a clear dependency
   * - Document the nature of the dependency
   */
  dependency?: LibraryDependency;

  /**
   * Child features of this root feature.
   * Root features always have outputs.
   */
  outputs: Record<string, DetectionFeatureSchema>;

  /**
   * Root features are never leaf nodes.
   */
  isLeaf: false;

  /**
   * The type of the root feature is always "object".
   */
  type: "object";

  /**
   * The parent key of the root feature is undefined.
   */
  parentKey: undefined;

  rootKey: undefined;
  level: 0;
}

/**
 * Array of root detection features.
 * Each YAML file in the detection_rules directory becomes one root feature.
 */
export type RootDetectionFeaturesSchema = Array<RootDetectionFeatureSchema>; 


export interface BaseDetectionFeature extends BaseDetectionFeatureSchema, FeatureValue {}
export type DetectionFeature = DetectionFeatureSchema & FeatureValue;
export interface RootDetectionFeature extends RootDetectionFeatureSchema, FeatureValue {}
