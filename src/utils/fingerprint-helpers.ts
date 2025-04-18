
// Helper functions for fingerprinting and data collection

/**
 * Safely evaluates code in a string format with error handling
 */
export const evaluateCode = (codeString: string): { result: any; error: string | null } => {
  try {
    // Never use eval in production - we're using Function constructor which is safer
    const result = new Function(`return ${codeString}`)();
    return { 
      result, 
      error: null 
    };
  } catch (err) {
    return { 
      result: null, 
      error: (err as Error).message 
    };
  }
};

/**
 * Returns a simplified object of the most important browser properties
 */
export const getBrowserFingerprint = () => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    doNotTrack: navigator.doNotTrack,
    cookieEnabled: navigator.cookieEnabled,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    devicePixelRatio: window.devicePixelRatio,
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    maxTouchPoints: navigator.maxTouchPoints,
    hasTouch: 'ontouchstart' in window,
    plugins: Array.from(navigator.plugins).map(p => p.name),
  };
};

/**
 * Get a canvas fingerprint
 */
export const getCanvasFingerprint = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 60;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return 'Canvas not supported';
  
  // Text with different styles and colors
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillStyle = '#F98';
  ctx.fillRect(0, 0, 100, 30);
  ctx.fillStyle = '#686';
  ctx.fillText('Bot Whisperer Insights', 2, 12);
  ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
  ctx.fillText('Canvas Fingerprint', 4, 26);
  
  return canvas.toDataURL();
};
