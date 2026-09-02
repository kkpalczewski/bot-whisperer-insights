import { getClientJS } from "./clientjs-manager";
import { getDeviceDetector } from "./device-detector-manager";
import { getFingerprintJS } from "./fingerprintjs-manager";
import { LibraryDependency } from "./types";

const loaders: Record<LibraryDependency, () => Promise<unknown>> = {
  clientjs: getClientJS,
  fingerprintjs: getFingerprintJS,
  deviceDetector: getDeviceDetector,
};

/**
 * Checks if a required library dependency can be initialised
 */
export const checkDependency = async (
  dependency: LibraryDependency
): Promise<{ available: boolean; error?: string }> => {
  const loader = loaders[dependency];
  if (!loader) {
    return { available: false, error: `Unknown dependency '${dependency}'` };
  }
  try {
    const library = await loader();
    return library
      ? { available: true }
      : { available: false, error: `Dependency '${dependency}' not available` };
  } catch (error) {
    return {
      available: false,
      error:
        error instanceof Error
          ? error.message
          : `Unknown error loading '${dependency}'`,
    };
  }
};

/**
 * Functions injected into rule code so rules can access library instances
 */
export const getDependencyFunctions = () => ({
  getClientJS,
  getFingerprintJS,
  getDeviceDetector,
});
