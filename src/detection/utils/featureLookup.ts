import { detectionFeaturesFlatSchema } from "@/detection/config/detectionSchemaLoader";
import { DetectionFeatureSchema, RootDetectionFeatureSchema } from "@/detection/types/detectionSchema";

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
