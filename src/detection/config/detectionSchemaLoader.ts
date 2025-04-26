import { parse } from "yaml";
import { RootDetectionFeatureSchema, RootDetectionFeaturesSchema, DetectionFeatureSchema } from "../types/detectionSchema";

// Import all YAML files from the detection_rules directory
const modules = import.meta.glob("./detection_rules/*.yaml", {
  eager: true,
  as: "raw",
});

// Recursively process nested outputs
const processOutputs = (
  outputs: Record<string, DetectionFeatureSchema>,
  parentKey: string,
  rootKey: string,
  level: number
): Record<string, DetectionFeatureSchema> => {
  const processed: Record<string, DetectionFeatureSchema> = {};

  for (const [key, value] of Object.entries(outputs)) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    const hasOutputs = !!value.outputs;
    processed[key] = {
      ...value,
      fullKey: fullKey,
      parentKey: parentKey,
      featureKey: key,
      rootKey: rootKey,
      type: value.type || "string",
      isLeaf: !hasOutputs,
      level: level,
      outputs: hasOutputs ? processOutputs(value.outputs, fullKey, rootKey, level + 1) : undefined,
    } as DetectionFeatureSchema;
  }

  return processed;
};

// Parse each YAML file and combine
export const detectionFeaturesMapSchema: RootDetectionFeaturesSchema = Object.values(modules).flatMap(
  (content) => {
    try {
      const parsed = parse(content);
      // Get the first (and only) rule from the object
      const objectKeys = Object.keys(parsed);
      if (objectKeys.length !== 1) {
        throw new Error("Expected exactly one rule in the YAML file");
      }
      const ruleId = objectKeys[0];
      const rootFeatureSchema = { 
        ...parsed[ruleId], 
        parentKey: "", 
        featureKey: ruleId, 
        fullKey: ruleId,
        isLeaf: false,
        level: 0
      } as RootDetectionFeatureSchema;

      // Recursively process nested outputs
      rootFeatureSchema.outputs = processOutputs(
        rootFeatureSchema.outputs, 
        rootFeatureSchema.fullKey,
        rootFeatureSchema.fullKey,
        1
      );

      return [rootFeatureSchema];
    } catch (error) {
      console.error("Error parsing detection feature:", error);
      return [];
    }
  }
);

export const detectionFeaturesFlatSchema: Record<string, RootDetectionFeatureSchema | DetectionFeatureSchema> = 
  detectionFeaturesMapSchema.reduce((acc, rootFeature) => {
    // Add the root feature itself
    acc[rootFeature.fullKey] = rootFeature;

    // Recursively flatten the outputs
    const flattenOutputs = (
      outputs: Record<string, DetectionFeatureSchema> | undefined
    ) => {
      if (!outputs) return;
      
      Object.values(outputs).forEach((feature) => {
        acc[feature.fullKey] = feature;
        if (feature.outputs) {
          flattenOutputs(feature.outputs);
        }
      });
    };

    flattenOutputs(rootFeature.outputs);
    return acc;
  }, {} as Record<string, RootDetectionFeatureSchema | DetectionFeatureSchema>);

export const leafDetectionFeaturesFlatSchema: Record<string, DetectionFeatureSchema> = 
  Object.values(detectionFeaturesFlatSchema)
    .filter((feature) => feature.isLeaf)
    .reduce((acc, feature) => {
      acc[feature.fullKey] = feature as DetectionFeatureSchema;
      return acc;
    }, {} as Record<string, DetectionFeatureSchema>);

export const rootDetectionFeaturesFlatSchema: Record<string, RootDetectionFeatureSchema> = 
  Object.values(detectionFeaturesFlatSchema)
    .filter((feature) => !feature.isLeaf)
    .reduce((acc, feature) => {
      acc[feature.fullKey] = feature as RootDetectionFeatureSchema;
      return acc;
    }, {} as Record<string, RootDetectionFeatureSchema>);
    
    