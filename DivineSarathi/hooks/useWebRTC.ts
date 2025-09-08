import { useRef, useCallback } from "react";
import {
  RTCPeerConnection,
  RTCSessionDescription,
  MediaStream,
} from "react-native-webrtc";
import { fetchEphemeralKey } from "../services/openai";
import type {
  ConnectionState,
  DataChannelMessage,
  WebRTCRefs,
} from "../types/audio";
import InCallManager from "react-native-incall-manager";
import { sendLocation } from "@/redux/auth/slice";
import { store } from "@/redux/store";

export const useWebRTC = (
  setConnectionState: (state: ConnectionState) => void,
  setError: (error: string | null) => void,
  setTranscript: (transcript: string) => void,
  setResponse: (response: string | ((prev: string) => string)) => void,
  startRippleAnimation: () => void,
  stopRippleAnimation: () => void,
  localStreamRef: React.MutableRefObject<MediaStream | null>
) => {
  // WebRTC refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<any>(null);

  // Add a ref to store the remote audio track
  const remoteAudioTrackRef = useRef<any>(null);

  // Handle realtime messages from OpenAI
  const handleRealtimeMessage = useCallback(
    (message: DataChannelMessage) => {
      console.log("Received realtime message:", message.type);

      switch (message.type) {
        case "session.created":
          console.log("Realtime session created");
          break;

        case "session.updated":
          console.log("Session configuration updated");
          break;

        case "input_audio_buffer.speech_started":
          console.log("Speech started");
          setConnectionState("listening");
          startRippleAnimation();
          break;

        case "input_audio_buffer.speech_stopped":
          console.log("Speech stopped");
          setConnectionState("connected");
          stopRippleAnimation();
          break;

        case "conversation.item.input_audio_transcription.completed":
          console.log("Transcription completed");
          if (message.transcript) {
            setTranscript(message.transcript);
          }
          break;

        case "response.created":
          console.log("Response generation started");
          setResponse("");
          break;

        case "response.audio_transcript.delta":
          if (message.delta) {
            setResponse((prev) => prev + message.delta);
          }
          break;

        case "response.done":
          console.log("Response completed");
          setConnectionState("connected");
          break;

        case "error":
          console.error("Realtime API error:", message);
          setError(`AI service error: ${JSON.stringify(message)}`);
          setConnectionState("error");
          break;

        default:
          console.log("Unhandled message type:", message.type);
      }
    },
    [
      setConnectionState,
      setTranscript,
      setResponse,
      setError,
      startRippleAnimation,
      stopRippleAnimation,
    ]
  );

  // Setup data channel event handlers
  const setupDataChannel = useCallback(
    (dataChannel: any) => {
      dataChannel.onopen = () => {
        console.log("Data channel opened");

        // Configure session for transcription
        dataChannel.send(
          JSON.stringify({
            type: "session.update",
            session: {
              input_audio_transcription: {
                model: "whisper-1",
              },
              turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 200,
              },
            },
          })
        );

        setConnectionState("connected");
      };

      dataChannel.onmessage = (event: any) => {
        try {
          const message: DataChannelMessage = JSON.parse(event.data);
          handleRealtimeMessage(message);
        } catch (err) {
          console.error("Failed to parse data channel message:", err);
        }
      };

      dataChannel.onerror = (error: any) => {
        console.error("Data channel error:", error);
        setError("Communication error occurred");
      };

      dataChannel.onclose = () => {
        console.log("Data channel closed");
        setConnectionState("idle");
      };
    },
    [setConnectionState, setError, handleRealtimeMessage]
  );

  // Connect to OpenAI Realtime API using WebRTC
  const connectToRealtime = useCallback(async () => {
    let peerConnection: RTCPeerConnection | null = null;

    try {
      setConnectionState("connecting");
      setError(null);

      // Get ephemeral key from backend
      console.log("Fetching ephemeral key...");
      const ephemeralKey = await fetchEphemeralKey();
      console.log("Ephemeral key obtained");

      // Create RTCPeerConnection with error handling
      const configuration = {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      };

      console.log("Creating RTCPeerConnection...");
      peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;
      console.log("RTCPeerConnection created successfully");

      // Create data channel for realtime events
      const dataChannel = peerConnection.createDataChannel("oai-events", {
        ordered: true,
      });
      dataChannelRef.current = dataChannel;
      setupDataChannel(dataChannel);

      // Handle remote audio stream with error protection
      (peerConnection as any).ontrack = (event: any) => {
        try {
          console.log("Received remote track:", event.track.kind);
          if (event.track.kind === "audio") {
            console.log(
              "Remote audio track received - audio will play automatically"
            );

            // Force audio through speaker instead of earpiece
            InCallManager.start({ media: "audio" });
            InCallManager.setForceSpeakerphoneOn(true);

            // Store the remote audio track reference
            remoteAudioTrackRef.current = event.track;

            // Still try to set volume (though it may not be the main issue)
            event.track._setVolume(1);
            console.log("Audio routed to speaker and volume boosted");
          }
        } catch (err) {
          console.error("Error handling remote track:", err);
        }
      };

      // Handle ICE connection state changes with error protection
      (peerConnection as any).oniceconnectionstatechange = () => {
        try {
          console.log(
            "ICE connection state:",
            peerConnection?.iceConnectionState
          );
          if (
            peerConnection?.iceConnectionState === "failed" ||
            peerConnection?.iceConnectionState === "disconnected"
          ) {
            setError("Connection lost. Please try again.");
            setConnectionState("error");
          }
        } catch (err) {
          console.error("Error handling ICE state change:", err);
        }
      };

      // Add local audio stream with error handling
      if (localStreamRef.current) {
        try {
          const audioTrack = localStreamRef.current.getAudioTracks()[0];
          if (audioTrack) {
            peerConnection.addTrack(audioTrack, localStreamRef.current);
            console.log("Local audio track added to peer connection");
          } else {
            console.warn("No audio track found in local stream");
          }
        } catch (err) {
          console.error("Error adding local track:", err);
          throw new Error("Failed to add audio track to peer connection");
        }
      } else {
        throw new Error("No local audio stream available");
      }

      // Create and set local description (offer)
      console.log("Creating SDP offer...");
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });
      await peerConnection.setLocalDescription(offer);

      // Send SDP offer to OpenAI Realtime API
      console.log("Sending SDP offer to OpenAI...");
      const response = await fetch(
        "https://api.openai.com/v1/realtime/calls?model=gpt-realtime",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            "Content-Type": "application/sdp",
            "OpenAI-Beta": "realtime=v1",
          },
          body: offer.sdp,
        }
      );

      console.log("Response:", response);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SDP exchange failed: ${response.status} ${errorText}`);
      }

      // Get SDP answer from OpenAI
      const answerSdp = await response.text();
      console.log("Received SDP answer from OpenAI");
      const location = response.headers.get("Location")?.split("/").pop();
      //send location to backend
      await store.dispatch(sendLocation(location || "", ephemeralKey || ""));

      // Set remote description (answer) with error handling
      console.log("Setting remote description...");
      const answer = new RTCSessionDescription({
        type: "answer",
        sdp: answerSdp,
      });

      await peerConnection.setRemoteDescription(answer);
      console.log("Remote description set successfully");

      console.log("WebRTC connection established successfully");

      // Add a small delay to ensure connection is stable
      setTimeout(() => {
        if (
          peerConnectionRef.current?.iceConnectionState === "connected" ||
          peerConnectionRef.current?.iceConnectionState === "completed"
        ) {
          console.log("Connection verified as stable");
        }
      }, 1000);
    } catch (err) {
      console.error("Failed to connect to OpenAI Realtime API:", err);

      // Clean up the failed connection
      if (peerConnection) {
        try {
          peerConnection.close();
        } catch (closeErr) {
          console.error("Error closing peer connection:", closeErr);
        }
      }

      // Provide specific error messages
      let errorMessage = "Connection failed";
      if (err instanceof Error) {
        if (err.message.includes("SDP")) {
          errorMessage = "Failed to establish audio connection with AI service";
        } else if (err.message.includes("No local audio stream")) {
          errorMessage = "Microphone access required for voice chat";
        } else if (err.message.includes("ephemeral")) {
          errorMessage = "Failed to authenticate with AI service";
        } else {
          errorMessage = `Connection error: ${err.message}`;
        }
      }

      setError(errorMessage);
      setConnectionState("error");

      // Reset refs
      peerConnectionRef.current = null;
      dataChannelRef.current = null;
    }
  }, [setConnectionState, setError, setupDataChannel]);

  // Cleanup resources
  const cleanup = useCallback(() => {
    console.log("Cleaning up WebRTC resources...");

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }

    // Reset connection state
    setConnectionState("idle");
    console.log("Cleaning up WebRTC resources...");

    // Stop InCallManager
    InCallManager.stop();
  }, [setConnectionState]);

  return {
    peerConnectionRef,
    dataChannelRef,
    connectToRealtime,
    cleanup,
  };
};
