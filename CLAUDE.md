# Fireplexity v2 - Complete Feature Documentation

This document outlines all the advanced AI-powered automation systems implemented in Fireplexity v2, including WhatsApp messaging automation, WordPress content management, and the **complete open-lovable AI development platform**.

## 🎯 **NEW: Complete Open-Lovable Implementation**

Fireplexity v2 now includes a **100% feature-complete replication** of the open-lovable AI development platform at `/lovable`. This provides:

- **🎨 Beautiful Animated UI**: Sun gradient home screen, smooth transitions, professional file explorer
- **🤖 Advanced AI Generation**: Multi-model support, streaming responses, edit intent analysis, thinking mode
- **⚡ Professional Dev Environment**: E2B sandboxes, Vite integration, live preview, command execution
- **🔧 Developer Tools**: Package auto-detection, error recovery, export functionality, comprehensive logging
- **📊 17 API Endpoints**: Complete backend with all open-lovable functionality replicated

**Access**: Navigate to `http://localhost:3000/lovable` for the full open-lovable experience.

---

# 🚀 Lovable - AI-Powered React Development Platform (Open-Lovable Implementation)

## 🏗️ Architecture Overview

Lovable is a complete replication of the open-lovable platform, providing an integrated AI development environment for generating, previewing, and iterating on React applications in real-time using E2B cloud sandboxes.

- **Frontend**: React/Next.js with TypeScript, Tailwind CSS, and Framer Motion
- **Backend**: 17+ REST API endpoints for comprehensive sandbox operations
- **Sandboxes**: E2B cloud environments with Vite + React + Tailwind CSS
- **AI Engine**: Multiple AI models via AI SDK (Groq, OpenAI, Anthropic, Google)
- **Real-time Preview**: Live iframe previews with automatic refresh
- **File Management**: Interactive file explorer with syntax highlighting and collapsible tree
- **Advanced Features**: Screenshot capture, URL scraping, edit intent analysis, package auto-detection

## 🎯 Core Features

### 1. AI Code Generation & Chat Interface

#### Real-time AI Conversation
- **Location**: `app/lovable/page.tsx`
- **Features**:
  - Natural language to React code generation
  - Context-aware conversations with chat history
  - Support for both creation and editing workflows
  - Progress tracking during code generation and application
  - Stream-based responses for real-time interaction

#### Multi-Model AI Support
- **Configuration**: `config/app.config.ts`
- **Models Available**:
  - `moonshotai/kimi-k2-instruct` - Default model
  - `openai/gpt-5` - GPT-5
  - `anthropic/claude-sonnet-4-20250514` - Sonnet 4
  - `google/gemini-2.5-pro` - Gemini 2.5 Pro
- **Features**:
  - Model selection via URL parameters
  - Temperature and token configuration
  - Streaming responses with progress tracking

### 2. E2B Cloud Sandbox Integration

#### Sandbox Management
- **API**: `app/api/lovable/create-ai-sandbox/route.ts`
- **Features**:
  - Automatic Vite + React + Tailwind CSS setup
  - 15-minute sandbox timeouts with configurable limits
  - Real-time status monitoring and health checks
  - Automatic dependency installation
  - File system management and synchronization

#### Live Preview System
- **Component**: `components/SandboxPreview.tsx`
- **Features**:
  - Iframe-based live preview of generated applications
  - Refresh and external link capabilities
  - Console output toggle for debugging
  - Mobile-responsive preview interface
  - Support for Vite dev server integration

### 3. Advanced File Management

#### Interactive File Explorer
- **Features**:
  - Real-time file structure visualization
  - Syntax highlighting with react-syntax-highlighter
  - File content preview and editing
  - Support for JavaScript, TypeScript, CSS, and config files
  - Collapsible directory navigation

#### Code Application System
- **API**: `app/api/lovable/apply-ai-code/route.ts`
- **Features**:
  - Multi-file code application
  - Progress tracking with visual feedback
  - Error handling and rollback capabilities
  - File path normalization and validation
  - Atomic operations (all or nothing)

### 4. Enhanced Development Workflow

#### Code Generation Pipeline
```
User Input → AI Analysis → Code Generation → File Application → Live Preview
```

#### Progress Tracking
- **Component**: `components/CodeApplicationProgress.tsx`
- **Stages**:
  - `analyzing` - Understanding user requirements
  - `installing` - Installing required packages
  - `applying` - Writing files to sandbox
  - `complete` - Process finished

