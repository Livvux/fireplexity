import { NextRequest, NextResponse } from 'next/server';
import '@/types/sandbox'; // Import global types

interface FileChange {
  path: string;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { files }: { files: FileChange[] } = await request.json();
    
    console.log('[apply-ai-code] Applying files:', files.map(f => f.path));
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files provided'
      }, { status: 400 });
    }
    
    const sandbox = global.activeSandbox;
    if (!sandbox) {
      return NextResponse.json({
        success: false,
        error: 'No active sandbox'
      }, { status: 400 });
    }

    const appliedFiles: string[] = [];
    const errors: string[] = [];

    // Apply each file
    for (const file of files) {
      try {
        let filePath = file.path;
        
        // Normalize path - ensure it's in the app directory
        if (!filePath.startsWith('/home/user/app/')) {
          if (filePath.startsWith('./') || filePath.startsWith('src/')) {
            filePath = `/home/user/app/${filePath.replace('./', '')}`;
          } else if (filePath.startsWith('/')) {
            filePath = `/home/user/app${filePath}`;
          } else {
            filePath = `/home/user/app/${filePath}`;
          }
        }

        console.log(`[apply-ai-code] Writing file: ${filePath}`);
        
        // Create directory if it doesn't exist
        const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
        await sandbox.runCode(`mkdir -p "${dirPath}"`, { language: 'bash' });
        
        // Write the file
        const writeScript = `
import os

# Write file content
with open('${filePath}', 'w', encoding='utf-8') as f:
    f.write('''${file.content.replace(/'/g, "\\'")}''')

print(f"✓ Written {os.path.getsize('${filePath}')} bytes to ${filePath}")
`;
        
        const result = await sandbox.runCode(writeScript, { language: 'python' });
        
        if (result.error) {
          console.error(`[apply-ai-code] Error writing ${filePath}:`, result.error);
          errors.push(`${filePath}: ${result.error}`);
        } else {
          console.log(`[apply-ai-code] Successfully wrote ${filePath}`);
          appliedFiles.push(filePath);
        }
        
      } catch (error: unknown) {
        console.error(`[apply-ai-code] Exception writing ${file.path}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`${file.path}: ${errorMessage}`);
      }
    }

    // Update file cache if exists
    if (global.sandboxState?.fileCache) {
      for (const file of files) {
        const normalizedPath = file.path.startsWith('/') ? file.path : `/home/user/app/${file.path}`;
        global.sandboxState.fileCache.files[normalizedPath] = {
          content: file.content,
          lastModified: Date.now()
        };
      }
      global.sandboxState.fileCache.lastSync = Date.now();
    }

    console.log(`[apply-ai-code] Applied ${appliedFiles.length} files successfully`);
    if (errors.length > 0) {
      console.log(`[apply-ai-code] ${errors.length} errors occurred:`, errors);
    }

    return NextResponse.json({
      success: true,
      appliedFiles,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: unknown) {
    console.error('[apply-ai-code] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to apply code changes',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}