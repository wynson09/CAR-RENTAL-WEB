'use client';
import { useState, useEffect, useMemo } from 'react';
import { useUserStore } from '@/store';
import { FirebaseChatService, Conversation } from '@/lib/firebase-chat-service';
import { Envelope } from '@/components/svg';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import shortImage from '@/public/images/all-img/short-image.png';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { MessageSquare, Bell } from 'lucide-react';

const Inbox = () => {
  const { user } = useUserStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate total unread messages
  const totalUnreadCount = useMemo(() => {
    if (!user?.uid) return 0;
    const count = conversations.reduce((total, conv) => {
      let userUnread = 0;

      // For admin/moderator: use shared 'admin' key
      if (user.role === 'admin' || user.role === 'moderator') {
        userUnread = conv.unreadCount['admin'] || 0;
      } else {
        // For regular users: use their specific user ID
        userUnread = conv.unreadCount[user.uid] || 0;
      }

      return total + userUnread;
    }, 0);

    return count;
  }, [conversations, user?.uid]);

  // Listen to conversations for current user
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    if (user.role === 'admin' || user.role === 'moderator') {
      // Admin/Moderator: Listen to all conversations
      unsubscribe = FirebaseChatService.listenToAdminConversations(
        (convs) => {
          // Filter to show only conversations with unread messages or recent activity
          const recentConversations = convs
            .filter((conv) => {
              const unreadCount = conv.unreadCount[user.uid] || 0;
              const isRecent =
                conv.lastMessageTimestamp &&
                Date.now() - conv.lastMessageTimestamp.toDate().getTime() < 24 * 60 * 60 * 1000; // 24 hours
              return unreadCount > 0 || isRecent;
            })
            .slice(0, 5); // Show max 5 conversations
          setConversations(recentConversations);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error loading admin conversations for inbox:', error);
          setIsLoading(false);
        }
      );
    } else {
      // Regular User: Listen to their own conversation with admin
      unsubscribe = FirebaseChatService.listenToUserConversation(
        user.uid,
        (conv) => {
          if (conv) {
            const unreadCount = conv.unreadCount[user.uid] || 0;
            const isRecent =
              conv.lastMessageTimestamp &&
              Date.now() - conv.lastMessageTimestamp.toDate().getTime() < 24 * 60 * 60 * 1000; // 24 hours

            // Show the conversation if it has unread messages OR recent activity
            if (unreadCount > 0 || isRecent) {
              setConversations([conv]);
            } else {
              setConversations([]);
            }
          } else {
            setConversations([]);
          }
          setIsLoading(false);
        },
        (error) => {
          console.error('Error loading user conversation for inbox:', error);
          setIsLoading(false);
        }
      );
    }

    return () => unsubscribe?.();
  }, [user?.uid, user?.role]);

  const formatLastMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) {
      // 7 days
      return format(date, 'EEE');
    } else {
      return format(date, 'dd/MM');
    }
  };

  const getUserFromConversation = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.userId !== user?.uid);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative md:h-9 md:w-9 h-8 w-8 hover:bg-default-100 dark:hover:bg-default-200 
          data-[state=open]:bg-default-100  dark:data-[state=open]:bg-default-200 
           hover:text-primary text-default-500 dark:text-default-800  rounded-full "
        >
          <Envelope className="h-5 w-5 " />
          {/* Only show badge when there are unread messages */}
          {totalUnreadCount > 0 && (
            <Badge className="w-6 h-6 p-0 text-xs font-medium flex items-center justify-center absolute -top-1 -right-1 bg-red-500 text-white border-2 border-background">
              {totalUnreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className=" z-[999] mx-4 lg:w-[420px] p-0">
        <DropdownMenuLabel className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center">
          <MessageSquare className="h-5 w-5 text-white mr-2" />
          <span className="text-base font-semibold text-white flex-1">
            Messages {totalUnreadCount > 0 && `(${totalUnreadCount} unread)`}
          </span>
          <Link href="/en/support-chat" className="text-xs font-medium text-white hover:underline">
            View All
          </Link>
        </DropdownMenuLabel>

        <div className="max-h-[400px]">
          <ScrollArea className="h-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Loading messages...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-center text-muted-foreground">
                  No new messages
                </p>
                <p className="text-xs text-center text-muted-foreground mt-1">
                  All conversations are up to date
                </p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherUser = getUserFromConversation(conversation);
                const unreadCount = user?.uid ? conversation.unreadCount[user.uid] || 0 : 0;
                const lastMessageText = FirebaseChatService.getLastMessageText(conversation);

                return (
                  <Link key={conversation.id} href="/en/support-chat">
                    <DropdownMenuItem className="flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-muted/50 border-b border-border/40 last:border-b-0">
                      <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
                        <AvatarImage
                          src={otherUser?.userAvatar || ''}
                          alt={otherUser?.userName || 'User'}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700">
                          {(otherUser?.userName || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4
                            className={cn(
                              'text-sm truncate max-w-[150px]',
                              unreadCount > 0
                                ? 'font-semibold text-foreground'
                                : 'font-medium text-muted-foreground'
                            )}
                          >
                            {otherUser?.userName || 'Unknown User'}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'text-xs whitespace-nowrap',
                                unreadCount > 0
                                  ? 'text-foreground font-medium'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {formatLastMessageTime(conversation.lastMessageTimestamp)}
                            </span>
                            {unreadCount > 0 && (
                              <Badge className="text-xs min-w-[18px] h-5 bg-red-500 text-white border-0 px-1.5">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p
                          className={cn(
                            'text-xs truncate max-w-[250px] mt-1',
                            unreadCount > 0 ? 'text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {lastMessageText || 'No messages yet'}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                );
              })
            )}
          </ScrollArea>
        </div>

        {conversations.length > 0 && (
          <div className="border-t border-border/40 p-3">
            <Link
              href="/en/support-chat"
              className="block text-center text-xs text-primary hover:text-primary/80 font-medium"
            >
              View all conversations →
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Inbox;
