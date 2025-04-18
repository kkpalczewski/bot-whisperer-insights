import { parse } from 'yaml';

// @ts-ignore
import featuresYaml from '../config/detection-features.yaml?raw';

const parsed = parse(featuresYaml);

export interface DetectionFeature {
  id: string;
  name: string;
  codeName: string;
  type: 'string' | 'number' | 'array' | 'object';
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
