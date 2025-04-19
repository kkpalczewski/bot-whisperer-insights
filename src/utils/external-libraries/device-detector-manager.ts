import DeviceDetector from 'device-detector-js';

let deviceDetectorInstance: DeviceDetector | null = null;

export async function getDeviceDetector(): Promise<DeviceDetector | null> {
  if (deviceDetectorInstance) {
    return deviceDetectorInstance;
  }

  try {
    deviceDetectorInstance = new DeviceDetector();
    return deviceDetectorInstance;
  } catch (error) {
    console.error('Failed to initialize device detector:', error);
    return null;
  }
} 