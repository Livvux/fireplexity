'use client'

import React, { useMemo, useCallback } from 'react'
import Streamdown from 'streamdown'
import { CitationTooltip } from './citation-tooltip-portal'
import { SearchResult } from './types'

type ComponentProps = { children?: React.ReactNode; [key: string]: any };

interface MarkdownRendererProps {
  content: string
  sources?: SearchResult[]
}

export function MarkdownRenderer({ content, sources }: MarkdownRendererProps) {
  // Process content to convert citations to clickable elements
  const processedContent = useMemo(() => {
    return content
      // Replace CITATION_1 with [1]
      .replace(/\bCITATION_(\d+)\b/g, '___CITATION_$1___')
      // Replace ___CITATION_1___ with [1] if not already done
      .replace(/___CITATION_(\d+)___/g, '[$1]')
  }, [content])

  // Process children to convert [1] to citation elements  
  const processChildren = useCallback((children: unknown): unknown => {
    if (typeof children === 'string') {
      const parts = children.split(/(\[\d+\])/g)
      return parts.map((part, index) => {
        const match = part.match(/\[(\d+)\]/)
        if (match) {
          return (
            <sup
              key={`citation-${match[1]}-${index}`}
              className="citation text-orange-600 cursor-pointer hover:text-orange-700 text-[0.65rem] ml-0.5"
              data-citation={match[1]}
            >
              [{match[1]}]
            </sup>
          )
        }
        return part
      })
    }
    
    if (Array.isArray(children)) {
      return children.map((child) => {
        if (typeof child === 'string') {
          return processChildren(child)
        }
        return child
      })
    }
    
    return children
  }, [])

  // Custom components for markdown rendering
  const components = useMemo(() => ({
    p: ({ children, ...props }: ComponentProps) => (
      <p className="mb-4 last:mb-0" {...props}>
        {processChildren(children as React.ReactNode) as React.ReactNode}
      </p>
    ),
    ul: ({ children }: ComponentProps) => (
      <ul className="mb-4 last:mb-0">{children}</ul>
    ),
    ol: ({ children }: ComponentProps) => (
      <ol className="mb-4 last:mb-0">{children}</ol>
    ),
    li: ({ children, ...props }: ComponentProps) => (
      <li {...props}>{processChildren(children as React.ReactNode) as React.ReactNode}</li>
    ),
    h1: ({ children }: ComponentProps) => (
      <h1 className="text-xl font-semibold mb-3 mt-6 first:mt-0">{children}</h1>
    ),
    h2: ({ children }: ComponentProps) => (
      <h2 className="text-lg font-semibold mb-3 mt-6 first:mt-0">{children}</h2>
    ),
    h3: ({ children }: ComponentProps) => (
      <h3 className="text-base font-semibold mb-2 mt-4 first:mt-0">{children}</h3>
    ),
    code: ({ children, className }: ComponentProps) => {
      const inline = !className?.includes('language-')
      return inline ? (
        <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded text-sm">{children}</code>
      ) : (
        <code className={className}>{children}</code>
      )
    },
    strong: ({ children, ...props }: ComponentProps) => (
      <strong {...props}>{processChildren(children as React.ReactNode) as React.ReactNode}</strong>
    ),
    em: ({ children, ...props }: ComponentProps) => (
      <em {...props}>{processChildren(children as React.ReactNode) as React.ReactNode}</em>
    ),
  }), [processChildren])

  return (
    <>
      <Streamdown
        parseIncompleteMarkdown={true}
        components={components}
      >
        {processedContent}
      </Streamdown>
      {sources && sources.length > 0 && <CitationTooltip sources={sources} />}
    </>
  )
}