# B2BD - Bot-to-Bot Detector

A comprehensive browser-based bot detection and analysis tool that helps identify and analyze potential automation or bot activity.

## Features

- **Real-time Bot Detection**: Analyze browser characteristics in real-time
- **Feature Evaluation**: Evaluate multiple detection features simultaneously
- **Library Detection**: Identify common fingerprinting libraries
- **Detailed Analysis**: View detailed feature metadata and results
- **Error Handling**: Robust error boundaries and graceful fallbacks
- **Performance Optimized**: Efficient caching and memoization
- **Type Safe**: Full TypeScript support with comprehensive type definitions

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui primitives
│   ├── feature/         # Feature table cells
│   └── metadata/        # Metadata drawer content
├── contexts/            # DetectionConfigProvider (evaluation store -> React)
├── detection/           # Core detection module (framework-agnostic)
│   ├── config/          # YAML rule loader + detection_rules/*.yaml
│   ├── core/            # Result/state types
│   ├── storage/         # Storage interface (localStorage in the app)
│   ├── types/           # Rule schema types
│   ├── utils/           # Evaluation pipeline and library loaders
│   └── __tests__/       # Vitest suite
├── hooks/               # Custom React hooks
└── pages/               # Route components
```

## Getting Started

### Prerequisites

- Node.js 22 or higher
- npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/bot-whisperer-insights.git
cd bot-whisperer-insights
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## Usage

### Basic Usage

The application provides a user-friendly interface to analyze browser characteristics:

1. **Feature Analysis**:

   - View all available detection features
   - Expand features to see detailed results
   - Check for potential bot indicators

2. **Library Detection**:

   - Identify fingerprinting libraries
   - View library metadata and detection status

3. **Error Handling**:
   - Automatic error boundaries
   - Each rule is evaluated with a timeout; a failing rule reports its error instead of blocking the others
   - Clear error messages

### Advanced Usage

#### Custom Detection Rules

Add a new YAML file in `src/detection/config/detection_rules/`. Each file holds exactly one
top-level key, which becomes the rule id. The `code` is an async function body evaluated in the
browser with `getClientJS()`, `getFingerprintJS()` and `getDeviceDetector()` in scope; declare the
library you use under `dependency` so it is loaded first.

```yaml
custom_feature:
  name: "Custom Feature Detection"
  type: "object"
  dependency: fingerprintjs # optional: clientjs | fingerprintjs | deviceDetector
  code: |
    async () => {
      const agent = await getFingerprintJS();
      const { visitorId } = await agent.get();
      return { result: visitorId.length > 0 };
    }
  description: "Custom feature detection"
  abuseIndication:
    bot: "Indicates potential bot activity"
  outputs:
    result:
      name: "Detection Result"
      type: "boolean"
      description: "Custom detection result"
  exemplaryValues:
    - { result: true }
    - { result: false }
```

#### Extending the Detection Module

The detection module can be extended with new features:

```typescript
import { detectionModule } from "@/detection";
import { useDetectionConfig } from "@/contexts/DetectionConfigContext";

// Get all available features (parsed rule schemas)
const features = detectionModule.getFeatures();

// Inside a component: current results and actions
const { results, status, error, refresh, retry } = useDetectionConfig();

// Outside React: an observable store over any Storage implementation
const store = detectionModule.createStore({ storage });
store.subscribe(() => console.log(store.getState()));
await store.load();
```

## Development

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error boundaries
- Write comprehensive tests

### Quality gate

CI runs the same commands on every push and pull request:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

`npm run build` type-checks before bundling, so a type error fails the build.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors
- Inspired by various bot detection research
- Built with modern web technologies
