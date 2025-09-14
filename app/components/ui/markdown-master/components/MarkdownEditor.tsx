import { useCallback, useEffect, useRef, useState } from 'react';

import { jetBrainsMono } from '../lib/fonts';

import { ResizablePanel } from '../../resizable';
import { Textarea } from '../../textarea';

import { useMarkdown } from '../context/MarkdownContext';

export interface WindowWithEditorScrollSync extends Window {
  editorScrollSyncMobile?: (scrollPercentage: number) => void;
  editorScrollSync?: (scrollPercentage: number) => void;
  previewScrollSync?: (scrollPercentage: number) => void;
}

export default function MarkdownEditor() {
  const { markdown, setMarkdown, replaceLatexDelimiters, setSelectedText, insertMarkdown } =
    useMarkdown();

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
      }, 50); // 50ms debounce for better responsiveness
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
      const previewElement = document.getElementById('markdown-preview-content');
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
    (window as WindowWithEditorScrollSync).editorScrollSync = handlePreviewScroll;

    return () => {
      delete (window as WindowWithEditorScrollSync).editorScrollSync;
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
      // Get selected text directly from textarea to ensure it's current
      const selectedContent = textarea.value.substring(start, end);
      setSelectedText(selectedContent);
    } else {
      // No selection - clear active formats
      setSelectedText('');
    }
  }; // Handle tab key to insert spaces instead of switching focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          insertMarkdown('bold');
          return;
        case 'i':
          e.preventDefault();
          insertMarkdown('italic');
          return;
        case 'u':
          e.preventDefault();
          insertMarkdown('underline');
          return;
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault(); // Prevent default tab behavior (focus switching)

      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '    '; // 4 spaces for tab

      // Insert spaces at cursor position or replace selection
      const newValue = localContent.substring(0, start) + spaces + localContent.substring(end);
      setLocalContent(newValue);
      debouncedSetMarkdown(newValue);

      // Move cursor to after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
      }, 0);
    }
  };

  return (
    <ResizablePanel defaultSize={50} minSize={30} className="lg:min-h-0 min-h-[45vh]">
      <div className="h-full w-full flex flex-col">
        <Textarea
          ref={textareaRef}
          value={localContent}
          onChange={handleContentChange}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          className={`flex-1 w-full min-h-0 p-3 border-none rounded-none resize-none focus:outline-none focus:ring-0 focus-visible:ring-0 ${jetBrainsMono.className} text-sm leading-relaxed custom-scrollbar touch-manipulation`}
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
