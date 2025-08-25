// Lovable-specific types

export interface SandboxData {
  sandboxId: string;
  url: string;
  [key: string]: any;
}

export interface ChatMessage {
  content: string;
  type: 'user' | 'ai' | 'system' | 'file-update' | 'command' | 'error';
  timestamp: Date;
  metadata?: {
    scrapedUrl?: string;
    scrapedContent?: any;
    generatedCode?: string;
    appliedFiles?: string[];
    commandType?: 'input' | 'output' | 'error' | 'success';
  };
}

export interface ConversationContextState {
  scrapedWebsites: Array<{ url: string; content: any; timestamp: Date }>;
  generatedComponents: Array<{ name: string; path: string; content: string }>;
  appliedCode: Array<{ files: string[]; timestamp: Date }>;
  currentProject: string;
  lastGeneratedCode?: string;
}

export interface CodeApplicationState {
  isStreaming: boolean;
  isApplying: boolean;
  isInstalling: boolean;
  currentStep: string;
  progress: number;
  error: string | null;
  showFullscreen?: boolean;
}

// Additional response interfaces for API calls
export interface ApplyResults {
  packagesInstalled?: string[];
  filesCreated?: string[];
  filesUpdated?: string[];
  commandsExecuted?: string[];
  errors?: string[];
  packagesFailed?: string[];
}

export interface ApplyResponse {
  success: boolean;
  results?: ApplyResults;
  explanation?: string;
  structure?: Record<string, unknown>;
  message?: string;
  warning?: string;
  missingImports?: string[];
  debug?: unknown;
}

export type FileOp = { 
  path: string; 
  content: string; 
  type: string; 
  completed: boolean; 
  edited?: boolean; 
};

// File node types for sandbox files
export type FileNode = { 
  type: 'file' | 'dir'; 
  name: string; 
  path?: string; 
  children?: FileNode[]; 
};

// Message part types for chat interface
export type Part =
  | { type: 'text'; text: string }
  | { type: 'data-sources'; data: { sources?: unknown; newsResults?: unknown; imageResults?: unknown } }
  | { type: 'data-ticker'; data: { symbol: string } }
  | { type: 'data-followup'; data: { questions: string[] } }
  | { type: 'data-status'; data: { message: string } }
  | { type: string; text?: string; data?: unknown };

// Search result types for Fireplexity
export interface SearchResultItem {
  url: string;
  title?: string;
  description?: string;
  snippet?: string;
  publishedAt?: string;
  date?: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  position?: number;
  source?: {
    name?: string;
  };
}

export interface ImageResultItem {
  url?: string;
  title?: string;
  alt?: string;
  source?: string;
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  position?: number;
}