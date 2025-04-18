
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
    
    // Specifically handle ClientJS and similar libraries with dependencies
    if (feature.dependency && id.includes(feature.dependency)) {
      // Extract dependency name and the path that follows
      const dependencyName = feature.dependency;
      
      // Handle format like "clientjs_fingerprint.device.os"
      if (id.includes(dependencyName)) {
        const parts = id.split('.');
        // Find where in the path our dependency is located
        const depIndex = parts.findIndex(part => part.includes(dependencyName));
        
        if (depIndex !== -1) {
          // Get segments after the dependency part
          const pathSegments = parts.slice(depIndex + 1);
          
          // If there are no segments after dependency, use the feature itself
          if (pathSegments.length === 0) {
            featureDefinition = feature;
            description = feature.description;
            abuseIndication = feature.abuse_indication?.bot;
            break;
          }
          
          // Navigate through the feature outputs structure
          if (feature.outputs) {
            let currentOutput = feature.outputs;
            let foundNestedProperty = false;
            
            // Handle first level (like "device")
            const firstSegment = pathSegments[0];
            if (currentOutput[firstSegment]) {
              if (pathSegments.length === 1) {
                // If we only have one path segment like ".device"
                description = currentOutput[firstSegment].description;
                abuseIndication = currentOutput[firstSegment].abuse_indication?.bot;
                featureDefinition = feature;
                foundNestedProperty = true;
              } else if (currentOutput[firstSegment].outputs) {
                // Move to second level and beyond
                currentOutput = currentOutput[firstSegment].outputs;
                
                // Continue with remaining segments
                let currentLevel = currentOutput;
                let foundMatch = true;
                
                for (let i = 1; i < pathSegments.length; i++) {
                  const segment = pathSegments[i];
                  
                  if (currentLevel[segment]) {
                    if (i === pathSegments.length - 1) {
                      // Found the match at the end of the path
                      description = currentLevel[segment].description;
                      abuseIndication = currentLevel[segment].abuse_indication?.bot;
                      featureDefinition = feature;
                      foundNestedProperty = true;
                      break;
                    }
                    
                    // Continue to next level if it exists
                    if (currentLevel[segment].outputs) {
                      currentLevel = currentLevel[segment].outputs;
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
            
            if (foundNestedProperty) break;
          }
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
