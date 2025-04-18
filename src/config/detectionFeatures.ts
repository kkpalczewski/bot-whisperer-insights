
import { parse } from 'yaml';

// Import the YAML content using Vite's raw loader
// @ts-ignore
import featuresYaml from '../config/detection-features.yaml?raw';

// Parse the YAML content into JavaScript objects
const parsed = parse(featuresYaml);

// Configuration for bot detection features
export interface DetectionFeature {
  id: string;
  name: string;
  code: string;
  description: string;
  category: 'browser' | 'network' | 'behavior' | 'hardware' | 'fingerprinting';
}

// Third-party fingerprinting libraries info
export interface LibraryInfo {
  id: string;
  name: string;
  description: string;
  website: string;
  features: string[];
}

export const detectionFeatures: DetectionFeature[] = parsed.detectionFeatures;
export const fingerprintingLibraries: LibraryInfo[] = parsed.fingerprintingLibraries;
