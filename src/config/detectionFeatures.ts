
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
// Browser features
import timezoneYaml from './detection_rules/timezone.yaml?raw';
import browserLanguagesYaml from './detection_rules/browser_languages.yaml?raw';
import userAgentYaml from './detection_rules/user_agent.yaml?raw';
import hasPermissionsApiYaml from './detection_rules/has_permissions_api.yaml?raw';
import browserPluginsYaml from './detection_rules/browser_plugins.yaml?raw';
import browserFeaturesYaml from './detection_rules/browser_features.yaml?raw';
import doNotTrackYaml from './detection_rules/do_not_track.yaml?raw';

// Hardware features
import cpuCoresYaml from './detection_rules/cpu_cores.yaml?raw';
import deviceMemoryYaml from './detection_rules/device_memory.yaml?raw';
import hasTouchSupportYaml from './detection_rules/has_touch_support.yaml?raw';

// Fingerprinting
import canvasFingerprintYaml from './detection_rules/canvas_fingerprint.yaml?raw';
import hasAudioContextYaml from './detection_rules/has_audio_context.yaml?raw';
import fingerprintDataYaml from './detection_rules/fingerprint_data.yaml?raw';
import clientjsFingerprintYaml from './detection_rules/clientjs_fingerprint.yaml?raw';

// Parse each YAML file and combine
const yamlFiles = [
  timezoneYaml,
  browserLanguagesYaml,
  userAgentYaml,
  hasPermissionsApiYaml,
  browserPluginsYaml,
  browserFeaturesYaml,
  doNotTrackYaml,
  cpuCoresYaml,
  deviceMemoryYaml,
  hasTouchSupportYaml,
  canvasFingerprintYaml,
  hasAudioContextYaml,
  fingerprintDataYaml,
  clientjsFingerprintYaml
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
