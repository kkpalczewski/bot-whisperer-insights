import { parse } from "yaml";
import librariesYaml from "./fingerprinting-libraries.yaml?raw";

export interface LibraryInfo {
  id: string;
  name: string;
  description: string;
  website: string;
  features: string[];
}

const parsed = parse(librariesYaml) as { libraries?: LibraryInfo[] };
export const libraries: LibraryInfo[] = parsed.libraries ?? [];
