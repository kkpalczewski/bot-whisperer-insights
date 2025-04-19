import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { load } from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';

// Extend Vitest's expect with Jest DOM matchers
expect.extend(matchers);

// Add YAML file handling
declare global {
  interface Window {
    loadYaml: (path: string) => Record<string, unknown>;
  }
}

const loadYaml = (path: string): Record<string, unknown> => {
  const content = readFileSync(join(__dirname, '..', path), 'utf8');
  return load(content) as Record<string, unknown>;
};

global.loadYaml = loadYaml;

// Cleanup after each test
afterEach(() => {
  cleanup();
}); 