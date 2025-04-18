
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
    
    // Handle features with dependencies
    if (feature.dependency && id.startsWith(feature.dependency)) {
      const remainingPath = id.substring(feature.dependency.length + 1);
      if (!remainingPath) {
        featureDefinition = feature;
        description = feature.description;
        abuseIndication = feature.abuse_indication?.bot;
        break;
      }
      
      if (feature.outputs) {
        const path = remainingPath.split('.');
        let currentOutput = feature.outputs;
        let currentPath = feature.dependency;
        let foundMatch = true;
        
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
