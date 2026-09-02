declare module "clientjs" {
  export class ClientJS {
    getFingerprint(): number;
    getBrowser(): string;
    getBrowserVersion(): string;
    getBrowserMajorVersion(): number;
    getEngine(): string;
    getEngineVersion(): string;
    getOS(): string;
    getOSVersion(): string;
    getDevice(): string;
    getDeviceType(): string;
    getDeviceVendor(): string;
  }
}
