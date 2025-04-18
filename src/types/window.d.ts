interface Window {
  ClientJS: any;
  FingerprintJS: any;
  libraryManager: {
    getClientJS: () => Promise<any>;
    getFingerprintJS: () => Promise<any>;
  };
  CreepJS?: {
    get: () => Promise<{
      fingerprint: string;
      lies: {
        detected: boolean;
        score: number;
      };
      bot: boolean;
      stealth: boolean;
      components: {
        canvas: any;
        audio: any;
        fonts: any;
        webGL: any;
      };
    }>;
  };
}
