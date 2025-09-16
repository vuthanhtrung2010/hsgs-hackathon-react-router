import { ResizableHandle, ResizablePanelGroup } from "../resizable";

import ActionButtons from "./components/ActionButtons";
import FormatToolbar from "./components/FormatToolbar";
import MarkdownEditor from "./components/MarkdownEditor";
import MarkdownEditorMobile from "./components/MarkdownEditorMobile";
import MarkdownPreview from "./components/MarkdownPreview";
import MarkdownPreviewMobile from "./components/MarkdownPreviewMobile";
import { MarkdownProvider } from "./context/MarkdownContext";

export interface SaveConfiguration {
  endpoint: string;
  method?: "PUT" | "POST" | "PATCH";
  payloadKey?: string; // Key to use for the content in the payload (default: "description")
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

export interface IMarkdownMasterProps {
  // Display Configuration
  title: string; // Title for the content being edited
  titleKey?: string; // Optional key/identifier for the resource being edited

  // Content
  initialContent: string; // The initial markdown content

  // Save Configuration
  saveConfig: SaveConfiguration;

  // Authentication
  sessionToken?: string;

  // Customization
  placeholder?: string; // Placeholder text for the editor
  showTitle?: boolean; // Whether to show the title in the action bar (default: true)
}

export default function MarkdownMaster({
  title,
  titleKey,
  initialContent,
  saveConfig,
  sessionToken,
  placeholder = "Start writing your content...",
  showTitle = true,
}: IMarkdownMasterProps) {
  return (
    <MarkdownProvider
      title={title}
      titleKey={titleKey || null}
      initialContent={initialContent}
      saveConfig={saveConfig}
      sessionToken={sessionToken}
      placeholder={placeholder}
      showTitle={showTitle}
    >
      <div className="h-screen w-full flex flex-col overflow-hidden">
        {/* Header section - responsive layout */}
        <div className="flex-shrink-0 w-full">
          {/* Collapsible toolbar section */}
          <div className="px-2 sm:px-3 lg:px-4 pb-1 space-y-1">
            {/* Primary tools row */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <div className="flex-1 min-w-0">
                <ActionButtons />
              </div>
            </div>

            {/* Format toolbar - full width on mobile */}
            <div className="w-full">
              <FormatToolbar />
            </div>
          </div>
        </div>

        {/* Main editor area - takes all remaining height */}
        <div className="flex-1 w-full px-2 sm:px-3 lg:px-4 pb-0 min-h-0 overflow-hidden">
          {/* Desktop layout with resizable panels */}
          <div className="hidden lg:flex w-full h-full">
            <ResizablePanelGroup
              direction="horizontal"
              className="w-full h-full rounded-lg border"
            >
              <MarkdownEditor />
              <ResizableHandle />
              <MarkdownPreview />
            </ResizablePanelGroup>
          </div>

          {/* Mobile layout with vertical resizable panels */}
          <div className="flex lg:hidden w-full h-full">
            <ResizablePanelGroup
              direction="vertical"
              className="w-full h-full rounded-lg border"
            >
              <MarkdownEditorMobile />
              <ResizableHandle withHandle />
              <MarkdownPreviewMobile />
            </ResizablePanelGroup>
          </div>
        </div>
      </div>
    </MarkdownProvider>
  );
}
