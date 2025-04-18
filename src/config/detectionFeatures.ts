
// Configuration for bot detection features
export interface DetectionFeature {
  id: string;
  name: string;
  code: string;
  description: string;
  category: 'browser' | 'network' | 'behavior' | 'hardware' | 'fingerprinting';
}

export const detectionFeatures: DetectionFeature[] = [
  {
    id: 'user-agent',
    name: 'User Agent',
    code: 'navigator.userAgent',
    description: 'The user agent string provides information about the browser and operating system. Bots often use fake or inconsistent user agents that can be detected.',
    category: 'browser'
  },
  {
    id: 'languages',
    name: 'Browser Languages',
    code: 'navigator.languages || []',
    description: 'Human users typically have consistent language preferences set in their browsers. Bots may have missing or inconsistent language settings.',
    category: 'browser'
  },
  {
    id: 'time-zone',
    name: 'Time Zone',
    code: 'Intl.DateTimeFormat().resolvedOptions().timeZone',
    description: 'The browser time zone can be compared with the IP geolocation. Mismatches can indicate bot activity or VPN usage.',
    category: 'browser'
  },
  {
    id: 'screen-size',
    name: 'Screen Resolution',
    code: '{ width: screen.width, height: screen.height, colorDepth: screen.colorDepth }',
    description: 'Bots often report common or unrealistic screen dimensions. Headless browsers may have unusual resolutions.',
    category: 'hardware'
  },
  {
    id: 'plugins',
    name: 'Browser Plugins',
    code: 'Array.from(navigator.plugins).map(p => p.name)',
    description: 'The presence and variety of plugins can help identify real browsers. Bots typically have few or no plugins.',
    category: 'browser'
  },
  {
    id: 'webgl',
    name: 'WebGL Fingerprint',
    code: 'const canvas = document.createElement("canvas"); const gl = canvas.getContext("webgl"); gl?.getExtension("WEBGL_debug_renderer_info") ? gl.getParameter(gl.getExtension("WEBGL_debug_renderer_info").UNMASKED_RENDERER_WEBGL) : null',
    description: 'WebGL renderer information can identify the graphics hardware. This is difficult for bots to spoof accurately.',
    category: 'hardware'
  },
  {
    id: 'canvas',
    name: 'Canvas Fingerprint',
    code: '(() => { const canvas = document.createElement("canvas"); canvas.width = 240; canvas.height = 60; const ctx = canvas.getContext("2d"); ctx.fillText("BotWhisperer", 10, 50); return canvas.toDataURL(); })()',
    description: 'Canvas rendering varies by device and browser. The subtle differences in how text and shapes are rendered create a unique fingerprint that is hard to fake.',
    category: 'fingerprinting'
  },
  {
    id: 'fonts',
    name: 'Available Fonts',
    code: '// Uses font detection techniques to determine available fonts',
    description: 'The collection of fonts installed on a device creates a unique signature. Bots typically have limited or predictable font sets.',
    category: 'fingerprinting'
  },
  {
    id: 'cpu-cores',
    name: 'CPU Cores',
    code: 'navigator.hardwareConcurrency || 0',
    description: 'The number of logical processors can help identify the device type. Bots often have unrealistic or inconsistent values.',
    category: 'hardware'
  },
  {
    id: 'memory',
    name: 'Device Memory',
    code: '(navigator as any).deviceMemory || "Not available"',
    description: 'The amount of RAM available can help identify device capabilities. This is often spoofed or unavailable in bot environments.',
    category: 'hardware'
  },
  {
    id: 'touch-support',
    name: 'Touch Support',
    code: '{ maxTouchPoints: navigator.maxTouchPoints, touchEvent: "ontouchstart" in window, touchPoints: navigator.maxTouchPoints > 0 }',
    description: 'Touch capabilities can indicate device type. Inconsistencies between touch support and device type may indicate spoofing.',
    category: 'hardware'
  },
  {
    id: 'connection-type',
    name: 'Network Information',
    code: '(navigator as any).connection ? { effectiveType: (navigator as any).connection.effectiveType, rtt: (navigator as any).connection.rtt } : "Not available"',
    description: 'Network characteristics can help identify unusual connection patterns typical of bot networks or data centers.',
    category: 'network'
  },
  {
    id: 'battery',
    name: 'Battery Status',
    code: '// Requires Battery API access',
    description: 'Real devices have changing battery states. Bots might report static battery information or none at all.',
    category: 'hardware'
  },
  {
    id: 'mouse-movement',
    name: 'Mouse Movement Patterns',
    code: '// Requires tracking mouse movements over time',
    description: 'Human mouse movements follow natural patterns with slight imperfections. Bot movements tend to be too direct or have unnatural patterns.',
    category: 'behavior'
  },
  {
    id: 'keyboard-timing',
    name: 'Keyboard Typing Patterns',
    code: '// Requires tracking keystroke timing',
    description: 'Human typing has natural rhythm variations. Bots typically type with perfectly consistent timing or unrealistically fast speeds.',
    category: 'behavior'
  }
];

// Third-party fingerprinting libraries info
export interface LibraryInfo {
  id: string;
  name: string;
  description: string;
  website: string;
  features: string[];
}

export const fingerprintingLibraries: LibraryInfo[] = [
  {
    id: 'fingerprint-js',
    name: 'FingerprintJS',
    description: 'A commercial browser fingerprinting service that identifies browsers with high accuracy.',
    website: 'https://fingerprint.com/',
    features: [
      'Browser fingerprinting',
      'VPN and proxy detection',
      'Bot detection',
      'TOR detection',
      'Incognito mode detection',
      'Device identification'
    ]
  },
  {
    id: 'creep-js',
    name: 'CreepJS',
    description: 'An open-source browser fingerprinting library focused on revealing spoofing and lies in the browser.',
    website: 'https://github.com/abrahamjuliot/creepjs',
    features: [
      'Browser fingerprinting',
      'Lie detection',
      'Spoofing detection',
      'Bot detection',
      'Unique browser identification'
    ]
  },
  {
    id: 'clientjs',
    name: 'ClientJS',
    description: 'An open-source browser fingerprinting library that collects browser data and creates a fingerprint.',
    website: 'https://github.com/jackspirou/clientjs',
    features: [
      'Browser fingerprinting',
      'User agent parsing',
      'Platform detection',
      'Language detection',
      'Flash detection'
    ]
  }
];
