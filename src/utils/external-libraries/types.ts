
export interface LibraryStore {
  clientjs?: any;
  fingerprintjs?: any;
  creepjs?: any;
}

export const libraryInstances: LibraryStore = {};

// Make library manager available globally for feature code execution
if (typeof window !== 'undefined') {
  (window as any).libraryManager = {
    getClientJS: async () => (await import('./clientjs-manager')).getClientJS(),
    getFingerprintJS: async () => (await import('./fingerprintjs-manager')).getFingerprintJS(),
    getCreepJS: async () => (await import('./creepjs-manager')).getCreepJS()
  };
}
