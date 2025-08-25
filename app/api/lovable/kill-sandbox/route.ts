import { NextResponse } from 'next/server';
import '@/types/lovable-sandbox';


export async function POST() {
  try {
    console.log('[kill-sandbox] Terminating sandbox...');

    if (globalThis.activeSandbox) {
      try {
        await globalThis.activeSandbox.kill();
        console.log('[kill-sandbox] Sandbox terminated successfully');
      } catch (error) {
        console.error('[kill-sandbox] Error terminating sandbox:', error);
      }
    }

    // Clean up global state
    globalThis.activeSandbox = null;
    globalThis.sandboxData = null;
    globalThis.sandboxState = {
      fileCache: null,
      sandbox: null,
      sandboxData: null
    };

    return NextResponse.json({
      success: true,
      message: 'Sandbox terminated successfully'
    });

  } catch (error: unknown) {
    console.error('[kill-sandbox] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to terminate sandbox',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}