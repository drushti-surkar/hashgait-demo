import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

type Screen = 'login' | 'capture' | 'result' | 'dashboard';

interface CaptureResult {
  username: string;
  hash: string;
  confidence: number;
  timestamp: string;
}

const MainApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [username, setUsername] = useState('demo_user');
  const [password, setPassword] = useState('password123');
  const [captureResult, setCaptureResult] = useState<CaptureResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Login Screen
  const LoginScreen = () => {
    const handleLogin = () => {
      if (!username.trim()) {
        Alert.alert('Error', 'Please enter a username');
        return;
      }

      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        Alert.alert('Login Successful!', `Welcome ${username}`, [
          { text: 'Continue', onPress: () => setCurrentScreen('capture') }
        ]);
      }, 1000);
    };

    return (
      <ScrollView contentContainerStyle={styles.screenContainer}>
        <View style={styles.header}>
          <Text style={styles.logo}>🚶‍♂️</Text>
          <Text style={styles.title}>HashGait</Text>
          <Text style={styles.subtitle}>Behavioral Authentication Demo</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Logging in...' : 'Login & Start Demo'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demoInfo}>
          <Text style={styles.demoTitle}>🎯 Demo Mode</Text>
          <Text style={styles.demoText}>
            Enter any credentials to continue to behavioral authentication demo
          </Text>
        </View>
      </ScrollView>
    );
  };

  // Capture Screen
  const CaptureScreen = () => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [touchCount, setTouchCount] = useState(0);

    const startCapture = () => {
      setIsCapturing(true);
      setProgress(0);
      setTouchCount(0);

      Alert.alert('Gait Capture Started', 'Touch the screen naturally for 10 seconds');

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            stopCapture();
            return 100;
          }
          return prev + 10;
        });
      }, 1000);
    };

    const stopCapture = () => {
      setIsCapturing(false);
      
      // Generate mock hash
      const mockHash = generateMockHash(`${username}_${Date.now()}`);
      const confidence = Math.floor(Math.random() * 40 + 60); // 60-100%

      const result: CaptureResult = {
        username,
        hash: mockHash,
        confidence,
        timestamp: new Date().toISOString(),
      };

      setCaptureResult(result);
      
      setTimeout(() => {
        Alert.alert('Capture Complete!', `Confidence: ${confidence}%`, [
          { text: 'View Results', onPress: () => setCurrentScreen('result') }
        ]);
      }, 500);
    };

    const handleTouch = () => {
      if (isCapturing) {
        setTouchCount(prev => prev + 1);
      }
    };

    return (
      <View style={styles.screenContainer}>
        <View style={styles.headerBlue}>
          <Text style={styles.headerTitle}>Gait Capture</Text>
          <Text style={styles.headerSubtitle}>Welcome, {username}</Text>
        </View>

        <TouchableOpacity 
          style={styles.touchArea}
          onPress={handleTouch}
          activeOpacity={0.8}
        >
          <ScrollView contentContainerStyle={styles.captureContent}>
            {isCapturing && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressTitle}>Capturing... {progress}%</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>Keep touching and moving!</Text>
              </View>
            )}

            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>Live Data Collection</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{touchCount}</Text>
                  <Text style={styles.statLabel}>Touch Events</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{Math.floor(progress * 2)}</Text>
                  <Text style={styles.statLabel}>Accelerometer</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{Math.floor(progress * 1.5)}</Text>
                  <Text style={styles.statLabel}>Gyroscope</Text>
                </View>
              </View>
            </View>

            <View style={styles.instructions}>
              <Text style={styles.instructionTitle}>
                {isCapturing ? '🎯 Keep Moving!' : '👋 Ready to Capture'}
              </Text>
              <Text style={styles.instructionText}>
                {isCapturing
                  ? 'Touch this area and move naturally. Behavioral patterns are being analyzed.'
                  : 'Tap "Start Capture" and interact with the screen for 10 seconds.'
                }
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.button, isCapturing && styles.captureButtonActive]}
              onPress={startCapture}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={[styles.buttonText, { marginLeft: 12 }]}>
                    Capturing... ({Math.ceil((100 - progress) / 10)}s)
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>🚀 Start Gait Capture</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableOpacity>
      </View>
    );
  };

  // Result Screen
  const ResultScreen = () => {
    if (!captureResult) return null;

    const copyHash = () => {
      Alert.alert('Hash Copied!', 'SHA-256 hash copied to clipboard');
    };

    return (
      <ScrollView contentContainerStyle={styles.screenContainer}>
        <View style={styles.headerGreen}>
          <Text style={styles.headerTitle}>Authentication Results</Text>
          <Text style={styles.headerSubtitle}>Analysis complete</Text>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.cardTitle}>🎯 Confidence Score</Text>
          <Text style={[styles.scoreValue, getScoreColor(captureResult.confidence)]}>
            {captureResult.confidence}%
          </Text>
          <Text style={styles.scoreDescription}>
            {captureResult.confidence >= 80 ? '✅ High confidence - Authenticated' :
             captureResult.confidence >= 60 ? '⚠️ Moderate confidence' :
             '❌ Low confidence - Failed'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔗 Generated Hash</Text>
          <TouchableOpacity style={styles.hashContainer} onPress={copyHash}>
            <Text style={styles.hashLabel}>SHA-256 Hash (tap to copy)</Text>
            <Text style={styles.hashValue}>{captureResult.hash}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Session Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User:</Text>
            <Text style={styles.infoValue}>{captureResult.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time:</Text>
            <Text style={styles.infoValue}>
              {new Date(captureResult.timestamp).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCurrentScreen('dashboard')}
          >
            <Text style={styles.buttonText}>📊 View Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setCurrentScreen('capture')}
          >
            <Text style={styles.secondaryButtonText}>🔄 New Capture</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Dashboard Screen
  const DashboardScreen = () => {
    const [liveData, setLiveData] = useState({ x: 0, y: 0, z: 0, readings: 0 });

    React.useEffect(() => {
      const interval = setInterval(() => {
        setLiveData({
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2 + 9.8,
          readings: prev => prev.readings + 1,
        });
      }, 1000);

      return () => clearInterval(interval);
    }, []);

    return (
      <ScrollView contentContainerStyle={styles.screenContainer}>
        <View style={styles.headerBlue}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome, {username}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => setCurrentScreen('login')}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{username}</Text>
            <Text style={styles.profileStatus}>🟢 Active Session</Text>
            <Text style={styles.profileDevice}>📱 Device: demo_device_001</Text>
          </View>
        </View>

        {captureResult && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎯 Latest Authentication</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Confidence:</Text>
              <Text style={[styles.infoValue, getScoreColor(captureResult.confidence)]}>
                {captureResult.confidence}%
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[styles.infoValue, getScoreColor(captureResult.confidence)]}>
                {captureResult.confidence >= 70 ? '✅ Authenticated' : '❌ Failed'}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Live Sensor Data (Mock)</Text>
          <View style={styles.sensorGrid}>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorTitle}>📱 Accelerometer</Text>
              <Text style={styles.sensorAxis}>X: {liveData.x.toFixed(3)}</Text>
              <Text style={styles.sensorAxis}>Y: {liveData.y.toFixed(3)}</Text>
              <Text style={styles.sensorAxis}>Z: {liveData.z.toFixed(3)}</Text>
            </View>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorTitle}>🎯 Gyroscope</Text>
              <Text style={styles.sensorAxis}>X: {(Math.random() - 0.5).toFixed(3)}</Text>
              <Text style={styles.sensorAxis}>Y: {(Math.random() - 0.5).toFixed(3)}</Text>
              <Text style={styles.sensorAxis}>Z: {(Math.random() - 0.5).toFixed(3)}</Text>
            </View>
          </View>
          <Text style={styles.readingsCount}>Total Readings: {liveData.readings}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCurrentScreen('capture')}
          >
            <Text style={styles.buttonText}>📊 New Capture</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Helper function to generate mock hash
  const generateMockHash = (data: string): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(16, '0') + 'demo';
  };

  // Helper function for score colors
  const getScoreColor = (score: number) => ({
    color: score >= 80 ? '#34C759' : score >= 60 ? '#FF9500' : '#FF3B30'
  });

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen />;
      case 'capture':
        return <CaptureScreen />;
      case 'result':
        return <ResultScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      default:
        return <LoginScreen />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  screenContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerBlue: {
    backgroundColor: '#007AFF',
    marginHorizontal: -20,
    marginTop: -60,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerGreen: {
    backgroundColor: '#34C759',
    marginHorizontal: -20,
    marginTop: -60,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    marginBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  logo: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  demoInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  demoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  touchArea: {
    flex: 1,
  },
  captureContent: {
    flexGrow: 1,
  },
  progressContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e1e5e9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  instructions: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  captureButtonActive: {
    backgroundColor: '#FF9500',
  },
  scoreCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  hashContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  hashLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  hashValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    marginTop: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 14,
    color: '#34C759',
    marginBottom: 2,
  },
  profileDevice: {
    fontSize: 12,
    color: '#666',
  },
  sensorGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  sensorCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  sensorTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sensorAxis: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#007AFF',
    marginBottom: 2,
  },
  readingsCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default MainApp;