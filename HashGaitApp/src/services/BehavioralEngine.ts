import { BehavioralFeatures, TouchEvent, AccelerometerData, GyroscopeData } from '../types';

export class BehavioralEngine {
  extractFeatures(
    touchEvents: TouchEvent[],
    accelerometerData: AccelerometerData[],
    gyroscopeData: GyroscopeData[]
  ): BehavioralFeatures {
    // Calculate touch pressure average
    const pressures = touchEvents.filter(e => e.pressure > 0).map(e => e.pressure);
    const avgTouchPressure = pressures.length > 0 
      ? pressures.reduce((sum, p) => sum + p, 0) / pressures.length 
      : 0.5;

    // Calculate touch duration average
    const durations = touchEvents.filter(e => e.duration && e.duration > 0).map(e => e.duration!);
    const avgTouchDuration = durations.length > 0
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length
      : 100;

    // Calculate swipe velocity
    let totalVelocity = 0;
    let velocityCount = 0;
    for (let i = 0; i < touchEvents.length - 1; i++) {
      const e1 = touchEvents[i];
      const e2 = touchEvents[i + 1];
      if (e1.type === 'move' && e2.type === 'move') {
        const distance = Math.sqrt(Math.pow(e2.x - e1.x, 2) + Math.pow(e2.y - e1.y, 2));
        const time = e2.timestamp - e1.timestamp;
        if (time > 0) {
          totalVelocity += distance / time;
          velocityCount++;
        }
      }
    }
    const swipeVelocity = velocityCount > 0 ? totalVelocity / velocityCount : 0;

    // Calculate tap frequency
    const taps = touchEvents.filter(e => e.type === 'start');
    const timeSpan = touchEvents.length > 0 
      ? (touchEvents[touchEvents.length - 1].timestamp - touchEvents[0].timestamp) / 1000 
      : 1;
    const tapFrequency = taps.length / Math.max(timeSpan, 1);

    // Calculate device motion variance
    const accelMagnitudes = accelerometerData.map(d => Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z));
    const gyroMagnitudes = gyroscopeData.map(d => Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z));
    const allMagnitudes = [...accelMagnitudes, ...gyroMagnitudes];
    
    let deviceMotionVariance = 0;
    if (allMagnitudes.length > 0) {
      const mean = allMagnitudes.reduce((sum, val) => sum + val, 0) / allMagnitudes.length;
      const variance = allMagnitudes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / allMagnitudes.length;
      deviceMotionVariance = isNaN(variance) ? 0 : variance;
    }

    // Calculate gesture complexity
    let pathLength = 0;
    let directDistance = 0;
    if (touchEvents.length >= 2) {
      const start = touchEvents[0];
      const end = touchEvents[touchEvents.length - 1];
      directDistance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

      for (let i = 0; i < touchEvents.length - 1; i++) {
        const e1 = touchEvents[i];
        const e2 = touchEvents[i + 1];
        pathLength += Math.sqrt(Math.pow(e2.x - e1.x, 2) + Math.pow(e2.y - e1.y, 2));
      }
    }
    const gestureComplexity = directDistance > 0 ? pathLength / directDistance : 1;

    return {
      avgTouchPressure,
      avgTouchDuration,
      swipeVelocity,
      tapFrequency,
      deviceMotionVariance,
      gestureComplexity
    };
  }

  generatePatternHash(features: BehavioralFeatures): string {
    const normalized = [
      Math.round(features.avgTouchPressure * 1000),
      Math.round(features.avgTouchDuration),
      Math.round(features.swipeVelocity * 1000),
      Math.round(features.tapFrequency * 1000),
      Math.round(features.deviceMotionVariance * 1000),
      Math.round(features.gestureComplexity * 1000)
    ];
    
    let hash = 0;
    const str = normalized.join('');
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  calculateConfidenceScore(features: BehavioralFeatures): number {
    const scores = [
      Math.min(100, features.avgTouchPressure * 100),
      Math.min(100, features.avgTouchDuration / 5),
      Math.min(100, features.swipeVelocity * 10),
      Math.min(100, features.tapFrequency * 20),
      Math.max(0, 100 - features.deviceMotionVariance * 10),
      Math.min(100, features.gestureComplexity * 20)
    ];
    
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  }
}