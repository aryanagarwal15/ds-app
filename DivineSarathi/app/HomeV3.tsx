import BottomNav from "@/components/Home/BottomNav";
import HomeTab from "@/components/Home/HomeTab";
import KrishnaAITab from "@/components/Home/KrishnaAITab";
import StoriesTab from "@/components/Home/StoriesTab";
import { useAudioContext } from "@/contexts/AudioContext";
import { useAnimations } from "@/hooks/useAnimations";
import { usePermissions } from "@/hooks/usePermissions";
import { useRecording } from "@/hooks/useRecording";
import { useWebRTC } from "@/hooks/useWebRTC";
import { ChatMessage, ConnectionState } from "@/types/audio";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, StatusBar, SafeAreaView, View } from "react-native";

export default function HomeV3() {
  const [selectedTab, setSelectedTab] = useState<string>("home");
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
  const [storyTitle, setStoryTitle] = useState<string>(
    "Ask Krishna Anything..."
  );
  const { backgroundMusic } = useAudioContext();

  // AI Connection hooks
  const { checkPermissions, localStreamRef, cleanupLocalStream } =
    usePermissions(setError);

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

  useEffect(() => {
    console.log("selectedTab", selectedTab);
  }, [selectedTab]);

  const handleStoryClick = (storyId: number, storyTitle: string) => {
    handleConnectionToggle(storyId.toString());
    setStoryTitle(storyTitle);
    setSelectedTab("chat");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <BottomNav selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      {selectedTab === "home" && <HomeTab onStoryClick={handleStoryClick}  />}
      <KrishnaAITab
        fullscreen={selectedTab === "chat"}
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
        storyTitle={storyTitle}
      />
      {selectedTab === "favourites" && <StoriesTab />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
