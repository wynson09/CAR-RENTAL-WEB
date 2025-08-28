'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Search } from 'lucide-react';
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
  }, [user?.uid, user?.role, selectedConversation]);

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
    <Card
      className={cn(
        'h-[calc(90vh-120px)] flex border border-gray-200 rounded-xl shadow-lg',
        className
      )}
    >
      {/* Sidebar - Conversations List */}
      <div className="w-1/3 border-r flex flex-col rounded-l-xl">
        <CardHeader className="pb-3 rounded-tl-xl">
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
                            {formatLastMessageTime(conversation.lastMessageTimestamp)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-muted-foreground truncate">
                            {FirebaseChatService.getLastMessageText(conversation)}
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
        {selectedConversation && user ? (
          (() => {
            const selectedConv = getSelectedConversationData();
            const conversationUser = selectedConv ? getUserFromConversation(selectedConv) : null;

            return (
              <ChatWindow
                chatId={selectedConversation}
                currentUserId={user.uid}
                currentUserName={user.name}
                currentUserRole="admin"
                currentUserAvatar={user.image}
                title={conversationUser?.userName || 'User'}
                className="h-full border-l-0 rounded-l-none rounded-r-xl"
                isAdminView={true}
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
      </div>
    </Card>
  );
};

export default AdminChat;
