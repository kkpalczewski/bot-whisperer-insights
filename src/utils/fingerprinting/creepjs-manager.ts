
import { toast } from 'sonner';
import { libraryInstances } from './types';

/**
 * Gets or initializes a CreepJS instance
 */
export const getCreepJS = async (): Promise<any> => {
  if (libraryInstances.creepjs) {
    return libraryInstances.creepjs;
  }

  try {
    // Check if CreepJS is already loaded globally
    if (typeof window.CreepJS !== 'undefined') {
      libraryInstances.creepjs = window.CreepJS;
      return window.CreepJS;
    }

    // Create a script tag to load CreepJS from CDN
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/creepjs@latest/dist/creep.min.js';
      script.async = true;
      script.onload = () => {
        if (typeof window.CreepJS !== 'undefined') {
          libraryInstances.creepjs = window.CreepJS;
          resolve(window.CreepJS);
        } else {
          const error = new Error('CreepJS loaded but global object not found');
          console.error(error);
          reject(error);
        }
      };
      script.onerror = (e) => {
        console.error('Failed to load CreepJS from CDN:', e);
        reject(new Error('Failed to load CreepJS library'));
      };
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('Error initializing CreepJS:', error);
    toast.error('Failed to initialize CreepJS library');
    return null;
  }
};
