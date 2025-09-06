import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

interface AudioContextType {
  // Background music controls
  backgroundMusic: {
    isPlaying: boolean;
    isPaused: boolean;
    play: () => Promise<void>;
    pause: () => Promise<void>;
    stop: () => Promise<void>;
  };
  
  // Disclaimer audio controls
  disclaimerAudio: {
    isPlaying: boolean;
    isPaused: boolean;
    play: (language: 'english' | 'hindi') => Promise<void>;
    pause: () => Promise<void>;
    stop: () => Promise<void>;
  };
  
  // Shankha audio controls
  shankhaAudio: {
    isPlaying: boolean;
    isPaused: boolean;
    start: () => Promise<void>;
    stop: () => Promise<void>;
  };
  
  // Global pause/play all audio
  pauseAllAudio: () => Promise<void>;
  resumeAllAudio: (language: 'english' | 'hindi') => Promise<void>;
  stopAllAudio: () => Promise<void>;
  
  // Audio state
  isAnyAudioPlaying: boolean;
  isPaused: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const [backgroundMusicState, setBackgroundMusicState] = useState({
    isPlaying: false,
    isPaused: false,
  });
  
  const [disclaimerAudioState, setDisclaimerAudioState] = useState({
    isPlaying: false,
    isPaused: false,
  });
  
  const [shankhaAudioState, setShankhaAudioState] = useState({
    isPlaying: false,
    isPaused: false,
  });
  
  const [isPaused, setIsPaused] = useState(false);
  
  const backgroundSoundRef = useRef<Audio.Sound | null>(null);
  const disclaimerSoundRef = useRef<Audio.Sound | null>(null);
  const shankhaSoundRef = useRef<Audio.Sound | null>(null);

  const isAnyAudioPlaying = backgroundMusicState.isPlaying || disclaimerAudioState.isPlaying || shankhaAudioState.isPlaying;

