import { getClientJS } from './clientjs-manager';
import { getFingerprintJS } from './fingerprintjs-manager';
import { getCreepJS } from './creepjs-manager';
import { getDeviceDetector } from './device-detector-manager';

export type LibraryDependency = 'clientjs' | 'fingerprintjs' | 'creepjs' | 'deviceDetector';

/**
 * Checks if a required library dependency is available
 */
export const checkDependency = async (dependency: LibraryDependency): Promise<{ 
  available: boolean; 
  error?: string;
}> => {
  try {
    switch (dependency) {
      case 'clientjs': {
        const client = await getClientJS();
        return {
          available: !!client,
          error: !client ? `Dependency '${dependency}' not available` : undefined
        };
      }
      case 'fingerprintjs': {
        const fp = await getFingerprintJS();
        return {
          available: !!fp,
          error: !fp ? `Dependency '${dependency}' not available` : undefined
        };
      }
      case 'creepjs': {
        const creep = await getCreepJS();
        return {
          available: !!creep,
          error: !creep ? `Dependency '${dependency}' not available` : undefined
        };
      }
      case 'deviceDetector': {
        const detector = await getDeviceDetector();
        return {
          available: !!detector,
          error: !detector ? `Dependency '${dependency}' not available` : undefined
        };
      }
      default:
        return {
          available: false,
          error: `Unknown dependency '${dependency}'`
        };
    }
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error checking dependency'
    };
  }
};

/**
 * Gets functions for accessing library dependencies
 */
export const getDependencyFunctions = () => ({
  getClientJS: async () => await getClientJS(),
  getFingerprintJS: async () => await getFingerprintJS(),
  getCreepJS: async () => await getCreepJS()
}); 