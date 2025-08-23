import { NextResponse } from 'next/server';

declare global {
  var activeSandbox: any;
  var sandboxData: any;
}

export async function GET() {
  try {
    if (!global.activeSandbox || !global.sandboxData) {
      return NextResponse.json({
        success: true,
        status: 'inactive',
        sandbox: null
      });
    }

    // Check if sandbox is still alive
    try {
      const result = await global.activeSandbox.runCode('python', 'print("alive")', {
        timeout: 5000
      });
      
      if (result.stdout.includes('alive')) {
        return NextResponse.json({
          success: true,
          status: 'active',
          sandbox: {
            sandboxId: global.sandboxData.sandboxId,
            url: global.sandboxData.url,
            port: global.sandboxData.port
          }
        });
      }
    } catch (error) {
      console.log('[sandbox-status] Sandbox appears to be dead:', error);
    }

    // Sandbox is dead, clean up
    global.activeSandbox = null;
    global.sandboxData = null;

    return NextResponse.json({
      success: true,
      status: 'inactive',
      sandbox: null
    });

  } catch (error: any) {
    console.error('[sandbox-status] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check sandbox status',
      details: error.message
    }, { status: 500 });
  }
}