
import { parse } from 'yaml';

export interface FeatureValue {
  name: string;
  type: 'string' | 'number' | 'array' | 'object' | 'boolean';
  description: string;
  outputs?: Record<string, FeatureValue>;
}

export interface DetectionFeature {
  id: string;
  name: string;
  codeName: string;
  type: 'string' | 'number' | 'array' | 'object' | 'boolean';
  code: string;
  description: string;
  abuse_indication?: {
    bot: string;
  };
  category: 'browser' | 'network' | 'behavior' | 'hardware' | 'fingerprinting';
  dependency?: string;
  outputs?: Record<string, FeatureValue>;
}

// Dynamic import of all YAML files
const importAll = (r: Record<string, any>) => {
  return Object.values(r).map(module => module.default);
};

// Import all files that match the pattern
const yamlFiles = importAll(import.meta.glob('./detection_rules/*.yaml', { eager: true }));

export const features: DetectionFeature[] = yamlFiles.flatMap(file => {
  try {
    const parsed = parse(file);
    return parsed || [];
  } catch (e) {
    console.error('Error parsing YAML file:', e);
    return [];
  }
});
