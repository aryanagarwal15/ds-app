import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

export interface AudioState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoaded: boolean;
  duration: number;
  position: number;
}

export interface AudioControls {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  seekTo: (positionMillis: number) => Promise<void>;
}

export function useAudio(audioSource: any, options: {
  shouldLoop?: boolean;
  volume?: number;
  shouldPlay?: boolean;
  onPlaybackStatusUpdate?: (status: any) => void;
} = {}) {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isPaused: false,
    isLoaded: false,
    duration: 0,
    position: 0,
  });

  const soundRef = useRef<Audio.Sound | null>(null);
  const { shouldLoop = false, volume = 1.0, shouldPlay = false, onPlaybackStatusUpdate } = options;

  useEffect(() => {
    loadAudio();
    return () => {
      unloadAudio();
    };
  }, [audioSource]);

  useEffect(() => {
    if (shouldPlay && audioState.isLoaded && !audioState.isPlaying) {
      play();
    } else if (!shouldPlay && audioState.isPlaying) {
      pause();
    }
  }, [shouldPlay, audioState.isLoaded, audioState.isPlaying]);

  const loadAudio = async () => {
    try {
      if (soundRef.current) {
        await unloadAudio();
      }

      const { sound } = await Audio.Sound.createAsync(
        audioSource,
        {
          shouldPlay: false,
          isLooping: shouldLoop,
          volume: volume,
        },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setAudioState(prev => ({ ...prev, isLoaded: true }));
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const unloadAudio = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setAudioState({
          isPlaying: false,
          isPaused: false,
          isLoaded: false,
          duration: 0,
          position: 0,
        });
      }
    } catch (error) {
      console.error('Error unloading audio:', error);
    }
  };

  const play = async () => {
    try {
      if (soundRef.current && audioState.isLoaded) {
        await soundRef.current.playAsync();
        setAudioState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const pause = async () => {
    try {
      if (soundRef.current && audioState.isPlaying) {
        await soundRef.current.pauseAsync();
        setAudioState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  const stop = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        setAudioState(prev => ({ ...prev, isPlaying: false, isPaused: false, position: 0 }));
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const setVolume = async (newVolume: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setVolumeAsync(newVolume);
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  const seekTo = async (positionMillis: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(positionMillis);
        setAudioState(prev => ({ ...prev, position: positionMillis }));
      }
    } catch (error) {
      console.error('Error seeking audio:', error);
    }
  };

  const controls: AudioControls = {
    play,
    pause,
    stop,
    setVolume,
    seekTo,
  };

  return { audioState, controls };
}
