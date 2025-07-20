import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    SafeAreaView,
    StatusBar,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { SensorManager } from '../components/SensorManager';
import { TouchCapture } from '../components/TouchCapture';
import { BehavioralEngine } from '../services/BehavioralEngine';
import { TouchEvent, AccelerometerData, GyroscopeData } from '../types/SensorTypes';

const { width } = Dimensions.get('window');

interface GaitCaptureScreenProps {
    username: string;
    onCaptureComplete: (result: any) => void;
}

export const GaitCaptureScreen: React.FC<GaitCaptureScreenProps> = ({ 
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
            'Move around naturally, touch the screen, and interact for 10 seconds.',
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

        if (touchEvents.length === 0) {
            Alert.alert('No Data', 'Please interact with the screen during capture');
            return;
        }

        try {
            // Extract behavioral features
            const features = behavioralEngine.extractFeatures(
                touchEvents,
                accelerometerData,
                gyroscopeData
            );

            // Generate pattern hash
            const patternHash = behavioralEngine.generatePatternHash(features);

            // Calculate confidence score
            const confidence = behavioralEngine.calculateConfidenceScore(features);

            // Create gait data string for Node.js backend
            const gaitDataString = JSON.stringify({
                username,
                sessionId,
                features,
                touchEventCount: touchEvents.length,
                accelerometerCount: accelerometerData.length,
                gyroscopeCount: gyroscopeData.length,
                timestamp: new Date().toISOString()
            });

            const result = {
                username,
                sessionId,
                patternHash,
                gaitDataString,
                features,
                confidence,
                touchEvents: touchEvents.length,
                accelerometerData: accelerometerData.length,
                gyroscopeData: gyroscopeData.length,
                timestamp: new Date().toISOString()
            };

            Alert.alert(
                'Capture Complete!',
                `Processed ${touchEvents.length} touch events and ${accelerometerData.length + gyroscopeData.length} sensor readings.`,
                [
                    { 
                        text: 'View Results', 
                        onPress: () => onCaptureComplete(result) 
                    }
                ]
            );

        } catch (error) {
            Alert.alert('Error', `Capture failed: ${error}`);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
            
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Gait Capture</Text>
                <Text style={styles.headerSubtitle}>Welcome, {username}</Text>
            </View>

            <TouchCapture onTouchEvent={handleTouchEvent} isEnabled={isCapturing}>
                <View style={styles.content}>
                    <SensorManager
                        onAccelerometerData={handleAccelerometerData}
                        onGyroscopeData={handleGyroscopeData}
                        isCollecting={isCapturing}
                    />

                    {/* Progress Indicator */}
                    {isCapturing && (
                        <View style={styles.progressContainer}>
                            <Text style={styles.progressTitle}>Capturing...</Text>
                            <View style={styles.progressBar}>
                                <View 
                                    style={[styles.progressFill, { width: `${captureProgress}%` }]} 
                                />
                            </View>
                            <Text style={styles.progressText}>{captureProgress}%</Text>
                        </View>
                    )}

                    {/* Stats Display */}
                    <View style={styles.statsContainer}>
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

                    {/* Instructions */}
                    <View style={styles.instructions}>
                        <Text style={styles.instructionTitle}>
                            {isCapturing ? 'Keep Moving!' : 'Ready to Capture'}
                        </Text>
                        <Text style={styles.instructionText}>
                            {isCapturing 
                                ? 'Touch, swipe, and move your device naturally. The system is learning your behavioral patterns.'
                                : 'Tap "Start Capture" and interact with the screen for 10 seconds while moving naturally.'
                            }
                        </Text>
                    </View>

                    {/* Capture Button */}
                    <TouchableOpacity 
                        style={[styles.captureButton, isCapturing && styles.captureButtonActive]}
                        onPress={startCapture}
                        disabled={isCapturing}
                    >
                        {isCapturing ? (
                            <>
                                <ActivityIndicator color="white" style={{ marginRight: 8 }} />
                                <Text style={styles.captureButtonText}>Capturing...</Text>
                            </>
                        ) : (
                            <Text style={styles.captureButtonText}>Start Gait Capture</Text>
                        )}
                    </TouchableOpacity>
                </View>
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
    content: {
        flex: 1,
        padding: 20,
    },
    progressContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
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
        color: '#666',
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        elevation: 1,
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
        elevation: 1,
    },
    instructionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    instructionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    captureButton: {
        backgroundColor: '#34C759',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    captureButtonActive: {
        backgroundColor: '#FF9500',
    },
    captureButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});