import { NextResponse } from 'next/server';
import { Sandbox } from '@e2b/code-interpreter';
import '@/types/sandbox';
import { lovableConfig } from '@/config/lovable.config';

// Store active sandbox globally  
interface ExtendedSandbox {
  sandboxId: string;
  getHost?: (port: number) => string;
  kill(): Promise<void>;
  runCode(code: string, opts?: any): Promise<any>;
  [key: string]: any;
}

export async function POST() {
  let sandbox: ExtendedSandbox | null = null;

  try {
    console.log('[create-ai-sandbox] Creating base sandbox...');
    
    // Kill existing sandbox if any
    if (globalThis.activeSandbox) {
      console.log('[create-ai-sandbox] Killing existing sandbox...');
      try {
        await globalThis.activeSandbox.kill();
      } catch (e) {
        console.error('Failed to close existing sandbox:', e);
      }
      globalThis.activeSandbox = null;
    }
    
    // Clear existing files tracking
    if (globalThis.existingFiles) {
      globalThis.existingFiles.clear();
    } else {
      globalThis.existingFiles = new Set<string>();
    }

    // Create base sandbox - we'll set up Vite ourselves for full control
    console.log(`[create-ai-sandbox] Creating base E2B sandbox with ${lovableConfig.e2b.timeoutMinutes} minute timeout...`);
    const baseSandbox = await Sandbox.create({ 
      apiKey: process.env.E2B_API_KEY,
      timeoutMs: lovableConfig.e2b.timeoutMs
    });
    
    // Cast to our extended interface
    sandbox = baseSandbox as ExtendedSandbox;
    sandbox.sandboxId = baseSandbox.sandboxId || Date.now().toString();
    
    const sandboxId = sandbox.sandboxId;
    const host = baseSandbox.getHost?.(lovableConfig.e2b.vitePort) || 'localhost';
    
    console.log(`[create-ai-sandbox] Sandbox created: ${sandboxId}`);
    console.log(`[create-ai-sandbox] Sandbox host: ${host}`);

    // Set up a basic Vite React app using Python to write files
    console.log('[create-ai-sandbox] Setting up Vite React app...');
    
    // Write all files in a single Python script to avoid multiple executions
    const setupScript = `
import os
import json

print('Setting up React app with Vite and Tailwind...')

# Create directory structure
os.makedirs('/home/user/app/src', exist_ok=True)

# Package.json
package_json = {
    "name": "sandbox-app",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
        "dev": "vite --host",
        "build": "vite build",
        "preview": "vite preview"
    },
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
    },
    "devDependencies": {
        "@vitejs/plugin-react": "^4.0.0",
        "vite": "^4.3.9",
        "tailwindcss": "^3.3.0",
        "postcss": "^8.4.31",
        "autoprefixer": "^10.4.16"
    }
}

with open('/home/user/app/package.json', 'w') as f:
    json.dump(package_json, f, indent=2)
print('✓ package.json')

# Vite config for E2B - with allowedHosts
vite_config = """import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// E2B-compatible Vite configuration
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: false,
    allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1']
  }
})"""

with open('/home/user/app/vite.config.js', 'w') as f:
    f.write(vite_config)
print('✓ vite.config.js')

# Tailwind config - standard without custom design tokens
tailwind_config = """/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}"""

with open('/home/user/app/tailwind.config.js', 'w') as f:
    f.write(tailwind_config)
print('✓ tailwind.config.js')

# PostCSS config
postcss_config = """export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}"""

with open('/home/user/app/postcss.config.js', 'w') as f:
    f.write(postcss_config)
print('✓ postcss.config.js')

# Index.html
index_html = """<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sandbox App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>"""

with open('/home/user/app/index.html', 'w') as f:
    f.write(index_html)
print('✓ index.html')

# Main.jsx
main_jsx = """import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)"""

with open('/home/user/app/src/main.jsx', 'w') as f:
    f.write(main_jsx)
print('✓ src/main.jsx')

# App.jsx with explicit Tailwind test
app_jsx = """function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Welcome to Lovable
        </h1>
        <p className="text-lg text-gray-400">
          Sandbox Ready<br/>
          Start building your React app with Vite and Tailwind CSS!
        </p>
      </div>
    </div>
  )
}

export default App"""

with open('/home/user/app/src/App.jsx', 'w') as f:
    f.write(app_jsx)
print('✓ src/App.jsx')

# Index.css with explicit Tailwind directives
index_css = """@tailwind base;
@tailwind components;
@tailwind utilities;

/* Force Tailwind to load */
@layer base {
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
  }
}"""

with open('/home/user/app/src/index.css', 'w') as f:
    f.write(index_css)
print('✓ src/index.css')

print('✅ All files created successfully!')
`;

    // Execute setup script
    const result = await sandbox.runCode(setupScript, { language: 'python' });
    console.log('[create-ai-sandbox] Setup output:', result.results?.[0]?.text);
    
    if (result.error) {
      console.error('[create-ai-sandbox] Setup errors:', result.error);
    }

    // Install dependencies
    console.log('[create-ai-sandbox] Installing dependencies...');
    const installResult = await sandbox.runCode('cd /home/user/app && npm install', {
      language: 'bash',
      timeout: 120000
    });
    
    console.log('[create-ai-sandbox] Install output:', installResult.results?.[0]?.text);
    if (installResult.error) {
      console.log('[create-ai-sandbox] Install stderr:', installResult.error);
    }

    // Start Vite dev server
    console.log('[create-ai-sandbox] Starting Vite dev server...');
    const startResult = await sandbox.runCode('cd /home/user/app && npm run dev > vite.log 2>&1 &', {
      language: 'bash',
      timeout: 10000
    });
    
    console.log('[create-ai-sandbox] Vite start output:', startResult.results?.[0]?.text);

    // Wait for Vite to be ready
    await new Promise(resolve => setTimeout(resolve, lovableConfig.e2b.viteStartupDelay));

    // Store sandbox globally
    globalThis.activeSandbox = sandbox;
    globalThis.sandboxData = {
      sandboxId,
      url: host,
      port: lovableConfig.e2b.vitePort
    };

    console.log('[create-ai-sandbox] ✅ Sandbox created successfully');

    return NextResponse.json({
      success: true,
      sandboxId,
      url: host,
      port: lovableConfig.e2b.vitePort
    });

  } catch (error: unknown) {
    console.error('[create-ai-sandbox] Error:', error);
    
    // Clean up on error
    if (sandbox) {
      try {
        await sandbox.kill();
      } catch (e) {
        console.error('Failed to cleanup sandbox on error:', e);
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create sandbox',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}