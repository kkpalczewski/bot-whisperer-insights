
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
    // Special handling for clientjs_fingerprint features
    if (feature.codeName === 'clientjs_fingerprint' && id.startsWith('clientjs')) {
      // Extract the path after "clientjs."
      const pathAfterPrefix = id.replace('clientjs.', '');
      
      // Handle direct properties like "os", "device", etc.
      if (!pathAfterPrefix.includes('.')) {
        // Check if it's a direct output
        if (feature.outputs && feature.outputs[pathAfterPrefix]) {
          description = feature.outputs[pathAfterPrefix].description;
          abuseIndication = feature.outputs[pathAfterPrefix].abuse_indication?.bot;
          featureDefinition = feature;
          break;
        }
      } 
      // Handle nested paths like "device.os"
      else {
        const parts = pathAfterPrefix.split('.');
        if (parts.length === 2 && feature.outputs) {
          const [parent, child] = parts;
          
          // Check if parent exists and has outputs
          if (feature.outputs[parent] && feature.outputs[parent].outputs && 
              feature.outputs[parent].outputs[child]) {
            description = feature.outputs[parent].outputs[child].description;
            abuseIndication = feature.outputs[parent].outputs[child].abuse_indication?.bot;
            featureDefinition = feature;
            break;
          }
        }
      }
      
      // If we didn't find specific info, use the parent feature info
      if (!description) {
        description = feature.description;
        abuseIndication = feature.abuse_indication?.bot;
        featureDefinition = feature;
        break;
      }
    }
    
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
