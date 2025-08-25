// types/sandbox.ts
import type { ConversationState } from './conversation';

export type SandboxInstance = { id: string; pid?: number; cwd?: string };

export type SandboxData = { sandboxId: string; url: string; port?: number; [key: string]: any } | null;
export type ViteError = { message: string; stack?: string; plugin?: string };
export type ViteErrorsCache = { errors: string[]; timestamp: number } | null;

// Additional types for existing functionality
export interface SandboxFile {
  content: string;
  lastModified: number;
}

export interface SandboxFileCache {
  files: Record<string, SandboxFile>;
  lastSync: number;
  sandboxId: string;
  manifest?: any; // FileManifest type from file-manifest.ts
}

export interface SandboxState {
  fileCache: SandboxFileCache | null;
  sandbox: any; // E2B sandbox instance
  sandboxData: SandboxData;
}

declare global {
  // Singletons (DO NOT re-declare in routes)
  // eslint-disable-next-line no-var
  var activeSandbox: any;
  // eslint-disable-next-line no-var
  var sandboxData: SandboxData | undefined;
  // eslint-disable-next-line no-var
  var viteErrors: ViteError[] | undefined;
  // eslint-disable-next-line no-var
  var viteErrorsCache: ViteErrorsCache | undefined;
  // Additional existing globals
  // eslint-disable-next-line no-var
  var sandboxState: SandboxState;
  // eslint-disable-next-line no-var
  var existingFiles: Set<string>;
  // eslint-disable-next-line no-var
  var conversationState: ConversationState | null;
}

globalThis.activeSandbox ??= null;
globalThis.sandboxData ??= null;
globalThis.viteErrors ??= [];
globalThis.viteErrorsCache ??= null;
globalThis.conversationState ??= null;

export {};