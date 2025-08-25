'use client';

import { useUserStore } from '@/store';
import { UserChat } from './user-chat';
import { AdminChat } from './admin-chat';
import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface ChatInterfaceProps {
  className?: string;
}

export const ChatInterface = ({ className }: ChatInterfaceProps) => {
  const { user } = useUserStore();

  if (!user) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please sign in to access chat</p>
        </div>
      </Card>
    );
  }

  // Render admin chat for admin/moderator users
  if (user.role === 'admin' || user.role === 'moderator') {
    return <AdminChat className={className} />;
  }

  // Render user chat for regular users
  return <UserChat className={className} />;
};

export default ChatInterface;
