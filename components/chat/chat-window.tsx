'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, MessageSquare, AlertCircle, ChevronUp, Loader2, AlertTriangle } from 'lucide-react';
import {
  FirebaseChatService,
  ChatMessage,
  Conversation,
  PaginatedMessages,
  SpamPreventionState,
} from '@/lib/firebase-chat-service';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

interface ChatWindowProps {
  chatId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'user' | 'admin' | 'moderator';
  currentUserAvatar?: string;
  className?: string;
  title?: string;
  isAdminView?: boolean;
  hideHeader?: boolean;
  targetUserAvatar?: string;
  targetUserName?: string;
}

export const ChatWindow = ({
  chatId,
  currentUserId,
  currentUserName,
  currentUserRole,
  currentUserAvatar,
  className,
  title = 'Chat',
  isAdminView = false,
  hideHeader = false,
  targetUserAvatar,
  targetUserName,
}: ChatWindowProps) => {
  // Core state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [paginationData, setPaginationData] = useState<PaginatedMessages | null>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(true);
  const [newlyLoadedMessageIds, setNewlyLoadedMessageIds] = useState<Set<string>>(new Set());

  // Spam prevention state
  const [spamState, setSpamState] = useState<SpamPreventionState>({
    consecutiveMessages: 0,
    isBlocked: false,
    lastMessageSenderId: '',
  });

  // Real-time listener state
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<Timestamp | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom function
  const scrollToBottom = useCallback(
    (behavior: 'smooth' | 'auto' = 'smooth') => {
      if (hasScrolledToBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior });
      }
    },
    [hasScrolledToBottom]
  );

  // Check if we've reached the very first message (welcome message)
  const hasReachedFirstMessage = useCallback(() => {
    // Only check if we have enough messages to potentially have reached the beginning
    if (messages.length < 10) return false;

    return messages.some(
      (message) =>
        message.senderRole === 'admin' &&
        (message.content.toLowerCase().includes('welcome to nacs') ||
          message.content.toLowerCase().includes('here to assist you'))
    );
  }, [messages]);

  // Handle scroll events for infinite loading and auto-scroll detection
  const handleScroll = useCallback(() => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollElement) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
    setHasScrolledToBottom(isAtBottom);

    // More precise trigger for loading older messages (like Messenger)
    // Trigger when user is within 50px of the top
    if (scrollTop < 50 && paginationData?.hasMore && !isLoadingOlder && !hasReachedFirstMessage()) {
      // Add slight delay to prevent accidental triggers
      setTimeout(() => {
        if (scrollElement.scrollTop < 50 && !isLoadingOlder) {
          setIsLoadingOlder(true);
        }
      }, 100);
    }
  }, [paginationData?.hasMore, isLoadingOlder, hasReachedFirstMessage]);

  // Load older messages with smooth scroll position maintenance
  const loadOlderMessages = useCallback(async () => {
    if (!paginationData?.lastDoc || isLoadingOlder || hasReachedFirstMessage()) return;

    setIsLoadingOlder(true);

    // Save current scroll position and reference message before loading
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    const beforeScrollTop = scrollElement?.scrollTop || 0;
    const beforeScrollHeight = scrollElement?.scrollHeight || 0;

    // Find the topmost visible message as a reference point
    const messagesContainer = messagesContainerRef.current;
    let referenceMessageElement: Element | null = null;
    if (messagesContainer) {
      const messageElements = messagesContainer.querySelectorAll('[data-message-id]');
      for (const element of messageElements) {
        const rect = element.getBoundingClientRect();
        const containerRect = scrollElement?.getBoundingClientRect();
        if (containerRect && rect.top >= containerRect.top) {
          referenceMessageElement = element;
          break;
        }
      }
    }

    try {
      const olderMessages = await FirebaseChatService.getOlderMessages(
        chatId,
        paginationData.lastDoc
      );

      // Track newly loaded message IDs for animation
      const newMessageIds = new Set(olderMessages.messages.map((msg) => msg.id));
      setNewlyLoadedMessageIds(newMessageIds);

      // Update messages and pagination
      setMessages((prev) => [...olderMessages.messages, ...prev]);
      setPaginationData((prev) => ({
        messages: [...olderMessages.messages, ...(prev?.messages || [])],
        lastDoc: olderMessages.lastDoc,
        hasMore: olderMessages.hasMore,
      }));

      // Clear animation tracking after animation completes
      setTimeout(() => {
        setNewlyLoadedMessageIds(new Set());
      }, 300);

      // Maintain scroll position after DOM update using requestAnimationFrame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (scrollElement) {
            // Try to use reference element first (more accurate)
            if (referenceMessageElement) {
              const updatedReferenceElement = messagesContainer?.querySelector(
                `[data-message-id="${referenceMessageElement.getAttribute('data-message-id')}"]`
              );
              if (updatedReferenceElement) {
                updatedReferenceElement.scrollIntoView({
                  behavior: 'auto',
                  block: 'start',
                });
                return;
              }
            }

            // Fallback to height-based method
            const afterScrollHeight = scrollElement.scrollHeight;
            const heightDifference = afterScrollHeight - beforeScrollHeight;

            if (heightDifference > 0) {
              const newScrollTop = beforeScrollTop + heightDifference;
              scrollElement.scrollTo({
                top: newScrollTop,
                behavior: 'auto',
              });
            }
          }
        });
      });
    } catch (error) {
      console.error('Error loading older messages:', error);
      toast.error('Failed to load older messages');
    } finally {
      setIsLoadingOlder(false);
    }
  }, [chatId, paginationData?.lastDoc, hasReachedFirstMessage]);

  // Handle loading older messages when triggered by scroll
  useEffect(() => {
    if (isLoadingOlder && paginationData?.lastDoc) {
      loadOlderMessages();
    }
  }, [isLoadingOlder, loadOlderMessages, paginationData?.lastDoc]);

  // Auto-disable pagination when first message is loaded
  useEffect(() => {
    if (hasReachedFirstMessage() && paginationData?.hasMore) {
      setPaginationData((prev) => (prev ? { ...prev, hasMore: false } : null));
    }
  }, [messages, hasReachedFirstMessage, paginationData?.hasMore]);

  // Initialize chat and load initial messages
  useEffect(() => {
    let unsubscribeMessages: (() => void) | undefined;
    let unsubscribeConversation: (() => void) | undefined;

    const initializeChat = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get or create conversation if user role
        let conversationId = chatId;
        if (currentUserRole === 'user') {
          conversationId = await FirebaseChatService.getOrCreateUserAdminConversation(
            currentUserId,
            currentUserName,
            currentUserAvatar
          );
        }

        // Load initial messages with pagination
        const initialMessages = await FirebaseChatService.getInitialMessages(conversationId);
        setMessages(initialMessages.messages);
        setPaginationData(initialMessages);

        // Don't auto-mark messages as read on load
        // Messages will be marked as read when user actively engages (scrolls, sends message)

        // Scroll to bottom on initial load
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }, 100);

        // Set up real-time listener for NEW messages only (preserves pagination)
        const latestMessage = initialMessages.messages[initialMessages.messages.length - 1];
        unsubscribeMessages = FirebaseChatService.listenToNewMessages(
          conversationId,
          latestMessage?.timestamp || null,
          (newMessages) => {
            if (newMessages.length > 0) {
              setMessages((prevMessages) => {
                // Separate optimistic and real messages
                const optimisticMessages = prevMessages.filter((msg) => msg.id.startsWith('temp_'));
                const realMessages = prevMessages.filter((msg) => !msg.id.startsWith('temp_'));

                // Find confirmed optimistic messages to remove
                const confirmedOptimisticIds: string[] = [];
                optimisticMessages.forEach((optimisticMsg) => {
                  const hasServerVersion = newMessages.find(
                    (serverMsg) =>
                      serverMsg.content.trim() === optimisticMsg.content.trim() &&
                      serverMsg.senderId === optimisticMsg.senderId &&
                      serverMsg.senderRole === optimisticMsg.senderRole
                  );

                  if (hasServerVersion) {
                    confirmedOptimisticIds.push(optimisticMsg.id);
                  }
                });

                // Remove confirmed optimistic messages
                const filteredOptimistic = optimisticMessages.filter(
                  (msg) => !confirmedOptimisticIds.includes(msg.id)
                );

                // Filter out duplicate real messages (prevent duplicates from multiple listener calls)
                const existingRealMessageIds = new Set(realMessages.map((msg) => msg.id));
                const uniqueNewMessages = newMessages.filter(
                  (msg) => !existingRealMessageIds.has(msg.id)
                );

                // Combine all messages
                const allMessages = [...realMessages, ...uniqueNewMessages, ...filteredOptimistic];

                // Final deduplication by ID (safety check)
                const seenIds = new Set();
                const finalMessages = allMessages.filter((msg) => {
                  if (seenIds.has(msg.id)) {
                    return false;
                  }
                  seenIds.add(msg.id);
                  return true;
                });

                // Sort by timestamp
                finalMessages.sort((a, b) => {
                  const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
                  const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
                  return timeA - timeB;
                });

                return finalMessages;
              });

              // Update latest timestamp for future listeners
              const latestNewMessage = newMessages[newMessages.length - 1];
              setLastMessageTimestamp(latestNewMessage.timestamp);
            }

            // Don't auto-mark messages as read anymore
            // Messages will be marked as read when user actively engages
          },
          (error) => {
            console.error('New messages listener error:', error);
            if (error.code === 'permission-denied') {
              setError('Access denied. Please sign in again.');
            } else if (error.code === 'unavailable') {
              setError('Chat service temporarily unavailable.');
            } else {
              setError('Unable to load messages. Please refresh.');
            }
          }
        );

        // Listen to conversation updates for spam prevention
        if (currentUserRole === 'user') {
          unsubscribeConversation = FirebaseChatService.listenToUserConversation(
            currentUserId,
            (conv) => {
              setConversation(conv);
              if (conv) {
                updateSpamState(conv);
              }
            },
            (error) => {
              console.error('Conversation listener error:', error);
            }
          );
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setError('Failed to initialize chat. Please refresh the page.');
        setIsLoading(false);
      }
    };

    initializeChat();

    return () => {
      unsubscribeMessages?.();
      unsubscribeConversation?.();
    };
  }, [chatId, currentUserId, currentUserName, currentUserRole, currentUserAvatar]);

  // Update spam prevention state
  const updateSpamState = useCallback(
    (conv: Conversation) => {
      const consecutiveMessages = conv.consecutiveUserMessages || 0;
      setSpamState({
        consecutiveMessages,
        isBlocked: consecutiveMessages >= 7,
        lastMessageSenderId: currentUserId,
      });
    },
    [currentUserId]
  );

  // Mark messages as read when actively engaging (works for both users and admins)
  const markAsRead = useCallback(async () => {
    if (chatId) {
      await FirebaseChatService.markMessagesAsRead(chatId, currentUserId);
    }
  }, [chatId, currentUserId]);

  // Auto-scroll when new messages arrive (only if user is at bottom)
  useEffect(() => {
    if (hasScrolledToBottom && messages.length > 0) {
      // Only auto-scroll if the last message is from someone else or real-time update
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && !lastMessage.id.startsWith('temp_')) {
        setTimeout(() => {
          if (hasScrolledToBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            // Mark messages as read when user is viewing at bottom
            markAsRead();
          }
        }, 100);
      }
    }
  }, [messages, hasScrolledToBottom, markAsRead]);

  // Send message with optimistic update
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    // Check spam prevention for users
    if (currentUserRole === 'user' && spamState.isBlocked) {
      toast.error('Please wait for an admin response before sending more messages.');
      return;
    }

    // Mark messages as read when user sends a message
    await markAsRead();

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately
    setIsSending(true);

    // Create optimistic message with unique ID
    const optimisticMessage: ChatMessage = {
      id: `temp_${currentUserId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // More unique temporary ID
      conversationId: chatId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      senderAvatar: currentUserAvatar || '',
      content: messageText,
      messageType: 'text',
      timestamp: { toDate: () => new Date() } as any, // Temporary timestamp
      isRead: false,
      isEdited: false,
    };

    // Add message optimistically to UI
    setMessages((prev) => [...prev, optimisticMessage]);

    // Scroll to bottom immediately and smoothly
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    try {
      await FirebaseChatService.sendMessage(
        chatId,
        currentUserId,
        currentUserName,
        currentUserRole,
        messageText,
        'text',
        currentUserAvatar
      );

      // Message will be replaced by real-time listener with actual server data
    } catch (error: any) {
      console.error('Error sending message:', error);

      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));

      // Restore message to input
      setNewMessage(messageText);

      if (error.message?.includes('Spam prevention')) {
        toast.error('Please wait for an admin response before sending more messages.');
      } else {
        toast.error('Failed to send message');
      }
    } finally {
      setIsSending(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format message time
  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'HH:mm');
  };

  // Loading state
  if (isLoading) {
    return (
      <Card
        className={cn(
          'h-[calc(70vh)] flex items-center justify-center border border-gray-200 bg-white rounded-xl shadow-lg',
          className
        )}
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 text-gray-400 animate-spin" />
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'h-[calc(70vh)] flex flex-col border border-gray-200 bg-white rounded-xl shadow-lg',
        className
      )}
    >
      {/* Header with gradient background */}
      {!hideHeader && (
        <CardHeader className="pb-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-white/30">
                {isAdminView ? (
                  // For admin view, show the target user's avatar
                  <>
                    <AvatarImage src={targetUserAvatar} alt={targetUserName || 'User'} />
                    <AvatarFallback className="bg-white/20 text-white font-semibold text-sm">
                      {targetUserName
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('') || 'U'}
                    </AvatarFallback>
                  </>
                ) : (
                  // For user view, show support team avatar
                  <AvatarFallback className="bg-white/20 text-white font-semibold text-sm">
                    ST
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold text-white">{title}</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-white/90">Active now</span>
                </div>
              </div>
            </div>

            {/* Spam prevention status in header */}
            {currentUserRole === 'user' && spamState.consecutiveMessages >= 5 && (
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                {spamState.isBlocked ? (
                  <>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-white font-medium">Awaiting admin response</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-xs text-white font-medium">
                      {7 - spamState.consecutiveMessages} messages left
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      )}

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        {error ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-600 font-medium mb-2">Connection Error</p>
              <p className="text-muted-foreground text-sm mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Load older messages indicator - Messenger style */}
            {isLoadingOlder && (
              <div className="absolute top-0 left-0 right-0 z-10">
                <div className="flex items-center justify-center py-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="font-medium">Loading messages...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll area */}
            <ScrollArea
              className="h-full w-full"
              ref={scrollAreaRef}
              onScrollCapture={handleScroll}
            >
              <div className="p-4 space-y-4" ref={messagesContainerRef}>
                {/* Load more indicator */}
                {paginationData?.hasMore && !isLoadingOlder && !hasReachedFirstMessage() && (
                  <div className="text-center py-2 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadOlderMessages}
                      className="text-xs text-muted-foreground"
                    >
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Load older messages
                    </Button>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 font-medium mb-2">No messages yet</p>
                    <p className="text-gray-400 text-sm">
                      Start a conversation with our support team
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isOwn = message.senderId === currentUserId;
                      const showTime =
                        index === 0 ||
                        (messages[index - 1] &&
                          Math.abs(
                            message.timestamp?.toDate?.()?.getTime() -
                              messages[index - 1].timestamp?.toDate?.()?.getTime()
                          ) > 300000); // 5 minutes

                      const isNewlyLoaded = newlyLoadedMessageIds.has(message.id);

                      return (
                        <div
                          key={message.id}
                          data-message-id={message.id}
                          className={cn(
                            'transition-all duration-300 ease-out',
                            isNewlyLoaded ? 'animate-pulse opacity-90' : 'opacity-100'
                          )}
                        >
                          {showTime && (
                            <div className="text-center my-3">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {formatMessageTime(message.timestamp)}
                              </span>
                            </div>
                          )}

                          <div
                            className={cn(
                              'flex gap-3 max-w-[80%]',
                              isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
                            )}
                          >
                            {!isOwn && (
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                                <AvatarFallback className="text-xs">
                                  {message.senderName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div
                              className={cn(
                                'rounded-lg px-3 py-2 text-sm break-words max-w-full',
                                isOwn
                                  ? 'bg-blue-500 text-white rounded-br-md'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-md',
                                // Add subtle opacity for optimistic messages
                                message.id.startsWith('temp_') && 'opacity-70'
                              )}
                            >
                              {!isOwn && (
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-xs text-gray-600">
                                    {message.senderRole === 'admin' ||
                                    message.senderRole === 'moderator'
                                      ? 'Support Team'
                                      : message.senderName}
                                  </span>
                                  {(message.senderRole === 'admin' ||
                                    message.senderRole === 'moderator') && (
                                    <Badge className="text-xs h-4 px-1 bg-green-500 text-white border-0">
                                      Support
                                    </Badge>
                                  )}
                                </div>
                              )}
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                              {message.isEdited && (
                                <span
                                  className={cn(
                                    'text-xs italic opacity-70 block mt-1',
                                    isOwn ? 'text-blue-100' : 'text-gray-500'
                                  )}
                                >
                                  Edited
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </CardContent>

      {/* Input */}
      <div className="p-4 border-t bg-white rounded-b-xl">
        <div className="flex gap-2">
          <Input
            placeholder={
              spamState.isBlocked ? 'Waiting for admin response...' : 'Type your message...'
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending || (currentUserRole === 'user' && spamState.isBlocked)}
            className="flex-1 rounded-lg"
          />
          <Button
            onClick={handleSendMessage}
            disabled={
              !newMessage.trim() || isSending || (currentUserRole === 'user' && spamState.isBlocked)
            }
            size="sm"
            className="px-3 rounded-lg"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send • Our support team typically responds within a few minutes
        </p>
      </div>
    </Card>
  );
};

export default ChatWindow;
