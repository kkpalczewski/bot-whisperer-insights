
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
  category: 'browser' | 'network' | 'behavior' | 'hardware' | 'fingerprinting';
  dependency?: string;
  outputs?: Record<string, FeatureValue>;
}

// Import all YAML files from the detection_rules directory
const modules = import.meta.glob('./detection_rules/*.yaml', { eager: true, as: 'raw' });

// Parse each YAML file and combine
export const features: DetectionFeature[] = Object.values(modules).flatMap(content => {
  try {
    const parsed = parse(content);
    return parsed || [];
  } catch (e) {
    console.error('Error parsing YAML file:', e);
    return [];
  }
});

