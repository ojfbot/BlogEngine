export interface MediaSource {
  title: string;
  url: string;
  author?: string;
  notes?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export type Step = 'input' | 'chat' | 'preview';
