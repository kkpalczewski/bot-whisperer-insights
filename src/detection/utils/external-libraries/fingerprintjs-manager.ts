import type { Agent } from "@fingerprintjs/fingerprintjs";
import { cachedLibrary } from "./types";

/**
 * Gets or initializes a FingerprintJS agent
 */
export const getFingerprintJS = (): Promise<Agent> =>
  cachedLibrary("fingerprintjs", async () => {
    const fpjs = await import("@fingerprintjs/fingerprintjs");
    return fpjs.load();
  });
