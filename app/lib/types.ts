// Message type for chat functionality
export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'system';
  timestamp: number;
}

// Prompt interface for the prompt library
export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: 'creative' | 'technical' | 'brainstorming' | 'roleplay';
  tags: string[];
  userId: string;
  createdAt: number;
  upvotes: number;
}

// Achievement related types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'usage' | 'performance' | 'social';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface UserStats {
  totalMessages: number;
  dailyLogins: number;
  consecutiveLogins: number;
  lastLoginDate: string;
  totalTokensGenerated: number;
  totalConversationsShared: number;
  achievements: Achievement[];
}

// WebLN types
export interface WebLNProvider {
  enable: () => Promise<void>;
  getInfo: () => Promise<{
    node: {
      pubkey: string;
      alias?: string;
    };
  }>;
  makeInvoice: (args: {
    amount: number;
    defaultMemo?: string;
    payerData?: {
      name?: string;
      identifier?: string;
    };
  }) => Promise<{
    paymentRequest: string;
  }>;
  sendPayment: (paymentRequest: string) => Promise<{
    preimage: string;
  }>;
}

// License types
export interface LicenseRecord {
  id?: number;
  licenseKey: string;
  productId: string;
  proofImage?: string;
  timestamp: number;
}

// Conversation context types
export interface ConversationContext {
  currentTopic: string;
  relevantTopics: string[];
  userPreferences: UserPreference;
  interactionCount: number;
  lastUpdateTime: number;
}

export interface UserPreference {
  communicationStyle: 'casual' | 'formal' | 'technical';
  responseLength: 'concise' | 'detailed';
  topics: string[];
  lastInteractions: string[];
}

// Payment types
export interface PaymentResult {
  success: boolean;
  error?: string;
  preimage?: string;
}
