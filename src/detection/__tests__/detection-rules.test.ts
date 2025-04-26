import { describe, it, expect } from 'vitest';
import { readdirSync } from 'fs';
import { join } from 'path';

interface DetectionRule {
  id: string;
  name: string;
  description: string;
  dependency: string;
  code: string;
  outputs: Record<string, string>;
}

describe('Detection Rules Configuration', () => {
  const detectionRulesDir = join(__dirname, '../config/detection_rules');
  const yamlFiles = readdirSync(detectionRulesDir).filter(file => file.endsWith('.yaml'));

  yamlFiles.forEach(file => {
    it(`should load and validate ${file}`, () => {
      const config = window.loadYaml(`./config/detection_rules/${file}`) as unknown as Record<string, DetectionRule>;
      
      // Check that config is an object
      expect(typeof config).toBe('object');
      expect(Array.isArray(config)).toBe(false);
      
      // Get the first rule (there should be only one)
      const ruleId = Object.keys(config)[0];
      const rule = config[ruleId];
      
      // Check required fields
      expect(rule).toHaveProperty('id');
      expect(rule).toHaveProperty('name');
      expect(rule).toHaveProperty('description');
      expect(rule).toHaveProperty('code');
      expect(rule).toHaveProperty('outputs');
      
      // Verify that the rule ID matches the key
      expect(rule.id).toBe(ruleId);
    });
  });
}); 