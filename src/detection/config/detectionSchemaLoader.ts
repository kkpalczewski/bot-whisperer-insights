import { parse } from "yaml";
import {
  DetectionFeatureSchema,
  RootDetectionFeatureSchema,
  RootDetectionFeaturesSchema,
} from "../types/detectionSchema";
import { formatIssues, RawOutputFeature, ruleFileSchema } from "./ruleSchema";

// Import all YAML files from the detection_rules directory
const modules = import.meta.glob("./detection_rules/*.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

// Recursively process nested outputs, adding the derived tree fields
const processOutputs = (
  outputs: Record<string, RawOutputFeature>,
  parentKey: string,
  rootKey: string,
  level: number
): Record<string, DetectionFeatureSchema> => {
  const processed: Record<string, DetectionFeatureSchema> = {};

  for (const [key, value] of Object.entries(outputs)) {
    const fullKey = `${parentKey}.${key}`;
    const shared = {
      name: value.name,
      type: value.type,
      description: value.description,
      abuseIndication: value.abuseIndication,
      exemplaryValues: value.exemplaryValues ?? [],
      fullKey,
      parentKey,
      featureKey: key,
      rootKey,
      level,
    };
    processed[key] = value.outputs
      ? {
          ...shared,
          isLeaf: false as const,
          outputs: processOutputs(value.outputs, fullKey, rootKey, level + 1),
        }
      : { ...shared, isLeaf: true as const, outputs: undefined };
  }

  return processed;
};

/**
 * Parses and validates a single rule file. Throws with the file path and the
 * list of schema violations so a bad rule is caught by the test suite and at
 * app startup rather than silently dropped.
 */
export const loadRuleFile = (path: string, content: string): RootDetectionFeatureSchema => {
  const result = ruleFileSchema.safeParse(parse(content));
  if (!result.success) {
    throw new Error(`Invalid detection rule ${path}:\n${formatIssues(result.error)}`);
  }

  const [ruleId, rule] = Object.entries(result.data)[0];
  return {
    ...rule,
    exemplaryValues: rule.exemplaryValues ?? [],
    parentKey: undefined,
    featureKey: ruleId,
    fullKey: ruleId,
    rootKey: undefined,
    isLeaf: false,
    level: 0,
    outputs: processOutputs(rule.outputs, ruleId, ruleId, 1),
  };
};

// Parse each YAML file and combine
export const detectionFeaturesMapSchema: RootDetectionFeaturesSchema = Object.entries(
  modules
).map(([path, content]) => loadRuleFile(path, content));

export const detectionFeaturesFlatSchema: Record<
  string,
  RootDetectionFeatureSchema | DetectionFeatureSchema
> = detectionFeaturesMapSchema.reduce(
  (acc, rootFeature) => {
    acc[rootFeature.fullKey] = rootFeature;

    const flattenOutputs = (
      outputs: Record<string, DetectionFeatureSchema> | undefined
    ) => {
      if (!outputs) return;
      Object.values(outputs).forEach((feature) => {
        acc[feature.fullKey] = feature;
        flattenOutputs(feature.outputs);
      });
    };

    flattenOutputs(rootFeature.outputs);
    return acc;
  },
  {} as Record<string, RootDetectionFeatureSchema | DetectionFeatureSchema>
);

/** Only the top-level rules (one per YAML file); these are the nodes that carry `code`. */
export const rootDetectionFeaturesFlatSchema: Record<string, RootDetectionFeatureSchema> =
  Object.fromEntries(
    detectionFeaturesMapSchema.map((rootFeature) => [rootFeature.fullKey, rootFeature])
  );
