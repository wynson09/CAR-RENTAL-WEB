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
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  limitToLast,
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
  lastMessage: string | { content: string; senderId: string; timestamp: Timestamp }; // Support legacy format
  lastMessageTimestamp: Timestamp;
  unreadCount: {
    [userId: string]: number;
  };
  consecutiveUserMessages: number; // Track consecutive messages from user
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PaginatedMessages {
  messages: ChatMessage[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  // Oldest message timestamp in this page (for timestamp-based cursors)
  cursorTimestamp: Timestamp | null;
}

export interface SpamPreventionState {
  consecutiveMessages: number;
  isBlocked: boolean;
  lastMessageSenderId: string;
}

export class FirebaseChatService {
  // Utility function to safely extract last message text
  static getLastMessageText(conversation: Conversation): string {
    const lastMessage = conversation.lastMessage;
    if (typeof lastMessage === 'string') {
      return lastMessage;
    } else if (typeof lastMessage === 'object' && lastMessage && 'content' in lastMessage) {
      return lastMessage.content || '';
    }
    return '';
  }
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

      // For multi-admin support, we'll use shared 'admin' key for unread counts

      // Use a transaction to prevent race conditions
      return await runTransaction(db, async (transaction) => {
        const conversationSnap = await transaction.get(conversationRef);

        if (conversationSnap.exists()) {
          return predictableId;
        }

        // Check if messages already exist for this conversation ID
        const messagesQuery = query(
          collection(db, MESSAGES_COLLECTION),
          where('conversationId', '==', predictableId),
          limit(1)
        );
        const existingMessages = await getDocs(messagesQuery);

        // Only create conversation and welcome message if no messages exist
        if (existingMessages.empty) {
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
                userId: 'admin', // Shared admin ID for all admins
                userName: 'Support Team',
                userRole: 'admin',
                userAvatar: '',
              },
            ],
            lastMessage:
              'Welcome to NACS Car Rental! We are here to assist you with any questions or concerns you may have. How can we help you today?',
            lastMessageTimestamp: serverTimestamp() as Timestamp,
            unreadCount: {
              [userId]: 1, // User has 1 unread welcome message
              admin: 0, // Shared count for all admins
            },
            consecutiveUserMessages: 0, // Initialize spam prevention counter
            isActive: true,
            createdAt: serverTimestamp() as Timestamp,
            updatedAt: serverTimestamp() as Timestamp,
          };

          // Create conversation within transaction
          transaction.set(conversationRef, conversationData);

          // Create welcome message
          const welcomeMessageRef = doc(collection(db, MESSAGES_COLLECTION));
          const welcomeMessage: Omit<ChatMessage, 'id'> = {
            conversationId: predictableId,
            senderId: 'admin', // Shared admin ID
            senderName: 'Support Team',
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
          console.log('Creating new conversation and welcome message for:', predictableId);
        } else {
          console.log('Conversation already exists with messages for:', predictableId);

          // Just update the conversation if it doesn't exist but messages do
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
            lastMessage: 'Chat conversation',
            lastMessageTimestamp: serverTimestamp() as Timestamp,
            unreadCount: {
              [userId]: 0,
              admin: 0,
            },
            consecutiveUserMessages: 0,
            isActive: true,
            createdAt: serverTimestamp() as Timestamp,
            updatedAt: serverTimestamp() as Timestamp,
          };

          transaction.set(conversationRef, conversationData);
        }

        return predictableId;
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Send message with spam prevention
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
      // Check spam prevention for user messages
      if (senderRole === 'user') {
        const spamState = await this.checkSpamPrevention(conversationId, senderId);
        if (spamState.isBlocked) {
          throw new Error(
            'Spam prevention: Please wait for an admin response before sending more messages.'
          );
        }
      }

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

      // Update conversation last message and spam prevention counter
      await this.updateConversationLastMessage(
        conversationId,
        senderId,
        content,
        senderRole,
        messageType
      );

      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Update conversation last message and spam prevention
  private static async updateConversationLastMessage(
    conversationId: string,
    senderId: string,
    content: string,
    senderRole: 'user' | 'admin' | 'moderator',
    messageType: 'text' | 'image' | 'file' = 'text'
  ): Promise<void> {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      const conversationSnap = await getDoc(conversationRef);

      if (!conversationSnap.exists()) return;

      const conversationData = conversationSnap.data() as Conversation;

      // Format last message based on type
      let lastMessageDisplay = content;
      if (messageType === 'image') {
        lastMessageDisplay = '📷 Image';
      } else if (messageType === 'file') {
        lastMessageDisplay = '📎 File';
      }

      let updateData: any = {
        lastMessage: lastMessageDisplay,
        lastMessageTimestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Update spam prevention counter
      if (senderRole === 'user') {
        // Increment consecutive user messages
        updateData.consecutiveUserMessages = (conversationData.consecutiveUserMessages || 0) + 1;
      } else if (senderRole === 'admin' || senderRole === 'moderator') {
        // Reset consecutive user messages when admin responds
        updateData.consecutiveUserMessages = 0;
      }

      // Increment unread count for all OTHER participants (not the sender)
      const currentUnreadCount = conversationData.unreadCount || {};

      conversationData.participants.forEach((participant) => {
        if (participant.userId !== senderId) {
          const currentCount = currentUnreadCount[participant.userId] || 0;
          const newCount = currentCount + 1;
          updateData[`unreadCount.${participant.userId}`] = newCount;
        }
      });

      await updateDoc(conversationRef, updateData);
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  }

  // Check spam prevention status
  static async checkSpamPrevention(
    conversationId: string,
    userId: string
  ): Promise<SpamPreventionState> {
    try {
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      const conversationSnap = await getDoc(conversationRef);

      if (!conversationSnap.exists()) {
        return { consecutiveMessages: 0, isBlocked: false, lastMessageSenderId: '' };
      }

      const conversationData = conversationSnap.data() as Conversation;
      const consecutiveMessages = conversationData.consecutiveUserMessages || 0;
      const isBlocked = consecutiveMessages >= 7;

      return {
        consecutiveMessages,
        isBlocked,
        lastMessageSenderId: userId,
      };
    } catch (error) {
      console.error('Error checking spam prevention:', error);
      return { consecutiveMessages: 0, isBlocked: false, lastMessageSenderId: '' };
    }
  }

  // Get initial paginated messages (latest 30)
  static async getInitialMessages(conversationId: string): Promise<PaginatedMessages> {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'desc'),
        limit(30)
      );

      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as ChatMessage)
      );

      // Reverse to show chronological order
      messages.reverse();

      // Better hasMore detection: check if there are actually more messages
      let hasMore = false;
      if (snapshot.docs.length === 30) {
        // Check if there are older messages beyond our current batch
        const oldestDoc = snapshot.docs[snapshot.docs.length - 1];
        const olderQuery = query(
          collection(db, MESSAGES_COLLECTION),
          where('conversationId', '==', conversationId),
          orderBy('timestamp', 'desc'),
          startAfter(oldestDoc),
          limit(1)
        );
        const olderSnapshot = await getDocs(olderQuery);
        hasMore = olderSnapshot.docs.length > 0;
      }

      return {
        messages,
        lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
        hasMore,
        cursorTimestamp:
          snapshot.docs.length > 0
            ? (snapshot.docs[snapshot.docs.length - 1].data() as any)?.timestamp || null
            : null,
      };
    } catch (error) {
      console.error('Error getting initial messages:', error);
      throw error;
    }
  }

  // Get older messages for infinite scroll
  static async getOlderMessages(
    conversationId: string,
    cursor: QueryDocumentSnapshot<DocumentData> | Timestamp | number | Date
  ): Promise<PaginatedMessages> {
    try {
      // Determine the correct startAfter argument. When we do not have the
      // previous page's DocumentSnapshot (e.g., when loading from cache), we
      // fall back to using the oldest message Timestamp as the cursor.
      const startAfterArg: any =
        cursor && typeof (cursor as any).id === 'string' && (cursor as any).ref
          ? cursor
          : cursor instanceof Timestamp
          ? cursor
          : typeof cursor === 'number'
          ? Timestamp.fromMillis(cursor)
          : cursor instanceof Date
          ? Timestamp.fromDate(cursor)
          : cursor;

      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'desc'),
        startAfter(startAfterArg),
        limit(30)
      );

      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as ChatMessage)
      );

      // Reverse to show chronological order
      messages.reverse();

      // Better hasMore detection: check if there are actually more messages
      let hasMore = false;
      if (snapshot.docs.length === 30) {
        // Check if there are even older messages beyond our current batch
        const oldestDoc = snapshot.docs[snapshot.docs.length - 1];
        const olderQuery = query(
          collection(db, MESSAGES_COLLECTION),
          where('conversationId', '==', conversationId),
          orderBy('timestamp', 'desc'),
          startAfter(oldestDoc),
          limit(1)
        );
        const olderSnapshot = await getDocs(olderQuery);
        hasMore = olderSnapshot.docs.length > 0;
      }

      return {
        messages,
        lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
        hasMore,
        cursorTimestamp:
          snapshot.docs.length > 0
            ? (snapshot.docs[snapshot.docs.length - 1].data() as any)?.timestamp || null
            : null,
      };
    } catch (error) {
      console.error('Error getting older messages:', error);
      throw error;
    }
  }

  // Listen to new messages only (for real-time updates)
  static listenToNewMessages(
    conversationId: string,
    lastTimestamp: Timestamp | null,
    callback: (messages: ChatMessage[]) => void,
    errorCallback: (error: any) => void
  ): () => void {
    try {
      let q;

      if (lastTimestamp) {
        q = query(
          collection(db, MESSAGES_COLLECTION),
          where('conversationId', '==', conversationId),
          where('timestamp', '>', lastTimestamp),
          orderBy('timestamp', 'asc')
        );
      } else {
        // If no lastTimestamp, listen to very recent messages only
        q = query(
          collection(db, MESSAGES_COLLECTION),
          where('conversationId', '==', conversationId),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
      }

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

          if (!lastTimestamp) {
            // First time, sort desc and take only latest
            messages.sort((a, b) => {
              const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
              const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
              return timeB - timeA;
            });
          } else {
            // Sort chronologically for new messages
            messages.sort((a, b) => {
              const timeA = a.timestamp?.toDate?.()?.getTime() || 0;
              const timeB = b.timestamp?.toDate?.()?.getTime() || 0;
              return timeA - timeB;
            });
          }

          callback(messages);
        },
        errorCallback
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up new messages listener:', error);
      errorCallback(error);
      return () => {};
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

      // Update individual messages to mark as read
      const updatePromises = querySnapshot.docs.map((doc) => updateDoc(doc.ref, { isRead: true }));
      await Promise.all(updatePromises);

      // ALWAYS reset unread count for this user in the conversation
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);

      // Get user role to determine which key to reset
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.exists() ? userDoc.data() : null;
      const userRole = userData?.role || 'user';

      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (userRole === 'admin' || userRole === 'moderator') {
        // For admin/moderator: reset shared 'admin' key (all admins share one count)
        updateData['unreadCount.admin'] = 0;
      } else {
        // For regular users: reset their specific user ID key
        updateData[`unreadCount.${userId}`] = 0;
      }

      await updateDoc(conversationRef, updateData);
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
