import { useCallback, useEffect, useRef, useState } from "react";

import styles from "~/ProblemPage.module.css";
import { processMarkdownToHtml } from "~/lib/markdown-processor";
import "katex/dist/katex.min.css";

import { ResizablePanel } from "~/components/ui/resizable";

import { useMarkdown } from "../context/MarkdownContext";
import type { WindowWithEditorScrollSync } from "./MarkdownEditor";

export default function MarkdownPreview() {
  const { markdown } = useMarkdown();
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrollingSelf = useRef(false);
  const [rendered, setRendered] = useState<string>("");

  // Cleanup CSS inspector classes
  useEffect(() => {
    return () => {
      document
        .querySelectorAll(".css-inspector-selected")
        .forEach((el) => el.classList.remove("css-inspector-selected"));
      document
        .querySelectorAll(".css-inspector-hover")
        .forEach((el) => el.classList.remove("css-inspector-hover"));
      document
        .querySelectorAll(".css-inspector-multi-selected")
        .forEach((el) => el.classList.remove("css-inspector-multi-selected"));
    };
  }, []);

  // Scroll sync
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isScrollingSelf.current) return;
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (maxScroll <= 0) return;
    const scrollPercentage = scrollTop / maxScroll;
    requestAnimationFrame(() => {
      const wwess = window as WindowWithEditorScrollSync;
      if (wwess && wwess.editorScrollSync) {
        wwess.editorScrollSync(scrollPercentage);
      }
    });
  }, []);

  useEffect(() => {
    const handleEditorScroll = (scrollPercentage: number) => {
      if (!previewRef.current || isScrollingSelf.current) return;
      isScrollingSelf.current = true;
      const container = previewRef.current;
      const maxScroll = container.scrollHeight - container.clientHeight;
      if (maxScroll > 0) {
        container.scrollTo({
          top: maxScroll * scrollPercentage,
          behavior: "instant",
        });
      }
      setTimeout(() => {
        isScrollingSelf.current = false;
      }, 50);
    };
    (window as WindowWithEditorScrollSync).previewScrollSync =
      handleEditorScroll;
    return () => {
      delete (window as WindowWithEditorScrollSync).previewScrollSync;
    };
  }, []);

  // Render markdown to HTML when it changes
  useEffect(() => {
    let cancelled = false;
    async function renderMarkdown() {
      try {
        const rendered = await processMarkdownToHtml(markdown ?? "");
        if (!cancelled) setRendered(rendered);
      } catch {
        if (!cancelled) setRendered("<p>Failed to render markdown</p>");
      }
    }
    renderMarkdown();
    return () => {
      cancelled = true;
    };
  }, [markdown]);

  return (
    <ResizablePanel
      defaultSize={50}
      minSize={20}
      className="lg:min-h-0 min-h-[35vh]"
    >
      <div className={`h-full w-full flex flex-col problemProse prose`}>
        <div
          ref={previewRef}
          id="markdown-preview-content"
          className={`flex-1 overflow-auto custom-scrollbar p-3 sm:p-4 lg:p-6 touch-manipulation ${styles.problemProse} content-description`}
          onScroll={handleScroll}
          style={{ WebkitTapHighlightColor: "transparent" }}
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      </div>
    </ResizablePanel>
  );
}
