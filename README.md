# HashGait - Behavioral Authentication Demo

A complete behavioral authentication system built for hackathon demonstration, featuring dual backends and advanced gait pattern analysis.

## 🎯 Project Overview

**HashGait** combines behavioral biometrics with modern web technologies to create a unique authentication system based on user movement patterns, touch behaviors, and device sensor data.

### Key Features
- 🚶‍♂️ **Gait Pattern Analysis** - Motion sensor-based behavioral authentication
- 🔐 **Dual Backend Architecture** - Node.js + ICP blockchain backends  
- 📱 **React Native Frontend** - Modern mobile app with real-time sensors
- 🎲 **SHA-256 Hashing** - Secure pattern generation and verification
- 📊 **Live Dashboard** - Real-time monitoring and statistics
- 🔄 **Automatic Fallback** - Works with either backend independently

## 🏗️ Architecture

```
HashGaitApp/                 # React Native Frontend
├── src/screens/            # Main app screens (Login, Capture, Results, Dashboard)  
├── src/services/           # Backend integrations (Node.js + ICP)
├── src/components/         # Reusable UI components
└── src/navigation/         # App navigation logic

backend/                    # Node.js + Express Backend
├── server.js              # Main server with SHA-256 hashing
├── package.json           # Dependencies and scripts
└── README.md              # Backend documentation

icp_backend/               # Internet Computer Protocol Backend  
├── src/index.ts           # Azle-based canister
├── dfx.json              # ICP configuration
└── package.json          # ICP dependencies
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Expo CLI: `npm install -g expo-cli`
- DFX SDK (for ICP backend)

### 1. Start Node.js Backend
```bash
cd backend
npm install
npm start
# Server runs at http://localhost:3000
```

### 2. Start ICP Backend (Optional)
```bash
cd icp_backend  
dfx start --background
dfx deploy
```

### 3. Start React Native Frontend
```bash
cd HashGaitApp
npm install
npx expo start
# Scan QR code with Expo Go app
```

## 📱 User Journey

### 1. Login Screen
- Mock authentication with any username/password
- Professional UI with demo instructions
- Smooth transition to gait capture

### 2. Gait Capture Screen  
- 10-second behavioral data collection
- Real-time touch and motion sensor tracking
- Progress indicator and live statistics
- Advanced behavioral pattern analysis

### 3. Results Screen
- **Node.js Backend**: SHA-256 hash generation and history
- **ICP Backend**: Pattern verification and confidence scoring
- Copy-to-clipboard functionality
- Comprehensive statistics display

### 4. Dashboard Screen
- User profile and session information  
- Live sensor readings (accelerometer/gyroscope)
- Backend connection status and statistics
- Quick actions for new captures

## 🔧 Technical Highlights

### Behavioral Analysis Engine
```typescript
// Extract behavioral features from sensor data
const features = behavioralEngine.extractFeatures(
    touchEvents,      // Touch pressure, duration, velocity
    accelerometerData, // Device motion patterns
    gyroscopeData     // Rotation patterns  
);

// Generate unique pattern hash
const patternHash = behavioralEngine.generatePatternHash(features);

// Calculate authentication confidence
const confidence = behavioralEngine.calculateConfidenceScore(features);
```

### Dual Backend Integration
```typescript
// Node.js Backend - SHA-256 hashing
const nodeResult = await nodeService.generateHash(gaitDataString);

// ICP Backend - Pattern verification  
const icpResult = await icpService.verifyBehavioralPattern(
    userId, patternHash, deviceId
);
```

### Real-time Sensor Collection
```typescript
// Live accelerometer/gyroscope data
<SensorManager
    onAccelerometerData={handleAccelData}
    onGyroscopeData={handleGyroData}
    isCollecting={true}
/>
```

## 🎨 UI/UX Features

- **Modern Design System** - Clean cards, consistent spacing, intuitive navigation
- **Real-time Feedback** - Progress bars, live sensor readings, status indicators
- **Professional Polish** - Smooth animations, loading states, error handling
- **Mobile Optimized** - Responsive design, touch-friendly interfaces
- **Accessibility** - High contrast, clear typography, proper touch targets

## 🔐 Security Features

- **Multi-modal Biometrics** - Combines touch behavior + motion sensors
- **Pattern Hashing** - Behavioral data converted to secure hashes
- **No PII Storage** - Only behavioral patterns stored, no personal data
- **Session Isolation** - Unique session IDs prevent replay attacks
- **Confidence Thresholds** - Configurable authentication sensitivity

## 📊 Demo Capabilities

Perfect for hackathon presentations:

### Technical Depth
- Advanced behavioral analysis algorithms
- Real-time sensor data processing
- Dual backend architecture demonstration
- Live authentication confidence scoring

### Visual Impact  
- Real-time sensor data visualization
- Professional mobile app interface
- Live backend status monitoring
- Interactive hash generation and history

### Scalability Showcase
- Blockchain backend (ICP) for decentralization
- Traditional backend (Node.js) for performance
- Mobile-first responsive design
- RESTful API architecture

## 🧪 Testing

### Backend Testing
```bash
# Test Node.js backend health
curl http://localhost:3000/

