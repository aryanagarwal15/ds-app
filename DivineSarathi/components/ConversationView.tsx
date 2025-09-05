import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ConversationViewProps {
  conversations: {
    id: string;
    userMessage: string;
    krishnaResponse: string;
    timestamp: Date;
    isComplete: boolean;
  }[];
  activeConversation: {
    id: string;
    userMessage: string;
    krishnaResponse: string;
    displayedUserMessage: string;
    displayedKrishnaResponse: string;
    isUserComplete: boolean;
    isKrishnaComplete: boolean;
    isTyping: boolean;
  } | null;
  typingDot1Anim: Animated.Value;
  typingDot2Anim: Animated.Value;
  typingDot3Anim: Animated.Value;
  isUserAtBottom: boolean;
  userHasManuallyScrolled: boolean;
  onScrollBeginDrag: () => void;
  onScrollEndDrag: (event: any) => void;
  onMomentumScrollEnd: (event: any) => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  conversations,
  activeConversation,
  typingDot1Anim,
  typingDot2Anim,
  typingDot3Anim,
  isUserAtBottom,
  userHasManuallyScrolled,
  onScrollBeginDrag,
  onScrollEndDrag,
  onMomentumScrollEnd,
}) => {
  const mainConversationScrollRef = useRef<ScrollView>(null);

  console.log('Conversations:', conversations);
  console.log('Active conversation:', activeConversation);

  return (
    <View style={styles.conversationPageContent}>
      <Text style={styles.conversationPageTitle}>Divine Conversations</Text>
      <ScrollView 
        ref={mainConversationScrollRef}
        style={styles.conversationScrollView} 
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
      >
        {/* All conversations displayed in chronological order */}
        {conversations.length === 0 && !activeConversation ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>
              Your conversations with Krishna Ji will appear here
            </Text>
            <Text style={styles.emptyStateSubText}>
              Swipe up during or after a conversation to view it here
            </Text>
          </View>
        ) : (
          <View style={styles.chatContainer}>
            {/* Debug info */}
            {__DEV__ && (
              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: 'white', fontSize: 12 }}>
                  Stored conversations: {conversations.length}
                </Text>
                <Text style={{ color: 'yellow', fontSize: 12 }}>
                  Active conversation: {activeConversation ? 'YES' : 'NO'}
                </Text>
                {activeConversation && (
                  <View>
                    <Text style={{ color: 'cyan', fontSize: 10 }}>
                      User: {activeConversation.userMessage ? '✓' : '✗'} | Krishna: {activeConversation.krishnaResponse ? '✓' : '✗'}
                    </Text>
                    <Text style={{ color: 'cyan', fontSize: 10 }}>
                      Displayed User: {activeConversation.displayedUserMessage ? '✓' : '✗'} | Displayed Krishna: {activeConversation.displayedKrishnaResponse ? '✓' : '✗'}
                    </Text>
                  </View>
                )}
              </View>
            )}
            
            {/* Past conversations */}
            {conversations.map((conversation, index) => {
              console.log(`Rendering main conversation ${index + 1}/${conversations.length}:`, conversation.id);
              return (
                <View key={`main-conversation-${conversation.id}`} style={styles.conversationPair}>
                  <View style={styles.userMessage}>
                    <Text style={styles.userLabel}>You</Text>
                    <Text style={styles.transcriptText}>{conversation.userMessage}</Text>
                  </View>
                  <View style={styles.krishnaMessage}>
                    <Text style={styles.krishnaLabel}>Krishna Ji</Text>
                    <Text style={styles.responseText}>{conversation.krishnaResponse}</Text>
                  </View>
                </View>
              );
            })}
            
            {/* Current ongoing conversation */}
            {activeConversation && (
              <View key={`main-active-${activeConversation.id}`} style={styles.conversationPair}>
                {activeConversation.userMessage && (
                  <View style={styles.userMessage}>
                    <Text style={styles.userLabel}>You</Text>
                    <Text style={styles.transcriptText}>{activeConversation.userMessage}</Text>
                  </View>
                )}
                {(activeConversation.krishnaResponse || activeConversation.isTyping) && (
                  <View style={styles.krishnaMessage}>
                    <Text style={styles.krishnaLabel}>Krishna Ji</Text>
                    {activeConversation.krishnaResponse ? (
                      <Text style={styles.responseText}>{activeConversation.krishnaResponse}</Text>
                    ) : activeConversation.isTyping ? (
                      <View style={styles.typingIndicator}>
                        <Text style={styles.typingText}>Krishna Ji is thinking</Text>
                        <View style={styles.typingDots}>
                          <Animated.View style={[styles.typingDot, { opacity: typingDot1Anim }]} />
                          <Animated.View style={[styles.typingDot, { opacity: typingDot2Anim }]} />
                          <Animated.View style={[styles.typingDot, { opacity: typingDot3Anim }]} />
                        </View>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  conversationPageContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  conversationPageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#D4A574',
    textAlign: 'center',
    marginBottom: 20,
  },
  conversationScrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  chatContainer: {
    flex: 1,
    paddingVertical: 10,
  },
  conversationPair: {
    marginBottom: 20,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 18,
    padding: 16,
    marginVertical: 8,
    maxWidth: '80%',
    borderBottomRightRadius: 4,
  },
  krishnaMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 165, 116, 0.1)',
    borderRadius: 18,
    padding: 16,
    marginVertical: 8,
    maxWidth: '80%',
    borderBottomLeftRadius: 4,
  },
  userLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4ecdc4',
    marginBottom: 4,
  },
  krishnaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4A574',
    marginBottom: 4,
  },
  transcriptText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  responseText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.7,
  },
  typingText: {
    fontSize: 14,
    color: '#D4A574',
    marginRight: 8,
    fontStyle: 'italic',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D4A574',
    marginHorizontal: 1,
  },
});

export default ConversationView;
