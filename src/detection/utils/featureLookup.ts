import { detectionFeaturesFlatSchema } from "@/detection/config/detectionSchemaLoader";
import { DetectionFeatureSchema, RootDetectionFeatureSchema } from "@/detection/types/detectionSchema";


const findNestedFeature = (
  outputs: Record<string, DetectionFeatureSchema>,
  [part, ...rest]: string[]
): DetectionFeatureSchema | null => {
  if (!part) return null;
  
  const exactMatch = outputs[part];
  if (!exactMatch) return null;
  
  if (rest.length === 0) {
    return exactMatch;
  }
  return exactMatch.outputs ? findNestedFeature(exactMatch.outputs, rest) : null;
};

type InheritanceConfig = {
  properties: Array<keyof DetectionFeatureSchema>;
};

const inheritFromParent = (
  feature: RootDetectionFeatureSchema | DetectionFeatureSchema,
  config: InheritanceConfig
): RootDetectionFeatureSchema | DetectionFeatureSchema => {
  const inheritedProps = config.properties.reduce((acc, prop) => {
    if (feature.parentKey) {
      const parent = detectionFeaturesFlatSchema[feature.parentKey];
      if (parent) {
        return { ...acc, [prop]: parent[prop] };
      }
    }
    return acc;
  }, {});

  return { ...feature, ...inheritedProps };
};

export const findFeatureInfo = (
  fullKey: string,
  inheritanceConfig: InheritanceConfig = {
    properties: ['abuseIndication', 'exemplaryValues']
  }
): DetectionFeatureSchema | RootDetectionFeatureSchema => {
  // Find the matching feature
  const feature = detectionFeaturesFlatSchema[fullKey];
  if (!feature) throw new Error(`Feature not found for key: ${fullKey}`);

  // Apply inheritance based on config
  return inheritFromParent(feature, inheritanceConfig);
};
