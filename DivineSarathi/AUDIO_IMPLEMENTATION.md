# Audio Implementation Guide

## Overview
This implementation adds audio functionality to the UserDetailsPage with three main audio files:

1. **Background Music**: `hare_rama_hare_krishna.mp3` - Plays continuously at lower volume
2. **English Disclaimer**: `english_disclaimer.mp3` - Plays when English is selected
3. **Hindi Disclaimer**: `hindi_disclaimer.mp3` - Plays when Hindi is selected

## Key Features

### 1. Background Music
- Starts automatically when UserDetailsPage opens
- Plays at 30% volume (lower volume for background)
- Loops continuously
- Stops when leaving the page

### 2. Language-based Disclaimer Audio
- Plays the appropriate disclaimer audio based on selected language
- Higher volume (80%) for clear speech
- Does not loop (plays once)

### 3. Pause Controls
- Pause button in both small and big disclaimer views
- Pauses ALL audio (background music + disclaimer)
- Stops scrolling animation when paused

## Implementation Details

### Files Created/Modified

1. **`hooks/useAudio.ts`** - Custom hook for audio management
2. **`contexts/AudioContext.tsx`** - Context provider for global audio state
3. **`app/_layout.tsx`** - Wrapped with AudioProvider
4. **`app/UserDetailsPage.tsx`** - Starts background music on mount
5. **`components/DisclaimerSection.tsx`** - Added pause buttons and disclaimer audio

### Audio Context API

```typescript
const {
  backgroundMusic,    // Background music controls
  disclaimerAudio,    // Disclaimer audio controls
  pauseAllAudio,      // Pause all audio
  resumeAllAudio,     // Resume all audio
  stopAllAudio,       // Stop all audio
  isAnyAudioPlaying,  // Global audio state
  isPaused           // Global pause state
} = useAudioContext();
```

### Usage Example

```typescript
// Start background music
backgroundMusic.play();

// Play disclaimer in specific language
disclaimerAudio.play('english'); // or 'hindi'

// Pause all audio
pauseAllAudio();

// Stop all audio
stopAllAudio();
```

## Audio Files

- **hare_rama_hare_krishna.mp3** (7.7MB) - Background music
- **english_disclaimer.mp3** (1.2MB) - English disclaimer
- **hindi_disclaimer.mp3** (1.6MB) - Hindi disclaimer

## Volume Levels

- Background Music: 30% (0.3)
- Disclaimer Audio: 80% (0.8)

## Error Handling

- All audio operations are wrapped in try-catch blocks
- Console errors are logged for debugging
- Graceful fallback if audio files fail to load

## Performance Considerations

- Audio files are loaded on-demand
- Proper cleanup on component unmount
- Audio mode configured for optimal performance
- Background music stops when leaving the page
