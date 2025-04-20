import { DetectionFeature } from "@/config/detectionFeatures";

interface FeatureInfo {
  description?: string;
  abuseIndication?: string;
  exemplaryValues?: Array<string | boolean | number | object | Array<unknown>>;
  featureDefinition: DetectionFeature | null;
}

export const findFeatureInfo = (
  features: DetectionFeature[],
  id: string
): FeatureInfo => {
  let featureDefinition = null;
  let description;
  let abuseIndication;
  let exemplaryValues;
  let type;

  // Look through all features to find the specific one
  for (const feature of features) {
    // Check if this ID starts with the feature codeName (like "clientjs.device.os" starts with "clientjs")
    if (id.startsWith(feature.codeName)) {
      // Get the path after the feature codeName (e.g., "device.os" from "clientjs.device.os")
      const pathAfterPrefix = id.substring(feature.codeName.length + 1);

      // If there's no path after the prefix, it's the top-level feature itself
      if (!pathAfterPrefix) {
        featureDefinition = feature;
        description = feature.description;
        abuseIndication = feature.abuse_indication?.bot;
        exemplaryValues = feature.exemplary_values;
        type = feature.type;
        break;
      }

      // Handle nested paths (could be multiple levels deep like "device.os")
      if (feature.outputs) {
        const pathParts = pathAfterPrefix.split(".");
        let currentOutput = feature.outputs;
        let found = true;

        // Navigate through each level of the path
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i];

          if (currentOutput[part]) {
            // If this is the last part of the path, we've found our target
            if (i === pathParts.length - 1) {
              description = currentOutput[part].description;
              abuseIndication = currentOutput[part].abuse_indication?.bot;
              exemplaryValues = currentOutput[part].exemplary_values;
              type = currentOutput[part].type;
              featureDefinition = feature;
              break;
            }

            // Otherwise, go deeper if there are more outputs
            if (currentOutput[part].outputs) {
              currentOutput = currentOutput[part].outputs;
            } else {
              // Can't go deeper, so we didn't find a match
              found = false;
              break;
            }
          } else {
            // If the exact key doesn't exist, check if there are any keys that contain this part
            // This is useful for array indices or dynamic keys
            let foundNestedKey = false;

            for (const key of Object.keys(currentOutput)) {
              // Check if the key contains the path part or represents an array index pattern
              if (
                key.includes(part) ||
                (part.match(/^\d+$/) && key.includes("[index]"))
              ) {
                // If this is the last part of the path, we've found our target
                if (i === pathParts.length - 1) {
                  description = currentOutput[key].description;
                  abuseIndication = currentOutput[key].abuse_indication?.bot;
                  exemplaryValues = currentOutput[key].exemplary_values;
                  featureDefinition = feature;
                  foundNestedKey = true;
                  break;
                }

                // Otherwise, go deeper if there are more outputs
                if (currentOutput[key].outputs) {
                  currentOutput = currentOutput[key].outputs;
                  foundNestedKey = true;
                  break;
                }
              }
            }

            if (!foundNestedKey) {
              found = false;
              break;
            }
          }
        }

        if (found) break;
      }
    }
  }

  // If we haven't explicitly found an abuse indication, but found the feature, use the parent one
  if (!abuseIndication && featureDefinition?.abuse_indication?.bot) {
    abuseIndication = featureDefinition.abuse_indication.bot;
  }

  // If we haven't explicitly found exemplary values, but found the feature, use the parent one
  if (!exemplaryValues && featureDefinition?.exemplary_values) {
    exemplaryValues = featureDefinition.exemplary_values;
  }

  return {
    description,
    abuseIndication,
    exemplaryValues,
    featureDefinition,
  };
};
