import { parse } from 'yaml';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs';

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
  abuse_indication: {
    bot: string;
  };
  category: 'browser' | 'network' | 'behavior' | 'hardware' | 'fingerprinting';
  dependency?: string;
  outputs?: Record<string, FeatureValue>;
}

// Load all feature files directly from the detection_rules directory
const featureFiles = glob.sync(path.resolve(__dirname, 'detection_rules/*.yaml'));
export const features: DetectionFeature[] = featureFiles.flatMap(file => {
  const content = fs.readFileSync(file, 'utf8');
  const parsed = parse(content);
  return parsed || [];
});
