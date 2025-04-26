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
│   ├── ui/              # Reusable UI components
│   ├── feature/         # Feature-related components
│   └── metadata/        # Metadata display components
├── contexts/            # React contexts
├── detection/           # Core detection module
│   ├── config/          # Configuration files
│   ├── core/            # Core types and interfaces
│   ├── storage/         # Storage implementations
│   └── utils/           # Utility functions
├── hooks/               # Custom React hooks
└── pages/               # Page components
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/bot-whisperer-insights.git
cd bot-whisperer-insights
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
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
   - Graceful fallbacks for failed detections
   - Clear error messages

### Advanced Usage

#### Custom Detection Rules

Add new detection rules in `src/detection/config/detection_rules/`:

```yaml
- id: "custom_feature"
  name: "Custom Feature Detection"
  type: "object"
  code: |
    (async () => {
      // Your detection logic here
    })()
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

// Get all available features
const features = detectionModule.getFeatures();

// Get detection results
const { results, status, error } = useDetectionConfig();

// Force refresh results
await detectionModule.refreshResults(storage);
```

## Development

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error boundaries
- Write comprehensive tests

### Testing

Run tests:

```bash
npm test
# or
yarn test
```

### Building

Build for production:

```bash
npm run build
# or
yarn build
```

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
