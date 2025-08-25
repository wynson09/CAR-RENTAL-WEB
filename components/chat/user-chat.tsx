'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, AlertCircle } from 'lucide-react';
import { useUserStore } from '@/store';
import { FirebaseChatService, ChatMessage, Conversation } from '@/lib/firebase-chat-service';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface UserChatProps {
  className?: string;
}

export const UserChat = ({ className }: UserChatProps) => {
  const { user } = useUserStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation and listen to messages
  useEffect(() => {
    if (!user?.uid) return;

    let unsubscribeConversation: (() => void) | undefined;
    let unsubscribeMessages: (() => void) | undefined;

    const setupChat = async () => {
      try {
        setIsLoading(true);

        // Get or create conversation with admin
        const conversationId = await FirebaseChatService.getOrCreateUserAdminConversation(
          user.uid,
          user.name,
          user.image
        );

        // Listen to conversation updates
        unsubscribeConversation = FirebaseChatService.listenToUserConversation(
          user.uid,
          (conv) => {
            setConversation(conv);
          },
          (error) => {
            console.error('Conversation listener error:', error);
            setError('Unable to connect to chat. Please refresh the page.');
            setIsLoading(false);
            setHasInitialized(true);
          }
        );

        // Listen to messages
        unsubscribeMessages = FirebaseChatService.listenToMessages(
          conversationId,
          (msgs) => {
            setMessages(msgs);
            setError(null); // Clear any previous errors
            setIsLoading(false);
            setHasInitialized(true);

            // Mark messages as read
            FirebaseChatService.markMessagesAsRead(conversationId, user.uid);
          },
          (error) => {
            console.error('Messages listener error:', error);
            // Only show error for actual connection/permission issues
            if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
              setError('Unable to access chat. Please sign in again.');
            } else if (error.code === 'unavailable') {
              setError('Chat service is temporarily unavailable. Please try again later.');
            } else {
              setError('Unable to load chat. Please refresh the page.');
            }
            setIsLoading(false);
            setHasInitialized(true);
          }
        );
      } catch (error) {
        console.error('Error setting up chat:', error);
        setError('Failed to initialize chat. Please refresh the page.');
        setIsLoading(false);
        setHasInitialized(true);
      }
    };

    setupChat();

    return () => {
      unsubscribeConversation?.();
      unsubscribeMessages?.();
    };
  }, [user?.uid]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation?.id || !user) return;

    setIsSending(true);
    try {
      await FirebaseChatService.sendMessage(
        conversation.id,
        user.uid,
        user.name,
        'user',
        newMessage.trim(),
        'text',
        user.image
      );

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'HH:mm');
  };

  if (isLoading) {
    return (
      <Card className={cn('h-[600px] flex items-center justify-center', className)}>
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('h-[600px] flex flex-col', className)}>
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">AS</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">Admin Support</CardTitle>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-4 py-4">
          {error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-600 font-medium mb-2">Connection Error</p>
              <p className="text-muted-foreground text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          ) : messages.length === 0 && hasInitialized ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground font-medium mb-2">Loading messages...</p>
              <p className="text-muted-foreground text-sm">
                Setting up your conversation with our support team
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isOwn = message.senderId === user?.uid;
                const showTime =
                  index === 0 ||
                  (messages[index - 1] &&
                    Math.abs(
                      message.timestamp?.toDate?.()?.getTime() -
                        messages[index - 1].timestamp?.toDate?.()?.getTime()
                    ) > 300000); // 5 minutes

                return (
                  <div key={message.id} className="space-y-2">
                    {showTime && (
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
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
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                          <AvatarFallback>
                            {message.senderName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          'rounded-lg px-3 py-2 text-sm',
                          isOwn ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted'
                        )}
                      >
                        {!isOwn && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs">{message.senderName}</span>
                            {message.senderRole === 'admin' && (
                              <Badge variant="soft" className="text-xs">
                                Admin
                              </Badge>
                            )}
                          </div>
                        )}
                        <p className="break-words">{message.content}</p>
                        {message.isEdited && (
                          <span className="text-xs opacity-70 italic">Edited</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSending} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send • Our support team typically responds within a few minutes
        </p>
      </div>
    </Card>
  );
};

export default UserChat;
