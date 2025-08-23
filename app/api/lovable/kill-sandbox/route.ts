import { NextResponse } from 'next/server';
import type { SandboxState } from '@/types/sandbox';

declare global {
  var activeSandbox: any;
  var sandboxData: any;
  var sandboxState: SandboxState;
}

export async function POST() {
  try {
    console.log('[kill-sandbox] Terminating sandbox...');

    if (global.activeSandbox) {
      try {
        await global.activeSandbox.kill();
        console.log('[kill-sandbox] Sandbox terminated successfully');
      } catch (error) {
        console.error('[kill-sandbox] Error terminating sandbox:', error);
      }
    }

    // Clean up global state
    global.activeSandbox = null;
    global.sandboxData = null;
    global.sandboxState = {
      fileCache: null,
      sandbox: null,
      sandboxData: null
    };

    return NextResponse.json({
      success: true,
      message: 'Sandbox terminated successfully'
    });

  } catch (error: any) {
    console.error('[kill-sandbox] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to terminate sandbox',
      details: error.message
    }, { status: 500 });
  }
}