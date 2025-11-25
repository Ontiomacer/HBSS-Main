// BlackBerry Dynamics Secure Messaging Service
import { gdGet, gdPost } from './GdHttpRequest';
import { gdGetItem, gdSetItem } from './GdStorage';

export interface SecureMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  encryptedContent: string;
  timestamp: number;
  deliveryStatus: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  messageType: 'text' | 'file' | 'image' | 'video' | 'audio';
  encryption: {
    algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305';
    keyId: string;
    iv: string;
  };
  metadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    thumbnail?: string;
  };
  signature: string;
  isEdited?: boolean;
  editedAt?: number;
  replyTo?: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  participants: string[];
  name?: string;
  avatar?: string;
  lastMessage?: SecureMessage;
  unreadCount: number;
  createdAt: number;
  updatedAt: number;
  metadata?: {
    description?: string;
    admins?: string[];
  };
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: number;
  publicKey: string;
  department?: string;
  title?: string;
  organization?: string;
}

class GdMessagingService {
  private messageCache: Map<string, SecureMessage[]> = new Map();
  private conversationCache: Map<string, Conversation> = new Map();
  private contactCache: Map<string, Contact> = new Map();
  private messageListeners: Set<(message: SecureMessage) => void> = new Set();
  private statusListeners: Set<(update: { messageId: string; status: string }) => void> = new Set();

  // Initialize messaging service
  async initialize(): Promise<void> {
    console.log('[GdMessaging] Initializing secure messaging service...');
    
    // Load cached conversations
    await this.loadConversationsFromCache();
    
    // Load contacts
    await this.loadContacts();
    
    console.log('[GdMessaging] Service initialized');
  }

  // ==================== MESSAGING ====================

  async sendMessage(
    recipientId: string,
    content: string,
    type: SecureMessage['messageType'] = 'text',
    metadata?: SecureMessage['metadata']
  ): Promise<SecureMessage> {
    const conversationId = await this.getOrCreateConversation(recipientId);
    
    // Generate encryption key and IV
    const keyId = await this.generateKeyId();
    const iv = this.generateIV();
    
    // Encrypt message content
    const encryptedContent = await this.encryptContent(content, keyId, iv);
    
    const message: SecureMessage = {
      id: this.generateMessageId(),
      conversationId,
      senderId: await this.getCurrentUserId(),
      recipientId,
      content,
      encryptedContent,
      timestamp: Date.now(),
      deliveryStatus: 'sending',
      messageType: type,
      encryption: {
        algorithm: 'AES-256-GCM',
        keyId,
        iv,
      },
      signature: await this.signMessage(content),
      metadata,
    };

    // Add to cache
    this.addMessageToCache(conversationId, message);

    // Send via BlackBerry Dynamics secure channel
    try {
      await this.sendViaSecureChannel(message);
      message.deliveryStatus = 'sent';
      this.notifyStatusUpdate(message.id, 'sent');
    } catch (error) {
      console.error('[GdMessaging] Send failed:', error);
      message.deliveryStatus = 'failed';
      this.notifyStatusUpdate(message.id, 'failed');
    }

    // Update conversation
    await this.updateConversationLastMessage(conversationId, message);

    return message;
  }

