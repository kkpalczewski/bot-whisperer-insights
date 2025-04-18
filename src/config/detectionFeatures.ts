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
  abuse_indication: {
    bot: string;
  };
  category: 'browser' | 'network' | 'behavior' | 'hardware' | 'fingerprinting';
  dependency?: string;
  outputs?: Record<string, FeatureValue>;
}

// Import all YAML files statically
import timezoneYaml from './detection_rules/timezone.yaml?raw';
import userAgentYaml from './detection_rules/user_agent.yaml?raw';
import browserInfoYaml from './detection_rules/browser_features.yaml?raw';
import hardwareInfoYaml from './detection_rules/hardware_info.yaml?raw';
import networkInfoYaml from './detection_rules/network_info.yaml?raw';
import fingerprintjsDataYaml from './detection_rules/fingerprintjs_data.yaml?raw';
import canvasFingerprintYaml from './detection_rules/canvas_fingerprint.yaml?raw';
import hasAudioContextYaml from './detection_rules/has_audio_context.yaml?raw';
import clientjsDataYaml from './detection_rules/clientjs_data.yaml?raw';

// Parse each YAML file and combine
const yamlFiles = [
  timezoneYaml,
  userAgentYaml,
  browserInfoYaml,
  hardwareInfoYaml,
  networkInfoYaml,
  fingerprintjsDataYaml,
  canvasFingerprintYaml,
  hasAudioContextYaml,
  clientjsDataYaml
];

export const features: DetectionFeature[] = yamlFiles.flatMap(file => {
  try {
    const parsed = parse(file);
    return parsed || [];
  } catch (e) {
    console.error('Error parsing YAML file:', e);
    return [];
  }
});
