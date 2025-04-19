
import { toast } from 'sonner';
import { libraryInstances } from './types';

/**
 * Gets or initializes a ClientJS instance
 */
export const getClientJS = async (): Promise<any> => {
  if (libraryInstances.clientjs) {
    return libraryInstances.clientjs;
  }

  try {
    // First try to load ClientJS from npm
    try {
      const ClientJS = await import('clientjs').then(m => m.default || m);
      if (typeof ClientJS === 'function') {
        const clientjs = new ClientJS();
        libraryInstances.clientjs = clientjs;
        return clientjs;
      }
    } catch (e) {
      console.warn('Failed to load ClientJS from import:', e);
    }

    // Try to access the global ClientJS
    if (typeof window.ClientJS === 'function') {
      const clientjs = new window.ClientJS();
      libraryInstances.clientjs = clientjs;
      return clientjs;
    }

    // If we couldn't load ClientJS, create a script tag to load it
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/clientjs/dist/client.min.js';
      script.async = true;
      script.onload = () => {
        if (typeof window.ClientJS === 'function') {
          const clientjs = new window.ClientJS();
          libraryInstances.clientjs = clientjs;
          resolve(clientjs);
        } else {
          const error = new Error('ClientJS loaded but ClientJS constructor not found');
          console.error(error);
          reject(error);
        }
      };
      script.onerror = (e) => {
        console.error('Failed to load ClientJS from CDN:', e);
        reject(new Error('Failed to load ClientJS library from CDN'));
      };
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('Error initializing ClientJS:', error);
    toast.error('Failed to initialize ClientJS library');
    return null;
  }
};
