# Detection Module

A robust browser-based detection module that collects and analyzes various browser and device characteristics to identify potential automation or bot activity.

## Architecture

```
detection/
├── core/           # Core types and interfaces
│   ├── types.ts    # Type definitions
│   └── index.ts    # Core module exports
├── config/         # Configuration and rules
│   ├── detectionFeatures.ts    # Feature definitions
│   ├── fingerprintingLibraries.ts # Library definitions
│   └── detection_rules/        # YAML rule files
├── storage/        # Storage interface and implementations
│   ├── interface.ts # Storage interface
│   └── index.ts    # Storage implementations
└── utils/          # Utility functions
    ├── detection-codes-manager.ts  # Code loading and caching
    ├── evaluation-manager.ts       # Feature evaluation
    ├── featureLookup.ts           # Feature metadata lookup
    └── external-libraries/        # External library implementations
```

## Core Components

### 1. Detection Module (`index.ts`)

The main entry point that provides:

- Feature evaluation
- Result caching
- Context management
- Public API for feature and library access

```typescript
import { detectionModule } from "@/detection";

// Get all available features
const features = detectionModule.getFeatures();

// Get all available libraries
const libraries = detectionModule.getLibraries();

// Get feature metadata
const metadata = detectionModule.getFeatureMetadata("featureFullKey");

// Create a detection context
const { getState, actions } = detectionModule.createContext(options);
```

### 2. Feature Configuration (`config/`)

Features are defined in YAML files with the following structure:

```yaml
- id: "browser_features"
  name: "Browser Features Detection"
  type: "object"
  code: |
    (async () => {
      // Detection logic
    })()
  description: "Detects browser features and capabilities"
  abuseIndication:
    bot: "Indicates automated browser environment"
  outputs:
    webgl:
      name: "WebGL Support"
      type: "boolean"
      description: "WebGL support detection"
  exemplaryValues:
    - { webgl: true }
    - { webgl: false }
```

### 3. Storage Interface (`storage/`)

Abstract storage interface for caching results:

```typescript
interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
```

### 4. Evaluation Manager (`utils/evaluation-manager.ts`)

Handles feature evaluation and result management:

- Loads and evaluates detection codes
- Manages result caching
- Handles error states

## Usage

### Basic Setup

```typescript
import { detectionModule } from "@/detection";

// Initialize with storage implementation
const storage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
};

// Create detection context
const { getState, actions } = detectionModule.createContext({
  storage,
  cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
  autoRefresh: true,
});
```

### Feature Evaluation

```typescript
// Get current results
const { results, status, error } = getState();

// Force refresh results
await actions.refresh();

// Retry on error
await actions.retry();
```

### Custom Features

1. Create a new YAML file in `config/detection_rules/`:

```yaml
- id: "custom_detection"
  name: "Custom Detection"
  type: "object"
  code: |
    (async () => {
      // Your detection logic
      return {
        result: true,
        details: "Custom detection details"
      };
    })()
  description: "Custom detection feature"
  abuseIndication:
    bot: "Indicates potential bot activity"
  outputs:
    result:
      name: "Detection Result"
      type: "boolean"
    details:
      name: "Details"
      type: "string"
```

2. The feature will be automatically loaded and available through the detection module.

## Error Handling

The module provides robust error handling:

- Automatic error boundaries
- Graceful fallbacks
- Clear error messages
- Retry mechanisms

```typescript
try {
  const results = await detectionModule.loadAndEvaluate(storage);
} catch (error) {
  console.error("Detection failed:", error);
  // Handle error appropriately
}
```

## Performance Optimization

- Results are cached with configurable expiry
- Features are evaluated only when necessary
- Efficient storage implementation
- Memoization of feature metadata

## Type Safety

Full TypeScript support with comprehensive type definitions:

- `DetectionResult`
- `DetectionFeature`
- `Storage`
- `DetectionOptions`
- And more...

## Testing

Run detection module tests:

```bash
npm test detection
# or
yarn test detection
```

## Contributing

1. Follow the existing code structure
2. Add appropriate tests
3. Update documentation
4. Submit a pull request

## License

This module is part of the main project and follows the same MIT license.
