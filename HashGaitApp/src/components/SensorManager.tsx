import React, { useEffect, useState } from 'react';
import { accelerometer, gyroscope } from 'react-native-sensors';
import { Subscription } from 'rxjs';
import { AccelerometerData, GyroscopeData } from '../types/SensorTypes';

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
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

    useEffect(() => {
        if (isCollecting) {
            startSensorCollection();
        } else {
            stopSensorCollection();
        }

        return () => stopSensorCollection();
    }, [isCollecting]);

    const startSensorCollection = () => {
        const accelSub = accelerometer.subscribe(({ x, y, z, timestamp }) => {
            const data: AccelerometerData = {
                timestamp: timestamp || Date.now(),
                x: parseFloat(x.toFixed(4)),
                y: parseFloat(y.toFixed(4)),
                z: parseFloat(z.toFixed(4))
            };
            onAccelerometerData(data);
        });

        const gyroSub = gyroscope.subscribe(({ x, y, z, timestamp }) => {
            const data: GyroscopeData = {
                timestamp: timestamp || Date.now(),
                x: parseFloat(x.toFixed(4)),
                y: parseFloat(y.toFixed(4)),
                z: parseFloat(z.toFixed(4))
            };
            onGyroscopeData(data);
        });

        setSubscriptions([accelSub, gyroSub]);
    };

    const stopSensorCollection = () => {
        subscriptions.forEach(sub => sub.unsubscribe());
        setSubscriptions([]);
    };

    return null;
};
