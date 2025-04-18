
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

  // Get parts from id (e.g., "clientjs_fingerprint.device.os" => ["clientjs_fingerprint", "device", "os"])
  const parts = id.split('.');
  const rootFeatureName = parts[0];
  
  // Find the root feature definition
  const rootFeature = features.find(f => f.codeName === rootFeatureName);
  
  if (!rootFeature) {
    return { featureDefinition: null };
  }
  
  // If we're looking at just the root feature itself
  if (parts.length === 1) {
    return {
      description: rootFeature.description,
      abuseIndication: rootFeature.abuse_indication?.bot,
      featureDefinition: rootFeature
    };
  }
  
  // We're looking at a nested property
  let currentOutput = rootFeature.outputs;
  let currentFeatureValue: FeatureValue | undefined;
  
  // Skip the first part (root feature name) and traverse the nested structure
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    
    if (!currentOutput || !currentOutput[part]) {
      // Path doesn't exist
      break;
    }
    
    currentFeatureValue = currentOutput[part];
    
    // If we've reached the final part, this is our target
    if (i === parts.length - 1) {
      description = currentFeatureValue.description;
      abuseIndication = currentFeatureValue.abuse_indication?.bot;
      featureDefinition = rootFeature;
      break;
    }
    
    // Move to the next level if outputs exist
    if (currentFeatureValue.outputs) {
      currentOutput = currentFeatureValue.outputs;
    } else {
      // No more levels but we haven't reached our target
      break;
    }
  }
  
  // If we haven't found a specific description but found the feature, use the parent feature's description
  if (!description && featureDefinition) {
    description = featureDefinition.description;
  }
  
  // If we haven't found a specific abuse indication but found the feature, use the parent feature's indication
  if (!abuseIndication && featureDefinition?.abuse_indication?.bot) {
    abuseIndication = featureDefinition.abuse_indication.bot;
  }

  return {
    description,
    abuseIndication,
    featureDefinition
  };
};
