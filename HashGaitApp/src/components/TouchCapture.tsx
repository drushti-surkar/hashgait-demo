import React from 'react';
import { View, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import { TouchEvent } from '../types/SensorTypes';

interface TouchCaptureProps {
    children: React.ReactNode;
    onTouchEvent: (event: TouchEvent) => void;
    isEnabled: boolean;
}

export const TouchCapture: React.FC<TouchCaptureProps> = ({ 
    children, 
    onTouchEvent, 
    isEnabled 
}) => {
    const touchStartTime = React.useRef<number>(0);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => isEnabled,
        onMoveShouldSetPanResponder: () => isEnabled,
        
        onPanResponderGrant: (evt: GestureResponderEvent) => {
            touchStartTime.current = Date.now();
            const touchEvent: TouchEvent = {
                timestamp: touchStartTime.current,
                x: evt.nativeEvent.pageX,
                y: evt.nativeEvent.pageY,
                pressure: evt.nativeEvent.force || 0.5,
                type: 'start'
            };
            onTouchEvent(touchEvent);
        },

        onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
            const touchEvent: TouchEvent = {
                timestamp: Date.now(),
                x: evt.nativeEvent.pageX,
                y: evt.nativeEvent.pageY,
                pressure: evt.nativeEvent.force || 0.5,
                type: 'move'
            };
            onTouchEvent(touchEvent);
        },

        onPanResponderRelease: (evt: GestureResponderEvent) => {
            const currentTime = Date.now();
            const duration = currentTime - touchStartTime.current;
            const touchEvent: TouchEvent = {
                timestamp: currentTime,
                x: evt.nativeEvent.pageX,
                y: evt.nativeEvent.pageY,
                pressure: evt.nativeEvent.force || 0.5,
                type: 'end',
                duration: duration
            };
            onTouchEvent(touchEvent);
        }
    });

    return (
        <View {...panResponder.panHandlers} style={{ flex: 1 }}>
            {children}
        </View>
    );
};
