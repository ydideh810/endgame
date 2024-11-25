// Previous type definitions remain
export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'system';
  timestamp: number;
}

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

export interface GuestTrialInfo {
  lastUsed: number | null;
  isAvailable: boolean;
}
