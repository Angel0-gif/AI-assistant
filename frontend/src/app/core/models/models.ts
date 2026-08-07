export interface Task {
  id: number;
  title: string;
  description: string;
  is_done: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  reminder_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  messages: Message[];
}

export interface ChatResponse {
  conversation_id: number;
  reply: string;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
