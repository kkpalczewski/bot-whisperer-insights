
import { parse } from 'yaml';

// @ts-ignore
import librariesYaml from './fingerprinting-libraries.yaml?raw';

export interface LibraryInfo {
  id: string;
  name: string;
  description: string;
  website: string;
  features: string[];
}

const parsed = parse(librariesYaml);
export const libraries = parsed.libraries || [];
