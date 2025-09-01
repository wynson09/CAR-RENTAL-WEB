'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Search, ArrowLeft } from 'lucide-react';
import { useUserStore } from '@/store';
import { FirebaseChatService, Conversation } from '@/lib/firebase-chat-service';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChatWindow } from './chat-window';

interface AdminChatProps {
  className?: string;
}

export const AdminChat = ({ className }: AdminChatProps) => {
  const { user } = useUserStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);

  // Handle mobile responsiveness
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen to all conversations (admin view)
  useEffect(() => {
    if (!user?.uid || user.role !== 'admin') return;

    const unsubscribe = FirebaseChatService.listenToAdminConversations(
      (convs) => {
        setConversations(convs);
        setIsLoading(false);

        // Auto-select first conversation if none selected and not mobile
        if (!selectedConversation && convs.length > 0 && !isMobileView) {
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
  }, [user?.uid, user?.role, selectedConversation, isMobileView]);

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
    const lastMessageText = FirebaseChatService.getLastMessageText(conv);
    return (
      user?.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastMessageText.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className={cn('h-[calc(90vh-120px)] flex gap-4', className)}>
      {/* Mobile: Show conversation list OR chat, not both */}
      {isMobileView ? (
        <>
          {/* Mobile Conversation List */}
          {!selectedConversation && (
            <Card className="w-full border border-gray-200 rounded-xl shadow-lg">
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

              <ScrollArea className="flex-1 overflow-hidden">
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
                  <div className="p-2">
                    {filteredConversations.map((conversation) => {
                      const user = getUserFromConversation(conversation);
                      const unreadCount = conversation.unreadCount?.[user?.userId || ''] || 0;

                      return (
                        <div
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation.id)}
                          className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user?.userAvatar} alt={user?.userName} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700">
                                {user?.userName
                                  ?.split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-base truncate">
                                  {user?.userName}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {formatLastMessageTime(conversation.lastMessageTimestamp)}
                                  </span>
                                  {unreadCount > 0 && (
                                    <Badge className="bg-blue-500 text-white text-xs min-w-[20px] h-5">
                                      {unreadCount}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {FirebaseChatService.getLastMessageText(conversation)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </Card>
          )}

          {/* Mobile Chat View */}
          {selectedConversation && (
            <Card className="w-full border border-gray-200 rounded-xl shadow-lg">
              {(() => {
                const selectedConv = getSelectedConversationData();
                const conversationUser = selectedConv
                  ? getUserFromConversation(selectedConv)
                  : null;

                return (
                  <div className="h-full flex flex-col">
                    {/* Mobile Chat Header with Back Button and Gradient */}
                    <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-xl">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedConversation(null)}
                        className="p-2 hover:bg-white/10 text-white"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <Avatar className="h-10 w-10 ring-2 ring-white/30">
                        <AvatarImage
                          src={conversationUser?.userAvatar}
                          alt={conversationUser?.userName}
                        />
                        <AvatarFallback className="bg-white/20 text-white font-semibold">
                          {conversationUser?.userName
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-white">
                          {conversationUser?.userName || 'User'}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <p className="text-xs text-white/90">Active now</p>
                        </div>
                      </div>
                    </div>

                    <ChatWindow
                      chatId={selectedConversation}
                      currentUserId={user!.uid}
                      currentUserName={user!.name}
                      currentUserRole="admin"
                      currentUserAvatar={user!.image}
                      title={conversationUser?.userName || 'User'}
                      className="flex-1 border-0 rounded-none"
                      isAdminView={true}
                      hideHeader={true}
                      targetUserAvatar={conversationUser?.userAvatar}
                      targetUserName={conversationUser?.userName}
                    />
                  </div>
                );
              })()}
            </Card>
          )}
        </>
      ) : (
        <>
          {/* Desktop: Show both conversation list and chat with proper spacing */}
          <Card className="w-1/3 border border-gray-200 rounded-xl shadow-lg">
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

            <ScrollArea className="flex-1 overflow-hidden">
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
                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700">
                              {user?.userName
                                ?.split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate">{user?.userName}</h4>
                              <span className="text-xs text-muted-foreground">
                                {formatLastMessageTime(conversation.lastMessageTimestamp)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-muted-foreground truncate">
                                {FirebaseChatService.getLastMessageText(conversation)}
                              </p>
                              {unreadCount > 0 && (
                                <Badge className="bg-blue-500 text-white text-xs min-w-[20px] h-5">
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
          </Card>

          {/* Desktop Chat Area */}
          <Card className="flex-1 border border-gray-200 rounded-xl shadow-lg">
            {selectedConversation && user ? (
              (() => {
                const selectedConv = getSelectedConversationData();
                const conversationUser = selectedConv
                  ? getUserFromConversation(selectedConv)
                  : null;

                return (
                  <ChatWindow
                    chatId={selectedConversation}
                    currentUserId={user.uid}
                    currentUserName={user.name}
                    currentUserRole="admin"
                    currentUserAvatar={user.image}
                    title={conversationUser?.userName || 'User'}
                    className="h-full border-0 rounded-xl"
                    isAdminView={true}
                    targetUserAvatar={conversationUser?.userAvatar}
                    targetUserName={conversationUser?.userName}
                  />
                );
              })()
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminChat;
