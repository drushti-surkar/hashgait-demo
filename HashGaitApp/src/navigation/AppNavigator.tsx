import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LoginScreen } from '../screens/LoginScreen';
import { GaitCaptureScreen } from '../screens/GaitCaptureScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { DashboardScreen } from '../screens/DashboardScreen';

export type Screen = 'login' | 'capture' | 'result' | 'dashboard';

export const AppNavigator: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>('login');
    const [username, setUsername] = useState<string>('');
    const [captureResult, setCaptureResult] = useState<any>(null);

    const navigateToCapture = (user: string) => {
        setUsername(user);
        setCurrentScreen('capture');
    };

    const navigateToResult = (result: any) => {
        setCaptureResult(result);
        setCurrentScreen('result');
    };

    const navigateToDashboard = () => {
        setCurrentScreen('dashboard');
    };

    const navigateToLogin = () => {
        setUsername('');
        setCaptureResult(null);
        setCurrentScreen('login');
    };

    const startNewCapture = () => {
        setCurrentScreen('capture');
    };

    const renderScreen = () => {
        switch (currentScreen) {
            case 'login':
                return (
                    <LoginScreen onLogin={navigateToCapture} />
                );
            
            case 'capture':
                return (
                    <GaitCaptureScreen 
                        username={username}
                        onCaptureComplete={navigateToResult}
                    />
                );
            
            case 'result':
                return (
                    <ResultScreen 
                        captureResult={captureResult}
                        onNavigateToDashboard={navigateToDashboard}
                        onStartNewCapture={startNewCapture}
                    />
                );
            
            case 'dashboard':
                return (
                    <DashboardScreen 
                        username={username}
                        captureResult={captureResult}
                        onLogout={navigateToLogin}
                        onStartNewCapture={startNewCapture}
                    />
                );
            
            default:
                return <LoginScreen onLogin={navigateToCapture} />;
        }
    };

    return (
        <View style={styles.container}>
            {renderScreen()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});