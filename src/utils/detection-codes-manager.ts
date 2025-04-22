import { parse } from "yaml";

interface DetectionFeature {
  codeName: string;
  code: string;
}

const DETECTION_CODES_KEY = "detection_codes";

// Import all YAML files from the detection_rules directory
const modules = import.meta.glob("../config/detection_rules/*.yaml", {
  eager: true,
  as: "raw",
});

export async function loadDetectionCodes() {
  try {
    // Check if codes are already in localStorage
    const cachedCodes = localStorage.getItem(DETECTION_CODES_KEY);
    if (cachedCodes) {
      return JSON.parse(cachedCodes);
    }

    // Parse each YAML file and collect codes
    const allCodes = Object.values(modules)
      .flatMap((content) => {
        try {
          const parsed = parse(content);
          return (
            parsed?.map((feature: DetectionFeature) => ({
              [feature.codeName]: feature.code,
            })) || []
          );
        } catch (e) {
          console.error("Error parsing YAML file:", e);
          return [];
        }
      })
      .reduce((acc, curr) => ({ ...acc, ...curr }), {});

    // Save to localStorage
    localStorage.setItem(DETECTION_CODES_KEY, JSON.stringify(allCodes));
    return allCodes;
  } catch (error) {
    console.error("Error loading detection codes:", error);
    return {};
  }
}
