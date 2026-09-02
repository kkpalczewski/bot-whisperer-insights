import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "yaml";

declare global {
  var loadYaml: (path: string) => Record<string, unknown>;
}

globalThis.loadYaml = (path: string): Record<string, unknown> => {
  const content = readFileSync(join(__dirname, "..", path), "utf8");
  return parse(content) as Record<string, unknown>;
};
