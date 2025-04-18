
import { DetectionFeature, FeatureValue } from '@/config/detectionFeatures';

interface FeatureInfo {
  description?: string;
  abuseIndication?: string;
  featureDefinition: DetectionFeature | null;
}

export const findFeatureInfo = (
  features: DetectionFeature[],
  id: string
): FeatureInfo => {
  let featureDefinition = null;
  let description;
  let abuseIndication;

  // Look through all features to find the specific one
  for (const feature of features) {
    // Check if this is a top-level feature
    if (id === feature.codeName) {
      featureDefinition = feature;
      description = feature.description;
      abuseIndication = feature.abuse_indication?.bot;
      break;
    }
    
    // Check if this is a sub-property of a feature with outputs
    if (feature.outputs && id.startsWith(feature.codeName + '.')) {
      const path = id.substring(feature.codeName.length + 1).split('.');
      let currentOutput = feature.outputs;
      let currentPath = feature.codeName;
      let foundMatch = true;
      
      // Traverse the outputs object based on the ID path
      for (const segment of path) {
        currentPath += '.' + segment;
        if (currentOutput[segment]) {
          if (currentPath === id) {
            description = currentOutput[segment].description;
            abuseIndication = currentOutput[segment].abuse_indication?.bot;
            featureDefinition = feature;
            foundMatch = true;
            break;
          }
          if (currentOutput[segment].outputs) {
            currentOutput = currentOutput[segment].outputs;
          } else {
            foundMatch = false;
            break;
          }
        } else {
          foundMatch = false;
          break;
        }
      }
      
      if (foundMatch) break;
    }
    
    // Handle ClientJS and other library with dependency field
    if (feature.dependency && id.includes(feature.codeName)) {
      // First check for exact property path in feature outputs
      let pathSegments = id.split('.');
      
      // For clientjs_fingerprint.device.os we need to correctly handle these nested properties
      if (pathSegments.length >= 3 && feature.outputs) {
        let rootPropertyName = pathSegments[1]; // e.g. 'device'
        let nestedPropertyName = pathSegments[2]; // e.g. 'os'
        
        // Check if root property exists in outputs
        if (feature.outputs[rootPropertyName]) {
          // Check if this root property has its own outputs
          if (feature.outputs[rootPropertyName].outputs) {
            // Find the nested property
            let nestedOutput = feature.outputs[rootPropertyName].outputs?.[nestedPropertyName];
            
            if (nestedOutput) {
              description = nestedOutput.description;
              abuseIndication = nestedOutput.abuse_indication?.bot;
              featureDefinition = feature;
              break;
            }
          } else {
            // Just use the root property's description if nested is not found
            description = feature.outputs[rootPropertyName].description;
            abuseIndication = feature.outputs[rootPropertyName].abuse_indication?.bot;
            featureDefinition = feature;
            break;
          }
        }
      }
      
      // If we didn't find the specific property, use the parent feature info
      if (!description) {
        description = feature.description;
        abuseIndication = feature.abuse_indication?.bot;
        featureDefinition = feature;
      }
    }
  }

  // If we haven't explicitly found an abuse indication, but found the feature, use the parent one
  if (!abuseIndication && featureDefinition?.abuse_indication?.bot) {
    abuseIndication = featureDefinition.abuse_indication.bot;
  }

  return {
    description,
    abuseIndication,
    featureDefinition
  };
};
