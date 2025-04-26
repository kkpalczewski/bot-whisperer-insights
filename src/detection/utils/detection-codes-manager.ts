import { Storage } from "../storage/interface";

const DETECTION_CODES_KEY = "detection_codes";

export async function loadDetectionCodes(
  storage: Storage
): Promise<Record<string, string>> {
  try {
    const cachedCodes = storage.getItem(DETECTION_CODES_KEY);
    if (cachedCodes) {
      return JSON.parse(cachedCodes);
    }

    // If no cached codes, load from public directory
    const response = await fetch("/detection-codes.json");
    if (!response.ok) {
      throw new Error("Failed to load detection codes");
    }

    const allCodes = await response.json();
    // Cache the loaded codes
    storage.setItem(DETECTION_CODES_KEY, JSON.stringify(allCodes));
    return allCodes;
  } catch (error) {
    console.error("Error loading detection codes:", error);
    return {};
  }
}
