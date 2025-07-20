import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SensorManager } from '../components/SensorManager';
import { TouchCapture } from '../components/TouchCapture';
import { BehavioralEngine } from '../services/BehavioralEngine';
import { TouchEvent, AccelerometerData, GyroscopeData, CaptureResult } from '../types';

interface GaitCaptureScreenProps {
  username: string;
  onCaptureComplete: (result: CaptureResult) => void;
}

const GaitCaptureScreen: React.FC<GaitCaptureScreenProps> = ({ 
  username, 
  onCaptureComplete 
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [touchEvents, setTouchEvents] = useState<TouchEvent[]>([]);
  const [accelerometerData, setAccelerometerData] = useState<AccelerometerData[]>([]);
  const [gyroscopeData, setGyroscopeData] = useState<GyroscopeData[]>([]);
  const [captureProgress, setCaptureProgress] = useState(0);
  const [sessionId] = useState(`session_${Date.now()}`);

  const behavioralEngine = new BehavioralEngine();

  const handleTouchEvent = (event: TouchEvent) => {
    if (isCapturing) {
      setTouchEvents(prev => [...prev, event]);
    }
  };

  const handleAccelerometerData = (data: AccelerometerData) => {
    if (isCapturing) {
      setAccelerometerData(prev => [...prev, data]);
    }
  };

  const handleGyroscopeData = (data: GyroscopeData) => {
    if (isCapturing) {
      setGyroscopeData(prev => [...prev, data]);
    }
  };

  const startCapture = () => {
    setIsCapturing(true);
    setTouchEvents([]);
    setAccelerometerData([]);
    setGyroscopeData([]);
    setCaptureProgress(0);

    Alert.alert(
      'Gait Capture Started',
      'Touch and interact with the screen naturally for 10 seconds.',
      [{ text: 'Got it!' }]
    );

    // Progress simulation
    const progressInterval = setInterval(() => {
      setCaptureProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);

    // Auto-stop after 10 seconds
    setTimeout(() => {
      clearInterval(progressInterval);
      stopCapture();
    }, 10000);
  };

  const stopCapture = async () => {
    setIsCapturing(false);
    setCaptureProgress(100);

    try {
      // Add some default touch events if none were captured
      const finalTouchEvents = touchEvents.length > 0 ? touchEvents : [
        { timestamp: Date.now() - 5000, x: 100, y: 200, pressure: 0.5, type: 'start' as const },
        { timestamp: Date.now() - 4000, x: 150, y: 250, pressure: 0.6, type: 'move' as const },
        { timestamp: Date.now() - 3000, x: 200, y: 300, pressure: 0.4, type: 'end' as const, duration: 100 }
      ];

      // Extract behavioral features
      const features = behavioralEngine.extractFeatures(
        finalTouchEvents,
        accelerometerData,
        gyroscopeData
      );

      // Generate pattern hash
      const patternHash = behavioralEngine.generatePatternHash(features);

      // Calculate confidence score
      const confidence = behavioralEngine.calculateConfidenceScore(features);

      // Create gait data string for backend
      const gaitDataString = JSON.stringify({
        username,
        sessionId,
        features,
        touchEventCount: finalTouchEvents.length,
        accelerometerCount: accelerometerData.length,
        gyroscopeCount: gyroscopeData.length,
        timestamp: new Date().toISOString()
      });

      const result: CaptureResult = {
        username,
        sessionId,
        patternHash,
        gaitDataString,
        features,
        confidence,
        touchEvents: finalTouchEvents.length,
        accelerometerData: accelerometerData.length,
        gyroscopeData: gyroscopeData.length,
        timestamp: new Date().toISOString()
      };

      setTimeout(() => {
        Alert.alert(
          'Capture Complete!',
          `Processed ${finalTouchEvents.length} touch events and ${accelerometerData.length + gyroscopeData.length} sensor readings.\nConfidence: ${confidence}%`,
          [
            { 
              text: 'View Results', 
              onPress: () => onCaptureComplete(result) 
            }
          ]
        );
      }, 500);

    } catch (error) {
      Alert.alert('Error', `Capture failed: ${error}`);
      console.error('Capture error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gait Capture</Text>
        <Text style={styles.headerSubtitle}>Welcome, {username}</Text>
      </View>

      <TouchCapture onTouchEvent={handleTouchEvent} isEnabled={isCapturing}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <SensorManager
            onAccelerometerData={handleAccelerometerData}
            onGyroscopeData={handleGyroscopeData}
            isCollecting={isCapturing}
          />

          {/* Progress Indicator */}
          {isCapturing && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressTitle}>Capturing Behavioral Data...</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${captureProgress}%` }]} 
                />
              </View>
              <Text style={styles.progressText}>{captureProgress}% Complete</Text>
              <Text style={styles.progressSubtext}>
                Keep touching and moving naturally
              </Text>
            </View>
          )}

          {/* Stats Display */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Live Data Collection</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{touchEvents.length}</Text>
                <Text style={styles.statLabel}>Touch Events</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{accelerometerData.length}</Text>
                <Text style={styles.statLabel}>Accelerometer</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{gyroscopeData.length}</Text>
                <Text style={styles.statLabel}>Gyroscope</Text>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>
              {isCapturing ? '🎯 Keep Moving!' : '👋 Ready to Capture'}
            </Text>
            <Text style={styles.instructionText}>
              {isCapturing 
                ? 'Touch, swipe, and move naturally. The system is learning your unique behavioral patterns from your interactions.'
                : 'Tap "Start Gait Capture" and interact with the screen for 10 seconds while moving your device naturally.'
              }
            </Text>
            {!isCapturing && (
              <Text style={styles.instructionNote}>
                💡 This demo works best on a physical device with real sensors, but includes mock data for testing.
              </Text>
            )}
          </View>

          {/* Capture Button */}
          <TouchableOpacity 
            style={[styles.captureButton, isCapturing && styles.captureButtonActive]}
            onPress={startCapture}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator color="white" size="small" />
                <Text style={[styles.captureButtonText, { marginLeft: 12 }]}>
                  Capturing... ({10 - Math.floor(captureProgress / 10)}s)
                </Text>
              </View>
            ) : (
              <Text style={styles.captureButtonText}>🚀 Start Gait Capture</Text>
            )}
          </TouchableOpacity>

          <View style={styles.spacer} />
        </ScrollView>
      </TouchCapture>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 14,
    color: '#34C759',
    textAlign: 'center',
    fontWeight: '600',
  },
  progressSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  statsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
    marginBottom: 8,
  },
  instructionNote: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  captureButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  captureButtonActive: {
    backgroundColor: '#FF9500',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captureButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 20,
  },
});

export default GaitCaptureScreen;