
import { parse } from 'yaml';

export interface FeatureValue {
  name: string;
  type: 'string' | 'number' | 'array' | 'object' | 'boolean';
  description: string;
  outputs?: Record<string, FeatureValue>;
  abuse_indication?: {
    bot?: string;
  };
}

export interface DetectionFeature {
  id: string;
  name: string;
  codeName: string;
  type: 'string' | 'number' | 'array' | 'object' | 'boolean';
  code: string;
  description: string;
  abuse_indication: {
    bot: string;
  };
  dependency?: string;
  outputs?: Record<string, FeatureValue>;
}

// Import all YAML files from the detection_rules directory
const modules = import.meta.glob('./detection_rules/*.yaml', { eager: true, as: 'raw' });

// Parse each YAML file and combine
export const features: DetectionFeature[] = Object.values(modules).flatMap(content => {
  try {
    const parsed = parse(content);
    // For each feature, ensure nested outputs have descriptions and abuse_indication
    return parsed?.map((feature: DetectionFeature) => {
      if (feature.outputs) {
        // Recursively process nested outputs
        const processOutputs = (outputs: Record<string, FeatureValue>, parentKey = ''): Record<string, FeatureValue> => {
          const processed: Record<string, FeatureValue> = {};
          
          for (const [key, value] of Object.entries(outputs)) {
            const fullKey = parentKey ? `${parentKey}.${key}` : key;
            processed[key] = {
              ...value,
              name: value.name || key, // Use key as name if not provided
              // Ensure description exists
              description: value.description || feature.description || `Value for ${fullKey}`,
              // Ensure abuse_indication exists
              abuse_indication: value.abuse_indication || feature.abuse_indication || {},
              // Ensure type exists
              type: value.type || 'string',
              // Recursively process any nested outputs
              outputs: value.outputs ? processOutputs(value.outputs, fullKey) : undefined
            };
          }
          
          return processed;
        };
        
        feature.outputs = processOutputs(feature.outputs);
      }
      return feature;
    }) || [];
  } catch (e) {
    console.error('Error parsing YAML file:', e);
    return [];
  }
});

