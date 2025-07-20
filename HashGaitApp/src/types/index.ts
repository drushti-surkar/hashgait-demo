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

export interface CaptureResult {
  username: string;
  sessionId: string;
  patternHash: string;
  gaitDataString: string;
  features: BehavioralFeatures;
  confidence: number;
  touchEvents: number;
  accelerometerData: number;
  gyroscopeData: number;
  timestamp: string;
}

export interface HashResult {
  success: boolean;
  hash: string;
  originalData: string;
  timestamp: string;
  historyCount: number;
  message: string;
}

export interface HashHistory {
  success: boolean;
  history: Array<{
    hash: string;
    gaitData: string;
    timestamp: string;
    id: number;
  }>;
  count: number;
  maxCount: number;
}