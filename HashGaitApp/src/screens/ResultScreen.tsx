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
    ActivityIndicator,
    Clipboard
} from 'react-native';
import { NodeBackendService } from '../services/NodeBackendService';
import { ICPService } from '../services/ICPService';

interface ResultScreenProps {
    captureResult: any;
    onNavigateToDashboard: () => void;
    onStartNewCapture: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ 
    captureResult, 
    onNavigateToDashboard,
    onStartNewCapture
}) => {
    const [nodeHash, setNodeHash] = useState<string>('');
    const [nodeHashHistory, setNodeHashHistory] = useState<any[]>([]);
    const [icpResult, setIcpResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [nodeBackendConnected, setNodeBackendConnected] = useState(false);

    const nodeService = new NodeBackendService();
    const icpService = new ICPService();

    useEffect(() => {
        processResults();
    }, []);

    const processResults = async () => {
        setLoading(true);
        
        try {
            // Test Node.js backend connection
            const nodeConnected = await nodeService.testConnection();
            setNodeBackendConnected(nodeConnected);

            if (nodeConnected) {
                // Generate hash via Node.js backend
                const nodeHashResult = await nodeService.generateHash(captureResult.gaitDataString);
                setNodeHash(nodeHashResult.hash);

                // Get hash history
                const historyResult = await nodeService.getHashHistory();
                setNodeHashHistory(historyResult.history || []);
            }

            // Process via ICP backend
            await icpService.saveBehavioralPattern(
                captureResult.username,
                captureResult.patternHash,
                JSON.stringify(captureResult.features),
                'device_001'
            );

            const icpVerifyResult = await icpService.verifyBehavioralPattern(
                captureResult.username,
                captureResult.patternHash,
                'device_001'
            );
            setIcpResult(icpVerifyResult);

        } catch (error) {
            console.error('Processing error:', error);
            Alert.alert('Processing Error', `Failed to process results: ${error}`);
        }

        setLoading(false);
    };

    const copyToClipboard = (text: string, label: string) => {
        Clipboard.setString(text);
        Alert.alert('Copied!', `${label} copied to clipboard`);
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#34C759" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#34C759" />
                    <Text style={styles.loadingText}>Processing results...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#34C759" />
            
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Authentication Results</Text>
                <Text style={styles.headerSubtitle}>Gait analysis complete</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Confidence Score */}
                <View style={styles.scoreCard}>
                    <Text style={styles.cardTitle}>🎯 Confidence Score</Text>
                    <Text style={[styles.scoreValue, getScoreColor(captureResult.confidence)]}>
                        {captureResult.confidence}%
                    </Text>
                    <Text style={styles.scoreDescription}>
                        {captureResult.confidence >= 80 ? 'High confidence match' :
                         captureResult.confidence >= 60 ? 'Moderate confidence' : 'Low confidence'}
                    </Text>
                </View>

                {/* Node.js Backend Results */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>🔗 Node.js Backend Hash</Text>
                        <View style={[styles.statusBadge, nodeBackendConnected ? styles.connectedBadge : styles.disconnectedBadge]}>
                            <Text style={styles.statusText}>
                                {nodeBackendConnected ? 'Connected' : 'Offline'}
                            </Text>
                        </View>
                    </View>
                    
                    {nodeBackendConnected ? (
                        <>
                            <TouchableOpacity 
                                style={styles.hashContainer} 
                                onPress={() => copyToClipboard(nodeHash, 'SHA-256 Hash')}
                            >
                                <Text style={styles.hashLabel}>SHA-256 Hash (tap to copy)</Text>
                                <Text style={styles.hashValue}>{nodeHash}</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <Text style={styles.errorText}>
                            Node.js backend is offline. Using ICP backend only.
                        </Text>
                    )}
                </View>

                {/* ICP Backend Results */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>⚡ ICP Backend Results</Text>
                    {icpResult ? (
                        <>
                            <View style={styles.icpResult}>
                                <Text style={[styles.icpStatus, icpResult.success ? styles.successText : styles.errorText]}>
                                    {icpResult.success ? '✅ Authentication Successful' : '❌ Authentication Failed'}
                                </Text>
                                <Text style={styles.icpMessage}>{icpResult.message}</Text>
                                <Text style={styles.icpConfidence}>
                                    ICP Confidence: {icpResult.confidenceScore}%
                                </Text>
                            </View>
                            
                            <TouchableOpacity 
                                style={styles.hashContainer} 
                                onPress={() => copyToClipboard(captureResult.patternHash, 'Pattern Hash')}
                            >
                                <Text style={styles.hashLabel}>Pattern Hash (tap to copy)</Text>
                                <Text style={styles.hashValue}>{captureResult.patternHash}</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <Text style={styles.errorText}>ICP processing failed</Text>
                    )}
                </View>

                {/* Hash History */}
                {nodeBackendConnected && nodeHashHistory.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>📚 Recent Hash History</Text>
                        <Text style={styles.historySubtitle}>Last {nodeHashHistory.length} generated hashes</Text>
                        
                        {nodeHashHistory.map((entry, index) => (
                            <View key={entry.id} style={styles.historyItem}>
                                <View style={styles.historyHeader}>
                                    <Text style={styles.historyIndex}>#{index + 1}</Text>
                                    <Text style={styles.historyTimestamp}>
                                        {formatTimestamp(entry.timestamp)}
                                    </Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => copyToClipboard(entry.hash, `Hash #${index + 1}`)}
                                >
                                    <Text style={styles.historyHash}>{entry.hash}</Text>
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
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity 
                        style={styles.primaryButton}
                        onPress={onNavigateToDashboard}
                    >
                        <Text style={styles.primaryButtonText}>View Dashboard</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.secondaryButton}
                        onPress={onStartNewCapture}
                    >
                        <Text style={styles.secondaryButtonText}>New Capture</Text>
                    </TouchableOpacity>
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
        backgroundColor: '#34C759',
        padding: 20,
        paddingBottom: 24,
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
    },
    scrollView: {
        flex: 1,
        padding: 20,
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
    scoreCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
    scoreValue: {
        fontSize: 48,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    scoreDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    hashContainer: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
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
    icpResult: {
        marginBottom: 12,
    },
    icpStatus: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    icpMessage: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    icpConfidence: {
        fontSize: 14,
        color: '#666',
    },
    successText: {
        color: '#34C759',
    },
    errorText: {
        color: '#FF3B30',
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
    },
    actions: {
        marginTop: 8,
        marginBottom: 20,
    },
    primaryButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
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
});