  useEffect(() => {
    // Configure audio mode for better performance
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      // Cleanup on unmount
      stopAllAudio();
    };
  }, []);

  const loadBackgroundMusic = async () => {
    try {
      if (backgroundSoundRef.current) {
        await backgroundSoundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        require('../assets/audio/hare_rama_hare_krishna.mp3'),
        {
          shouldPlay: false,
          isLooping: true,
          volume: 0.1, // Lower volume for background music
        }
      );

      backgroundSoundRef.current = sound;
    } catch (error) {
      console.error('Error loading background music:', error);
    }
  };

  const loadDisclaimerAudio = async (language: 'english' | 'hindi') => {
    try {
      if (disclaimerSoundRef.current) {
        await disclaimerSoundRef.current.unloadAsync();
      }

      const audioFile = language === 'english' 
        ? require('../assets/audio/english_disclaimer.mp3')
        : require('../assets/audio/hindi_disclaimer.mp3');

      const { sound } = await Audio.Sound.createAsync(
        audioFile,
        {
          shouldPlay: false,
          isLooping: false,
          volume: 0.8, // Higher volume for disclaimer
        }
      );

      disclaimerSoundRef.current = sound;
    } catch (error) {
      console.error('Error loading disclaimer audio:', error);
    }
  };

  const loadShankhaAudio = async () => {
    try {
      if (shankhaSoundRef.current) {
        await shankhaSoundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        require('../assets/audio/shankha.m4a'),
        {
          shouldPlay: false,
          isLooping: false,
          volume: 0.9, // High volume for shankha
        }
      );

      shankhaSoundRef.current = sound;
    } catch (error) {
      console.error('Error loading shankha audio:', error);
    }
  };

  const playBackgroundMusic = async () => {
    try {
      if (!backgroundSoundRef.current) {
        await loadBackgroundMusic();
      }
      
      if (backgroundSoundRef.current && !backgroundMusicState.isPlaying) {
        await backgroundSoundRef.current.playAsync();
        setBackgroundMusicState({ isPlaying: true, isPaused: false });
      }
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  };

  const pauseBackgroundMusic = async () => {
    try {
      if (backgroundSoundRef.current && backgroundMusicState.isPlaying) {
        await backgroundSoundRef.current.pauseAsync();
        setBackgroundMusicState({ isPlaying: false, isPaused: true });
      }
    } catch (error) {
      console.error('Error pausing background music:', error);
    }
  };

  const stopBackgroundMusic = async () => {
    try {
      if (backgroundSoundRef.current) {
        await backgroundSoundRef.current.stopAsync();
        setBackgroundMusicState({ isPlaying: false, isPaused: false });
      }
    } catch (error) {
      console.error('Error stopping background music:', error);
    }
  };

  const playDisclaimerAudio = async (language: 'english' | 'hindi') => {
    try {
      if (!disclaimerSoundRef.current) {
        await loadDisclaimerAudio(language);
      }
      
      if (disclaimerSoundRef.current && !disclaimerAudioState.isPlaying) {
        await disclaimerSoundRef.current.playAsync();
        setDisclaimerAudioState({ isPlaying: true, isPaused: false });
      }
    } catch (error) {
      console.error('Error playing disclaimer audio:', error);
    }
  };

  const pauseDisclaimerAudio = async () => {
    try {
      if (disclaimerSoundRef.current && disclaimerAudioState.isPlaying) {
        await disclaimerSoundRef.current.pauseAsync();
        setDisclaimerAudioState({ isPlaying: false, isPaused: true });
      }
    } catch (error) {
      console.error('Error pausing disclaimer audio:', error);
    }
  };

  const stopDisclaimerAudio = async () => {
    try {
      if (disclaimerSoundRef.current) {
        await disclaimerSoundRef.current.stopAsync();
        setDisclaimerAudioState({ isPlaying: false, isPaused: false });
      }
    } catch (error) {
      console.error('Error stopping disclaimer audio:', error);
    }
  };

  const startShankha = async () => {
    try {
      if (!shankhaSoundRef.current) {
        await loadShankhaAudio();
      }
      
      if (shankhaSoundRef.current && !shankhaAudioState.isPlaying) {
        await shankhaSoundRef.current.playAsync();
        setShankhaAudioState({ isPlaying: true, isPaused: false });
      }
    } catch (error) {
      console.error('Error playing shankha audio:', error);
    }
  };

  const stopShankha = async () => {
    try {
      if (shankhaSoundRef.current) {
        await shankhaSoundRef.current.stopAsync();
        setShankhaAudioState({ isPlaying: false, isPaused: false });
      }
    } catch (error) {
      console.error('Error stopping shankha audio:', error);
    }
  };

  const pauseAllAudio = async () => {
    setIsPaused(true);
    await Promise.all([
      pauseBackgroundMusic(),
      pauseDisclaimerAudio(),
    ]);
  };

  const resumeAllAudio = async (language: 'english' | 'hindi') => {
    console.log("resumeAllAudio", language);
    setIsPaused(false);
    if (backgroundMusicState.isPaused) {
      await playBackgroundMusic();
    }
    if (disclaimerAudioState.isPaused) {
      await playDisclaimerAudio(language);
    }
  };

  const stopAllAudio = async () => {
    setIsPaused(false);
    await Promise.all([
      stopBackgroundMusic(),
      stopDisclaimerAudio(),
    ]);
  };

  const contextValue: AudioContextType = {
    backgroundMusic: {
      isPlaying: backgroundMusicState.isPlaying,
      isPaused: backgroundMusicState.isPaused,
      play: playBackgroundMusic,
      pause: pauseBackgroundMusic,
      stop: stopBackgroundMusic,
    },
    disclaimerAudio: {
      isPlaying: disclaimerAudioState.isPlaying,
      isPaused: disclaimerAudioState.isPaused,
      play: playDisclaimerAudio,
      pause: pauseDisclaimerAudio,
      stop: stopDisclaimerAudio,
    },
    shankhaAudio: {
      isPlaying: shankhaAudioState.isPlaying,
      isPaused: shankhaAudioState.isPaused,
      start: startShankha,
      stop: stopShankha,
    },
    pauseAllAudio,
    resumeAllAudio,
    stopAllAudio,
    isAnyAudioPlaying,
    isPaused,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
};
