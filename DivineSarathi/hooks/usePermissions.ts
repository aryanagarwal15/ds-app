import { useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { mediaDevices, MediaStream } from 'react-native-webrtc';
import type { AudioPermissions } from '../types/audio';

export const usePermissions = (setError: (error: string | null) => void) => {
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isSimulator, setIsSimulator] = useState(false);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Check if running on iOS Simulator
  const checkIfSimulator = useCallback(() => {
    const isIOSSimulator = Platform.OS === 'ios' && !Constants.isDevice;
    setIsSimulator(isIOSSimulator);
    
    return isIOSSimulator;
  }, []);

  // Check and request microphone permissions
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    try {
      // Check if simulator first
      const simulator = checkIfSimulator();
      
      console.log('Requesting microphone permissions...');
      
      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      
      if (stream) {
        localStreamRef.current = stream;
        setHasPermissions(true);
        console.log('Microphone permissions granted');
        
        return true;
      }
    } catch (err) {
      console.error('Permission check failed:', err);
      
      const errorMessage = simulator 
        ? 'iOS Simulator does not support microphone access. Please test on a physical device.'
        : 'Microphone permission required. Please grant access in device settings.';
      
      setError(errorMessage);
      return false;
    }
    return false;
  }, [checkIfSimulator, setError]);

  // Cleanup local stream
  const cleanupLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setHasPermissions(false);
  }, []);

  return {
    hasPermissions,
    isSimulator,
    checkPermissions,
    checkIfSimulator,
    setHasPermissions,
    localStreamRef,
    cleanupLocalStream,
  };
};
