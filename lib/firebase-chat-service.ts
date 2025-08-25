'use client';

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit,
  and,
  or,
  setDoc,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Collections
const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

// Interfaces
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin' | 'moderator';
  senderAvatar?: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  timestamp: Timestamp;
  isRead: boolean;
  isEdited: boolean;
  editedAt?: Timestamp;
  replyTo?: string; // Message ID being replied to
}

export interface Conversation {
  id: string;
  participants: {
    userId: string;
    userName: string;
    userRole: 'user' | 'admin' | 'moderator';
    userAvatar?: string;
  }[];
  lastMessage: string;
  lastMessageTimestamp: Timestamp;
  unreadCount: {
    [userId: string]: number;
  };
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class FirebaseChatService {
  // Get or create conversation between user and admin
  static async getOrCreateUserAdminConversation(
    userId: string,
    userName: string,
    userAvatar?: string
  ): Promise<string> {
    try {
      // Use predictable ID to check if conversation already exists
      const predictableId = `user_${userId}_admin`;
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, predictableId);
      
      // Use a transaction to prevent race conditions
      return await runTransaction(db, async (transaction) => {
        const conversationSnap = await transaction.get(conversationRef);

        if (conversationSnap.exists()) {
          console.log('Found existing conversation for user:', userId);
          return predictableId;
        }

        console.log('Creating new conversation for user:', userId);

        // Check if messages already exist for this conversation ID
        const messagesQuery = query(
          collection(db, MESSAGES_COLLECTION),
          where('conversationId', '==', predictableId),
          limit(1)
        );
        const existingMessages = await getDocs(messagesQuery);

        // Create new conversation with admin
        const conversationData: Omit<Conversation, 'id'> = {
          participants: [
            {
              userId: userId,
              userName: userName,
              userRole: 'user',
              userAvatar: userAvatar || '',
            },
            {
              userId: 'admin',
              userName: 'Admin Support',
              userRole: 'admin',
              userAvatar: '',
            },
          ],
          lastMessage:
            'Welcome to NACS Car Rental! We are here to assist you with any questions or concerns you may have. How can we help you today?',
          lastMessageTimestamp: serverTimestamp() as Timestamp,
          unreadCount: {
            [userId]: 1, // User has 1 unread welcome message
            admin: 0,
          },
          isActive: true,
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
        };

        // Create conversation within transaction
        transaction.set(conversationRef, conversationData);

        // Create welcome message only if no messages exist
        if (existingMessages.empty) {
          const welcomeMessageRef = doc(collection(db, MESSAGES_COLLECTION));
          const welcomeMessage: Omit<ChatMessage, 'id'> = {
            conversationId: predictableId,
            senderId: 'admin',
            senderName: 'Admin Support',
            senderRole: 'admin',
            senderAvatar: '',
            content:
              'Welcome to NACS Car Rental! We are here to assist you with any questions or concerns you may have. How can we help you today?',
            messageType: 'text',
            timestamp: serverTimestamp() as Timestamp,
            isRead: false,
            isEdited: false,
          };

          transaction.set(welcomeMessageRef, welcomeMessage);
          console.log('Creating welcome message for conversation:', predictableId);
        } else {
          console.log('Welcome message already exists for conversation:', predictableId);
        }

        return predictableId;
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Send message
  static async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderRole: 'user' | 'admin' | 'moderator',
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text',
    senderAvatar?: string,
    replyTo?: string
  ): Promise<string> {
    try {
      const messageData: any = {
        conversationId,
        senderId,
        senderName,
        senderRole,
        senderAvatar: senderAvatar || '',
        content,
        messageType,
        timestamp: serverTimestamp(),
        isRead: false,
        isEdited: false,
      };

      // Only add replyTo if it has a value
      if (replyTo) {
        messageData.replyTo = replyTo;
      }

      const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);

      // Update conversation last message
      await this.updateConversationLastMessage(conversationId, senderId, content);

      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Update conversation last message
  private static async updateConversationLastMessage(
    conversationId: string,
    senderId: string,
    content: string
  ): Promise<void> {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      await updateDoc(conversationRef, {
        lastMessage: {
          content,
          senderId,
          timestamp: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  }

  // Listen to messages in real-time
  static listenToMessages(
    conversationId: string,
    callback: (messages: ChatMessage[]) => void,
    errorCallback: (error: any) => void
  ): () => void {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const messages = snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as ChatMessage)
          );

          // Sort messages by timestamp client-side
          messages.sort((a, b) => {
            const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
            const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
            return timeA - timeB;
          });

          callback(messages);
        },
        errorCallback
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up message listener:', error);
      errorCallback(error);
      return () => {};
    }
  }

  // Get all conversations for admin (all user conversations)
  static listenToAdminConversations(
    callback: (conversations: Conversation[]) => void,
    errorCallback: (error: any) => void
  ): () => void {
    try {
      const q = query(collection(db, CONVERSATIONS_COLLECTION), where('isActive', '==', true));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const conversations = snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              } as Conversation)
          );

          // Sort conversations by updatedAt client-side (newest first)
          conversations.sort((a, b) => {
            const timeA = a.updatedAt?.toDate?.()?.getTime() || 0;
            const timeB = b.updatedAt?.toDate?.()?.getTime() || 0;
            return timeB - timeA;
          });

          callback(conversations);
        },
        errorCallback
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up admin conversations listener:', error);
      errorCallback(error);
      return () => {};
    }
  }

  // Get user's conversation with admin
  static listenToUserConversation(
    userId: string,
    callback: (conversation: Conversation | null) => void,
    errorCallback: (error: any) => void
  ): () => void {
    try {
      // Listen to all conversations and filter client-side
      const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);

      const unsubscribe = onSnapshot(
        conversationsRef,
        (snapshot) => {
          // Find conversation where this user is a participant
          const userConversation = snapshot.docs.find((doc) => {
            const data = doc.data() as Conversation;
            return data.participants.some((p) => p.userId === userId && p.userRole === 'user');
          });

          if (userConversation) {
            const conversation = {
              id: userConversation.id,
              ...userConversation.data(),
            } as Conversation;
            callback(conversation);
          } else {
            callback(null);
          }
        },
        errorCallback
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up user conversation listener:', error);
      errorCallback(error);
      return () => {};
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        where('senderId', '!=', userId),
        where('isRead', '==', false)
      );

      const querySnapshot = await getDocs(q);

      const updatePromises = querySnapshot.docs.map((doc) => updateDoc(doc.ref, { isRead: true }));

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  // Delete message
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, MESSAGES_COLLECTION, messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  // Edit message
  static async editMessage(messageId: string, newContent: string): Promise<void> {
    try {
      await updateDoc(doc(db, MESSAGES_COLLECTION, messageId), {
        content: newContent,
        isEdited: true,
        editedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  }
}

export default FirebaseChatService;
