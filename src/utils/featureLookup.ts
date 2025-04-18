
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
    
    // Handle features with dependencies - specifically handle clientjs better
    if (feature.dependency && id.includes(feature.dependency)) {
      // Extract the path after the dependency
      // For clientjs, the ID format could be clientjs_fingerprint.device.os
      // We need to handle this format correctly
      let pathParts = id.split('.');
      let dependencyIndex = pathParts.findIndex(part => part === feature.dependency || part.includes(feature.dependency));
      
      if (dependencyIndex !== -1) {
        // Get the remaining path after the dependency
        let remainingPath = pathParts.slice(dependencyIndex + 1).join('.');
        
        if (!remainingPath) {
          featureDefinition = feature;
          description = feature.description;
          abuseIndication = feature.abuse_indication?.bot;
          break;
        }
        
        if (feature.outputs) {
          // For nested objects like device.os, we need to navigate through the outputs
          const path = remainingPath.split('.');
          let currentOutput = feature.outputs;
          let foundMatch = true;
          
          // First level might be a parent object (like 'device')
          const firstSegment = path[0];
          if (currentOutput[firstSegment]) {
            if (path.length === 1) {
              description = currentOutput[firstSegment].description;
              abuseIndication = currentOutput[firstSegment].abuse_indication?.bot;
              featureDefinition = feature;
              break;
            }
            
            // Move to the next level
            if (currentOutput[firstSegment].outputs) {
              currentOutput = currentOutput[firstSegment].outputs;
              
              // For the second level and beyond
              for (let i = 1; i < path.length; i++) {
                const segment = path[i];
                if (currentOutput[segment]) {
                  if (i === path.length - 1) {
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
            }
          }
          
          if (foundMatch) break;
        }
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
