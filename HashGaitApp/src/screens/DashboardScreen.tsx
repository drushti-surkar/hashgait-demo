import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { SensorManager } from '../components/SensorManager';
import { NodeBackendService } from '../services/NodeBackendService';
import { AccelerometerData, GyroscopeData, CaptureResult } from '../types';

interface DashboardScreenProps {
  username: string;
  captureResult?: CaptureResult | null;
  onLogout: () => void;
  onStartNewCapture: () => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ 
  username, 
  captureResult,
  onLogout,
  onStartNewCapture
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [backendStats, setBackendStats] = useState<any>(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [liveAccelData, setLiveAccelData] = useState<AccelerometerData | null>(null);
  const [liveGyroData, setLiveGyroData] = useState<GyroscopeData | null>(null);
  const [totalReadings, setTotalReadings] = useState(0);

  const nodeService = new NodeBackendService();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const connected = await nodeService.testConnection();
      setBackendConnected(connected);

      if (connected) {
        try {
          // Try to get stats if backend supports it
          const response = await fetch('http://localhost:3000/stats');
          if (response.ok) {
            const statsData = await response.json();
            setBackendStats(statsData.stats);
          }
        } catch (error) {
          console.log('Stats endpoint not available:', error);
          // Set mock stats
          setBackendStats({
            serverUptime: Math.random() * 3600,
            totalHashesGenerated: Math.floor(Math.random() * 50),
            memoryUsage: { rss: Math.random() * 50000000 },
            timestamp: new Date().toISOString()
          });
        }
      } else {
        // Set mock stats for demo
        setBackendStats({
          serverUptime: 1234,
          totalHashesGenerated: 5,
          memoryUsage: { rss: 25000000 },
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleAccelerometerData = (data: AccelerometerData) => {
    setLiveAccelData(data);
    setTotalReadings(prev => prev + 1);
  };

  const handleGyroscopeData = (data: GyroscopeData) => {
    setLiveGyroData(data);
    setTotalReadings(prev => prev + 1);
  };

  const formatValue = (value: number | undefined) => {
    if (value === undefined || isNaN(value)) return '0.000';
    return value.toFixed(3);
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const formatMemory = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getScoreColor = (score: number) => ({
    color: score >= 80 ? '#34C759' : score >= 60 ? '#FF9500' : '#FF3B30'
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Hidden Sensor Manager for Live Data */}
      <SensorManager
        onAccelerometerData={handleAccelerometerData}
        onGyroscopeData={handleGyroscopeData}
        isCollecting={true}
      />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome back, {username}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{username}</Text>
            <Text style={styles.profileStatus}>🟢 Active Session</Text>
            <Text style={styles.profileDevice}>📱 Device: demo_device_001</Text>
            <Text style={styles.profileTime}>
              Session started: {new Date().toLocaleTimeString()}
            </Text>
          </View>
        </View>

        {/* Latest Authentication Results */}
        {captureResult && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🎯 Latest Authentication</Text>
            <View style={styles.authResults}>
              <View style={styles.confidenceRow}>
                <Text style={styles.confidenceLabel}>Confidence Score:</Text>
                <Text style={[styles.confidenceValue, getScoreColor(captureResult.confidence)]}>
                  {captureResult.confidence}%
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Status:</Text>
                <Text style={[styles.resultValue, getScoreColor(captureResult.confidence)]}>
                  {captureResult.confidence >= 70 ? '✅ Authenticated' : '❌ Failed'}
                </Text>
              </View>
              <View style={styles.hashRow}>
                <Text style={styles.hashLabel}>Pattern:</Text>
                <Text style={styles.hashText}>
                  {captureResult.patternHash.substring(0, 12)}...
                </Text>
              </View>
              <View style={styles.dataRow}>
                <View style={styles.dataItem}>
                  <Text style={styles.dataValue}>{captureResult.touchEvents}</Text>
                  <Text style={styles.dataLabel}>Touches</Text>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.dataValue}>{captureResult.accelerometerData}</Text>
                  <Text style={styles.dataLabel}>Accel</Text>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.dataValue}>{captureResult.gyroscopeData}</Text>
                  <Text style={styles.dataLabel}>Gyro</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Live Sensor Readings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Live Sensor Readings</Text>
          <Text style={styles.sensorSubtitle}>Real-time device motion data</Text>
          
          <View style={styles.sensorGrid}>
            <View style={styles.sensorCard}>
              <Text style={styles.sensorTitle}>📱 Accelerometer</Text>
              {liveAccelData ? (
                <View style={styles.sensorData}>
                  <Text style={styles.sensorAxis}>X: {formatValue(liveAccelData.x)}</Text>
                  <Text style={styles.sensorAxis}>Y: {formatValue(liveAccelData.y)}</Text>
                  <Text style={styles.sensorAxis}>Z: {formatValue(liveAccelData.z)}</Text>
                </View>
              ) : (
                <Text style={styles.sensorNoData}>Initializing...</Text>
              )}
            </View>
            
            <View style={styles.sensorCard}>
              <Text style={styles.sensorTitle}>🎯 Gyroscope</Text>
              {liveGyroData ? (
                <View style={styles.sensorData}>
                  <Text style={styles.sensorAxis}>X: {formatValue(liveGyroData.x)}</Text>
                  <Text style={styles.sensorAxis}>Y: {formatValue(liveGyroData.y)}</Text>
                  <Text style={styles.sensorAxis}>Z: {formatValue(liveGyroData.z)}</Text>
                </View>
              ) : (
                <Text style={styles.sensorNoData}>Initializing...</Text>
              )}
            </View>
          </View>

          <View style={styles.sensorStats}>
            <Text style={styles.totalReadings}>
              📈 Total Readings: {totalReadings.toLocaleString()}
            </Text>
            <Text style={styles.sampleRate}>
              Sample Rate: ~10 Hz (Demo Mode)
            </Text>
          </View>
        </View>

        {/* Backend Status */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>⚙️ Backend Status</Text>
            <View style={[styles.statusBadge, backendConnected ? styles.connectedBadge : styles.disconnectedBadge]}>
              <Text style={styles.statusText}>
                {backendConnected ? 'Connected' : 'Mock Mode'}
              </Text>
            </View>
          </View>

          {backendStats && (
            <View style={styles.backendStats}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Server Uptime:</Text>
                <Text style={styles.statValue}>
                  {formatUptime(backendStats.serverUptime)}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Hashes:</Text>
                <Text style={styles.statValue}>
                  {backendStats.totalHashesGenerated || 0}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Memory Usage:</Text>
                <Text style={styles.statValue}>
                  {formatMemory(backendStats.memoryUsage?.rss || 0)}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Last Updated:</Text>
                <Text style={styles.timestampText}>
                  {new Date(backendStats.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          )}

          {!backendConnected && (
            <Text style={styles.offlineText}>
              💡 Backend offline - using mock data for demo. Pull down to refresh.
            </Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚀 Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onStartNewCapture}
            >
              <Text style={styles.actionButtonIcon}>📊</Text>
              <Text style={styles.actionButtonText}>New Capture</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onRefresh}
            >
              <Text style={styles.actionButtonIcon}>🔄</Text>
              <Text style={styles.actionButtonText}>Refresh Data</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>HashGait v1.0.0 - Demo</Text>
          <Text style={styles.infoText}>
            🎯 Behavioral authentication using gait patterns and device sensors
          </Text>
          <Text style={styles.infoText}>
            🏗️ Built with React Native + Node.js backend
          </Text>
          <Text style={styles.infoText}>
            🚀 Ready for hackathon presentation
          </Text>
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
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    marginBottom: 2,
  },
  profileTime: {
    fontSize: 11,
    color: '#999',
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
  authResults: {
    gap: 12,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  hashRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hashLabel: {
    fontSize: 14,
    color: '#666',
  },
  hashText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    backgroundColor: '#f8f9fa',
    padding: 4,
    borderRadius: 4,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dataItem: {
    alignItems: 'center',
  },
  dataValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  dataLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  sensorSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
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
  },
  sensorTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  sensorData: {
    alignItems: 'center',
  },
  sensorAxis: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#007AFF',
    marginBottom: 2,
  },
  sensorNoData: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sensorStats: {
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    paddingTop: 12,
    alignItems: 'center',
  },
  totalReadings: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  sampleRate: {
    fontSize: 10,
    color: '#999',
  },
  backendStats: {
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  timestampText: {
    fontSize: 12,
    color: '#666',
  },
  offlineText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  actionButtonIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoCard: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  spacer: {
    height: 20,
  },
});

export default DashboardScreen;