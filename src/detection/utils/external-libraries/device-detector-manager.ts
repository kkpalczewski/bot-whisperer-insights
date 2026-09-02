import type DeviceDetector from "device-detector-js";
import { cachedLibrary } from "./types";

/**
 * Gets or initializes a device-detector-js instance
 */
export const getDeviceDetector = (): Promise<DeviceDetector> =>
  cachedLibrary("deviceDetector", async () => {
    const { default: DeviceDetector } = await import("device-detector-js");
    return new DeviceDetector();
  });
