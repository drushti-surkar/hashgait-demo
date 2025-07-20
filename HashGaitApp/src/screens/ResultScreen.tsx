import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { NodeBackendService } from '../services/NodeBackendService';
import { CaptureResult, HashResult, HashHistory } from '../types';

interface ResultScreenProps {
  captureResult: CaptureResult | null;
  onNavigateToDashboard: () => void;
  onStartNewCapture: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ 
  captureResult, 
  onNavigateToDashboard,
  onStartNewCapture
}) => {
  const [nodeHash, setNodeHash] = useState<string>('');
  const [nodeHashHistory, setNodeHashHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);

  const nodeService = new NodeBackendService();

  useEffect(() => {
    if (captureResult) {
      processResults();
    }
  }, [captureResult]);

  const processResults = async () => {
    if (!captureResult) return;
    
    setLoading(true);
    
    try {
      // Test backend connection
      const isConnected = await nodeService.testConnection();
      setBackendConnected(isConnected);

      if (isConnected) {
        // Generate hash via Node.js backend
        const hashResult: HashResult = await nodeService.generateHash(captureResult.gaitDataString);
        setNodeHash(hashResult.hash);

        // Get hash history
        const historyResult: HashHistory = await nodeService.getHashHistory();
        setNodeHashHistory(historyResult.history || []);
      } else {
        // Use mock hash when backend unavailable
        const mockHash = `${captureResult.patternHash}_node_mock`;
        setNodeHash(mockHash);
        setNodeHashHistory([
          {
            hash: mockHash,
            gaitData: 'mock-data-1',
            timestamp: new Date().toISOString(),
            id: Date.now()
          }
        ]);
      }

    } catch (error) {
      console.error('Processing error:', error);
      // Fallback to mock data
      const mockHash = `${captureResult.patternHash}_fallback`;
      setNodeHash(mockHash);
      setNodeHashHistory([]);
    }

    setLoading(false);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied!', `${label} copied to clipboard`);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getScoreColor = (score: number) => ({
    color: score >= 80 ? '#34C759' : score >= 60 ? '#FF9500' : '#FF3B30'
  });

  if (loading || !captureResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34C759" />
          <Text style={styles.loadingText}>Processing authentication results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Authentication Results</Text>
        <Text style={styles.headerSubtitle}>Behavioral analysis complete</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Confidence Score */}
        <View style={styles.scoreCard}>
          <Text style={styles.cardTitle}>🎯 Confidence Score</Text>
          <Text style={[styles.scoreValue, getScoreColor(captureResult.confidence)]}>
            {captureResult.confidence}%
          </Text>
          <Text style={styles.scoreDescription}>
            {captureResult.confidence >= 80 ? '✅ High confidence - Authentication successful' :
             captureResult.confidence >= 60 ? '⚠️ Moderate confidence - Additional verification may be needed' : 
             '❌ Low confidence - Authentication failed'}
          </Text>
        </View>

        {/* Node.js Backend Results */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🔗 Node.js Backend Hash</Text>
            <View style={[styles.statusBadge, backendConnected ? styles.connectedBadge : styles.disconnectedBadge]}>
              <Text style={styles.statusText}>
                {backendConnected ? 'Connected' : 'Mock Mode'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.hashContainer} 
            onPress={() => copyToClipboard(nodeHash, 'SHA-256 Hash')}
          >
            <Text style={styles.hashLabel}>SHA-256 Hash (tap to copy)</Text>
            <Text style={styles.hashValue}>{nodeHash}</Text>
          </TouchableOpacity>

          {!backendConnected && (
            <Text style={styles.mockNote}>
              💡 Backend offline - displaying mock hash for demo
            </Text>
          )}
        </View>

        {/* Behavioral Pattern Results */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧠 Behavioral Pattern Analysis</Text>
          
          <TouchableOpacity 
            style={styles.hashContainer} 
            onPress={() => copyToClipboard(captureResult.patternHash, 'Pattern Hash')}
          >
            <Text style={styles.hashLabel}>Behavioral Pattern Hash (tap to copy)</Text>
            <Text style={styles.hashValue}>{captureResult.patternHash}</Text>
          </TouchableOpacity>

          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Text style={styles.featureLabel}>Touch Pressure</Text>
              <Text style={styles.featureValue}>
                {captureResult.features.avgTouchPressure.toFixed(3)}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureLabel}>Gesture Speed</Text>
              <Text style={styles.featureValue}>
                {captureResult.features.swipeVelocity.toFixed(2)}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureLabel}>Motion Variance</Text>
              <Text style={styles.featureValue}>
                {captureResult.features.deviceMotionVariance.toFixed(3)}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureLabel}>Complexity</Text>
              <Text style={styles.featureValue}>
                {captureResult.features.gestureComplexity.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Hash History */}
        {nodeHashHistory.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📚 Recent Hash History</Text>
            <Text style={styles.historySubtitle}>Last {nodeHashHistory.length} generated hashes</Text>
            
            {nodeHashHistory.slice(0, 3).map((entry, index) => (
              <View key={entry.id || index} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyIndex}>#{index + 1}</Text>
                  <Text style={styles.historyTimestamp}>
                    {formatTimestamp(entry.timestamp)}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => copyToClipboard(entry.hash, `Hash #${index + 1}`)}
                >
                  <Text style={styles.historyHash}>
                    {entry.hash.length > 40 ? `${entry.hash.substring(0, 40)}...` : entry.hash}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Capture Statistics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Capture Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{captureResult.touchEvents}</Text>
              <Text style={styles.statLabel}>Touch Events</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{captureResult.accelerometerData}</Text>
              <Text style={styles.statLabel}>Accelerometer</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{captureResult.gyroscopeData}</Text>
              <Text style={styles.statLabel}>Gyroscope</Text>
            </View>
          </View>
          <Text style={styles.captureTime}>
            Captured: {formatTimestamp(captureResult.timestamp)}
          </Text>
          <Text style={styles.sessionInfo}>
            Session: {captureResult.sessionId}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={onNavigateToDashboard}
          >
            <Text style={styles.primaryButtonText}>📊 View Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={onStartNewCapture}
          >
            <Text style={styles.secondaryButtonText}>🔄 New Capture</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#34C759',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  scoreCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  connectedBadge: {
    backgroundColor: '#34C759',
  },
  disconnectedBadge: {
    backgroundColor: '#FF9500',
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
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
  hashContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
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
  mockNote: {
    fontSize: 12,
    color: '#FF9500',
    fontStyle: 'italic',
    marginTop: 8,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  featureLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  featureValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  historySubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  historyItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyIndex: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  historyTimestamp: {
    fontSize: 12,
    color: '#666',
  },
  historyHash: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#333',
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  captureTime: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  sessionInfo: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  actions: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 20,
  },
});

export default ResultScreen;