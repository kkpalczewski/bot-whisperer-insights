import { toast } from 'sonner';

export async function getNetworkInfo() {
  try {
    return {
      connection: navigator.connection || (navigator as any).mozConnection || (navigator as any).webkitConnection,
      fetch: window.fetch
    };
  } catch (error) {
    console.error('Failed to get network information:', error);
    toast.error('Failed to get network information');
    return null;
  }
}
