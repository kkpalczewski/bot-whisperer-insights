
import { parse } from 'yaml';

// @ts-ignore
import featuresYaml from '../config/detection-features.yaml?raw';

export interface FeatureValue {
  name: string;
  type: 'string' | 'number' | 'array' | 'object' | 'boolean';
  description: string;
}

export interface DetectionFeature {
  id: string;
  name: string;
  codeName: string;
  type: 'string' | 'number' | 'array' | 'object' | 'boolean';
  code: string;
  description: string;
  category: 'browser' | 'network' | 'behavior' | 'hardware' | 'fingerprinting';
  dependency?: string;
  outputs?: Record<string, FeatureValue>;
}

// Third-party fingerprinting libraries info
export interface LibraryInfo {
  id: string;
  name: string;
  description: string;
  website: string;
  features: string[];
}

// Parse the YAML file content
const parsed = parse(featuresYaml);

export const detectionFeatures: DetectionFeature[] = parsed.detectionFeatures;
export const fingerprintingLibraries: LibraryInfo[] = parsed.fingerprintingLibraries;
