'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Send,
  MessageSquare,
  AlertCircle,
  ChevronUp,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  Annoyed,
  Check,
  CheckCheck,
  Clock,
  AlertOctagon,
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
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
import avatar from '@/public/images/car-rental/avatar/support-team-avatar.png';

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

  // Message states for better UX
  const [failedMessages, setFailedMessages] = useState<Set<string>>(new Set());

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

  // --- Lightweight session cache: only for this session, prevents refetches on navigation ---
  type CachedThread = { messages: ChatMessage[]; lastMs: number };

  const cacheKey = useMemo(() => {
    // Distinguish admin vs user threads and user identity
    return `support-chat:${chatId}:${currentUserRole}:${currentUserId}`;
  }, [chatId, currentUserRole, currentUserId]);

  const readCache = useCallback((): CachedThread | null => {
    try {
      const raw = sessionStorage.getItem('chat:cache');
      if (!raw) return null;
      const all: Record<string, CachedThread> = JSON.parse(raw);
      const entry = all?.[cacheKey];
      if (!entry || !Array.isArray(entry.messages)) return null;
      return entry;
    } catch {
      return null;
    }
  }, [cacheKey]);

  const writeCache = useCallback(
    (messagesToStore: ChatMessage[]) => {
      try {
        const last = messagesToStore[messagesToStore.length - 1];
        const lastMs = last?.timestamp?.toDate?.()?.getTime?.() ?? 0;
        const raw = sessionStorage.getItem('chat:cache');
        const all: Record<string, CachedThread> = raw ? JSON.parse(raw) : {};
        all[cacheKey] = { messages: messagesToStore, lastMs };
        sessionStorage.setItem('chat:cache', JSON.stringify(all));
      } catch {
        // ignore cache write failures
      }
    },
    [cacheKey]
  );

  // Normalize various timestamp shapes into Firestore Timestamp for queries
  const toFirestoreTimestamp = useCallback((ts: any): Timestamp | null => {
    try {
      if (!ts) return null;
      if (typeof ts.toDate === 'function' && typeof ts.seconds === 'number') {
        return ts as Timestamp;
      }
      if (typeof ts.seconds === 'number') {
        return new Timestamp(ts.seconds, ts.nanoseconds || 0);
      }
      if (ts instanceof Date) {
        return Timestamp.fromDate(ts);
      }
      if (typeof ts === 'number') {
        return Timestamp.fromMillis(ts);
      }
      return null;
    } catch {
      return null;
    }
  }, []);

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

        // Try cache first to avoid an initial fetch when returning to the page
        const cached = readCache();
        if (cached && cached.messages.length > 0) {
          setMessages(cached.messages);
          setPaginationData(null);

          // Scroll to bottom on load from cache
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
          }, 100);

          // Listen only for messages newer than the cached last timestamp
          const lastTs = toFirestoreTimestamp(
            cached.messages[cached.messages.length - 1]?.timestamp || null
          );
          unsubscribeMessages = FirebaseChatService.listenToNewMessages(
            conversationId,
            lastTs,
            (newMessages) => {
              if (newMessages.length === 0) return;
              setMessages((prevMessages) => {
                // Separate optimistic and real messages
                const optimisticMessages = prevMessages.filter((msg) => msg.id.startsWith('temp_'));
                const realMessages = prevMessages.filter((msg) => !msg.id.startsWith('temp_'));

                // Remove confirmed optimistic messages
                const confirmedOptimisticIds: string[] = [];
                optimisticMessages.forEach((optimisticMsg) => {
                  const hasServerVersion = newMessages.find(
                    (serverMsg) =>
                      serverMsg.content.trim() === optimisticMsg.content.trim() &&
                      serverMsg.senderId === optimisticMsg.senderId &&
                      serverMsg.senderRole === optimisticMsg.senderRole
                  );
                  if (hasServerVersion) confirmedOptimisticIds.push(optimisticMsg.id);
                });

                const filteredOptimistic = optimisticMessages.filter(
                  (msg) => !confirmedOptimisticIds.includes(msg.id)
                );

                const existingRealMessageIds = new Set(realMessages.map((msg) => msg.id));
                const uniqueNewMessages = newMessages.filter(
                  (msg) => !existingRealMessageIds.has(msg.id)
                );

                const merged = [...realMessages, ...uniqueNewMessages, ...filteredOptimistic];

                // Final dedupe and sort
                const seenIds = new Set();
                const finalMessages = merged.filter((msg) => {
                  if (seenIds.has(msg.id)) return false;
                  seenIds.add(msg.id);
                  return true;
                });

                finalMessages.sort((a, b) => {
                  const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
                  const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
                  return timeA - timeB;
                });

                // Persist to cache
                writeCache(finalMessages);

                return finalMessages;
              });

              const latestNewMessage = newMessages[newMessages.length - 1];
              setLastMessageTimestamp(latestNewMessage.timestamp);
            },
            (error) => {
              console.error('New messages listener error:', error);
              setError('Unable to load messages. Please refresh.');
            }
          );

          // Keep conversation listener for spam-prevention (user role)
          if (currentUserRole === 'user') {
            unsubscribeConversation = FirebaseChatService.listenToUserConversation(
              currentUserId,
              (conv) => {
                setConversation(conv);
                if (conv) updateSpamState(conv);
              },
              (error) => {
                console.error('Conversation listener error:', error);
              }
            );
          }

          setIsLoading(false);
          return; // Skip initial fetch
        }

        // Load initial messages with pagination
        const initialMessages = await FirebaseChatService.getInitialMessages(conversationId);
        setMessages(initialMessages.messages);
        setPaginationData(initialMessages);
        // Persist to cache on fresh load
        writeCache(initialMessages.messages);

        // Don't auto-mark messages as read on load
        // Messages will be marked as read when user actively engages (scrolls, sends message)

        // Scroll to bottom on initial load
        setTimeout(() => {
          try {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
          } catch {}
        }, 100);

        // Set up real-time listener for NEW messages only (preserves pagination)
        const latestMessage = initialMessages.messages[initialMessages.messages.length - 1];
        unsubscribeMessages = FirebaseChatService.listenToNewMessages(
          conversationId,
          toFirestoreTimestamp(latestMessage?.timestamp || null),
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

                // Persist to cache on updates
                writeCache(finalMessages);
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
  }, [
    chatId,
    currentUserId,
    currentUserName,
    currentUserRole,
    currentUserAvatar,
    readCache,
    writeCache,
  ]);

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

  // Handle emoji selection (for @emoji-mart)
  const handleEmojiSelect = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.native);
  };

  // Handle image upload
  const handleImageUpload = async (imageUrl: string, fileName: string) => {
    if (isSending) return;

    // Check spam prevention for users
    if (currentUserRole === 'user' && spamState.isBlocked) {
      toast.error('Please wait for an admin response before sending more messages.');
      return;
    }

    // Create optimistic message with unique ID
    const optimisticMessage: ChatMessage = {
      id: `temp_${currentUserId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId: chatId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      senderAvatar: currentUserAvatar || '',
      content: imageUrl,
      messageType: 'image',
      timestamp: { toDate: () => new Date() } as any,
      isRead: false,
      isEdited: false,
    };

    // Add message optimistically to UI IMMEDIATELY
    setMessages((prev) => [...prev, optimisticMessage]);

    // Scroll to bottom immediately and smoothly
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    // Mark messages as read asynchronously (don't block UI)
    markAsRead().catch(console.error);

    // Send to server in background
    try {
      await FirebaseChatService.sendMessage(
        chatId,
        currentUserId,
        currentUserName,
        currentUserRole,
        imageUrl,
        'image',
        currentUserAvatar
      );

      toast.success('Image sent successfully');
    } catch (error) {
      console.error('Error sending image:', error);

      // Mark message as failed instead of removing it
      setFailedMessages((prev) => new Set([...prev, optimisticMessage.id]));

      toast.error('Failed to send image. Tap message to retry.');
    }
  };

  // Send message with optimistic update
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    // Check spam prevention for users
    if (currentUserRole === 'user' && spamState.isBlocked) {
      toast.error('Please wait for an admin response before sending more messages.');
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately for instant feedback

    // Create optimistic message with unique ID
    const optimisticMessage: ChatMessage = {
      id: `temp_${currentUserId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId: chatId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      senderAvatar: currentUserAvatar || '',
      content: messageText,
      messageType: 'text',
      timestamp: { toDate: () => new Date() } as any,
      isRead: false,
      isEdited: false,
    };

    // Add message optimistically to UI IMMEDIATELY
    setMessages((prev) => [...prev, optimisticMessage]);

    // Scroll to bottom immediately and smoothly
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    // Mark messages as read asynchronously (don't block UI)
    markAsRead().catch(console.error);

    // Send to server in background
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

      // Mark message as failed instead of removing it
      setFailedMessages((prev) => new Set([...prev, optimisticMessage.id]));

      if (error.message?.includes('Spam prevention')) {
        toast.error('Please wait for an admin response before sending more messages.');
      } else {
        toast.error('Failed to send message. Tap message to retry.');
      }
    }
  };

  // Retry failed message
  const retryMessage = async (failedMessage: ChatMessage) => {
    if (isSending) return;

    // Remove from failed messages set
    setFailedMessages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(failedMessage.id);
      return newSet;
    });

    try {
      await FirebaseChatService.sendMessage(
        chatId,
        currentUserId,
        currentUserName,
        currentUserRole,
        failedMessage.content,
        failedMessage.messageType,
        currentUserAvatar
      );

      toast.success('Message sent successfully');
    } catch (error: any) {
      console.error('Error retrying message:', error);
      setFailedMessages((prev) => new Set([...prev, failedMessage.id]));
      toast.error('Failed to send message again');
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format message time (robust against cached timestamp objects)
  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';

    try {
      let date: Date;

      // Firestore Timestamp instance
      if (timestamp && typeof timestamp.toDate === 'function') {
        try {
          date = timestamp.toDate();
        } catch {
          // Fallback if toDate throws (rare)
          if (typeof timestamp.seconds === 'number') {
            const ms =
              timestamp.seconds * 1000 + Math.floor((timestamp.nanoseconds || 0) / 1_000_000);
            date = new Date(ms);
          } else {
            return '';
          }
        }
      }
      // Cached plain object with seconds/nanoseconds
      else if (
        timestamp &&
        typeof timestamp === 'object' &&
        typeof timestamp.seconds === 'number'
      ) {
        const ms = timestamp.seconds * 1000 + Math.floor((timestamp.nanoseconds || 0) / 1_000_000);
        date = new Date(ms);
      }
      // Already a Date
      else if (timestamp instanceof Date) {
        date = timestamp;
      }
      // Number or ISO string
      else if (typeof timestamp === 'number' || typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else {
        return '';
      }

      if (isNaN(date.getTime())) return '';
      return format(date, 'hh:mm a');
    } catch {
      return '';
    }
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
    <Card className={cn('h-[calc(70vh)] flex flex-col rounded-xl shadow-lg', className)}>
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
                  <>
                    <AvatarImage src={avatar.src} alt="Support Team" className="bg-white" />
                    <AvatarFallback className="bg-white/20 text-white font-semibold text-sm"></AvatarFallback>
                  </>
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
                      // Determine if we should show a timestamp for this message
                      // We show timestamps:
                      // 1. For the first message in the conversation
                      // 2. When there's a gap of more than 5 minutes between messages
                      // This creates cleaner chat with timestamps only when time context is needed
                      const showTime =
                        index === 0 ||
                        (messages[index - 1] &&
                          Math.abs(
                            message.timestamp?.toDate?.()?.getTime() -
                              messages[index - 1].timestamp?.toDate?.()?.getTime()
                          ) > 300000); // 5 minutes (300,000 ms)

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
                              <span className="text-xs text-gray-500 px-2 py-1 rounded">
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
                                'rounded-2xl px-3 py-2 text-sm break-words max-w-full relative group',
                                isOwn ? 'bg-primary/70 text-primary-foreground' : 'bg-default-200',
                                // Add subtle opacity for optimistic messages
                                message.id.startsWith('temp_') &&
                                  !failedMessages.has(message.id) &&
                                  'opacity-70',
                                // Highlight failed messages
                                failedMessages.has(message.id) &&
                                  'bg-destructive/20 border border-destructive/30 cursor-pointer',
                                failedMessages.has(message.id) &&
                                  'hover:bg-destructive/30 transition-colors'
                              )}
                              onClick={
                                failedMessages.has(message.id)
                                  ? () => retryMessage(message)
                                  : undefined
                              }
                            >
                              {message.messageType === 'image' ? (
                                <div className="max-w-xs sm:max-w-sm">
                                  <img
                                    src={message.content}
                                    alt="Shared image"
                                    className="rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow w-full h-auto"
                                    onLoad={() => {
                                      // When image finishes loading, keep view at the very bottom
                                      requestAnimationFrame(() => {
                                        messagesEndRef.current?.scrollIntoView({
                                          behavior: 'auto',
                                        });
                                      });
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(message.content, '_blank');
                                    }}
                                  />
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                              )}

                              {/* Message status indicators */}
                              {isOwn && (
                                <div className="flex items-center gap-1 mt-1">
                                  {message.isEdited && (
                                    <span
                                      className={cn(
                                        'text-xs italic opacity-70',
                                        isOwn ? 'text-primary-foreground/70' : 'text-default-500'
                                      )}
                                    >
                                      Edited
                                    </span>
                                  )}

                                  <div className="ml-auto flex items-center">
                                    {failedMessages.has(message.id) ? (
                                      <div className="flex items-center gap-1 text-destructive">
                                        <AlertOctagon className="h-3 w-3" />
                                        <span className="text-xs">Tap to retry</span>
                                      </div>
                                    ) : message.id.startsWith('temp_') ? (
                                      <Clock className="h-3 w-3 opacity-60" />
                                    ) : (
                                      <div className="flex items-center gap-0.5">
                                        <CheckCheck className="h-3 w-3 opacity-60" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {!isOwn && message.isEdited && (
                                <span
                                  className={cn(
                                    'text-xs italic opacity-70 block mt-1',
                                    'text-default-500'
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

      {/* Input - Using Template's Professional Design */}
      <CardFooter className="flex-none flex-col px-0 py-4 border-t border-border">
        <div
          className="w-full flex items-end gap-1 lg:gap-4 lg:px-4 relative px-2"
          style={{ boxSizing: 'border-box' }}
        >
          <div className="flex-none flex gap-1 absolute md:static top-0 left-1.5 z-10">
            <div className="hidden lg:block">
              <ImageUpload
                onImageUpload={handleImageUpload}
                currentUserId={currentUserId}
                disabled={currentUserRole === 'user' && spamState.isBlocked}
                className="h-10 w-10 rounded-full hover:bg-default-50 flex justify-center items-center"
              />
            </div>
          </div>
          <div className="flex-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <div className="flex gap-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight - 15}px`;
                  }}
                  placeholder={
                    spamState.isBlocked ? 'Waiting for admin response...' : 'Type your message...'
                  }
                  className="bg-background border border-default-200 outline-none focus:border-primary rounded-xl break-words pl-8 md:pl-3 px-3 flex-1 h-10 pt-2 p-1 pr-8 no-scrollbar"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  style={{
                    minHeight: '40px',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    resize: 'none',
                  }}
                  disabled={currentUserRole === 'user' && spamState.isBlocked}
                />

                <Popover>
                  <PopoverTrigger asChild>
                    <span className="absolute ltr:right-12 rtl:left-12 bottom-1.5 h-7 w-7 rounded-full cursor-pointer">
                      <Annoyed className="w-6 h-6 text-primary" />
                    </span>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    className="w-fit p-0 shadow-none border-none bottom-0 rtl:left-5 ltr:-left-[110px]"
                  >
                    <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="auto" />
                  </PopoverContent>
                </Popover>

                <Button
                  type="submit"
                  className="rounded-full bg-default-200 hover:bg-default-300 h-[42px] w-[42px] p-0 self-end"
                  disabled={
                    !newMessage.trim() || (currentUserRole === 'user' && spamState.isBlocked)
                  }
                >
                  <Send className="w-5 h-8 text-primary rtl:rotate-180" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatWindow;
