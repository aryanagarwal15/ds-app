import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Import custom hooks and utilities
import { usePermissions } from "../hooks/usePermissions";
import { useAnimations } from "../hooks/useAnimations";
import { useWebRTC } from "../hooks/useWebRTC";
import { useRecording } from "../hooks/useRecording";
import type { ConnectionState, ChatMessage } from "../types/audio";
import { useAudioContext } from "../contexts/AudioContext";

// Import new components
import MainInterfaceV2 from "../components/MainInterfaceV2";
import KrishnaTalkInterface from "../components/KrishnaTalkInterface";

const HomeV2: React.FC = () => {
  // AI Connection state
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [chatTranscript, setChatTranscript] = useState<ChatMessage[]>([]);
  const [activeConversation, setActiveConversation] = useState<string>("");
  //krishnaInterfaceOpen
  const [isKrishnaInterfaceOpen, setIsKrishnaInterfaceOpen] = useState(false);

  useEffect(() => {
    console.log("isKrishnaInterfaceOpen", isKrishnaInterfaceOpen);
  }, [isKrishnaInterfaceOpen]);

  // Audio context for background music
  const { backgroundMusic } = useAudioContext();

  // AI Connection hooks
  const {
    checkPermissions,
    localStreamRef,
    cleanupLocalStream,
  } = usePermissions(setError);

  const {
    startPulseAnimation,
    stopPulseAnimation,
    startRippleAnimation,
    stopRippleAnimation,
  } = useAnimations(transcript, response);

  const { dataChannelRef, connectToRealtime, cleanup } = useWebRTC(
    setConnectionState,
    setError,
    setTranscript,
    setResponse,
    startRippleAnimation,
    stopRippleAnimation,
    localStreamRef
  );

  const {
    startRecording,
    stopRecording,
    handleMuteToggle: toggleMute,
  } = useRecording(
    connectionState,
    isRecording,
    setIsRecording,
    setConnectionState,
    setTranscript,
    setResponse,
    setError,
    dataChannelRef,
    localStreamRef,
    startPulseAnimation,
    stopPulseAnimation
  );

  // Handle mute/unmute
  const handleMuteToggle = useCallback(() => {
    const newMutedState = toggleMute();
    setIsMuted(newMutedState);
  }, [toggleMute]);

  // Handle connect/disconnect
  const handleConnectionToggle = useCallback(
    async (storyId: string) => {
      if (connectionState === "idle" || connectionState === "error") {
        const permissionGranted = await checkPermissions();
        if (permissionGranted) {
          setActiveConversation("");
          setChatTranscript([]);
          setIsKrishnaInterfaceOpen(true);
          await connectToRealtime(storyId);
        }
      } else {
        cleanup();
        cleanupLocalStream();
        setIsRecording(false);
        setTranscript("");
        setResponse("");
        stopPulseAnimation();
        stopRippleAnimation();
      }
    },
    [
      connectionState,
      checkPermissions,
      connectToRealtime,
      cleanup,
      cleanupLocalStream,
      stopPulseAnimation,
      stopRippleAnimation,
    ]
  );

  // Play background music while establishing connection; stop when connected or finished
  useEffect(() => {
    const syncBackgroundMusic = async () => {
      if (
        connectionState === "connecting" ||
        connectionState === "connected" ||
        connectionState === "listening" ||
        connectionState === "speaking"
      ) {
        await backgroundMusic.play();
      } else if (connectionState === "idle" || connectionState === "error") {
        await backgroundMusic.stop();
      }
    };
    syncBackgroundMusic();
  }, [connectionState, backgroundMusic]);

  // Duck background music volume during active WebRTC states
  useEffect(() => {
    const adjustBackgroundVolume = async () => {
      // Default gentle volume
      const defaultVolume = 0.1;
      const connectingVolume = 0.02; // slightly lower while connecting
      const activeCallVolume = 0.02; // very low when AI is connected/speaking/listening

      if (connectionState === "connecting") {
        await backgroundMusic.setVolume(connectingVolume);
      } else if (
        connectionState === "connected" ||
        connectionState === "listening" ||
        connectionState === "speaking"
      ) {
        await backgroundMusic.setVolume(activeCallVolume);
      } else {
        await backgroundMusic.setVolume(defaultVolume);
      }
    };
    adjustBackgroundVolume();
  }, [connectionState, backgroundMusic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      cleanupLocalStream();
      stopPulseAnimation();
      stopRippleAnimation();
    };
  }, [cleanup, cleanupLocalStream, stopPulseAnimation, stopRippleAnimation]);

  useEffect(() => {
    if (transcript == "...") {
      setChatTranscript([
        ...chatTranscript,
        {
          id: Date.now().toString(),
          sender: "user",
          message: "...",
          timestamp: Date.now(),
          isComplete: true,
        },
      ]);
    } else {
      let indexToEdit = -1;
      for (let i = chatTranscript.length - 1; i >= 0; i--) {
        if (
          chatTranscript[i]?.sender === "user" &&
          chatTranscript[i]?.message === "..."
        ) {
          indexToEdit = i;
          break;
        }
      }
      if (indexToEdit !== -1) {
        chatTranscript[indexToEdit].message = transcript;
      }
    }
  }, [transcript]);

  useEffect(() => {
    if (response && connectionState === "connected") {
      //checkif last message from added is not same
      let lastResponse = "";
      for (let i = chatTranscript.length - 1; i >= 0; i--) {
        if (chatTranscript[i]?.sender === "Krishna Ji") {
          lastResponse = chatTranscript[i]?.message;
          break;
        }
      }
      if (lastResponse !== response) {
        setChatTranscript([
          ...chatTranscript,
          {
            id: Date.now().toString(),
            sender: "Krishna Ji",
            message: response,
            timestamp: Date.now(),
            isComplete: true,
          },
        ]);
        setActiveConversation("");
      }
    } else if (response && connectionState === "speaking") {
      setActiveConversation(response);
    }
  }, [response, connectionState]);

  return (
    <GestureHandlerRootView style={styles.rootContainer}>
      <MainInterfaceV2
        onConnectionToggle={handleConnectionToggle}
        error={error}
        onClearError={() => setError(null)}
      />
      <KrishnaTalkInterface
        connectionState={connectionState}
        isRecording={isRecording}
        transcript={transcript}
        response={response}
        chatTranscript={chatTranscript}
        isMuted={isMuted}
        onMuteToggle={handleMuteToggle}
        onConnectionToggle={handleConnectionToggle}
        activeConversation={activeConversation}
        isKrishnaInterfaceOpen={isKrishnaInterfaceOpen}
        setIsKrishnaInterfaceOpen={setIsKrishnaInterfaceOpen}
      />
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
});

export default HomeV2;
