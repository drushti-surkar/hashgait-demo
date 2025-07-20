import React, { useEffect, useState } from 'react';
import { AccelerometerData, GyroscopeData } from '../types';

interface SensorManagerProps {
  onAccelerometerData: (data: AccelerometerData) => void;
  onGyroscopeData: (data: GyroscopeData) => void;
  isCollecting: boolean;
}

export const SensorManager: React.FC<SensorManagerProps> = ({
  onAccelerometerData,
  onGyroscopeData,
  isCollecting
}) => {
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isCollecting) {
      // Start mock sensor data generation
      const id = setInterval(() => {
        const timestamp = Date.now();
        
        // Generate mock accelerometer data
        const accelData: AccelerometerData = {
          timestamp,
          x: (Math.random() - 0.5) * 2, // -1 to 1
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2 + 9.8, // Include gravity
        };
        
        // Generate mock gyroscope data
        const gyroData: GyroscopeData = {
          timestamp,
          x: (Math.random() - 0.5) * 0.5, // -0.25 to 0.25
          y: (Math.random() - 0.5) * 0.5,
          z: (Math.random() - 0.5) * 0.5,
        };

        onAccelerometerData(accelData);
        onGyroscopeData(gyroData);
      }, 100); // 10Hz sampling rate

      setIntervalId(id);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isCollecting, onAccelerometerData, onGyroscopeData]);

  // This is a service component, no UI needed
  return null;
};