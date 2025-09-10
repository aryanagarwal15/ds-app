import React, { useState, useCallback, useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Import custom hooks and utilities
import { usePermissions } from "../hooks/usePermissions";
import { useAnimations } from "../hooks/useAnimations";
import { useWebRTC } from "../hooks/useWebRTC";
import { useRecording } from "../hooks/useRecording";
import type { ConnectionState } from "../types/audio";

// Import new components
import DailyStoryInterface from "../components/DailyStoryInterface";
import KrishnaTalkInterface from "../components/KrishnaTalkInterface";

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
  isComplete: boolean;
}

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

  // AI Connection hooks
  const {
    checkPermissions,
    checkIfSimulator,
    localStreamRef,
    cleanupLocalStream,
  } = usePermissions(setError);

  const {
    pulseAnim,
    rippleAnim,
    fadeAnim,
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
  const handleConnectionToggle = useCallback(async () => {
    if (connectionState === "idle" || connectionState === "error") {
      const permissionGranted = await checkPermissions();
      if (permissionGranted) {
        await connectToRealtime();
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
  }, [
    connectionState,
    checkPermissions,
    connectToRealtime,
    cleanup,
    cleanupLocalStream,
    stopPulseAnimation,
    stopRippleAnimation,
  ]);

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
    if (transcript && connectionState === "connected") {
      setChatTranscript([
        ...chatTranscript,
        {
          id: Date.now().toString(),
          sender: "user",
          message: transcript,
          timestamp: Date.now(),
          isComplete: true,
        },
      ]);
    }
    if (connectionState === "listening") {
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
    }
  }, [transcript, connectionState]);

  useEffect(() => {
    if (response && connectionState === "connected") {
      //checkif last message added is not same
      if (chatTranscript[chatTranscript.length - 1].message !== response) {
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
      <DailyStoryInterface error={error} onClearError={() => setError(null)} />
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
