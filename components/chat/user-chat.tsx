'use client';

import { useUserStore } from '@/store';
import { MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChatWindow } from './chat-window';

interface UserChatProps {
  className?: string;
}

export const UserChat = ({ className }: UserChatProps) => {
  const { user } = useUserStore();

  if (!user) {
    return (
      <Card className={cn('h-[600px] flex items-center justify-center', className)}>
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please sign in to access chat</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('h-[calc(90vh-120px)] border rounded-xl shadow-lg', className)}>
      <ChatWindow
        chatId={`user_${user.uid}_admin`}
        currentUserId={user.uid}
        currentUserName={user.name}
        currentUserRole="user"
        currentUserAvatar={user.image}
        title="Support Team"
        className="h-full border-0 rounded-xl"
        isAdminView={false}
        hideHeader={false}
      />
    </Card>
  );
};

export default UserChat;