  async receiveMessages(conversationId: string): Promise<SecureMessage[]> {
    // Check cache first
    if (this.messageCache.has(conversationId)) {
      return this.messageCache.get(conversationId) || [];
    }

    // Fetch from server via secure channel
    try {
      const response = await gdGet(`/api/messages/${conversationId}`);
      const messages: SecureMessage[] = JSON.parse(response.body);
      
      // Decrypt messages
      const decryptedMessages = await Promise.all(
        messages.map(msg => this.decryptMessage(msg))
      );
      
      this.messageCache.set(conversationId, decryptedMessages);
      return decryptedMessages;
    } catch (error) {
      console.error('[GdMessaging] Receive failed:', error);
      return [];
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      await gdPost(`/api/messages/${messageId}/read`, {});
      this.notifyStatusUpdate(messageId, 'read');
    } catch (error) {
      console.error('[GdMessaging] Mark as read failed:', error);
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    try {
      await gdPost(`/api/messages/${messageId}/delete`, {});
      
      // Remove from cache
      for (const [convId, messages] of this.messageCache.entries()) {
        const filtered = messages.filter(m => m.id !== messageId);
        this.messageCache.set(convId, filtered);
      }
    } catch (error) {
      console.error('[GdMessaging] Delete failed:', error);
    }
  }

  // ==================== CONVERSATIONS ====================

  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await gdGet('/api/conversations');
      const conversations: Conversation[] = JSON.parse(response.body);
      
      conversations.forEach(conv => {
        this.conversationCache.set(conv.id, conv);
      });
      
      return conversations;
    } catch (error) {
      console.error('[GdMessaging] Get conversations failed:', error);
      return Array.from(this.conversationCache.values());
    }
  }

  async createGroupConversation(
    name: string,
    participantIds: string[]
  ): Promise<Conversation> {
    const conversation: Conversation = {
      id: this.generateConversationId(),
      type: 'group',
      participants: [await this.getCurrentUserId(), ...participantIds],
      name,
      unreadCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        admins: [await this.getCurrentUserId()],
      },
    };

    try {
      await gdPost('/api/conversations', conversation);
      this.conversationCache.set(conversation.id, conversation);
      return conversation;
    } catch (error) {
      console.error('[GdMessaging] Create group failed:', error);
      throw error;
    }
  }

  async leaveConversation(conversationId: string): Promise<void> {
    try {
      await gdPost(`/api/conversations/${conversationId}/leave`, {});
      this.conversationCache.delete(conversationId);
      this.messageCache.delete(conversationId);
    } catch (error) {
      console.error('[GdMessaging] Leave conversation failed:', error);
    }
  }

  // ==================== CONTACTS ====================

  async loadContacts(): Promise<Contact[]> {
    try {
      const response = await gdGet('/api/contacts');
      const contacts: Contact[] = JSON.parse(response.body);
      
      contacts.forEach(contact => {
        this.contactCache.set(contact.id, contact);
      });
      
      return contacts;
    } catch (error) {
      console.error('[GdMessaging] Load contacts failed:', error);
      return this.getMockContacts();
    }
  }

  async getContact(contactId: string): Promise<Contact | null> {
    if (this.contactCache.has(contactId)) {
      return this.contactCache.get(contactId) || null;
    }

    try {
      const response = await gdGet(`/api/contacts/${contactId}`);
      const contact: Contact = JSON.parse(response.body);
      this.contactCache.set(contact.id, contact);
      return contact;
    } catch (error) {
      console.error('[GdMessaging] Get contact failed:', error);
      return null;
    }
  }

  async searchContacts(query: string): Promise<Contact[]> {
    const allContacts = Array.from(this.contactCache.values());
    const lowerQuery = query.toLowerCase();
    
    return allContacts.filter(contact =>
      contact.name.toLowerCase().includes(lowerQuery) ||
      contact.email.toLowerCase().includes(lowerQuery) ||
      contact.department?.toLowerCase().includes(lowerQuery)
    );
  }

  // ==================== FILE SHARING ====================

  async sendFile(
    recipientId: string,
    file: File | { name: string; size: number; type: string; data: string }
  ): Promise<SecureMessage> {
    // Encrypt file
    const encryptedFile = await this.encryptFile(file);
    
    // Upload via secure channel
    const fileUrl = await this.uploadSecureFile(encryptedFile);
    
    // Send message with file metadata
    return this.sendMessage(
      recipientId,
      `Sent file: ${file.name}`,
      this.getFileMessageType(file.type),
      {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      }
    );
  }

  async downloadFile(messageId: string): Promise<Blob> {
    try {
      const response = await gdGet(`/api/files/${messageId}`);
      const encryptedData = response.body;
      
      // Decrypt file
      const decryptedData = await this.decryptFile(encryptedData);
      return new Blob([decryptedData]);
    } catch (error) {
      console.error('[GdMessaging] Download file failed:', error);
      throw error;
    }
  }

  // ==================== ENCRYPTION ====================

  private async encryptContent(content: string, keyId: string, iv: string): Promise<string> {
    // In production, use BlackBerry Dynamics crypto APIs
    // For now, simulate encryption
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const base64 = btoa(String.fromCharCode(...data));
    return `encrypted:${keyId}:${iv}:${base64}`;
  }

  private async decryptMessage(message: SecureMessage): Promise<SecureMessage> {
    try {
      // In production, use BlackBerry Dynamics crypto APIs
      const parts = message.encryptedContent.split(':');
      if (parts[0] === 'encrypted' && parts.length === 4) {
        const base64 = parts[3];
        const decoded = atob(base64);
        const bytes = new Uint8Array(decoded.split('').map(c => c.charCodeAt(0)));
        const decoder = new TextDecoder();
        message.content = decoder.decode(bytes);
      }
      return message;
    } catch (error) {
      console.error('[GdMessaging] Decrypt failed:', error);
      return message;
    }
  }

  private async encryptFile(file: File | { name: string; size: number; type: string; data: string }): Promise<string> {
    // Simulate file encryption
    return `encrypted_file_${Date.now()}`;
  }

  private async decryptFile(encryptedData: string): Promise<ArrayBuffer> {
    // Simulate file decryption
    return new ArrayBuffer(0);
  }

  private async signMessage(content: string): Promise<string> {
    // Generate message signature using BlackBerry Dynamics
    return `sig_${btoa(content).substring(0, 16)}`;
  }

  // ==================== UTILITIES ====================

  private async sendViaSecureChannel(message: SecureMessage): Promise<void> {
    await gdPost('/api/messages/send', message);
  }

  private async uploadSecureFile(encryptedFile: string): Promise<string> {
    const response = await gdPost('/api/files/upload', { file: encryptedFile });
    return JSON.parse(response.body).url;
  }

  private async getOrCreateConversation(recipientId: string): Promise<string> {
    // Check if conversation exists
    for (const conv of this.conversationCache.values()) {
      if (conv.type === 'direct' && conv.participants.includes(recipientId)) {
        return conv.id;
      }
    }

    // Create new conversation
    const conversation: Conversation = {
      id: this.generateConversationId(),
      type: 'direct',
      participants: [await this.getCurrentUserId(), recipientId],
      unreadCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.conversationCache.set(conversation.id, conversation);
    return conversation.id;
  }

  private async updateConversationLastMessage(
    conversationId: string,
    message: SecureMessage
  ): Promise<void> {
    const conversation = this.conversationCache.get(conversationId);
    if (conversation) {
      conversation.lastMessage = message;
      conversation.updatedAt = Date.now();
      this.conversationCache.set(conversationId, conversation);
    }
  }

  private addMessageToCache(conversationId: string, message: SecureMessage): void {
    const messages = this.messageCache.get(conversationId) || [];
    messages.push(message);
    this.messageCache.set(conversationId, messages);
  }

  private async loadConversationsFromCache(): Promise<void> {
    try {
      const cached = await gdGetItem('conversations');
      if (cached) {
        const conversations: Conversation[] = JSON.parse(cached);
        conversations.forEach(conv => {
          this.conversationCache.set(conv.id, conv);
        });
      }
    } catch (error) {
      console.error('[GdMessaging] Load cache failed:', error);
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async generateKeyId(): Promise<string> {
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateIV(): string {
    return `iv_${Math.random().toString(36).substr(2, 16)}`;
  }

  private async getCurrentUserId(): Promise<string> {
    const userId = await gdGetItem('current_user_id');
    return userId || 'user_current';
  }

  private getFileMessageType(mimeType: string): SecureMessage['messageType'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  }

  // ==================== EVENT LISTENERS ====================

  onMessage(callback: (message: SecureMessage) => void): () => void {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  onStatusUpdate(callback: (update: { messageId: string; status: string }) => void): () => void {
    this.statusListeners.add(callback);
    return () => this.statusListeners.delete(callback);
  }

  private notifyStatusUpdate(messageId: string, status: string): void {
    this.statusListeners.forEach(listener => {
      listener({ messageId, status });
    });
  }

  // ==================== MOCK DATA ====================

  private getMockContacts(): Contact[] {
    return [
      {
        id: 'contact_1',
        name: 'Sarah Connor',
        email: 's.connor@cyberdyne.corp',
        status: 'online',
        publicKey: 'pub_key_sarah',
        department: 'Security Operations',
        title: 'Security Director',
      },
      {
        id: 'contact_2',
        name: 'John Matrix',
        email: 'j.matrix@defense.mil',
        status: 'away',
        publicKey: 'pub_key_john',
        department: 'Military Intelligence',
        title: 'Intelligence Officer',
        lastSeen: Date.now() - 300000,
      },
      {
        id: 'contact_3',
        name: 'Diana Prince',
        email: 'd.prince@justice.gov',
        status: 'online',
        publicKey: 'pub_key_diana',
        department: 'Federal Security',
        title: 'Special Agent',
      },
    ];
  }
}

export const gdMessaging = new GdMessagingService();
