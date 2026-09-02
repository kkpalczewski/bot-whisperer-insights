import { describe, it, expect } from "vitest";
import { readdirSync } from "fs";
import { join } from "path";
import {
  detectionFeaturesMapSchema,
  rootDetectionFeaturesFlatSchema,
} from "../config/detectionSchemaLoader";

const LIBRARY_DEPENDENCIES = ["clientjs", "fingerprintjs", "deviceDetector"];

const detectionRulesDir = join(__dirname, "../config/detection_rules");
const yamlFiles = readdirSync(detectionRulesDir).filter((file) =>
  file.endsWith(".yaml")
);

describe("Detection rule YAML files", () => {
  it("has at least one rule file", () => {
    expect(yamlFiles.length).toBeGreaterThan(0);
  });

  yamlFiles.forEach((file) => {
    it(`${file} declares exactly one well-formed root rule`, () => {
      const config = globalThis.loadYaml(`./config/detection_rules/${file}`);

      expect(typeof config).toBe("object");
      expect(Array.isArray(config)).toBe(false);
      expect(Object.keys(config)).toHaveLength(1);

      const rule = Object.values(config)[0] as Record<string, unknown>;
      expect(typeof rule.name).toBe("string");
      expect(typeof rule.description).toBe("string");
      expect(rule.type).toBe("object");
      expect(typeof rule.code).toBe("string");
      expect((rule.code as string).trim().length).toBeGreaterThan(0);
      expect(typeof rule.outputs).toBe("object");
      if (rule.dependency !== undefined) {
        expect(LIBRARY_DEPENDENCIES).toContain(rule.dependency);
      }
    });
  });
});

describe("detectionSchemaLoader", () => {
  it("loads one root feature per YAML file", () => {
    expect(detectionFeaturesMapSchema).toHaveLength(yamlFiles.length);
  });

  it("only treats top-level rules as roots", () => {
    const roots = Object.values(rootDetectionFeaturesFlatSchema);
    expect(roots).toHaveLength(yamlFiles.length);
    roots.forEach((root) => {
      expect(root.level).toBe(0);
      expect(root.parentKey).toBe("");
      expect(typeof root.code).toBe("string");
    });
  });

  it("gives every root a unique featureKey", () => {
    const keys = Object.values(rootDetectionFeaturesFlatSchema).map(
      (root) => root.featureKey
    );
    expect(new Set(keys).size).toBe(keys.length);
  });
});