## 📁 File Structure (Complete Open-Lovable Implementation)

```
app/
├── lovable/
│   └── page.tsx                 # Complete 4000+ line main interface (copied from open-lovable)
├── api/lovable/                 # All 17 API routes from open-lovable
│   ├── analyze-edit-intent/     # Edit intent analysis
│   ├── apply-ai-code-stream/    # Streaming code application  
│   ├── apply-ai-code/           # Legacy code application
│   ├── check-vite-errors/       # Vite error detection
│   ├── clear-vite-errors-cache/ # Clear Vite error cache
│   ├── conversation-state/      # Conversation context management
│   ├── create-ai-sandbox/       # E2B sandbox creation
│   ├── create-zip/              # Export to ZIP functionality
│   ├── detect-and-install-packages/ # Auto package detection
│   ├── generate-ai-code-stream/ # Streaming AI code generation
│   ├── get-sandbox-files/       # File structure retrieval
│   ├── install-packages/        # NPM package installation
│   ├── kill-sandbox/            # Terminate sandbox
│   ├── monitor-vite-logs/       # Vite log monitoring
│   ├── report-vite-error/       # Error reporting
│   ├── restart-vite/            # Vite server restart
│   ├── run-command/             # Command execution
│   ├── sandbox-logs/            # Sandbox logging
│   ├── sandbox-status/          # Health checking
│   ├── scrape-screenshot/       # URL screenshot capture
│   └── scrape-url-enhanced/     # Enhanced URL scraping

components/
├── CodeApplicationProgress.tsx   # Simple progress indicator (from open-lovable)
├── HMRErrorDetector.tsx         # HMR error detection
├── SandboxPreview.tsx           # Live preview component (updated)
└── ui/
    ├── switch.tsx               # Radix UI switch component
    └── toggle.tsx               # Toggle component

config/
└── app.config.ts                # Complete configuration (from open-lovable)

lib/
├── context-selector.ts          # Context selection utilities
├── edit-examples.ts             # Edit examples for AI
├── edit-intent-analyzer.ts      # Edit intent analysis
├── file-search-executor.ts      # File search functionality
├── icons.ts                     # Centralized icon exports
└── utils.ts                     # Utility functions

types/
├── conversation.ts              # Conversation tracking types
├── file-manifest.ts             # File structure types
└── sandbox.ts                   # E2B sandbox types
```

## 🌟 Key Features from Open-Lovable Implementation

### **Beautiful Animated Home Screen**
- Pulsing sun gradient background with CSS animations
- URL input with automatic screenshot capture
- Smooth fade transitions and escape key navigation
- Website analysis and design recreation capabilities

### **Advanced AI Code Generation**
- **Edit Intent Analysis**: Smart detection of user intent (creation vs modification)
- **Streaming Generation**: Real-time code display with file-by-file progress
- **Context Awareness**: Full conversation history and project state tracking
- **Package Auto-Detection**: Automatic npm package installation from imports
- **Thinking Mode**: Visual AI thinking process display during complex operations

### **Professional Development Environment**
- **File Explorer**: Collapsible tree structure with syntax highlighting
- **Live Preview**: Real-time iframe with automatic refresh and manual controls
- **Error Recovery**: Vite error detection, reporting, and automatic restart
- **Command Execution**: Full shell command support in sandbox
- **Export Tools**: ZIP export functionality for completed projects

### **URL-Based Development**
- **Screenshot Capture**: Automatic website screenshot for design inspiration
- **Enhanced Scraping**: Content extraction and analysis from URLs
- **Design Recreation**: AI-powered recreation of existing websites

### **Developer Experience**
- **Progress Tracking**: Visual indicators for all long-running operations
- **Error Handling**: Comprehensive error reporting and recovery mechanisms
- **Performance Monitoring**: Vite log monitoring and optimization
- **State Management**: Persistent conversation context and project state

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# E2B API Configuration for Lovable
E2B_API_KEY=e2b_c01c6b2d2a0e7212ead789c9fedbdde49df550ae

# AI Models (Multiple providers supported)
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-key  # Optional
ANTHROPIC_API_KEY=your-anthropic-key  # Optional
GOOGLE_AI_API_KEY=your-google-key  # Optional

