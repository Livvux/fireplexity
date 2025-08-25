// types/sandbox.ts
// Type definitions only - no global variable declarations
// Global variables are now in /types/lovable-sandbox.ts to isolate sandbox functionality

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