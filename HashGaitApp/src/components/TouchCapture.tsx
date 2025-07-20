import React from 'react';
import { View, PanResponder, ViewStyle } from 'react-native';
import { TouchEvent } from '../types';

interface TouchCaptureProps {
  onTouchEvent: (event: TouchEvent) => void;
  isEnabled: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const TouchCapture: React.FC<TouchCaptureProps> = ({
  onTouchEvent,
  isEnabled,
  children,
  style
}) => {
  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => isEnabled,
    onMoveShouldSetPanResponder: () => isEnabled,

    onPanResponderGrant: (evt) => {
      if (!isEnabled) return;
      
      const { locationX: x, locationY: y } = evt.nativeEvent;
      const touchEvent: TouchEvent = {
        timestamp: Date.now(),
        x: x || 0,
        y: y || 0,
        pressure: 0.5, // Mock pressure since it's not available in web
        type: 'start'
      };
      onTouchEvent(touchEvent);
    },

    onPanResponderMove: (evt) => {
      if (!isEnabled) return;
      
      const { locationX: x, locationY: y } = evt.nativeEvent;
      const touchEvent: TouchEvent = {
        timestamp: Date.now(),
        x: x || 0,
        y: y || 0,
        pressure: 0.5,
        type: 'move'
      };
      onTouchEvent(touchEvent);
    },

    onPanResponderRelease: (evt) => {
      if (!isEnabled) return;
      
      const { locationX: x, locationY: y } = evt.nativeEvent;
      const touchEvent: TouchEvent = {
        timestamp: Date.now(),
        x: x || 0,
        y: y || 0,
        pressure: 0,
        type: 'end',
        duration: 100 // Mock duration
      };
      onTouchEvent(touchEvent);
    },
  }), [isEnabled, onTouchEvent]);

  return (
    <View style={[{ flex: 1 }, style]} {...panResponder.panHandlers}>
      {children}
    </View>
  );
};