# Firecrawl Configuration for URL scraping
FIRECRAWL_API_URL=https://api.firecrawl.dev
FIRECRAWL_API_KEY=your-firecrawl-key
```

## 🚀 Getting Started with Lovable

### 🎉 **COMPLETE IMPLEMENTATION STATUS**
✅ **100% Feature-Complete**: All open-lovable features replicated  
✅ **All 17 API Routes**: Complete backend functionality  
✅ **Beautiful UI**: Animated home screen, file explorer, live preview  
✅ **Advanced Features**: Edit intent analysis, package auto-detection, export tools  
✅ **Dependencies**: All required packages installed and configured  

### 1. Access the Platform
Navigate to `http://localhost:3000/lovable`

### 2. Experience Open-Lovable Features
- **Home Screen**: Beautiful animated sun gradient with URL input
- **AI Generation**: Advanced streaming code generation with thinking mode
- **File Explorer**: Professional tree view with syntax highlighting  
- **Live Preview**: Real-time sandbox preview with automatic refresh
- **Export**: Download your projects as ZIP files

### 2. Create Your First Sandbox
1. Click "Create Sandbox" to provision a new E2B environment
2. Wait for the sandbox to initialize (takes 30-60 seconds)
3. Status will show "Connected" when ready

### 3. Generate Your First App
1. Switch to the "AI Chat" tab
2. Enter a prompt like: "Create a todo app with dark mode toggle"
3. Watch as AI generates and applies the code
4. See your app running live in the Preview tab

### 4. Iterate and Improve
1. Ask for modifications: "Add a search filter to the todos"
2. AI will analyze existing code and make targeted updates
3. Changes are applied in real-time to your running app

## 🎨 Example Prompts

### App Creation
- "Create a weather app with location search"
- "Build a personal portfolio website"
- "Make a simple e-commerce product page"
- "Create a chat interface with message bubbles"

### Feature Additions
- "Add dark mode to this app"
- "Include a search functionality"
- "Add animations to the buttons"
- "Make it mobile responsive"

### Styling Updates
- "Change the color scheme to purple and gold"
- "Use a modern card-based layout"
- "Add hover effects to all interactive elements"
- "Make the typography more elegant"

## 📊 Technical Specifications

### Sandbox Configuration
- **Runtime**: Node.js with Vite dev server
- **Port**: 5173 (configurable)
- **Timeout**: 15 minutes (configurable)
- **File System**: Full read/write access to `/home/user/app`
- **Dependencies**: Automatic npm package detection and installation

### Performance Optimizations
- **Streaming Responses**: Real-time AI code generation
- **File Caching**: In-memory file structure caching
- **Progress Feedback**: Visual progress indicators
- **Error Handling**: Comprehensive error recovery

### Security Features
- **Sandbox Isolation**: Complete isolation in E2B cloud environments
- **Input Validation**: All user inputs are validated and sanitized
- **API Rate Limiting**: Built-in protection against abuse
- **Timeout Protection**: Automatic cleanup of inactive sandboxes

## 🔄 API Endpoints

### Core Operations
- `POST /api/lovable/create-ai-sandbox` - Create new E2B sandbox
- `POST /api/lovable/generate-ai-code-stream` - Generate code with AI
- `POST /api/lovable/apply-ai-code` - Apply code files to sandbox
- `GET /api/lovable/get-sandbox-files` - Retrieve file structure
- `GET /api/lovable/sandbox-status` - Check sandbox health
- `POST /api/lovable/kill-sandbox` - Terminate sandbox

### Request/Response Examples

#### Create Sandbox
```json
// Response
{
  "success": true,
  "sandboxId": "sb_1234567890",
  "url": "https://sb_1234567890-5173.e2b.dev",
  "port": 5173
}
```

