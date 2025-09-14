import { useCallback, useEffect, useRef, useState } from 'react';

import { ResizablePanel } from '~/components/ui/resizable';
import { Textarea } from '~/components/ui/textarea';

import { useMarkdown } from '../context/MarkdownContext';
import { type WindowWithEditorScrollSync } from './MarkdownEditor';

export default function MarkdownEditorMobile() {
  const { markdown, setMarkdown, replaceLatexDelimiters, setSelectedText } = useMarkdown();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localContent, setLocalContent] = useState(markdown);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingSelf = useRef<boolean>(false);
  const lastScrollTop = useRef<number>(0);

  // Debounced update to main markdown state
  const debouncedSetMarkdown = useCallback(
    (value: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        setMarkdown(replaceLatexDelimiters(value));
      }, 150); // 150ms debounce
    },
    [setMarkdown, replaceLatexDelimiters]
  );

  // Handle content change with local state for immediate UI update
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalContent(newValue); // Immediate UI update
    debouncedSetMarkdown(newValue); // Debounced state update
  };

  // Sync local content when markdown changes from outside (e.g., AI, load document)
  useEffect(() => {
    setLocalContent(markdown);
  }, [markdown]);

  // Handle synchronized scrolling with smooth animation
  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (isScrollingSelf.current) return; // Prevent feedback loop

    const textarea = e.currentTarget;
    const scrollTop = textarea.scrollTop;
    const scrollHeight = textarea.scrollHeight;
    const clientHeight = textarea.clientHeight;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 0) return; // No scrollable content

    const scrollPercentage = scrollTop / maxScroll;
    lastScrollTop.current = scrollTop;

    // Use requestAnimationFrame for smooth scrolling
    requestAnimationFrame(() => {
      const previewElement = document.getElementById('markdown-preview-content-mobile');
      if (previewElement) {
        const previewMaxScroll = previewElement.scrollHeight - previewElement.clientHeight;
        if (previewMaxScroll > 0) {
          previewElement.scrollTo({
            top: previewMaxScroll * scrollPercentage,
            behavior: 'instant', // Use instant to prevent jarring
          });
        }
      }
    });
  }, []);

  // Listen for preview scroll events
  useEffect(() => {
    const handlePreviewScroll = (scrollPercentage: number) => {
      if (!textareaRef.current || isScrollingSelf.current) return;

      isScrollingSelf.current = true;
      const textarea = textareaRef.current;
      const maxScroll = textarea.scrollHeight - textarea.clientHeight;

      if (maxScroll > 0) {
        const targetScrollTop = maxScroll * scrollPercentage;
        textarea.scrollTo({
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
    (window as WindowWithEditorScrollSync).editorScrollSyncMobile = handlePreviewScroll;

    return () => {
      delete (window as WindowWithEditorScrollSync).editorScrollSyncMobile;
    };
  }, []);

  // Cleanup debounce timeout
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Handle text selection in the editor
  const handleSelect = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selectedContent = localContent.substring(start, end);
      setSelectedText(selectedContent);
    }
  };

  return (
    <ResizablePanel defaultSize={65} minSize={40} className="min-h-0">
      <div className="h-full w-full flex flex-col">
        <Textarea
          ref={textareaRef}
          value={localContent}
          onChange={handleContentChange}
          onSelect={handleSelect}
          onScroll={handleScroll}
          className="flex-1 w-full h-full p-3 border-none rounded-none resize-none focus:outline-none focus:ring-0 focus-visible:ring-0 font-mono text-sm leading-relaxed custom-scrollbar touch-manipulation"
          placeholder="Enter your markdown here..."
          style={{
            minHeight: 0,
            height: '100%',
            WebkitTapHighlightColor: 'transparent',
          }}
        />
      </div>
    </ResizablePanel>
  );
}
