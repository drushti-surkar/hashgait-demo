# HashGait Frontend - React Native App

A React Native + Expo application for behavioral authentication using gait patterns and device sensors.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+ recommended)
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator or Android Emulator (or physical device with Expo Go app)

### Installation
```bash
npm install
# or
yarn install
```

### Run the App
```bash
npx expo start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator  
- Scan QR code with Expo Go app on physical device

## 📱 App Structure

### Screens
1. **LoginScreen** - Mock authentication with username/password
2. **GaitCaptureScreen** - Behavioral data collection with sensors
3. **ResultScreen** - Display hash results and history
4. **DashboardScreen** - User profile, live sensors, backend status

### Navigation Flow
```
Login → Gait Capture → Results → Dashboard
  ↑         ↓            ↓        ↓
  ←←←← Logout ←←←← New Capture ←←←←
```

## 🏗️ Architecture

### Directory Structure
```
src/
├── components/          # Reusable UI components
│   ├── AuthenticationScreen.tsx (legacy)
│   ├── SensorManager.tsx
│   └── TouchCapture.tsx
├── screens/            # Main app screens
│   ├── LoginScreen.tsx
│   ├── GaitCaptureScreen.tsx
│   ├── ResultScreen.tsx
│   └── DashboardScreen.tsx
├── services/           # Backend integrations
│   ├── BehavioralEngine.ts
│   ├── ICPService.ts
│   └── NodeBackendService.ts
├── navigation/         # Navigation logic
│   └── AppNavigator.tsx
└── types/             # TypeScript definitions
    └── SensorTypes.ts
```

### Key Features

#### 🎯 Behavioral Authentication
- **Touch Pattern Analysis** - Pressure, duration, velocity tracking
- **Motion Sensors** - Accelerometer and gyroscope data collection
- **Pattern Hashing** - Generate unique behavioral signatures
- **Confidence Scoring** - Real-time authentication confidence

#### 🔗 Dual Backend Support
- **Node.js Backend** - SHA-256 hashing, history storage
- **ICP Backend** - Behavioral pattern verification, canister storage
- **Automatic Fallback** - Works with either backend independently

#### 📊 Real-time Monitoring
- **Live Sensor Data** - Real-time accelerometer/gyroscope readings
- **Backend Status** - Connection monitoring and statistics
- **Performance Metrics** - Memory usage, uptime, hash counts

## 🔧 Configuration

### Backend URLs
The app connects to both backends:
- **Node.js Backend**: `http://localhost:3000` (configurable in NodeBackendService.ts)
- **ICP Backend**: Via DFX declarations (auto-generated)

### Sensor Settings
- **Collection Rate**: ~60Hz for accelerometer/gyroscope
- **Capture Duration**: 10 seconds default
- **Touch Sensitivity**: Pressure and timing thresholds

## 📚 API Integration

### Node.js Backend Endpoints
```typescript
// Health check
GET /
Response: { message: "HashGait Backend Running!", status: "healthy" }

// Generate hash
POST /hash
Body: { gaitData: "behavioral-pattern-string" }
Response: { success: true, hash: "sha256-hash", ... }

// Get history
GET /history
Response: { success: true, history: [...], count: 5 }
```

### ICP Backend Methods
```typescript
// Save pattern
saveBehavioralPattern(userId, patternHash, features, deviceId)

// Verify pattern  
verifyBehavioralPattern(userId, patternHash, deviceId)
```

## 🧪 Testing

### Manual Testing Flow
1. **Login**: Enter any username/password
2. **Capture**: Interact with screen for 10 seconds while moving
3. **Results**: View hashes, confidence scores, history
4. **Dashboard**: Monitor live sensors, backend status

### Debug Features
- Console logging for all sensor events
- Network request/response logging
- Error handling with user-friendly alerts
- Offline mode support

## 🎨 UI/UX Features

### Design System
- **Modern Material Design** - Clean cards, consistent spacing
- **Intuitive Navigation** - Clear screen transitions
- **Real-time Feedback** - Progress indicators, live updates
- **Responsive Layout** - Works on various screen sizes

### Accessibility
- **High Contrast** - Clear text/background ratios
- **Touch Targets** - Minimum 44pt touch areas
- **Error States** - Clear error messaging
- **Loading States** - Progress indicators for all async operations

## 🔐 Security Features

### Behavioral Biometrics
- **Multi-modal Analysis** - Touch + motion sensor fusion
- **Pattern Uniqueness** - Generates unique behavioral signatures
- **Confidence Thresholds** - Configurable authentication levels
- **Replay Protection** - Timestamp and session validation

### Data Privacy
- **Local Processing** - Behavioral analysis on-device
- **Hashed Storage** - Only pattern hashes stored remotely  
- **Session Isolation** - Unique session IDs per capture
- **No PII Storage** - No personal information in behavioral data

## 🚀 Deployment

### Development Build
```bash
npx expo start
```

### Production Build
```bash
# iOS
npx expo build:ios

# Android  
npx expo build:android
```

### Expo Publishing
```bash
npx expo publish
```

## 📱 Device Requirements

### iOS
- iOS 11.0+
- iPhone 5s or newer
- Accelerometer/Gyroscope sensors

### Android
- Android API Level 21+ (Android 5.0)
- ARM64 or ARMv7 processor
- Accelerometer/Gyroscope sensors

## 🐛 Troubleshooting

### Common Issues

**Backend Connection Failed**
- Ensure Node.js backend is running on `http://localhost:3000`
- Check network connectivity
- Verify CORS settings

**Sensor Data Not Collecting**
- Grant motion & fitness permissions
- Test on physical device (sensors don't work in simulator)
- Check sensor availability

**Build Errors**
- Clear expo cache: `npx expo r -c`
- Reinstall dependencies: `rm -rf node_modules && yarn install`
- Update Expo CLI: `npm install -g @expo/cli`

**Performance Issues**
- Reduce sensor sampling rate
- Limit touch event collection
- Clear app cache/data

## 📝 Development Notes

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Functional components with hooks
- Clear separation of concerns

### State Management
- React hooks for local state
- Context-free navigation
- Minimal prop drilling
- Clear data flow patterns

### Error Handling
- Try-catch blocks for async operations
- User-friendly error messages
- Graceful degradation for offline mode
- Comprehensive logging

## 🤝 Contributing

This is a hackathon demo project. For production use:

1. **Add Authentication** - Real user authentication system
2. **Enhance Security** - Encrypt sensitive data, secure communications
3. **Add Analytics** - User behavior analytics, performance monitoring
4. **Improve UX** - Better onboarding, tutorials, accessibility
5. **Add Tests** - Unit tests, integration tests, E2E tests

## 📊 Demo Features

Perfect for hackathon demos:
- ✅ **Quick Setup** - Runs in 2 minutes
- ✅ **Visual Impact** - Real-time charts and animations
- ✅ **Technical Depth** - Advanced behavioral analysis
- ✅ **Dual Backends** - Shows architectural flexibility
- ✅ **Live Data** - Real sensor readings for engagement
- ✅ **Professional UI** - Polished, modern interface

## 📞 Support

For hackathon demo support:
- Check console logs for debugging
- Verify both backends are running
- Test on physical device for sensors
- Use provided test data if sensors fail