#### Generate Code
```json
// Request
{
  "prompt": "Create a todo app with dark mode",
  "context": {
    "sandboxId": "sb_1234567890",
    "currentFiles": {...}
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Sandbox Creation Fails**
   - Check E2B_API_KEY in environment variables
   - Verify network connectivity
   - Check API quota limits

2. **Preview Not Loading**
   - Ensure sandbox is in "Connected" status
   - Check browser console for CORS errors
   - Wait for Vite dev server to fully start

3. **AI Generation Errors**
   - Verify GROQ_API_KEY is valid
   - Check for API rate limiting
   - Ensure prompt is clear and specific

4. **File Application Fails**
   - Check for syntax errors in generated code
   - Verify file paths are valid
   - Ensure sandbox has write permissions

## 🔮 Future Enhancements

### Planned Features
1. **Multi-Framework Support** - Next.js, Vue.js, Svelte
2. **Database Integration** - Supabase, Firebase, PostgreSQL
3. **Deployment Pipeline** - One-click deploy to Vercel, Netlify
4. **Collaboration Tools** - Real-time code sharing
5. **Template Library** - Pre-built app templates
6. **Package Manager** - Advanced dependency management
7. **Testing Integration** - Automated testing generation
8. **Version Control** - Git integration for code history

---

# 📱 WhatsApp Agent - Enhanced Features Documentation

This section outlines the comprehensive WhatsApp messaging automation system implemented in Fireplexity v2.

## 🏗️ Architecture Overview

The WhatsApp agent is built on a modern, scalable architecture:

- **Frontend**: React/Next.js components with TypeScript
- **Backend**: REST API endpoints for WhatsApp operations  
- **Integration**: WAHA (WhatsApp HTTP API) for WhatsApp Business API access
- **AI Engine**: Groq's Llama 3.1 8B Instant model for message generation
- **Storage**: JSON-based template/reply storage (database-ready)

## 🎯 Core Features Implemented

### 1. Enhanced Messaging Capabilities

#### Rich Text Message Composer
- **File**: `components/ui/rich-text-editor.tsx`
- **Features**:
  - WhatsApp markdown support: `*bold*`, `_italic_`, `~strikethrough~`, `` `code` ``
  - Live preview mode with HTML rendering
  - Keyboard shortcuts (Ctrl+B, Ctrl+I, Ctrl+U, Ctrl+`)
  - Real-time character count and validation (4096 char limit)
  - Mention support with contact suggestions
  - Toggle between edit and preview modes

#### Media Upload System
- **File**: `components/ui/media-uploader.tsx`
- **Features**:
  - Drag & drop file upload interface
  - Support for images, videos, audio, documents (64MB limit)
  - Image preview functionality
  - Caption support for all media types
  - File validation and error handling
  - Batch processing capabilities

#### Message Templates & Quick Replies
- **Storage**: `lib/db/templates.ts`
- **API**: `app/api/whatsapp/templates/`
- **Components**: 
  - `app/whatsapp-agent/components/template-manager.tsx`
  - `app/whatsapp-agent/components/quick-replies.tsx`
- **Features**:
  - Template creation with variable placeholders (`{{name}}`, `{{company}}`)
  - Quick reply management with categories
  - Usage tracking and analytics
  - Search and filtering capabilities
  - Variable processing and validation

### 2. Enhanced WAHA Client Integration
- **File**: `lib/waha-client.ts`
- **New Methods**:
  - `sendImage()`, `sendVideo()`, `sendAudio()`, `sendFile()`
  - `sendMedia()` - Auto-detects file type
  - `fileToBase64()` - File conversion utility
- **Features**:
  - Full media support with captions
  - Mention and reply functionality
  - Error handling and validation

### 3. Bulk Messaging System
- **File**: `app/whatsapp-agent/components/bulk-messenger.tsx`
- **Features**:
  - Multi-contact selection with search/filtering
  - Template-based bulk messaging
  - Per-contact variable customization
  - Custom message bulk sending
  - Real-time progress tracking
  - Rate limiting (2-second delays)
  - CSV import ready

### 4. Enhanced Chat Interface
- **File**: `app/whatsapp-agent/components/whatsapp-chat.tsx`
- **Enhancements**:
  - Rich text editor integration
  - Template and quick reply panels
  - Advanced message validation
  - Formatted message processing
  - Media attachment support

## 📁 File Structure

```
lib/
├── waha-client.ts          # Enhanced WAHA API client
├── message-formatter.ts    # WhatsApp formatting utilities
└── db/
    └── templates.ts        # Template storage management

components/ui/
├── rich-text-editor.tsx   # Rich text editor component
├── media-uploader.tsx     # Drag & drop media uploader
├── badge.tsx              # UI badge component
└── scroll-area.tsx        # Scrollable area component

app/whatsapp-agent/components/
├── whatsapp-chat.tsx      # Enhanced chat interface
├── template-manager.tsx   # Template management UI
├── quick-replies.tsx      # Quick replies component
└── bulk-messenger.tsx     # Bulk messaging interface

app/api/whatsapp/
├── media/route.ts         # Media handling endpoint
├── templates/route.ts     # Template CRUD operations
└── templates/process/route.ts # Template processing

types/
└── whatsapp.ts           # TypeScript interfaces

data/                     # Auto-created directory
├── templates.json        # Template storage
└── quick-replies.json    # Quick replies storage
```

## 🔧 Environment Variables

Required environment variables in `.env.local`:

