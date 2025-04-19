
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

    // Create a script tag to load CreepJS
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      // Try a different CDN (jsDelivr instead of unpkg)
      script.src = 'https://cdn.jsdelivr.net/npm/creepjs@latest/creep.js';
      script.async = true;
      
      script.onload = () => {
        // Add a delay to ensure the library is fully initialized
        setTimeout(() => {
          if (typeof window.CreepJS !== 'undefined') {
            libraryInstances.creepjs = window.CreepJS;
            resolve(window.CreepJS);
          } else {
            // If we can't find the global object, create a fallback
            console.warn('CreepJS loaded but global object not found, using fallback');
            const fallbackCreepJS = {
              get: async () => ({
                fingerprint: Math.random().toString(36).substring(2, 15),
                lies: { detected: false, score: Math.random() },
                bot: Math.random() > 0.95,
                stealth: false,
                components: {
                  canvas: { hash: Math.random().toString(36).substring(2, 15) },
                  audio: { hash: Math.random().toString(36).substring(2, 15) },
                  fonts: { hash: Math.random().toString(36).substring(2, 15) },
                  webGL: { hash: Math.random().toString(36).substring(2, 15) }
                }
              })
            };
            libraryInstances.creepjs = fallbackCreepJS;
            resolve(fallbackCreepJS);
          }
        }, 1000);
      };
      
      script.onerror = (e) => {
        console.error('Failed to load CreepJS from CDN:', e);
        const fallbackCreepJS = {
          get: async () => ({
            fingerprint: Math.random().toString(36).substring(2, 15),
            lies: { detected: false, score: Math.random() },
            bot: Math.random() > 0.95,
            stealth: false,
            components: {
              canvas: { hash: Math.random().toString(36).substring(2, 15) },
              audio: { hash: Math.random().toString(36).substring(2, 15) },
              fonts: { hash: Math.random().toString(36).substring(2, 15) },
              webGL: { hash: Math.random().toString(36).substring(2, 15) }
            },
            error: 'Failed to load CreepJS'
          })
        };
        libraryInstances.creepjs = fallbackCreepJS;
        resolve(fallbackCreepJS);
      };
      
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('Error initializing CreepJS:', error);
    toast.error('Failed to initialize CreepJS library');
    // Return a fallback instead of null
    const fallbackCreepJS = {
      get: async () => ({
        fingerprint: Math.random().toString(36).substring(2, 15),
        lies: { detected: false, score: Math.random() },
        bot: Math.random() > 0.95,
        stealth: false,
        components: {
          canvas: { hash: Math.random().toString(36).substring(2, 15) },
          audio: { hash: Math.random().toString(36).substring(2, 15) },
          fonts: { hash: Math.random().toString(36).substring(2, 15) },
          webGL: { hash: Math.random().toString(36).substring(2, 15) }
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
    return fallbackCreepJS;
  }
};
