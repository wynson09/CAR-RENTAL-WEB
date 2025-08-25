'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, MessageSquare, Users, Search, AlertCircle } from 'lucide-react';
import { useUserStore } from '@/store';
import { FirebaseChatService, ChatMessage, Conversation } from '@/lib/firebase-chat-service';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AdminChatProps {
  className?: string;
}

export const AdminChat = ({ className }: AdminChatProps) => {
  const { user } = useUserStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen to all conversations (admin view)
  useEffect(() => {
    if (!user?.uid || user.role !== 'admin') return;

    const unsubscribe = FirebaseChatService.listenToAdminConversations(
      (convs) => {
        setConversations(convs);
        setIsLoading(false);

        // Auto-select first conversation if none selected
        if (!selectedConversation && convs.length > 0) {
          setSelectedConversation(convs[0].id);
        }
      },
      (error) => {
        console.error('Conversations listener error:', error);
        // Only show error toast for actual errors, not empty data
        if (error.code !== 'not-found') {
          toast.error('Unable to load conversations');
        }
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, user?.role]);

  // Listen to messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const unsubscribe = FirebaseChatService.listenToMessages(
      selectedConversation,
      (msgs) => {
        setMessages(msgs);

        // Mark messages as read for admin
        if (user?.uid) {
          FirebaseChatService.markMessagesAsRead(selectedConversation, user.uid);
        }
      },
      (error) => {
        console.error('Messages listener error:', error);
        // Only show error toast for actual connection errors
        if (error.code === 'permission-denied' || error.code === 'unauthenticated') {
          toast.error('Unable to access messages. Please check permissions.');
        } else if (error.code === 'unavailable') {
          toast.error('Chat service temporarily unavailable');
        }
      }
    );

    return () => unsubscribe();
  }, [selectedConversation, user?.uid]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setIsSending(true);
    try {
      await FirebaseChatService.sendMessage(
        selectedConversation,
        user.uid,
        user.name,
        'admin',
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

  const formatLastMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) {
      // 7 days
      return format(date, 'EEE');
    } else {
      return format(date, 'dd/MM');
    }
  };

  const getSelectedConversationData = () => {
    return conversations.find((conv) => conv.id === selectedConversation);
  };

  const getUserFromConversation = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.userRole === 'user');
  };

  const filteredConversations = conversations.filter((conv) => {
    const user = getUserFromConversation(conv);
    return (
      user?.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (user?.role !== 'admin') {
    return (
      <Card className={cn('h-[600px] flex items-center justify-center', className)}>
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('h-[600px] flex', className)}>
      {/* Sidebar - Conversations List */}
      <div className="w-1/3 border-r flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Conversations
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No conversations found</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => {
                const user = getUserFromConversation(conversation);
                const unreadCount = conversation.unreadCount?.[user?.userId || ''] || 0;

                return (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={cn(
                      'p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted',
                      selectedConversation === conversation.id && 'bg-muted'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.userAvatar} alt={user?.userName} />
                        <AvatarFallback>
                          {user?.userName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{user?.userName}</h4>
                          <span className="text-xs text-muted-foreground">
                            {formatLastMessageTime(conversation.lastMessage.timestamp)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage.content}
                          </p>
                          {unreadCount > 0 && (
                            <Badge
                              variant="outline"
                              className="text-xs min-w-[20px] h-5 bg-red-100 text-red-800 border-red-200"
                            >
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-3">
                {(() => {
                  const selectedConv = getSelectedConversationData();
                  const user = selectedConv ? getUserFromConversation(selectedConv) : null;

                  return (
                    <>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.userAvatar} alt={user?.userName} />
                        <AvatarFallback>
                          {user?.userName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{user?.userName}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            User
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {messages.length} messages
                          </span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full px-4 py-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No messages yet</p>
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
                          ) > 300000);

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
                                  <Badge variant="soft" className="text-xs">
                                    User
                                  </Badge>
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
                  placeholder="Type your response..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSending}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AdminChat;
