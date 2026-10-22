import { useState, useEffect, useMemo } from "react";
import { useFetcher } from "react-router";
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
import { AlertCircle, RotateCcw } from "lucide-react";
import {
  type RatingThresholds,
  DEFAULT_RATING_THRESHOLDS,
  validateRatingThresholds,
} from "~/lib/rating";

interface CourseSettingsDialogProps {
  courseId: string;
  initialQuote?: string;
  initialQuoteAuthor?: string;
  initialShowDebt?: boolean;
  initialCustomRatingThresholds?: boolean;
  initialThresholds?: RatingThresholds | null;
  children: React.ReactNode;
}

interface ThresholdConfig {
  key: keyof RatingThresholds;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  defaultVal: number;
}

const THRESHOLD_CONFIGS: ThresholdConfig[] = [
  {
    key: "newbieThreshold",
    label: "Newbie",
    badgeBg: "bg-zinc-100 dark:bg-zinc-800",
    badgeText: "text-zinc-600 dark:text-zinc-300",
    badgeBorder: "border-zinc-300 dark:border-zinc-700",
    defaultVal: 0,
  },
  {
    key: "amateurThreshold",
    label: "Amateur",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/60",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    badgeBorder: "border-emerald-300 dark:border-emerald-700",
    defaultVal: 1000,
  },
  {
    key: "expertThreshold",
    label: "Expert",
    badgeBg: "bg-blue-50 dark:bg-blue-950/60",
    badgeText: "text-blue-700 dark:text-blue-300",
    badgeBorder: "border-blue-300 dark:border-blue-700",
    defaultVal: 1300,
  },
  {
    key: "candidateMasterThreshold",
    label: "Candidate Master",
    badgeBg: "bg-purple-50 dark:bg-purple-950/60",
    badgeText: "text-purple-700 dark:text-purple-300",
    badgeBorder: "border-purple-300 dark:border-purple-700",
    defaultVal: 1600,
  },
  {
    key: "masterThreshold",
    label: "Master",
    badgeBg: "bg-amber-50 dark:bg-amber-950/60",
    badgeText: "text-amber-700 dark:text-amber-300",
    badgeBorder: "border-amber-300 dark:border-amber-700",
    defaultVal: 1900,
  },
  {
    key: "grandmasterThreshold",
    label: "Grandmaster",
    badgeBg: "bg-red-50 dark:bg-red-950/60",
    badgeText: "text-red-700 dark:text-red-300",
    badgeBorder: "border-red-300 dark:border-red-700",
    defaultVal: 2100,
  },
  {
    key: "targetThreshold",
    label: "Target",
    badgeBg: "bg-rose-50 dark:bg-rose-950/60",
    badgeText: "text-rose-700 dark:text-rose-300",
    badgeBorder: "border-rose-300 dark:border-rose-700",
    defaultVal: 2400,
  },
  {
    key: "adminThreshold",
    label: "Admin",
    badgeBg: "bg-red-100 dark:bg-red-950",
    badgeText: "text-red-900 dark:text-red-200",
    badgeBorder: "border-red-400 dark:border-red-800",
    defaultVal: 3000,
  },
];

type ThresholdInputMap = Record<keyof RatingThresholds, string>;