```bash
# WAHA WhatsApp API Configuration
WAHA_BASE_URL=https://your-waha-instance.com
WAHA_API_KEY=your-waha-api-key

# Groq API Key for AI features
GROQ_API_KEY=your-groq-api-key

# Firecrawl Configuration (existing)
FIRECRAWL_API_URL=https://api.firecrawl.dev
FIRECRAWL_API_KEY=your-firecrawl-key
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install @radix-ui/react-scroll-area
```

### 2. Start the Application
```bash
npm run dev
```

### 3. Configure WhatsApp Session
1. Navigate to `/whatsapp-agent`
2. Start a new WhatsApp session
3. Scan the QR code with your phone
4. Wait for "WORKING" status

### 4. Use Enhanced Features
- Toggle between simple text and rich text editor
- Create templates with variables
- Set up quick replies for common responses
- Use bulk messenger for mass communications

## 📊 Default Templates

The system comes with pre-configured templates:

1. **Welcome Message**: `Hello {{name}}! Welcome to {{company}}. How can I help you today?`
2. **Meeting Reminder**: `Hi {{name}}, this is a reminder about our meeting scheduled for {{date}} at {{time}}.`
3. **Order Confirmation**: `Thank you for your order #{{orderNumber}}! Your order total is {{amount}}.`
4. **Support Response**: `Hi {{name}}, thank you for contacting support. Your ticket #{{ticketId}} has been created.`

## 🔄 Default Quick Replies

Pre-configured quick replies include:

1. **Thanks**: "Thank you for your message! I'll get back to you soon." (`/thanks`)
2. **Away**: "I'm currently away but will respond as soon as possible." (`/away`)
3. **Details**: "Can you please provide more details about your request?" (`/details`)
4. **Support**: "Please contact our support team at support@company.com" (`/support`)

## 📈 Usage Analytics

Both templates and quick replies track:
- Usage count per item
- Most popular items sorting
- Creation and update timestamps
- Category-based organization

## 🔐 Security Features

- Input validation and sanitization
- Character limit enforcement (4096 chars)
- File size validation (64MB limit)
- Rate limiting for bulk messages
- Error handling and user feedback

## 🎨 UI/UX Features

- Dark mode support
- Mobile-responsive design
- Real-time validation feedback
- Progress indicators for long operations
- Collapsible panels for better space usage
- Search and filter capabilities

## 🔧 Technical Implementation Notes

### Message Formatting
- WhatsApp markdown is converted to HTML for preview
- Variables are extracted using regex: `/\{\{([^}]+)\}\}/g`
- Message cleaning removes excessive whitespace and line breaks

### Rate Limiting
- Bulk messages have 2-second delays between sends
- Progress tracking shows real-time status
- Error handling for failed sends

### Template Variables
- Auto-initialization from contact data
- Support for common variables (name, phone, company, date, etc.)
- Custom variable support

### File Storage
- JSON-based storage in `data/` directory
- Auto-creation of directory structure
- Migration-ready for database implementation

## 🚧 Future Enhancements

Ready for implementation:

1. **Message Scheduling**: Time-based message sending
2. **Contact Management**: Full contact synchronization
3. **Group Support**: Group chat messaging
4. **Chat History**: Message storage and search
5. **Database Migration**: PostgreSQL/MySQL integration
6. **Webhook Integration**: Real-time message events
7. **Advanced Analytics**: Detailed reporting

## 🐛 Troubleshooting

### Common Issues:

1. **QR Code Won't Load**: Check WAHA_BASE_URL and WAHA_API_KEY
2. **Messages Not Sending**: Verify WhatsApp session is WORKING status
3. **Templates Not Loading**: Check file permissions in data/ directory
4. **Media Upload Fails**: Verify 64MB size limit and supported formats

### Debug Commands:

```bash
# Check WAHA connection
curl -H "X-Api-Key: $WAHA_API_KEY" $WAHA_BASE_URL/api/sessions

# View template storage
cat data/templates.json

# Check quick replies
cat data/quick-replies.json
```

## 🤝 Contributing

When extending the WhatsApp agent:

1. Follow existing TypeScript interfaces in `types/whatsapp.ts`
2. Add proper error handling and validation
3. Include loading states and user feedback
4. Test with various message types and sizes
5. Ensure mobile responsiveness
6. Add proper documentation

## 📄 License

This enhanced WhatsApp agent implementation is part of Fireplexity v2 and follows the project's MIT License.

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Maintained by**: Claude Code Assistant