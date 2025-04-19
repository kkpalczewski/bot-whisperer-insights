
interface Window {
  ClientJS: any;
  FingerprintJS: any;
  libraryManager: {
    getClientJS: () => Promise<any>;
    getFingerprintJS: () => Promise<any>;
    getCreepJS: () => Promise<any>;
  };
  CreepJS?: any;
}