function thresholdsToInputs(
  t?: Partial<RatingThresholds> | null,
): ThresholdInputMap {
  const src = t || DEFAULT_RATING_THRESHOLDS;
  return {
    newbieThreshold: String(src.newbieThreshold ?? DEFAULT_RATING_THRESHOLDS.newbieThreshold),
    amateurThreshold: String(src.amateurThreshold ?? DEFAULT_RATING_THRESHOLDS.amateurThreshold),
    expertThreshold: String(src.expertThreshold ?? DEFAULT_RATING_THRESHOLDS.expertThreshold),
    candidateMasterThreshold: String(
      src.candidateMasterThreshold ?? DEFAULT_RATING_THRESHOLDS.candidateMasterThreshold,
    ),
    masterThreshold: String(src.masterThreshold ?? DEFAULT_RATING_THRESHOLDS.masterThreshold),
    grandmasterThreshold: String(
      src.grandmasterThreshold ?? DEFAULT_RATING_THRESHOLDS.grandmasterThreshold,
    ),
    targetThreshold: String(src.targetThreshold ?? DEFAULT_RATING_THRESHOLDS.targetThreshold),
    adminThreshold: String(src.adminThreshold ?? DEFAULT_RATING_THRESHOLDS.adminThreshold),
  };
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

  // Thresholds state (stored as strings so users can delete and type freely)
  const [thresholdInputs, setThresholdInputs] = useState<ThresholdInputMap>(() =>
    thresholdsToInputs(initialThresholds),
  );

  // Reset form with latest initial props whenever dialog opens
  useEffect(() => {
    if (open) {
      setQuote(initialQuote);
      setQuoteAuthor(initialQuoteAuthor);
      setShowDebt(initialShowDebt);
      setCustomRatingThresholds(initialCustomRatingThresholds);
      setThresholdInputs(thresholdsToInputs(initialThresholds));
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

  // Update a specific threshold string value
  const updateThreshold = (key: keyof RatingThresholds, value: string) => {
    setThresholdInputs((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
  };

  // Reset to default DMOJ thresholds
  const handleResetToDefaults = () => {
    setThresholdInputs(thresholdsToInputs(DEFAULT_RATING_THRESHOLDS));
    setError(null);
  };

  // Parse current inputs to numbers
  const parsedThresholds = useMemo((): Partial<RatingThresholds> => {
    return {
      newbieThreshold: parseInt(thresholdInputs.newbieThreshold, 10),
      amateurThreshold: parseInt(thresholdInputs.amateurThreshold, 10),
      expertThreshold: parseInt(thresholdInputs.expertThreshold, 10),
      candidateMasterThreshold: parseInt(
        thresholdInputs.candidateMasterThreshold,
        10,
      ),
      masterThreshold: parseInt(thresholdInputs.masterThreshold, 10),
      grandmasterThreshold: parseInt(thresholdInputs.grandmasterThreshold, 10),
      targetThreshold: parseInt(thresholdInputs.targetThreshold, 10),
      adminThreshold: parseInt(thresholdInputs.adminThreshold, 10),
    };
  }, [thresholdInputs]);

  // Per-field validation errors for real-time visual feedback
  const fieldErrors = useMemo(() => {
    const errs: Partial<Record<keyof RatingThresholds, string>> = {};
    if (!customRatingThresholds) return errs;

    for (const cfg of THRESHOLD_CONFIGS) {
      const valStr = thresholdInputs[cfg.key].trim();
      const num = parseInt(valStr, 10);
      if (valStr === "" || isNaN(num)) {
        errs[cfg.key] = "Must be a number";
      }
    }

    if (Object.keys(errs).length > 0) return errs;

    if ((parsedThresholds.newbieThreshold ?? 0) < 0) {
      errs.newbieThreshold = "Must be ≥ 0";
    }

    for (let i = 0; i < THRESHOLD_CONFIGS.length - 1; i++) {
      const cur = THRESHOLD_CONFIGS[i];
      const next = THRESHOLD_CONFIGS[i + 1];
      const curVal = parsedThresholds[cur.key];
      const nextVal = parsedThresholds[next.key];
      if (curVal !== undefined && nextVal !== undefined && curVal >= nextVal) {
        errs[next.key] = `Must be > ${cur.label} (${curVal})`;
      }
    }

    return errs;
  }, [customRatingThresholds, thresholdInputs, parsedThresholds]);

  // Dynamic range / order guidance for each field
  const getFieldHint = (index: number) => {
    const cur = THRESHOLD_CONFIGS[index];
    const prev = index > 0 ? THRESHOLD_CONFIGS[index - 1] : null;
    const next =
      index < THRESHOLD_CONFIGS.length - 1 ? THRESHOLD_CONFIGS[index + 1] : null;

    if (!prev && next) {
      const nextVal = parsedThresholds[next.key];
      const nText = !isNaN(nextVal ?? NaN) ? ` (${nextVal})` : "";
      return `≥ 0 and < ${next.label}${nText}`;
    }
    if (prev && next) {
      const prevVal = parsedThresholds[prev.key];
      const nextVal = parsedThresholds[next.key];
      const pText = !isNaN(prevVal ?? NaN) ? ` (${prevVal})` : "";
      const nText = !isNaN(nextVal ?? NaN) ? ` (${nextVal})` : "";
      return `> ${prev.label}${pText} and < ${next.label}${nText}`;
    }
    if (prev && !next) {
      const prevVal = parsedThresholds[prev.key];
      const pText = !isNaN(prevVal ?? NaN) ? ` (${prevVal})` : "";
      return `> ${prev.label}${pText}`;
    }
    return "";
  };

  // Close dialog on successful save
  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        setOpen(false);
      } else if (fetcher.data.error) {
        setError(fetcher.data.error);
      }
    }
  }, [fetcher.data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (customRatingThresholds) {
      const validation = validateRatingThresholds(parsedThresholds);
      if (!validation.valid) {
        e.preventDefault();
        setError(validation.error || "Please fix threshold validation errors");
        return;
      }
    }
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <fetcher.Form
          method="post"
          action="/admin/courses"
          onSubmit={handleSubmit}
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
            value={thresholdInputs.newbieThreshold}
          />
          <input
            type="hidden"
            name="amateurThreshold"
            value={thresholdInputs.amateurThreshold}
          />
          <input
            type="hidden"
            name="expertThreshold"
            value={thresholdInputs.expertThreshold}
          />
          <input
            type="hidden"
            name="candidateMasterThreshold"
            value={thresholdInputs.candidateMasterThreshold}
          />
          <input
            type="hidden"
            name="masterThreshold"
            value={thresholdInputs.masterThreshold}
          />
          <input
            type="hidden"
            name="grandmasterThreshold"
            value={thresholdInputs.grandmasterThreshold}
          />
          <input
            type="hidden"
            name="targetThreshold"
            value={thresholdInputs.targetThreshold}
          />
          <input
            type="hidden"
            name="adminThreshold"
            value={thresholdInputs.adminThreshold}
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
                  type="button"
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/40 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="customRatingThresholds"
                    type="button"
                    checked={customRatingThresholds}
                    onCheckedChange={(checked) =>
                      setCustomRatingThresholds(checked === true)
                    }
                  />
                  <Label
                    htmlFor="customRatingThresholds"
                    className="cursor-pointer font-medium"
                  >
                    Use custom rating thresholds for this course
                  </Label>
                </div>

                {customRatingThresholds && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetToDefaults}
                    className="text-xs h-8 gap-1.5 self-start sm:self-auto"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset to defaults
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {customRatingThresholds
                      ? "Set custom rating thresholds for this course. Cutoffs must be strictly ascending."
                      : "Currently using standard DMOJ rating thresholds. Enable custom thresholds above to edit."}
                  </p>
                  {!customRatingThresholds && (
                    <span className="text-xs bg-secondary text-secondary-foreground font-medium px-2 py-0.5 rounded-md">
                      Read-only
                    </span>
                  )}
                </div>

                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                    !customRatingThresholds ? "opacity-75" : ""
                  }`}
                >
                  {THRESHOLD_CONFIGS.map((config, index) => {
                    const hasError = !!fieldErrors[config.key];
                    const hint = getFieldHint(index);

                    return (
                      <div
                        key={config.key}
                        className={`p-3 rounded-lg border transition-colors ${
                          hasError
                            ? "border-destructive/60 bg-destructive/5"
                            : "bg-card border-border/70"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Label
                            htmlFor={config.key}
                            className="font-medium text-sm flex items-center gap-2 cursor-pointer"
                          >
                            <span>{config.label}</span>
                          </Label>
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
                          >
                            {config.label}
                          </span>
                        </div>

                        <Input
                          id={config.key}
                          type="number"
                          min="0"
                          value={thresholdInputs[config.key]}
                          onChange={(e) =>
                            updateThreshold(config.key, e.target.value)
                          }
                          disabled={!customRatingThresholds}
                          className={`font-mono text-sm ${
                            hasError
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          } ${!customRatingThresholds ? "cursor-not-allowed bg-muted/50" : ""}`}
                        />

                        <div className="mt-1.5 flex items-center justify-between text-xs">
                          {hasError ? (
                            <span className="text-destructive font-medium">
                              {fieldErrors[config.key]}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {hint}
                            </span>
                          )}
                          <span className="text-muted-foreground/60 text-[10px]">
                            Default: {config.defaultVal}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 mt-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                <span className="text-destructive text-sm font-medium">
                  {error}
                </span>
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
            <Button
              type="submit"
              disabled={fetcher.state !== "idle" || (customRatingThresholds && Object.keys(fieldErrors).length > 0)}
            >
              {fetcher.state !== "idle" ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
