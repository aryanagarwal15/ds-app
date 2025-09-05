import { useCallback } from 'react';
import { MediaStream } from 'react-native-webrtc';
import type { ConnectionState } from '../types/audio';

export const useRecording = (
  connectionState: ConnectionState,
  isRecording: boolean,
  setIsRecording: (value: boolean) => void,
  setConnectionState: (state: ConnectionState) => void,
  setTranscript: (transcript: string) => void,
  setResponse: (response: string) => void,
  setError: (error: string | null) => void,
  dataChannelRef: React.MutableRefObject<any>,
  localStreamRef: React.MutableRefObject<MediaStream | null>,
  startPulseAnimation: () => void,
  stopPulseAnimation: () => void
) => {
  // Start recording audio
  const startRecording = useCallback(() => {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      setError('Not connected to AI service');
      return;
    }
    
    try {
      setIsRecording(true);
      setConnectionState('speaking');
      setTranscript('');
      setResponse('');
      startPulseAnimation();
      
      // Clear any existing audio buffer
      dataChannelRef.current.send(JSON.stringify({
        type: 'input_audio_buffer.clear',
      }));
      
      console.log('Started recording - audio is being captured automatically by WebRTC');
      
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording');
      setIsRecording(false);
      setConnectionState('connected');
      stopPulseAnimation();
    }
  }, [
    dataChannelRef,
    setError,
    setIsRecording,
    setConnectionState,
    setTranscript,
    setResponse,
    startPulseAnimation,
    stopPulseAnimation
  ]);

  // Stop recording audio
  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    
    try {
      setIsRecording(false);
      stopPulseAnimation();
      
      if (dataChannelRef.current && dataChannelRef.current.readyState === 'open') {
        // Commit the audio buffer for processing
        dataChannelRef.current.send(JSON.stringify({
          type: 'input_audio_buffer.commit',
        }));
        
        // Request response generation
        dataChannelRef.current.send(JSON.stringify({
          type: 'response.create',
          response: {
            modalities: ['text', 'audio'],
          },
        }));
      }
      
      setConnectionState('connected');
      console.log('Stopped recording - processing audio...');
      
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setError('Failed to process audio');
    }
  }, [
    isRecording,
    setIsRecording,
    stopPulseAnimation,
    dataChannelRef,
    setConnectionState,
    setError
  ]);

  // Handle mute/unmute
  const handleMuteToggle = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // return muted state
      }
    }
    return false;
  }, [localStreamRef]);

  return {
    startRecording,
    stopRecording,
    handleMuteToggle,
  };
};
