import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';

export interface SaveConfiguration {
  endpoint: string;
  method?: 'PUT' | 'POST' | 'PATCH';
  payloadKey?: string;
  headers?: Record<string, string>;
  onSuccess?: {
    title: string;
    description: string;
    redirectPath?: string;
    redirectPrompt?: string;
    confirmText?: string;
  };
  errorMessages?: Record<string, string>;
  transformPayload?: (content: string) => unknown;
}

type MarkdownContextType = {
  markdown: string;
  setMarkdown: (markdown: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  fontSize: string;
  setFontSize: (fontSize: string) => void;
  lineHeight: string;
  setLineHeight: (lineHeight: string) => void;
  syntaxTheme: string;
  setSyntaxTheme: (syntaxTheme: string) => void;
  fontFamily: string;
  setFontFamily: (fontFamily: string) => void;
  savedContent: string;
  setSavedContent: (content: string) => void;
  tableRows: number;
  setTableRows: (rows: number) => void;
  tableCols: number;
  setTableCols: (cols: number) => void;
  tableContent: string[][];
  setTableContent: (content: string[][]) => void;
  title: string;
  titleKey: string | null;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  showSaveDialog: boolean;
  setShowSaveDialog: (show: boolean) => void;
  selectedText: string;
  setSelectedText: (text: string) => void;
  activeFormats: Record<string, boolean>;
  insertMarkdown: (format: string) => void;
  saveContent: () => void;
  sessionToken?: string;
  saveConfig: SaveConfiguration;
  placeholder: string;
  showTitle: boolean;
  copyToClipboard: () => void;
  clearMarkdown: () => void;
  addTableRow: () => void;
  addTableColumn: () => void;
  deleteTableRow: (rowIndex: number) => void;
  deleteTableColumn: (colIndex: number) => void;
  updateTableCell: (rowIndex: number, colIndex: number, value: string) => void;
  generateMarkdownTable: () => string;
  copyMarkdownTable: () => void;
  insertMarkdownTable: () => void;
  replaceLatexDelimiters: (text: string) => string;
};

export interface IMarkdownProviderProps {
  title: string;
  titleKey: string | null;
  initialContent: string;
  saveConfig: SaveConfiguration;
  sessionToken?: string;
  placeholder?: string;
  showTitle?: boolean;
  children: ReactNode;
}

const MarkdownContext = createContext<MarkdownContextType | undefined>(undefined);

export const MarkdownProvider = ({
  title,
  titleKey,
  initialContent,
  saveConfig,
  sessionToken,
  placeholder = 'Start writing your content...',
  showTitle = true,
  children,
}: IMarkdownProviderProps) => {
  const [markdown, setMarkdown] = useState(initialContent);
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('16');
  const [lineHeight, setLineHeight] = useState('1.5');
  const [syntaxTheme, setSyntaxTheme] = useState('tomorrow');
  const [fontFamily, setFontFamily] = useState('inter');
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(2);
  const [tableContent, setTableContent] = useState([
    ['', ''],
    ['', ''],
  ]);
  const [savedContent, setSavedContent] = useState<string>(initialContent);
  const [selectedText, setSelectedText] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({}); // Handle theme and styling
  useEffect(() => {
    document.body.className = theme;
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
    document.documentElement.style.setProperty('--line-height', lineHeight);
    document.documentElement.style.setProperty('--font-family', fontFamily);
  }, [theme, fontSize, lineHeight, fontFamily]);

  // Track unsaved changes
  useEffect(() => {
    if (savedContent !== undefined) {
      setHasUnsavedChanges(savedContent !== markdown);
    }
  }, [markdown, savedContent]);

  // Detect active formats in selected text
  useEffect(() => {
    if (!selectedText.trim()) {
      setActiveFormats({});
      return;
    }

    const formats: Record<string, boolean> = {};

    // Check for bold (**text**, ***text***, or contains **/*** patterns)
    formats.bold =
      /^\*\*.*\*\*$/.test(selectedText) ||
      /^\*\*\*.*\*\*\*$/.test(selectedText) ||
      /\*\*.*\*\*/.test(selectedText) ||
      /\*\*\*.*\*\*\*/.test(selectedText);

    // Check for italic (*text*, ***text***, _text_, or contains */_ patterns)
    const startsWithSingleAsterisk = selectedText.startsWith('*') && !selectedText.startsWith('**');
    const endsWithSingleAsterisk = selectedText.endsWith('*') && !selectedText.endsWith('**');
    const startsWithSingleUnderscore =
      selectedText.startsWith('_') && !selectedText.startsWith('__');
    const endsWithSingleUnderscore = selectedText.endsWith('_') && !selectedText.endsWith('__');
    const isCombinedAsterisks =
      /^\*\*\*.*\*\*\*$/.test(selectedText) || /\*\*\*.*\*\*\*/.test(selectedText);
    const containsItalicPatterns =
      (/\*.*\*/.test(selectedText) && !/\*\*.*\*\*/.test(selectedText)) ||
      (/_.*_/.test(selectedText) && !/__.*__/.test(selectedText));

    formats.italic =
      (startsWithSingleAsterisk && endsWithSingleAsterisk) ||
      (startsWithSingleUnderscore && endsWithSingleUnderscore) ||
      isCombinedAsterisks ||
      containsItalicPatterns;

    // Check for strikethrough
    formats.strikethrough = /^~~.*~~$/.test(selectedText) || /~~.*~~/.test(selectedText);

    // Check for underline (__text__ or contains __ patterns)
    formats.underline =
      /^__.*__$/.test(selectedText) ||
      /^\*\*__.*__.*\*\*$/.test(selectedText) ||
      /__.*__/.test(selectedText);

    // Check for code
    formats.code = /^`.*`$/.test(selectedText) || /`.*`/.test(selectedText);

    setActiveFormats(formats);
  }, [selectedText]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdown);
  };

  const clearMarkdown = () => {
    setMarkdown('');
  };

  const saveContent = () => {
    setSavedContent(markdown);
    setShowSaveDialog(true);
    // You might want to add actual save logic here
  };

  const insertMarkdown = (format: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    let insertion = '';
    let cursorOffset = 0;
    let shouldRemove = false;

    // Check if format is already active and should be removed
    if (start !== end) {
      const selectedText = text.slice(start, end);
      switch (format) {
        case 'bold':
          if (/^\*\*\*.*\*\*\*$/.test(selectedText)) {
            // ***text*** -> *text* (remove bold, keep italic)
            shouldRemove = true;
            insertion = `*${selectedText.slice(3, -3)}*`;
          } else if (/^\*\*__.*__.*\*\*$/.test(selectedText)) {
            // **__text__** -> __text__ (remove bold, keep underline)
            shouldRemove = true;
            const innerText = selectedText.slice(4, -4); // Remove **__ and __**
            insertion = `__${innerText}__`;
          } else if (/\*\*\*.*\*\*\*/.test(selectedText)) {
            // Contains ***text*** pattern -> replace with *text*
            shouldRemove = true;
            insertion = selectedText.replace(/\*\*\*(.*?)\*\*\*/g, '*$1*');
          } else if (/\*\*.*\*\*/.test(selectedText)) {
            // Contains **text** pattern -> remove it
            shouldRemove = true;
            insertion = selectedText.replace(/\*\*(.*?)\*\*/g, '$1');
          } else if (/^\*\*.*\*\*$/.test(selectedText)) {
            shouldRemove = true;
            insertion = selectedText.slice(2, -2);
          }
          break;
        case 'italic':
          const italicStartsWithSingle =
            selectedText.startsWith('*') && !selectedText.startsWith('**');
          const italicEndsWithSingle = selectedText.endsWith('*') && !selectedText.endsWith('**');
          const italicStartsWithSingleUnderscore =
            selectedText.startsWith('_') && !selectedText.startsWith('__');
          const italicEndsWithSingleUnderscore =
            selectedText.endsWith('_') && !selectedText.endsWith('__');

          if (/^\*\*\*.*\*\*\*$/.test(selectedText)) {
            // ***text*** -> **text** (remove italic, keep bold)
            shouldRemove = true;
            insertion = `**${selectedText.slice(3, -3)}**`;
          } else if (/\*\*\*.*\*\*\*/.test(selectedText)) {
            // Contains ***text*** pattern -> replace with **text**
            shouldRemove = true;
            insertion = selectedText.replace(/\*\*\*(.*?)\*\*\*/g, '**$1**');
          } else if (/\*.*\*/.test(selectedText) && !/\*\*.*\*\*/.test(selectedText)) {
            // Contains single *text* pattern -> remove it
            shouldRemove = true;
            insertion = selectedText.replace(/\*(.*?)\*/g, '$1');
          } else if (/_.*_/.test(selectedText) && !/__.*__/.test(selectedText)) {
            // Contains single _text_ pattern -> remove it
            shouldRemove = true;
            insertion = selectedText.replace(/_(.*?)_/g, '$1');
          } else if (italicStartsWithSingle && italicEndsWithSingle) {
            shouldRemove = true;
            insertion = selectedText.slice(1, -1);
          } else if (italicStartsWithSingleUnderscore && italicEndsWithSingleUnderscore) {
            shouldRemove = true;
            insertion = selectedText.slice(1, -1);
          }
          break;
        case 'strikethrough':
          if (/^~~.*~~$/.test(selectedText)) {
            shouldRemove = true;
            insertion = selectedText.slice(2, -2);
          } else if (/~~.*~~/.test(selectedText)) {
            // Contains ~~text~~ pattern -> remove it
            shouldRemove = true;
            insertion = selectedText.replace(/~~(.*?)~~/g, '$1');
          }
          break;
        case 'underline':
          if (/^\*\*__.*__.*\*\*$/.test(selectedText)) {
            // **__text__** -> **text** (remove underline, keep bold)
            shouldRemove = true;
            const innerText = selectedText.slice(4, -4); // Remove **__ and __**
            insertion = `**${innerText}**`;
          } else if (/__.*__/.test(selectedText)) {
            // Contains __text__ pattern -> remove it
            shouldRemove = true;
            insertion = selectedText.replace(/__(.*?)__/g, '$1');
          } else if (/^__.*__$/.test(selectedText)) {
            shouldRemove = true;
            insertion = selectedText.slice(2, -2);
          }
          break;
        case 'code':
          if (/^`.*`$/.test(selectedText)) {
            shouldRemove = true;
            insertion = selectedText.slice(1, -1);
          } else if (/`.*`/.test(selectedText)) {
            // Contains `text` pattern -> remove it
            shouldRemove = true;
            insertion = selectedText.replace(/`(.*?)`/g, '$1');
          }
          break;
      }
    }

    if (!shouldRemove) {
      switch (format) {
        case 'bold':
          insertion = `**${text.slice(start, end) || 'bold text'}**`;
          cursorOffset = start === end ? 2 : 0;
          break;
        case 'italic':
          insertion = `*${text.slice(start, end) || 'italic text'}*`;
          cursorOffset = start === end ? 1 : 0;
          break;
        case 'strikethrough':
          insertion = `~~${text.slice(start, end) || 'strikethrough text'}~~`;
          cursorOffset = start === end ? 2 : 0;
          break;
        case 'underline':
          insertion = `__${text.slice(start, end) || 'underline text'}__`;
          cursorOffset = start === end ? 2 : 0;
          break;
        case 'list':
          insertion = `\n- List item`;
          cursorOffset = 2;
          break;
        case 'ordered-list':
          insertion = `\n1. Ordered list item`;
          cursorOffset = 3;
          break;
        case 'quote':
          insertion = `\n> ${text.slice(start, end) || 'Blockquote'}`;
          cursorOffset = start === end ? 2 : 0;
          break;
        case 'code':
          insertion = `\`${text.slice(start, end) || 'code'}\``;
          cursorOffset = start === end ? 1 : 0;
          break;
        case 'math':
          insertion = `$$${text.slice(start, end) || 'math equation (block)'}$$`;
          cursorOffset = start === end ? 2 : 0;
          break;
        case 'image':
          insertion = `![Alt text](https://example.com/image.jpg)`;
          cursorOffset = 2;
          break;
        case 'link':
          insertion = `[Link text](https://example.com)`;
          cursorOffset = 1;
          break;
        case 'h1':
          insertion = `\n# ${text.slice(start, end) || 'Heading 1'}`;
          cursorOffset = start === end ? 2 : 0;
          break;
        case 'h2':
          insertion = `\n## ${text.slice(start, end) || 'Heading 2'}`;
          cursorOffset = start === end ? 3 : 0;
          break;
        case 'h3':
          insertion = `\n### ${text.slice(start, end) || 'Heading 3'}`;
          cursorOffset = start === end ? 4 : 0;
          break;
        default:
          if (format.startsWith('emoji-')) {
            insertion = format.slice(6);
          }
      }
    }

    const newText = shouldRemove
      ? text.slice(0, start) + insertion + text.slice(end)
      : text.slice(0, start) + insertion + text.slice(end);

    const newStartPos = start;
    const newEndPos = shouldRemove ? start + insertion.length : start + insertion.length;

    setMarkdown(newText);

    // Use setTimeout to ensure DOM updates before setting cursor/selection
    setTimeout(() => {
      textarea.focus();
      if (start !== end || shouldRemove) {
        // If text was originally selected or we're removing formatting, maintain selection
        textarea.setSelectionRange(newStartPos, newEndPos);
        // Manually update selectedText since onSelect might not fire for programmatic selection
        const updatedSelectedText = textarea.value.substring(newStartPos, newEndPos);
        setSelectedText(updatedSelectedText);
      } else {
        // If no original selection (cursor only), place cursor at appropriate position
        const cursorPos = start + insertion.length - cursorOffset;
        textarea.setSelectionRange(cursorPos, cursorPos);
        // Clear selection since cursor is at a single position
        setSelectedText('');
      }
    }, 10); // Small delay for better performance
  };

  const addTableRow = () => {
    setTableRows(tableRows + 1);
    setTableContent([...tableContent, Array(tableCols).fill('')]);
  };

  const addTableColumn = () => {
    setTableCols(tableCols + 1);
    setTableContent(tableContent.map((row) => [...row, '']));
  };

  const deleteTableRow = (rowIndex: number) => {
    if (tableRows > 1) {
      setTableRows(tableRows - 1);
      setTableContent(tableContent.filter((_, index) => index !== rowIndex));
    }
  };

  const deleteTableColumn = (colIndex: number) => {
    if (tableCols > 1) {
      setTableCols(tableCols - 1);
      setTableContent(tableContent.map((row) => row.filter((_, index) => index !== colIndex)));
    }
  };

  const updateTableCell = (rowIndex: number, colIndex: number, value: string) => {
    const newContent = [...tableContent];
    newContent[rowIndex][colIndex] = value;
    setTableContent(newContent);
  };

  const generateMarkdownTable = () => {
    let markdownTable = '| ' + tableContent[0].join(' | ') + ' |\n';
    markdownTable += '| ' + Array(tableCols).fill('---').join(' | ') + ' |\n';
    for (let i = 1; i < tableRows; i++) {
      markdownTable += '| ' + tableContent[i].join(' | ') + ' |\n';
    }
    return markdownTable;
  };

  const copyMarkdownTable = () => {
    const markdownTable = generateMarkdownTable();
    navigator.clipboard.writeText(markdownTable);
  };

  const insertMarkdownTable = () => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    const markdownTable = generateMarkdownTable();

    if (!textarea) {
      // Fallback: append to end if no textarea found
      setMarkdown((prevMarkdown: string) => prevMarkdown + '\n\n' + markdownTable);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;

    // Add proper spacing around table
    const beforeText = currentValue.slice(0, start);
    const afterText = currentValue.slice(end);
    const needsSpaceBefore = beforeText.trim() && !beforeText.endsWith('\n\n');
    const needsSpaceAfter = afterText.trim() && !afterText.startsWith('\n\n');

    const insertion =
      (needsSpaceBefore ? '\n\n' : '') + markdownTable + (needsSpaceAfter ? '\n\n' : '');
    const newContent = beforeText + insertion + afterText;

    // Update React state
    setMarkdown(newContent);

    // Update textarea and cursor position
    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  const replaceLatexDelimiters = (text: string) => {
    // Replace LaTeX delimiters only
    return text
      .replace(/\\\[/g, '$$$$') // Replace \[ with $$
      .replace(/\\\]/g, '$$$$') // Replace \] with $$
      .replace(/\\\(/g, '$$') // Replace \( with $
      .replace(/\\\)/g, '$$'); // Replace \) with $
  };

  return (
    <MarkdownContext.Provider
      value={{
        markdown,
        setMarkdown,
        theme,
        setTheme,
        fontSize,
        setFontSize,
        lineHeight,
        setLineHeight,
        syntaxTheme,
        setSyntaxTheme,
        fontFamily,
        savedContent,
        setSavedContent,
        setFontFamily,
        tableRows,
        setTableRows,
        tableCols,
        setTableCols,
        tableContent,
        setTableContent,
        title,
        titleKey,
        saveConfig,
        placeholder,
        showTitle,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        showSaveDialog,
        setShowSaveDialog,
        selectedText,
        setSelectedText,
        activeFormats,
        insertMarkdown,
        saveContent,
        copyToClipboard,
        sessionToken,
        clearMarkdown,
        addTableRow,
        addTableColumn,
        deleteTableRow,
        deleteTableColumn,
        updateTableCell,
        generateMarkdownTable,
        copyMarkdownTable,
        insertMarkdownTable,
        replaceLatexDelimiters,
      }}
    >
      {children}
    </MarkdownContext.Provider>
  );
};

export const useMarkdown = () => {
  const context = useContext(MarkdownContext);
  if (context === undefined) {
    throw new Error('useMarkdown must be used within a MarkdownProvider');
  }
  return context;
};
