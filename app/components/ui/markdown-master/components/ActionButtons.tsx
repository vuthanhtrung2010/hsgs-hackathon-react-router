import { useCallback, useEffect, useState } from 'react';

import { useSave } from '~/hooks/use-save';
import { CopyIcon, SaveIcon, TrashIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { SaveDialog } from '~/components/ui/save-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

import { useMarkdown } from '../context/MarkdownContext';

interface SaveData {
  [key: string]: string;
}

export default function ActionButtons() {
  const {
    copyToClipboard,
    clearMarkdown,
    sessionToken,
    markdown,
    title,
    hasUnsavedChanges,
    setSavedContent,
    setHasUnsavedChanges,
    saveConfig,
    showTitle,
  } = useMarkdown();

  const { save, isLoading, dialogOpen, setDialogOpen, dialogContent } = useSave<SaveData>();

  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);

  // Handle copy to clipboard with dialog notification
  const handleCopy = () => {
    copyToClipboard();
    setCopyDialogOpen(true);
  };

  const handleSave = useCallback(async () => {
    if (!hasUnsavedChanges) return false;

    // Build payload using the configured key
    const payloadKey = saveConfig.payloadKey || 'description';
    const payload: SaveData = { [payloadKey]: markdown };

    const success = await save(payload, {
      endpoint: saveConfig.endpoint,
      method: saveConfig.method || 'PUT',
      headers: {
        Authorization: sessionToken ? `Bearer ${sessionToken}` : '',
        ...saveConfig.headers,
      },
      onSuccess: saveConfig.onSuccess,
      errorMessages: saveConfig.errorMessages,
      // Handle transformPayload - if it exists, it should transform the content
      transformPayload: saveConfig.transformPayload
        ? () => saveConfig.transformPayload!(markdown)
        : undefined,
    });

    if (success) {
      setSavedContent(markdown);
      setHasUnsavedChanges(false);
    }

    return success;
  }, [
    hasUnsavedChanges,
    saveConfig,
    markdown,
    save,
    sessionToken,
    setSavedContent,
    setHasUnsavedChanges,
  ]);

  // Keyboard shortcut for save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault(); // Prevent browser's default save behavior
        // Only save if not already loading (same as button behavior)
        if (!isLoading) {
          handleSave();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSave, isLoading]);

  // Handle clear document with confirmation
  const handleClearDocument = () => {
    clearMarkdown();
    setClearDialogOpen(false);
  };

  return (
    <div className="mb-1">
      <div className="flex flex-wrap items-center gap-1 sm:gap-2 p-1 sm:p-2 bg-muted/30 rounded-lg shadow-sm">
        {/* Document Actions Group */}
        <div className="flex items-center">
          {/* Quick Save Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSave}
                  variant="outline"
                  size="sm"
                  className="rounded-r-none border-r-0"
                  disabled={isLoading}
                >
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Save{hasUnsavedChanges && '*'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save the current problem description</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="rounded-l-none rounded-r-none"
                >
                  <CopyIcon className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy markdown to clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-l-none text-destructive hover:text-destructive"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear Document</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to clear the current document? This action cannot be
                        undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                      <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleClearDocument}>
                        Clear Document
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear the current document</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Separator between buttons and problem name */}
        <div className="h-8 w-px bg-border mx-4" />

        {/* Title display */}
        {showTitle && (
          <div className="flex items-center px-2 py-1 bg-background rounded-md border">
            <span className="text-sm font-medium text-foreground">{title}</span>
          </div>
        )}
      </div>

      {/* Save Dialog */}
      <SaveDialog open={dialogOpen} onOpenChange={setDialogOpen} content={dialogContent} />

      {/* Copy Success Dialog */}
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copied</DialogTitle>
            <DialogDescription>Problem description copied to clipboard.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
