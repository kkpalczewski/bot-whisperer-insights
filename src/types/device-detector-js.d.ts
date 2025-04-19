declare module 'device-detector-js' {
  interface Device {
    type?: string;
    brand?: string;
    model?: string;
  }

  interface OS {
    name?: string;
    version?: string;
    platform?: string;
  }

  interface Client {
    type?: string;
    name?: string;
    version?: string;
    engine?: string;
    engineVersion?: string;
  }

  interface BotProducer {
    name?: string;
    url?: string;
  }

  interface Bot {
    name?: string;
    category?: string;
    url?: string;
    producer?: BotProducer;
  }

  interface ParseResult {
    device?: Device;
    os?: OS;
    client?: Client;
    bot?: Bot;
  }

  class DeviceDetector {
    constructor();
    parse(userAgent: string): ParseResult;
  }

  export default DeviceDetector;
} 