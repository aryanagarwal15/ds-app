import { Animated } from 'react-native';

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error';

export interface DataChannelMessage {
  type: string;
  event?: string;
  session?: any;
  response?: any;
  conversation?: any;
  audio?: string;
  transcript?: string;
  delta?: any;
}

export interface WebRTCRefs {
  peerConnectionRef: React.MutableRefObject<RTCPeerConnection | null>;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  dataChannelRef: React.MutableRefObject<any>;
}

export interface AudioPermissions {
  hasPermissions: boolean;
  isSimulator: boolean;
  checkPermissions: () => Promise<boolean>;
  checkIfSimulator: () => boolean;
}

export interface AudioState {
  connectionState: ConnectionState;
  isRecording: boolean;
  transcript: string;
  response: string;
  error: string | null;
  isMuted: boolean;
}

export interface AnimationRefs {
  pulseAnim: Animated.Value;
  rippleAnim: Animated.Value;
  fadeAnim: Animated.Value;
}

export interface AnimationControls {
  startPulseAnimation: () => void;
  stopPulseAnimation: () => void;
  startRippleAnimation: () => void;
  stopRippleAnimation: () => void;
}
