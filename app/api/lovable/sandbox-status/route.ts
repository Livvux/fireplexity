import { NextResponse } from 'next/server';
import '@/types/lovable-sandbox';

export async function GET() {
  try {
    if (!globalThis.activeSandbox || !globalThis.sandboxData) {
      return NextResponse.json({
        success: true,
        status: 'inactive',
        sandbox: null
      });
    }

    // Check if sandbox is still alive
    try {
      const result = await globalThis.activeSandbox.runCode('python', 'print("alive")', {
        timeout: 5000
      });
      
      if (result.stdout.includes('alive')) {
        return NextResponse.json({
          success: true,
          status: 'active',
          sandbox: {
            sandboxId: globalThis.sandboxData.sandboxId,
            url: globalThis.sandboxData.url,
            port: globalThis.sandboxData.port
          }
        });
      }
    } catch (error) {
      console.log('[sandbox-status] Sandbox appears to be dead:', error);
    }

    // Sandbox is dead, clean up
    globalThis.activeSandbox = null;
    globalThis.sandboxData = null;

    return NextResponse.json({
      success: true,
      status: 'inactive',
      sandbox: null
    });

  } catch (error: unknown) {
    console.error('[sandbox-status] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check sandbox status',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}