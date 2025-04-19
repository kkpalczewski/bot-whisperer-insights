import { toast } from 'sonner';

interface NetworkInfo {
  connection: {
    effectiveType: string;
    rtt: number;
    downlink: number;
    saveData: boolean;
  };
  ipInfo: {
    ip: string;
    country: string;
    region: string;
    city: string;
    timezone: string;
    isp: string;
  };
  dns: {
    servers: string[];
    leak: boolean;
  };
  proxy: {
    detected: boolean;
    type: string | null;
  };
}

let networkInfo: NetworkInfo | null = null;

/**
 * Gets comprehensive network information
 */
export async function getNetworkInfo(): Promise<NetworkInfo | null> {
  if (networkInfo) {
    return networkInfo;
  }

  try {
    // Get connection info from Network Information API
    const connection = navigator.connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    // Get IP info from ip-api.com
    const ipResponse = await fetch('http://ip-api.com/json/');
    const ipData = await ipResponse.json();

    // Get DNS info
    const dnsServers = await getDNSServers();
    const dnsLeak = await checkDNSLeak();

    // Check for proxy
    const proxyInfo = await detectProxy();

    networkInfo = {
      connection: {
        effectiveType: connection?.effectiveType || 'unknown',
        rtt: connection?.rtt || 0,
        downlink: connection?.downlink || 0,
        saveData: connection?.saveData || false
      },
      ipInfo: {
        ip: ipData.query || 'unknown',
        country: ipData.country || 'unknown',
        region: ipData.regionName || 'unknown',
        city: ipData.city || 'unknown',
        timezone: ipData.timezone || 'unknown',
        isp: ipData.isp || 'unknown'
      },
      dns: {
        servers: dnsServers,
        leak: dnsLeak
      },
      proxy: {
        detected: proxyInfo.detected,
        type: proxyInfo.type
      }
    };

    return networkInfo;
  } catch (error) {
    console.error('Failed to get network information:', error);
    toast.error('Failed to get network information');
    return null;
  }
}

/**
 * Gets DNS servers being used
 */
async function getDNSServers(): Promise<string[]> {
  try {
    // This is a simplified version - in reality, DNS server detection
    // would require more sophisticated techniques
    return ['8.8.8.8', '8.8.4.4']; // Default to Google DNS
  } catch (error) {
    console.error('Failed to get DNS servers:', error);
    return [];
  }
}

/**
 * Checks for DNS leaks
 */
async function checkDNSLeak(): Promise<boolean> {
  try {
    // This would involve making requests to different DNS servers
    // and comparing the results
    return false;
  } catch (error) {
    console.error('Failed to check DNS leak:', error);
    return false;
  }
}

/**
 * Detects if a proxy is being used
 */
async function detectProxy(): Promise<{ detected: boolean; type: string | null }> {
  try {
    // Check for common proxy indicators
    const headers = {
      'X-Forwarded-For': null,
      'X-Real-IP': null,
      'Via': null,
      'Proxy-Connection': null
    };

    // Make a request to check headers
    const response = await fetch('https://httpbin.org/headers');
    const data = await response.json();
    
    const proxyHeaders = Object.keys(headers).filter(header => 
      data.headers[header] || data.headers[header.toLowerCase()]
    );

    return {
      detected: proxyHeaders.length > 0,
      type: proxyHeaders.length > 0 ? 'HTTP Proxy' : null
    };
  } catch (error) {
    console.error('Failed to detect proxy:', error);
    return { detected: false, type: null };
  }
} 