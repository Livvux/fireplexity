import { NextResponse } from 'next/server';
import type { SandboxState } from '@/types/sandbox';

declare global {
  var sandboxState: SandboxState;
  var activeSandbox: any;
}

export async function GET() {
  try {
    const sandbox = global.activeSandbox;
    if (!sandbox) {
      return NextResponse.json({
        success: false,
        error: 'No active sandbox'
      }, { status: 400 });
    }

    console.log('[get-sandbox-files] Fetching file structure...');

    // Get directory structure
    const treeScript = `
import os
import json

def get_file_tree(path, prefix="", max_depth=3, current_depth=0):
    if current_depth > max_depth:
        return []
    
    items = []
    try:
        entries = sorted(os.listdir(path))
        for entry in entries:
            # Skip node_modules, .git, and other unnecessary directories
            if entry in ['node_modules', '.git', 'dist', 'build', '.next', '.vite']:
                continue
                
            full_path = os.path.join(path, entry)
            relative_path = full_path.replace('/home/user/app/', '')
            
            if os.path.isdir(full_path):
                items.append({
                    "name": entry,
                    "type": "directory",
                    "path": relative_path,
                    "children": get_file_tree(full_path, prefix + "  ", max_depth, current_depth + 1)
                })
            else:
                # Get file size
                try:
                    size = os.path.getsize(full_path)
                except:
                    size = 0
                
                items.append({
                    "name": entry,
                    "type": "file",
                    "path": relative_path,
                    "size": size
                })
    except PermissionError:
        pass
    
    return items

# Get the tree structure
tree = get_file_tree('/home/user/app')
print(json.dumps(tree, indent=2))
`;

    const treeResult = await sandbox.runCode('python', treeScript);
    
    let fileStructure = [];
    try {
      fileStructure = JSON.parse(treeResult.stdout);
    } catch (e) {
      console.error('[get-sandbox-files] Failed to parse tree structure:', e);
      fileStructure = [];
    }

    // Get content of key files
    const files: Record<string, string> = {};
    
    // Helper function to get file content
    const getFileContent = async (relativePath: string): Promise<string | null> => {
      try {
        const fullPath = `/home/user/app/${relativePath}`;
        const readResult = await sandbox.runCode('python', `
with open('${fullPath}', 'r', encoding='utf-8') as f:
    content = f.read()
print(repr(content))
        `);
        
        if (readResult.stdout) {
          // Parse the repr() output to get the actual content
          const content = readResult.stdout.trim();
          if (content.startsWith("'") && content.endsWith("'")) {
            return content.slice(1, -1).replace(/\\'/g, "'").replace(/\\n/g, "\n").replace(/\\\\/g, "\\");
          }
        }
        return null;
      } catch (e) {
        return null;
      }
    };

    // Recursively collect file contents for important files
    const collectFiles = async (items: any[], prefix = '') => {
      for (const item of items) {
        if (item.type === 'file') {
          const path = item.path;
          // Only read text files and important configs
          if (path.match(/\.(jsx?|tsx?|css|json|md|html|txt)$/i) || 
              path.includes('package.json') ||
              path.includes('vite.config') ||
              path.includes('tailwind.config')) {
            
            const content = await getFileContent(path);
            if (content !== null) {
              files[path] = content;
            }
          }
        } else if (item.type === 'directory' && item.children) {
          await collectFiles(item.children, prefix + item.name + '/');
        }
      }
    };

    await collectFiles(fileStructure);

    console.log(`[get-sandbox-files] Retrieved ${Object.keys(files).length} files`);

    // Update global file cache
    if (!global.sandboxState) {
      global.sandboxState = {
        fileCache: null,
        sandbox: sandbox,
        sandboxData: global.sandboxData
      };
    }

    global.sandboxState.fileCache = {
      files: Object.fromEntries(
        Object.entries(files).map(([path, content]) => [
          path,
          { content, lastModified: Date.now() }
        ])
      ),
      lastSync: Date.now(),
      sandboxId: global.sandboxData?.sandboxId || 'unknown'
    };

    return NextResponse.json({
      success: true,
      fileStructure,
      files,
      totalFiles: Object.keys(files).length
    });

  } catch (error: any) {
    console.error('[get-sandbox-files] Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get sandbox files',
      details: error.message
    }, { status: 500 });
  }
}