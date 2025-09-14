import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';

export interface SaveDialogContent {
  title: string;
  description: string;
  type: 'success' | 'error' | 'confirm';
  onConfirm?: () => void;
  confirmText?: string;
}

interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: SaveDialogContent | null;
}

export function SaveDialog({ open, onOpenChange, content }: SaveDialogProps) {
  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          {content.type === 'confirm' ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  content.onConfirm?.();
                  onOpenChange(false);
                }}
              >
                {content.confirmText || 'Confirm'}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              OK
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
