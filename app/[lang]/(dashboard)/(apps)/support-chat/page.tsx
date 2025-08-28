'use client';

import { ChatInterface } from '@/components/chat/chat-interface';

const SupportChatPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Support Chat</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Get help from our support team or manage user conversations
        </p>
      </div>

      <ChatInterface />
    </div>
  );
};

export default SupportChatPage;
