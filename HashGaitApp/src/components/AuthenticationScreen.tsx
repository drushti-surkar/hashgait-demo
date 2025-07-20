import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Dimensions,
    SafeAreaView
} from 'react-native';
import { SensorManager } from './SensorManager';
import { TouchCapture } from './TouchCapture';
import { BehavioralEngine } from '../services/BehavioralEngine';
import { ICPService } from '../services/ICPService';
import { TouchEvent, AccelerometerData, GyroscopeData } from '../types/SensorTypes';

const { width } = Dimensions.get('window');

export const AuthenticationScreen: React.FC = () => {
    const [isLearning, setIsLearning] = useState(false);
    const [touchEvents, setTouchEvents] = useState<TouchEvent[]>([]);
    const [accelerometerData, setAccelerometerData] = useState<AccelerometerData[]>([]);
    const [gyroscopeData, setGyroscopeData] = useState<GyroscopeData[]>([]);
    const [behavioralScore, setBehavioralScore] = useState(0);
    const [authenticationResult, setAuthenticationResult] = useState<string>('');
    const [sessionId] = useState(\`session_\${Date.now()}\`);
    const [userId] = useState('demo_user_001');

    const behavioralEngine = new BehavioralEngine();
    const icpService = new ICPService();

    const handleTouchEvent = (event: TouchEvent) => {
        if (isLearning) {
            setTouchEvents(prev => [...prev, event]);
        }
    };

    const handleAccelerometerData = (data: AccelerometerData) => {
        if (isLearning) {
            setAccelerometerData(prev => [...prev, data]);
        }
    };

    const handleGyroscopeData = (data: GyroscopeData) => {
        if (isLearning) {
            setGyroscopeData(prev => [...prev, data]);
        }
    };

    const startLearning = () => {
        setIsLearning(true);
        setTouchEvents([]);
        setAccelerometerData([]);
        setGyroscopeData([]);
        setAuthenticationResult('');

        Alert.alert(
            'Learning Started',
            'Touch and move the screen naturally for 10 seconds',
            [{ text: 'OK' }]
        );

        setTimeout(() => {
            stopLearning();
        }, 10000);
    };

    const stopLearning = async () => {
        setIsLearning(false);

        if (touchEvents.length === 0) {
            Alert.alert('No Data', 'Please interact with the screen during learning');
            return;
        }

        try {
            const features = behavioralEngine.extractFeatures(
                touchEvents,
                accelerometerData,
                gyroscopeData
            );

            const patternHash = behavioralEngine.generatePatternHash(features);

            const confidence = behavioralEngine.calculateConfidenceScore(features);
            setBehavioralScore(confidence);

            await icpService.saveBehavioralPattern(
                userId,
                patternHash,
                JSON.stringify(features),
                'device_001'
            );

            const verifyResult = await icpService.verifyBehavioralPattern(
                userId,
                patternHash,
                'device_001'
            );

            setAuthenticationResult(verifyResult.message);

            Alert.alert(
                'Analysis Complete',
                \`Confidence Score: \${confidence}%\n\${verifyResult.message}\`,
                [{ text: 'OK' }]
            );

        } catch (error) {
            Alert.alert('Error', \`Analysis failed: \${error}\`);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchCapture onTouchEvent={handleTouchEvent} isEnabled={isLearning}>
                <View style={styles.content}>
                    <SensorManager
                        onAccelerometerData={handleAccelerometerData}
                        onGyroscopeData={handleGyroscopeData}
                        isCollecting={isLearning}
                    />

                    <Text style={styles.title}>HashGait Authentication</Text>
                    <Text style={styles.subtitle}>Behavioral Biometrics</Text>

                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreTitle}>Behavioral Score</Text>
                        <Text style={[styles.scoreValue, getScoreColor(behavioralScore)]}>
                            {behavioralScore}%
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isLearning && styles.buttonActive]}
                        onPress={startLearning}
                        disabled={isLearning}
                    >
                        <Text style={styles.buttonText}>
                            {isLearning ? 'Learning...' : 'Start Learning'}
                        </Text>
                    </TouchableOpacity>

                    {authenticationResult ? (
                        <View style={styles.resultContainer}>
                            <Text style={styles.resultText}>{authenticationResult}</Text>
                        </View>
                    ) : null}
                </View>
            </TouchCapture>
        </SafeAreaView>
    );
};

const getScoreColor = (score: number) => ({
    color: score >= 80 ? '#4CAF50' : score >= 60 ? '#FF9800' : '#F44336'
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
    },
    scoreContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    scoreTitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },
    scoreValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    resultContainer: {
        backgroundColor: '#e8f5e8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    resultText: {
        fontSize: 14,
        color: '#2e7d32',
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 10,
        marginBottom: 15,
        minWidth: 200,
        alignItems: 'center',
    },
    buttonActive: {
        backgroundColor: '#34C759',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
