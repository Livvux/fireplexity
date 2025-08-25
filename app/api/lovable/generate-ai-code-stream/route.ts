import { NextRequest, NextResponse } from 'next/server';
import '@/types/lovable-sandbox';
import { createGroq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { lovableConfig } from '@/config/lovable.config';

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});


export async function POST(request: NextRequest) {
  try {
    const { prompt, model = 'llama-3.1-8b-instant', context, isEdit = false } = await request.json();
    
    console.log('[generate-ai-code-stream] Received request:');
    console.log('[generate-ai-code-stream] - prompt:', prompt);
    console.log('[generate-ai-code-stream] - isEdit:', isEdit);
    console.log('[generate-ai-code-stream] - context.sandboxId:', context?.sandboxId);
    
    if (!prompt) {
      return NextResponse.json({ 
        success: false, 
        error: 'Prompt is required' 
      }, { status: 400 });
    }
    
    // Build context from current files
    let contextString = '';
    if (context?.currentFiles && Object.keys(context.currentFiles).length > 0) {
      contextString = '\n\nCurrent project files:\n';
      for (const [path, content] of Object.entries(context.currentFiles)) {
        if (typeof content === 'string' && content.length < 5000) {
          contextString += `\n--- ${path} ---\n${content}\n`;
        }
      }
    }

    // System prompt for code generation
    const systemPrompt = `You are an expert React developer using Vite and Tailwind CSS. Generate modern, clean, and functional React code.

${isEdit ? 'EDIT MODE: You are modifying existing code. Make targeted changes while preserving the overall structure.' : 'CREATION MODE: You are creating new components/features.'}

IMPORTANT GUIDELINES:
1. Use modern React patterns (functional components, hooks)
2. Use Tailwind CSS for styling with responsive design
3. Write clean, readable code with proper component structure
4. Always include proper imports and exports
5. Use TypeScript-style JSX where appropriate
6. Create complete, working components
7. For edits: make minimal necessary changes, preserve working functionality
8. For new features: create complete implementations

OUTPUT FORMAT:
Always wrap your code in \`\`\`jsx blocks and specify the filename.
Example:
\`\`\`jsx
// src/components/Header.jsx
import React from 'react';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4">
      <h1 className="text-2xl font-bold">My App</h1>
    </header>
  );
}
\`\`\`

${contextString}`;

    // Stream the AI response
    const result = await streamText({
      model: groq(model),
      system: systemPrompt,
      prompt: prompt,
      temperature: lovableConfig.ai.defaultTemperature,
    });

    return result.toTextStreamResponse();

  } catch (error: unknown) {
    console.error('[generate-ai-code-stream] Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate code',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}