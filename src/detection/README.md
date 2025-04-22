# Detection Module

A browser-based detection module that collects and analyzes various browser and device characteristics to identify potential automation or bot activity.

## Purpose

This module is designed to:

- Collect comprehensive browser and device information
- Evaluate detection rules defined in YAML configuration files
- Provide a clean interface for accessing detection results
- Cache results for performance optimization
- Support extensible detection rules and patterns
- Enable easy integration with any JavaScript framework

## Features

- **Browser Fingerprinting**: Collects detailed browser characteristics
- **Device Detection**: Identifies device type, brand, and model
- **Automation Detection**: Detects common automation frameworks and tools
- **Performance Monitoring**: Tracks browser performance characteristics
- **Caching System**: Implements efficient result caching with configurable expiry
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Extensible Rules**: Easy to add new detection rules via YAML configuration

## Installation

```bash
npm install @your-org/detection
```

## Quick Start

```typescript
import { initDetection } from "@your-org/detection";

// Initialize with options
const detection = initDetection({
  storage: {
    getItem: (key: string) => localStorage.getItem(key),
    setItem: (key: string, value: string) => localStorage.setItem(key, value),
  },
  cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
  autoRefresh: true,
});

// Get detection results
try {
  const results = await detection.getResults();
  console.log("Browser characteristics:", results);
} catch (error) {
  console.error("Failed to get results:", error);
}

// Force refresh results
const freshResults = await detection.refresh();

// Clear cache
detection.clearCache();
```

## API Reference

### `initDetection(options: DetectionOptions): DetectionInstance`

Initialize the detection module with configuration options.

#### Options

```typescript
interface DetectionOptions {
  /**
   * Storage implementation for caching results
   * Must implement getItem and setItem methods
   */
  storage: Storage;

  /**
   * Cache expiration time in milliseconds
   * @default 24 hours
   */
  cacheExpiry?: number;

  /**
   * Whether to automatically refresh results when they expire
   * @default true
   */
  autoRefresh?: boolean;
}
```

#### Instance Methods

- `getResults(): Promise<DetectionResult>` - Get current detection results
  ```typescript
  interface DetectionResult {
    [key: string]: {
      value?: DetectionValue;
      error?: string;
      timestamp: string;
    };
  }
  ```
- `refresh(): Promise<DetectionResult>` - Force refresh of detection results
- `clearCache(): void` - Clear cached results

## Configuration

Detection rules are defined in YAML files under the `config/detection_rules` directory. Each rule includes:

- `id`: Unique identifier
- `name`: Human-readable name
- `codeName`: Code identifier
- `type`: Value type (string, number, boolean, array, object)
- `code`: Detection logic
- `description`: Rule description
- `abuse_indication`: Bot detection indicators
- `outputs`: Expected output structure
- `exemplary_values`: Example values for testing

Example rule:

```yaml
- id: "browser_features"
  name: "Browser Features Detection"
  codeName: "browserFeatures"
  type: "object"
  code: |
    (async () => {
      // Detection logic
    })()
  description: "Detects browser features and capabilities"
  abuse_indication:
    bot: "Indicates automated browser environment"
  outputs:
    webgl:
      name: "WebGL Support"
      type: "boolean"
      description: "WebGL support detection"
  exemplary_values:
    - { webgl: true }
    - { webgl: false }
```

## Project Structure

```
detection/
├── core/           # Core types and interfaces
│   ├── types.ts    # Type definitions
│   └── index.ts    # Core module exports
├── storage/        # Storage interface and implementations
│   ├── interface.ts # Storage interface
│   └── index.ts    # Storage implementations
├── config/         # Configuration and rules
│   ├── detectionFeatures.ts # Feature definitions
│   └── detection_rules/     # YAML rule files
└── utils/          # Utility functions and managers
    ├── evaluation-manager.ts    # Result evaluation
    ├── detection-codes-manager.ts # Code management
    └── library-manager.ts      # External library handling
```

## Development

The module is designed to be:

- **Framework-agnostic**: Works with any JavaScript framework
- **Easily testable**: Comprehensive test coverage
- **Extensible**: Easy to add new detection rules
- **Well-typed**: Full TypeScript support
- **Performant**: Efficient caching and evaluation
- **Maintainable**: Clear code structure and documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your changes
4. Update documentation
5. Submit a pull request

## Future Improvements

- [ ] Add more detection rules
- [ ] Improve error handling
- [ ] Add more test coverage
- [ ] Document API in detail
- [ ] Add performance benchmarks
- [ ] Support custom rule loading
- [ ] Add real-time monitoring
- [ ] Implement rule versioning
