// types/lovable-sandbox.ts
// Global variables specifically for Lovable E2B sandbox functionality
import type { ConversationState } from './conversation';
import type { SandboxData, ViteError, ViteErrorsCache, SandboxState } from './sandbox';

declare global {
  // Singletons for Lovable sandbox functionality (DO NOT re-declare in routes)
  // eslint-disable-next-line no-var
  var activeSandbox: any;
  // eslint-disable-next-line no-var
  var sandboxData: SandboxData | undefined;
  // eslint-disable-next-line no-var
  var viteErrors: ViteError[] | undefined;
  // eslint-disable-next-line no-var
  var viteErrorsCache: ViteErrorsCache | undefined;
  // eslint-disable-next-line no-var
  var sandboxState: SandboxState;
  // eslint-disable-next-line no-var
  var existingFiles: Set<string>;
  // eslint-disable-next-line no-var
  var conversationState: ConversationState | null;
}

// Initialize global sandbox variables for Lovable
globalThis.activeSandbox ??= null;
globalThis.sandboxData ??= null;
globalThis.viteErrors ??= [];
globalThis.viteErrorsCache ??= null;
globalThis.conversationState ??= null;

export {};