# Test hash generation  
curl -X POST http://localhost:3000/hash \
  -H "Content-Type: application/json" \
  -d '{"gaitData": "test-behavioral-pattern"}'

# Test history
curl http://localhost:3000/history
```

### Frontend Testing
1. Login with any credentials
2. Complete 10-second gait capture
3. View dual backend results
4. Explore dashboard features
5. Test offline mode capabilities

## 📁 File Structure

```
HashGait/
├── README.md              # This file
├── backend/              # Node.js backend
│   ├── server.js         # Express server with hashing
│   ├── package.json      # Dependencies
│   └── README.md         # Backend docs
├── icp_backend/          # ICP blockchain backend  
│   ├── src/index.ts      # Azle canister
│   ├── dfx.json          # ICP config
│   └── package.json      # ICP dependencies
└── HashGaitApp/          # React Native frontend
    ├── App.tsx           # Main app component
    ├── src/screens/      # App screens
    ├── src/services/     # Backend integrations
    ├── src/components/   # UI components
    ├── package.json      # Frontend dependencies
    └── README.md         # Frontend docs
```

## 🚀 Deployment Options

### Development
- Node.js backend: `npm start` (localhost:3000)
- ICP backend: `dfx start --background && dfx deploy`  
- Frontend: `npx expo start` (Expo Go app)

### Production
- **Backend**: Deploy to Heroku, Railway, AWS, DigitalOcean
- **ICP**: Deploy to Internet Computer mainnet
- **Frontend**: Build with `expo build` and deploy to app stores

## 🤝 Hackathon Presentation Tips

### Technical Demo Flow
1. **Architecture Overview** - Show dual backend system
2. **Live Gait Capture** - Demonstrate real sensor collection
3. **Hash Generation** - Show SHA-256 output and history  
4. **Behavioral Analysis** - Explain confidence scoring
5. **Dashboard Tour** - Live sensor data and backend monitoring

### Key Talking Points
- **Innovation**: Behavioral biometrics for authentication
- **Technical Complexity**: Real-time sensor processing + dual backends
- **Practical Application**: Mobile security, IoT device authentication
- **Scalability**: Blockchain + traditional backend architecture
- **User Experience**: Seamless authentication without passwords

### Demo Safety Tips
- Test on physical device (sensors required)
- Have backup demo data if sensors fail
- Prepare network connectivity backups
- Practice the 10-second capture timing
- Show error handling and offline capabilities

## 📈 Future Enhancements

### Production Readiness
- [ ] Real user authentication and registration
- [ ] Encrypted data transmission and storage  
- [ ] Advanced ML models for pattern recognition
- [ ] Production database (PostgreSQL/MongoDB)
- [ ] API rate limiting and monitoring

### Feature Additions
- [ ] Multi-device behavioral sync
- [ ] Continuous authentication during app usage
- [ ] Administrative dashboard for pattern management
- [ ] Integration with existing identity providers
- [ ] Advanced analytics and reporting

### Technical Improvements  
- [ ] Automated testing suite
- [ ] Performance optimization
- [ ] Enhanced error handling
- [ ] Code documentation and TypeScript improvements
- [ ] Security audit and penetration testing

## 🎯 Hackathon Success Criteria

✅ **Complete System** - Full-stack application with frontend + dual backends
✅ **Advanced Technology** - Behavioral biometrics, blockchain integration, real-time sensors  
✅ **Professional UI** - Polished mobile interface with smooth UX
✅ **Live Demo Ready** - Works reliably for live demonstration
✅ **Technical Depth** - Complex algorithms, multiple technology integrations
✅ **Practical Application** - Solves real authentication security problems

---

**Built for Hackathon Excellence** 🏆

*HashGait represents the perfect balance of technical innovation, practical application, and demo-ready polish for hackathon success.*