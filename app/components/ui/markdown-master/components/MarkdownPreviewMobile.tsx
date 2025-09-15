import { useCallback, useEffect, useRef, useState } from 'react';

import styles from '~/ProblemPage.module.css';
import { processMarkdownToHtml } from '~/lib/markdown-processor';
import 'katex/dist/katex.min.css';

import { ResizablePanel } from '~/components/ui/resizable';

import { useMarkdown } from '../context/MarkdownContext';

// Add at the top, after imports
declare global {
  interface Window {
    editorScrollSyncMobile?: (scrollPercentage: number) => void;
    previewScrollSyncMobile?: (scrollPercentage: number) => void;
  }
}

export default function MarkdownPreviewMobile() {
  const { markdown } = useMarkdown();
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrollingSelf = useRef<boolean>(false);
  const lastScrollTop = useRef<number>(0);
  const [rendered, setRendered] = useState<string>('');

  // Handle synchronized scrolling with smooth animation
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isScrollingSelf.current) return; // Prevent feedback loop

    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 0) return; // No scrollable content

    const scrollPercentage = scrollTop / maxScroll;
    lastScrollTop.current = scrollTop;

    // Use requestAnimationFrame for smooth scrolling
    requestAnimationFrame(() => {
      if (window.editorScrollSyncMobile) {
        window.editorScrollSyncMobile(scrollPercentage);
      }
    });
  }, []);

  // Listen for editor scroll events
  useEffect(() => {
    const handleEditorScroll = (scrollPercentage: number) => {
      if (!previewRef.current || isScrollingSelf.current) return;

      isScrollingSelf.current = true;
      const container = previewRef.current;
      const maxScroll = container.scrollHeight - container.clientHeight;

      if (maxScroll > 0) {
        const targetScrollTop = maxScroll * scrollPercentage;
        container.scrollTo({
          top: targetScrollTop,
          behavior: 'instant',
        });
      }

      // Reset flag after scroll completes
      setTimeout(() => {
        isScrollingSelf.current = false;
      }, 50);
    };

    // Store the function reference for cleanup
    window.previewScrollSyncMobile = handleEditorScroll;

    return () => {
      delete window.previewScrollSyncMobile;
    };
  }, []);

  // Render markdown to HTML when it changes
  useEffect(() => {
    let cancelled = false;
    async function renderMarkdown() {
      try {
        const rendered = await processMarkdownToHtml(markdown ?? '');
        if (!cancelled) setRendered(rendered);
      } catch {
        if (!cancelled) setRendered('<p>Failed to render markdown</p>');
      }
    }
    renderMarkdown();
    return () => {
      cancelled = true;
    };
  }, [markdown]);

  return (
    <ResizablePanel defaultSize={35} minSize={25} className="min-h-0">
      <div className="h-full w-full flex flex-col">
        <div
          ref={previewRef}
          id="markdown-preview-content-mobile"
          className="flex-1 h-full overflow-auto custom-scrollbar p-3 sm:p-4 touch-manipulation"
          onScroll={handleScroll}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div
            className={`markdown-body max-w-none prose prose-sm ${styles.problemProse} content-description`}
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        </div>
      </div>
    </ResizablePanel>
  );
}
