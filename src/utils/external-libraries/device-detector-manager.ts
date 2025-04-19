import { toast } from 'sonner';
import { libraryInstances } from './types';

/**
 * Gets or initializes a device detector instance
 */
export async function getDeviceDetector() {
  if (libraryInstances.deviceDetector) {
    return libraryInstances.deviceDetector;
  }

  try {
    // Try to load from npm
    const DeviceDetector = (await import('device-detector-js')).default;
    libraryInstances.deviceDetector = new DeviceDetector();
    return libraryInstances.deviceDetector;
  } catch (error) {
    console.warn('Failed to load device-detector-js from npm:', error);
  }

  try {
    // Try to load from CDN
    if (!window.DeviceDetector) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/device-detector-js@2.2.10/dist/device-detector.min.js';
      script.async = true;
      document.head.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }

    libraryInstances.deviceDetector = new window.DeviceDetector();
    return libraryInstances.deviceDetector;
  } catch (error) {
    console.warn('Failed to load device-detector-js from CDN:', error);
    return null;
  }
} 