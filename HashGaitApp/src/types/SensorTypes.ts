export interface TouchEvent {
    timestamp: number;
    x: number;
    y: number;
    pressure: number;
    type: 'start' | 'move' | 'end';
    duration?: number;
}

export interface AccelerometerData {
    timestamp: number;
    x: number;
    y: number;
    z: number;
}

export interface GyroscopeData {
    timestamp: number;
    x: number;
    y: number;
    z: number;
}

export interface BehavioralFeatures {
    avgTouchPressure: number;
    avgTouchDuration: number;
    swipeVelocity: number;
    tapFrequency: number;
    deviceMotionVariance: number;
    gestureComplexity: number;
}
