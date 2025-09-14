import { useCallback, useEffect, useRef, useState } from 'react';

import styles from '~/ProblemPage.module.css';
import { transformerCopyButton } from '@rehype-pretty/transformers';
import 'katex/dist/katex.min.css';
import type { Root } from "mdast";
import rehypeKatex from 'rehype-katex';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { ResizablePanel } from '~/components/ui/resizable';

import { useMarkdown } from '../context/MarkdownContext';
import { type WindowWithEditorScrollSync } from './MarkdownEditor';

// Optional: implement your preprocessing function (if needed)
function preprocessTabs(text: string): string {
  return text
    .replace(/\t{2,}/g, (m) => `<pre>${m}</pre>`)
    .replace(/\t/g, (m) => `<code>${m}</code>`);
}

function remarkHeadingSeparator() {
  return (tree: Root) => {
    const newChildren: Root['children'][number][] = [];
    for (const node of tree.children) {
      newChildren.push(node);
      if (node.type === 'heading' && [1, 2, 3].includes(node.depth)) {
        newChildren.push({ type: 'thematicBreak' }); // renders as <hr>
      }
    }
    tree.children = newChildren;
  };
}

export default function MarkdownPreview() {
  const { markdown } = useMarkdown();
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrollingSelf = useRef(false);
  const [rendered, setRendered] = useState<string>('');

  // Cleanup CSS inspector classes
  useEffect(() => {
    return () => {
      document
        .querySelectorAll('.css-inspector-selected')
        .forEach((el) => el.classList.remove('css-inspector-selected'));
      document
        .querySelectorAll('.css-inspector-hover')
        .forEach((el) => el.classList.remove('css-inspector-hover'));
      document
        .querySelectorAll('.css-inspector-multi-selected')
        .forEach((el) => el.classList.remove('css-inspector-multi-selected'));
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
          behavior: 'instant',
        });
      }
      setTimeout(() => {
        isScrollingSelf.current = false;
      }, 50);
    };
    (window as WindowWithEditorScrollSync).previewScrollSync = handleEditorScroll;
    return () => {
      delete (window as WindowWithEditorScrollSync).previewScrollSync;
    };
  }, []);

  // Custom rehype plugin for table, headers, images, inline code, lists
  const rehypeCustomStyleAndHeaders = () => {
    // minimal HAST element shape we need
    type HastNode = {
      type?: string;
      tagName?: string;
      properties?: Record<string, unknown>;
      children?: unknown[];
    } & Record<string, unknown>;
    return (tree: unknown) => {
      function walk(node: unknown) {
        if (!node || typeof node !== 'object') return;
        const n = node as HastNode;
        const children = n.children;
        if (!children || !Array.isArray(children)) return;
        for (let i = 0; i < children.length; i++) {
          const child = children[i] as HastNode | undefined;
          if (!child || child.type !== 'element') continue;

          /* Table CSS inject */
          // Wrap <table> with <div class="table-wrapper figure-table">
          if (child.tagName === 'table') {
            const wrapper: HastNode = {
              type: 'element',
              tagName: 'div',
              properties: { className: ['table-wrapper', 'figure-table'] },
              children: [child],
            };
            children[i] = wrapper as unknown;
            // don't descend into this table now
            continue;
          }

          // ensure images carry a decorative outline class so CSS applies
          if (child.tagName === 'img') {
            const props = (child.properties || {}) as Record<string, unknown>;
            const existing = Array.isArray(props.className)
              ? props.className.map(String)
              : props.className
                ? [String(props.className)]
                : [];
            if (!existing.includes('decor-outline')) existing.push('decor-outline');
            props.className = existing;
            child.properties = props;
          }

          // Add wiki-inline-code class to inline <code> so backported CSS targets it
          if (child.tagName === 'code') {
            const props = (child.properties || {}) as Record<string, unknown>;
            const existing = Array.isArray(props.className)
              ? props.className.map(String)
              : props.className
                ? [String(props.className)]
                : [];
            if (!existing.includes('wiki-inline-code')) existing.push('wiki-inline-code');
            props.className = existing;
            child.properties = props;
          }

          /* header css inject */
          if (child.tagName === 'h1' || child.tagName === 'h2' || child.tagName === 'h3') {
            const props = (child.properties || {}) as Record<string, unknown>;
            const existing = Array.isArray(props.className)
              ? props.className.map(String)
              : props.className
                ? [String(props.className)]
                : [];
            if (child.tagName === 'h1') {
              if (!existing.includes('text-2xl'))
                existing.push('text-2xl', 'font-bold', 'mt-6', 'mb-4');
            } else if (child.tagName === 'h2') {
              if (!existing.includes('text-xl'))
                existing.push('text-xl', 'font-semibold', 'mt-5', 'mb-3');
            } else if (child.tagName === 'h3') {
              if (!existing.includes('text-lg'))
                existing.push('text-lg', 'font-semibold', 'mt-4', 'mb-2');
            }
            props.className = existing;
            child.properties = props;
          }

          // Add list container classes for targeted styling
          if (child.tagName === 'ul' || child.tagName === 'ol' || child.tagName === 'dl') {
            const props = (child.properties || {}) as Record<string, unknown>;
            const existing = Array.isArray(props.className)
              ? props.className.map(String)
              : props.className
                ? [String(props.className)]
                : [];
            // mark task-list/contains-task-list if present in items
            if (child.tagName === 'ul' || child.tagName === 'ol') {
              if (!existing.includes('wiki-list')) existing.push('wiki-list');
            }
            if (child.tagName === 'dl') {
              if (!existing.includes('wiki-dl')) existing.push('wiki-dl');
            }
            props.className = existing;
            child.properties = props;
          }

          // recurse
          walk(child);
        }
      }
      walk(tree);
    };
  };
  // Render markdown to HTML when it changes
  useEffect(() => {
    let cancelled = false;
    async function renderMarkdown() {
      try {
        const preprocessed = preprocessTabs(markdown ?? '').replace(/__([^_\n]+)__/g, '<u>$1</u>');

        const file = await unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkMath)
          .use(remarkHeadingSeparator)
          .use(remarkBreaks)
          .use(remarkRehype, { allowDangerousHtml: true })
          .use(rehypeRaw)
          .use(rehypeSanitize, {
            ...defaultSchema,
            // customize what tags/attributes you allow
            attributes: {
              ...defaultSchema.attributes,
              img: [
                ...(defaultSchema.attributes?.img || []),
                ['className'],
                ['alt'],
                ['src'],
                ['title'],
              ],
              code: [...(defaultSchema.attributes?.code || []), ['className']],
            },
            // Ensure <u> tag is allowed for underline support
            tagNames: [...(defaultSchema.tagNames || []), 'u'].filter(
              (tag, index, arr) => arr.indexOf(tag) === index
            ), // Remove duplicates
          })
          .use(rehypeCustomStyleAndHeaders)
          .use(rehypePrettyCode, {
            keepBackground: true,
            defaultLang: 'text',
            transformers: [
              transformerCopyButton({
                visibility: 'always',
                feedbackDuration: 3000,
              }),
            ],
          })
          .use(rehypeKatex)
          .use(rehypeStringify, { allowDangerousHtml: true })
          .process(preprocessed);

        if (!cancelled) setRendered(String(file));
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
    <ResizablePanel defaultSize={50} minSize={20} className="lg:min-h-0 min-h-[35vh]">
      <div className={`h-full w-full flex flex-col ${styles.problemProse} prose`}>
        <div
          ref={previewRef}
          id="markdown-preview-content"
          className={`flex-1 overflow-auto custom-scrollbar p-3 sm:p-4 lg:p-6 touch-manipulation problemProse content-description`}
          onScroll={handleScroll}
          style={{ WebkitTapHighlightColor: 'transparent' }}
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      </div>
    </ResizablePanel>
  );
}
