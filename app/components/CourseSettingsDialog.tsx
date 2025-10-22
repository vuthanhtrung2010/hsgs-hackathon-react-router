import { useState, useEffect } from "react";
import { Form, useActionData, useFetcher } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import { AlertCircle } from "lucide-react";
import { type RatingThresholds, DEFAULT_RATING_THRESHOLDS } from "~/lib/rating";

interface CourseSettingsDialogProps {
  courseId: string;
  initialQuote?: string;
  initialQuoteAuthor?: string;
  initialShowDebt?: boolean;
  initialCustomRatingThresholds?: boolean;
  initialThresholds?: RatingThresholds;
  children: React.ReactNode;
}

export function CourseSettingsDialog({
  courseId,
  initialQuote = "",
  initialQuoteAuthor = "",
  initialShowDebt = false,
  initialCustomRatingThresholds = false,
  initialThresholds = DEFAULT_RATING_THRESHOLDS,
  children,
}: CourseSettingsDialogProps) {
  const actionData = useActionData<{ success?: boolean; error?: string }>();
  const fetcher = useFetcher();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  // Settings state
  const [quote, setQuote] = useState(initialQuote);
  const [quoteAuthor, setQuoteAuthor] = useState(initialQuoteAuthor);
  const [showDebt, setShowDebt] = useState(initialShowDebt);
  const [customRatingThresholds, setCustomRatingThresholds] = useState(
    initialCustomRatingThresholds,
  );

  // Thresholds state
  const [thresholds, setThresholds] = useState<RatingThresholds>({
    ...initialThresholds,
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setQuote(initialQuote);
      setQuoteAuthor(initialQuoteAuthor);
      setShowDebt(initialShowDebt);
      setCustomRatingThresholds(initialCustomRatingThresholds);
      setThresholds({ ...initialThresholds });
      setError(null);
    }
  }, [
    open,
    initialQuote,
    initialQuoteAuthor,
    initialShowDebt,
    initialCustomRatingThresholds,
    initialThresholds,
  ]);

  // Update thresholds when custom thresholds toggle changes
  useEffect(() => {
    if (!customRatingThresholds) {
      // If disabling custom thresholds, reset to initial thresholds
      setThresholds({ ...initialThresholds });
    }
  }, [customRatingThresholds, initialThresholds]);

  // Update a specific threshold value
  const updateThreshold = (key: keyof RatingThresholds, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setThresholds((prev) => ({ ...prev, [key]: numValue }));
    }
  };

  // Validate thresholds follow the correct order
  const validateThresholds = (): boolean => {
    const {
      newbieThreshold,
      amateurThreshold,
      expertThreshold,
      candidateMasterThreshold,
      masterThreshold,
      grandmasterThreshold,
      targetThreshold,
      adminThreshold,
    } = thresholds;

    return (
      newbieThreshold < amateurThreshold &&
      amateurThreshold < expertThreshold &&
      expertThreshold < candidateMasterThreshold &&
      candidateMasterThreshold < masterThreshold &&
      masterThreshold < grandmasterThreshold &&
      grandmasterThreshold < targetThreshold &&
      targetThreshold < adminThreshold
    );
  };

  // Check for action data results when component updates
  useEffect(() => {
    if (actionData?.success) {
      setOpen(false);
    } else if (actionData?.error) {
      setError(actionData.error);
    }
  }, [actionData]);

  // Check fetcher state and data
  useEffect(() => {
    if (fetcher.data) {
      // If successful, close the dialog
      if (fetcher.data.success) {
        console.log("Settings saved successfully!");
        alert("Course settings saved successfully!");
        setOpen(false);
        // Force a page refresh to show updated settings
        window.location.reload();
      } else if (fetcher.data.error) {
        console.error("Error saving settings:", fetcher.data.error);
        setError(fetcher.data.error);
      } else {
        console.log("Unexpected response format:", fetcher.data);
      }
    }
  }, [fetcher.state, fetcher.data]);

  // Pre-validate form before submission
  const validateForm = (): boolean => {
    // Validate form
    if (customRatingThresholds && !validateThresholds()) {
      setError(
        "Rating thresholds must be in ascending order: Newbie < Amateur < Expert < Candidate Master < Master < Grandmaster < Target < Admin",
      );
      console.log("Validation failed: Thresholds not in ascending order");
      return false;
    }

    setError(null);
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <fetcher.Form
          method="post"
          action="/admin/courses"
          onSubmit={(e) => {
            if (!validateForm()) {
              e.preventDefault();
              return false;
            }
          }}
        >
          {/* Required and always-present form values */}
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="quote" value={quote} />
          <input type="hidden" name="quoteAuthor" value={quoteAuthor} />
          <input type="hidden" name="showDebt" value={showDebt.toString()} />
          <input
            type="hidden"
            name="customRatingThresholds"
            value={customRatingThresholds.toString()}
          />
          <input
            type="hidden"
            name="newbieThreshold"
            value={thresholds.newbieThreshold.toString()}
          />
          <input
            type="hidden"
            name="amateurThreshold"
            value={thresholds.amateurThreshold.toString()}
          />
          <input
            type="hidden"
            name="expertThreshold"
            value={thresholds.expertThreshold.toString()}
          />
          <input
            type="hidden"
            name="candidateMasterThreshold"
            value={thresholds.candidateMasterThreshold.toString()}
          />
          <input
            type="hidden"
            name="masterThreshold"
            value={thresholds.masterThreshold.toString()}
          />
          <input
            type="hidden"
            name="grandmasterThreshold"
            value={thresholds.grandmasterThreshold.toString()}
          />
          <input
            type="hidden"
            name="targetThreshold"
            value={thresholds.targetThreshold.toString()}
          />
          <input
            type="hidden"
            name="adminThreshold"
            value={thresholds.adminThreshold.toString()}
          />
          <DialogHeader>
            <DialogTitle>Course Settings</DialogTitle>
            <DialogDescription>
              Customize course display settings and rating thresholds
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="mt-6"
            orientation="horizontal"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="ratings">Rating Thresholds</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              {/* Quote */}
              <div className="space-y-2">
                <Label htmlFor="quote">Leaderboard Quote</Label>
                <Textarea
                  id="quote"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Enter a motivational quote for the leaderboard"
                  rows={2}
                />
              </div>

              {/* Quote Author */}
              <div className="space-y-2">
                <Label htmlFor="quoteAuthor">Quote Author</Label>
                <Input
                  id="quoteAuthor"
                  value={quoteAuthor}
                  onChange={(e) => setQuoteAuthor(e.target.value)}
                  placeholder="Who said the quote?"
                />
              </div>

              {/* Show Debt */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="showDebt"
                  type="button" /* Prevent it from submitting as form field */
                  checked={showDebt}
                  onCheckedChange={(checked) => setShowDebt(checked === true)}
                />
                <Label htmlFor="showDebt" className="cursor-pointer">
                  Show student debt on leaderboard
                </Label>
              </div>
            </TabsContent>

            <TabsContent value="ratings" className="space-y-4">
              {/* Custom Rating Thresholds Toggle */}
              <div className="flex items-center space-x-2 pb-4">
                <Checkbox
                  id="customRatingThresholds"
                  type="button" /* Prevent it from submitting as form field */
                  checked={customRatingThresholds}
                  onCheckedChange={(checked) =>
                    setCustomRatingThresholds(checked === true)
                  }
                />
                <Label
                  htmlFor="customRatingThresholds"
                  className="cursor-pointer"
                >
                  Use custom rating thresholds for this course
                </Label>
              </div>

              {/* Always show thresholds but conditionally set disabled state */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {customRatingThresholds
                      ? "Set custom rating thresholds for this course. Thresholds must be in ascending order."
                      : "Current rating thresholds for this course. Enable custom thresholds to modify these values."}
                  </p>
                  {!customRatingThresholds && (
                    <span className="text-xs bg-secondary px-2 py-1 rounded-md">
                      Read-only
                    </span>
                  )}
                </div>

                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!customRatingThresholds ? "opacity-75" : ""}`}
                >
                  <div className="space-y-2">
                    <Label htmlFor="newbieThreshold">Newbie Threshold</Label>
                    <Input
                      id="newbieThreshold"
                      type="number"
                      min="0"
                      value={thresholds.newbieThreshold}
                      onChange={(e) =>
                        updateThreshold("newbieThreshold", e.target.value)
                      }
                      disabled={!customRatingThresholds}
                      className={
                        !customRatingThresholds ? "cursor-not-allowed" : ""
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amateurThreshold">Amateur Threshold</Label>
                    <Input
                      id="amateurThreshold"
                      type="number"
                      min="1"
                      value={thresholds.amateurThreshold}
                      onChange={(e) =>
                        updateThreshold("amateurThreshold", e.target.value)
                      }
                      disabled={!customRatingThresholds}
                      className={
                        !customRatingThresholds ? "cursor-not-allowed" : ""
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expertThreshold">Expert Threshold</Label>
                    <Input
                      id="expertThreshold"
                      type="number"
                      min="1"
                      value={thresholds.expertThreshold}
                      onChange={(e) =>
                        updateThreshold("expertThreshold", e.target.value)
                      }
                      disabled={!customRatingThresholds}
                      className={
                        !customRatingThresholds ? "cursor-not-allowed" : ""
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="candidateMasterThreshold">
                      Candidate Master Threshold
                    </Label>
                    <Input
                      id="candidateMasterThreshold"
                      type="number"
                      min="1"
                      value={thresholds.candidateMasterThreshold}
                      onChange={(e) =>
                        updateThreshold(
                          "candidateMasterThreshold",
                          e.target.value,
                        )
                      }
                      disabled={!customRatingThresholds}
                      className={
                        !customRatingThresholds ? "cursor-not-allowed" : ""
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="masterThreshold">Master Threshold</Label>
                    <Input
                      id="masterThreshold"
                      type="number"
                      min="1"
                      value={thresholds.masterThreshold}
                      onChange={(e) =>
                        updateThreshold("masterThreshold", e.target.value)
                      }
                      disabled={!customRatingThresholds}
                      className={
                        !customRatingThresholds ? "cursor-not-allowed" : ""
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grandmasterThreshold">
                      Grandmaster Threshold
                    </Label>
                    <Input
                      id="grandmasterThreshold"
                      type="number"
                      min="1"
                      value={thresholds.grandmasterThreshold}
                      onChange={(e) =>
                        updateThreshold("grandmasterThreshold", e.target.value)
                      }
                      disabled={!customRatingThresholds}
                      className={
                        !customRatingThresholds ? "cursor-not-allowed" : ""
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetThreshold">Target Threshold</Label>
                    <Input
                      id="targetThreshold"
                      type="number"
                      min="1"
                      value={thresholds.targetThreshold}
                      onChange={(e) =>
                        updateThreshold("targetThreshold", e.target.value)
                      }
                      disabled={!customRatingThresholds}
                      className={
                        !customRatingThresholds ? "cursor-not-allowed" : ""
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adminThreshold">Admin Threshold</Label>
                    <Input
                      id="adminThreshold"
                      type="number"
                      min="1"
                      value={thresholds.adminThreshold}
                      onChange={(e) =>
                        updateThreshold("adminThreshold", e.target.value)
                      }
                      disabled={!customRatingThresholds}
                      className={
                        !customRatingThresholds ? "cursor-not-allowed" : ""
                      }
                    />
                  </div>
                </div>

                {customRatingThresholds && !validateThresholds() && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                      <span className="text-amber-600 text-sm">
                        Rating thresholds must be in ascending order
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600 text-sm">{error}</span>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={fetcher.state !== "idle"}>
              {fetcher.state !== "idle" ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
