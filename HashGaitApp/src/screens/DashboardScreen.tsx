import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    SafeAreaView,
    StatusBar,
    RefreshControl
} from 'react-native';
import { SensorManager } from '../components/SensorManager';
import { NodeBackendService } from '../services/NodeBackendService';
import { AccelerometerData, GyroscopeData } from '../types/SensorTypes';

interface DashboardScreenProps {
    username: string;
    captureResult?: any;
    onLogout: () => void;
    onStartNewCapture: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ 
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
                const stats = await nodeService.getStats();
                setBackendStats(stats.stats);
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

    const formatValue = (value: number) => {
        return value ? value.toFixed(3) : '0.000';
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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
            
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
                    </View>
                </View>

                {/* Behavioral Stats */}
                {captureResult && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>🎯 Latest Authentication</Text>
                        <View style={styles.behavioralStats}>
                            <View style={styles.statRow}>
                                <Text style={styles.statLabel}>Confidence Score:</Text>
                                <Text style={[styles.statValue, getScoreColor(captureResult.confidence)]}>
                                    {captureResult.confidence}%
                                </Text>
                            </View>
                            <View style={styles.statRow}>
                                <Text style={styles.statLabel}>Pattern Hash:</Text>
                                <Text style={styles.hashText}>
                                    {captureResult.patternHash.substring(0, 16)}...
                                </Text>
                            </View>
                            <View style={styles.statRow}>
                                <Text style={styles.statLabel}>Touch Events:</Text>
                                <Text style={styles.statValue}>{captureResult.touchEvents}</Text>
                            </View>
                            <View style={styles.statRow}>
                                <Text style={styles.statLabel}>Sensor Readings:</Text>
                                <Text style={styles.statValue}>
                                    {captureResult.accelerometerData + captureResult.gyroscopeData}
                                </Text>
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
                            <Text style={styles.sensorTitle}>Accelerometer</Text>
                            {liveAccelData ? (
                                <>
                                    <Text style={styles.sensorAxis}>X: {formatValue(liveAccelData.x)}</Text>
                                    <Text style={styles.sensorAxis}>Y: {formatValue(liveAccelData.y)}</Text>
                                    <Text style={styles.sensorAxis}>Z: {formatValue(liveAccelData.z)}</Text>
                                </>
                            ) : (
                                <Text style={styles.sensorNoData}>No data</Text>
                            )}
                        </View>
                        
                        <View style={styles.sensorCard}>
                            <Text style={styles.sensorTitle}>Gyroscope</Text>
                            {liveGyroData ? (
                                <>
                                    <Text style={styles.sensorAxis}>X: {formatValue(liveGyroData.x)}</Text>
                                    <Text style={styles.sensorAxis}>Y: {formatValue(liveGyroData.y)}</Text>
                                    <Text style={styles.sensorAxis}>Z: {formatValue(liveGyroData.z)}</Text>
                                </>
                            ) : (
                                <Text style={styles.sensorNoData}>No data</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.sensorStats}>
                        <Text style={styles.totalReadings}>
                            Total Readings: {totalReadings.toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* Backend Status */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>⚙️ Backend Status</Text>
                        <View style={[styles.statusBadge, backendConnected ? styles.connectedBadge : styles.disconnectedBadge]}>
                            <Text style={styles.statusText}>
                                {backendConnected ? 'Connected' : 'Offline'}
                            </Text>
                        </View>
                    </View>

                    {backendConnected && backendStats ? (
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
                                    {backendStats.totalHashesGenerated}
                                </Text>
                            </View>
                            <View style={styles.statRow}>
                                <Text style={styles.statLabel}>Memory Usage:</Text>
                                <Text style={styles.statValue}>
                                    {formatMemory(backendStats.memoryUsage.rss)}
                                </Text>
                            </View>
                            <View style={styles.statRow}>
                                <Text style={styles.statLabel}>Last Updated:</Text>
                                <Text style={styles.timestampText}>
                                    {new Date(backendStats.timestamp).toLocaleTimeString()}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.offlineText}>
                            Backend is offline. Pull to refresh to retry connection.
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
                    <Text style={styles.infoTitle}>HashGait v1.0.0</Text>
                    <Text style={styles.infoText}>
                        Behavioral authentication using gait patterns and device sensors.
                    </Text>
                    <Text style={styles.infoText}>
                        Built for hackathon demo with Node.js + ICP backends.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const getScoreColor = (score: number) => ({
    color: score >= 80 ? '#34C759' : score >= 60 ? '#FF9500' : '#FF3B30'
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        backgroundColor: '#007AFF',
        padding: 20,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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
        backgroundColor: '#FF3B30',
    },
    statusText: {
        fontSize: 12,
        color: 'white',
        fontWeight: '600',
    },
    behavioralStats: {
        gap: 8,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
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
    hashText: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#333',
        backgroundColor: '#f8f9fa',
        padding: 4,
        borderRadius: 4,
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
    sensorAxis: {
        fontSize: 12,
        fontFamily: 'monospace',
        color: '#007AFF',
        textAlign: 'center',
        marginBottom: 2,
    },
    sensorNoData: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
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
    },
    backendStats: {
        gap: 8,
    },
    timestampText: {
        fontSize: 12,
        color: '#666',
    },
    offlineText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
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
        fontSize: 24,
        marginBottom: 8,
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
        marginBottom: 20,
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
});