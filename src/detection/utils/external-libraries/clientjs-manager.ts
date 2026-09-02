import type { ClientJS } from "clientjs";
import { cachedLibrary } from "./types";

/**
 * Gets or initializes a ClientJS instance
 */
export const getClientJS = (): Promise<ClientJS> =>
  cachedLibrary("clientjs", async () => {
    const { ClientJS } = await import("clientjs");
    return new ClientJS();
  });
