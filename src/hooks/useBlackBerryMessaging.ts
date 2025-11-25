// React hook for BlackBerry Dynamics messaging
import { useState, useEffect, useCallback } from 'react';
import { gdMessaging, SecureMessage, Conversation, Contact } from '../services/blackberry/GdMessaging';
import { useGd } from '../contexts/GdContext';

export function useBlackBerryMessaging() {
  const { gdReady } = useGd();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize messaging service
  useEffect(() => {
    if (!gdReady) return;

    let mounted = true;

    async function init() {
      try {
        setLoading(true);
        await gdMessaging.initialize();
        
        if (mounted) {
          const [convs, conts] = await Promise.all([
            gdMessaging.getConversations(),
            gdMessaging.loadContacts(),
          ]);
          
          setConversations(convs);
          setContacts(conts);
        }
      } catch (err) {
        console.error('[useBlackBerryMessaging] Init failed:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize messaging');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [gdReady]);

  // Send message
  const sendMessage = useCallback(async (
    recipientId: string,
    content: string,
    type: SecureMessage['messageType'] = 'text',
    metadata?: SecureMessage['metadata']
  ): Promise<SecureMessage | null> => {
    try {
      const message = await gdMessaging.sendMessage(recipientId, content, type, metadata);
      
      // Update conversations list
      const updatedConvs = await gdMessaging.getConversations();
      setConversations(updatedConvs);
      
      return message;
    } catch (err) {
      console.error('[useBlackBerryMessaging] Send failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return null;
    }
  }, []);

  // Get messages for conversation
  const getMessages = useCallback(async (conversationId: string): Promise<SecureMessage[]> => {
    try {
      return await gdMessaging.receiveMessages(conversationId);
    } catch (err) {
      console.error('[useBlackBerryMessaging] Get messages failed:', err);
      return [];
    }
  }, []);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string): Promise<void> => {
    try {
      await gdMessaging.markAsRead(messageId);
    } catch (err) {
      console.error('[useBlackBerryMessaging] Mark as read failed:', err);
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    try {
      await gdMessaging.deleteMessage(messageId);
    } catch (err) {
      console.error('[useBlackBerryMessaging] Delete failed:', err);
    }
  }, []);

  // Create group conversation
  const createGroup = useCallback(async (
    name: string,
    participantIds: string[]
  ): Promise<Conversation | null> => {
    try {
      const conversation = await gdMessaging.createGroupConversation(name, participantIds);
      setConversations(prev => [...prev, conversation]);
      return conversation;
    } catch (err) {
      console.error('[useBlackBerryMessaging] Create group failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to create group');
      return null;
    }
  }, []);

  // Leave conversation
  const leaveConversation = useCallback(async (conversationId: string): Promise<void> => {
    try {
      await gdMessaging.leaveConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
    } catch (err) {
      console.error('[useBlackBerryMessaging] Leave failed:', err);
    }
  }, []);

  // Search contacts
  const searchContacts = useCallback(async (query: string): Promise<Contact[]> => {
    try {
      return await gdMessaging.searchContacts(query);
    } catch (err) {
      console.error('[useBlackBerryMessaging] Search failed:', err);
      return [];
    }
  }, []);

  // Send file
  const sendFile = useCallback(async (
    recipientId: string,
    file: File
  ): Promise<SecureMessage | null> => {
    try {
      const message = await gdMessaging.sendFile(recipientId, file);
      
      // Update conversations list
      const updatedConvs = await gdMessaging.getConversations();
      setConversations(updatedConvs);
      
      return message;
    } catch (err) {
      console.error('[useBlackBerryMessaging] Send file failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to send file');
      return null;
    }
  }, []);

  // Download file
  const downloadFile = useCallback(async (messageId: string): Promise<Blob | null> => {
    try {
      return await gdMessaging.downloadFile(messageId);
    } catch (err) {
      console.error('[useBlackBerryMessaging] Download failed:', err);
      return null;
    }
  }, []);

  return {
    conversations,
    contacts,
    loading,
    error,
    sendMessage,
    getMessages,
    markAsRead,
    deleteMessage,
    createGroup,
    leaveConversation,
    searchContacts,
    sendFile,
    downloadFile,
  };
}
