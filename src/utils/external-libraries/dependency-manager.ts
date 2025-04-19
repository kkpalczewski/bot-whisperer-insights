import { toast } from 'sonner';
import { libraryInstances } from './types';
import { getDeviceDetector } from './device-detector-manager';

export type LibraryDependency = 'clientjs' | 'fingerprintjs' | 'creepjs' | 'devicedetector';

export async function checkDependency(dependency: LibraryDependency): Promise<{ 
  available: boolean; 
  error?: string;
}> {
  let detector;
  switch (dependency) {
    case 'clientjs':
      if (!libraryInstances.clientjs) {
        return {
          available: false,
          error: 'ClientJS library is not available'
        };
      }
      break;
    case 'fingerprintjs':
      if (!libraryInstances.fingerprintjs) {
        return {
          available: false,
          error: 'FingerprintJS library is not available'
        };
      }
      break;
    case 'creepjs':
      if (!libraryInstances.creepjs) {
        return {
          available: false,
          error: 'CreepJS library is not available'
        };
      }
      break;
    case 'devicedetector':
      detector = await getDeviceDetector();
      if (!detector) {
        return {
          available: false,
          error: 'Device detector is not available'
        };
      }
      break;
  }
  return { available: true };
}

export function getDependencyFunctions() {
  return {
    getClientJS: async () => (await import('./clientjs-manager')).getClientJS(),
    getFingerprintJS: async () => (await import('./fingerprintjs-manager')).getFingerprintJS(),
    getCreepJS: async () => (await import('./creepjs-manager')).getCreepJS(),
    getDeviceDetector: async () => getDeviceDetector()
  };
} 