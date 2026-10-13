import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import { X, Search, Users, Check, AlertCircle } from "lucide-react";
import { parseStudentIds } from "~/lib/student-id-parser";

export interface CandidateStudent {
  studentId: string;
  name: string;
  shortName: string;
}

export interface SubLeaderboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  courseId: string;
  subLeaderboardId?: string;
  initialName?: string;
  onSuccess: () => void;
}

export default function SubLeaderboardDialog({
  open,
  onOpenChange,
  mode,
  courseId,
  subLeaderboardId,
  initialName = "",
  onSuccess,
}: SubLeaderboardDialogProps) {
  const [name, setName] = useState(initialName);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<CandidateStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or fetch details on open
  useEffect(() => {
    if (!open) return;

    setName(initialName);
    setError(null);
    setSearchQuery("");
    setBulkInput("");

    // 1. Fetch course students to populate candidate list
    const fetchCourseStudents = async () => {
      setLoadingCandidates(true);
      try {
        const res = await fetch(`/api/courses/${courseId}/students`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const studentList: CandidateStudent[] = data.map((entry: any) => ({
              studentId: String(entry.id),
              name: entry.name || "Unknown",
              shortName: entry.name || "Unknown",
            }));
            setCandidates(studentList);
          }
        } else {
          console.error("Failed to load students for course:", res.status);
        }
      } catch (err) {
        console.error("Failed to load candidate students:", err);
      } finally {
        setLoadingCandidates(false);
      }
    };

    if (courseId) {
      fetchCourseStudents();
    }

    // 2. If in edit mode, fetch existing sub-leaderboard details and members
    if (mode === "edit" && subLeaderboardId) {
      const fetchDetails = async () => {
        try {
          const res = await fetch(
            `/api/admin/sub-leaderboards/${subLeaderboardId}`,
            {
              credentials: "include",
            },
          );
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.subLeaderboard) {
              setName(data.subLeaderboard.name || initialName);
              if (Array.isArray(data.members)) {
                setSelectedStudentIds(
                  data.members.map((m: any) => String(m.studentId)),
                );
                // Also merge any member into candidates if missing
                setCandidates((prev) => {
                  const existingIds = new Set(prev.map((c) => c.studentId));
                  const newOnes = data.members
                    .filter((m: any) => !existingIds.has(String(m.studentId)))
                    .map((m: any) => ({
                      studentId: String(m.studentId),
                      name: m.name || "Unknown",
                      shortName: m.shortName || m.name || "Unknown",
                    }));
                  return [...prev, ...newOnes];
                });
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch sub-leaderboard details:", err);
        }
      };
      fetchDetails();
    } else {
      setSelectedStudentIds([]);
    }
  }, [open, mode, courseId, subLeaderboardId, initialName]);

  // Lookup map from studentId to candidate name
  const studentMap = useMemo(() => {
    const map = new Map<string, CandidateStudent>();
    candidates.forEach((c) => map.set(c.studentId, c));
    return map;
  }, [candidates]);

  // Filtered candidate list based on search query
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates;
    const query = searchQuery.toLowerCase().trim();
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.shortName.toLowerCase().includes(query) ||
        c.studentId.toLowerCase().includes(query),
    );
  }, [candidates, searchQuery]);

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const removeStudent = (studentId: string) => {
    setSelectedStudentIds((prev) => prev.filter((id) => id !== studentId));
  };

  const handleApplyBulk = () => {
    const parsed = parseStudentIds(bulkInput);
    if (parsed.length > 0) {
      setSelectedStudentIds((prev) =>
        Array.from(new Set([...prev, ...parsed])),
      );
      setBulkInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a name for the sub-leaderboard");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const endpoint =
        mode === "create"
          ? "/api/admin/sub-leaderboards"
          : `/api/admin/sub-leaderboards/${subLeaderboardId}`;

      const method = mode === "create" ? "POST" : "PUT";
      const payload =
        mode === "create"
          ? {
              courseId,
              name: name.trim(),
              studentIds: selectedStudentIds,
            }
          : {
              name: name.trim(),
              studentIds: selectedStudentIds,
            };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || "Failed to save sub-leaderboard");
      }
    } catch (err) {
      console.error("Error saving sub-leaderboard:", err);
      setError("Failed to connect to server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Create Sub-Leaderboard"
              : "Edit Sub-Leaderboard"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a dedicated cohort or section leaderboard for this course."
              : "Update the title and enrolled member students for this sub-leaderboard."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden space-y-4"
        >
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Title Input */}
          <div className="space-y-1.5">
            <Label htmlFor="sub-name">Sub-Leaderboard Name</Label>
            <Input
              id="sub-name"
              placeholder="e.g. Class 10A1, Lab Group Beta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Members Selection Section */}
          <div className="flex-1 flex flex-col min-h-0 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Selected Members ({selectedStudentIds.length})</span>
              </Label>
              {selectedStudentIds.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStudentIds([])}
                  className="h-7 text-xs text-muted-foreground hover:text-destructive"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Selected Members Chips */}
            <div className="min-h-[52px] max-h-24 overflow-y-auto p-2 rounded-md border border-input bg-muted/20 flex flex-wrap gap-1.5 items-start">
              {selectedStudentIds.length === 0 ? (
                <span className="text-xs text-muted-foreground italic p-1">
                  No members selected yet. Select students below or paste IDs in bulk.
                </span>
              ) : (
                selectedStudentIds.map((studentId) => {
                  const student = studentMap.get(studentId);
                  const displayName = student
                    ? `${student.name} (${studentId})`
                    : studentId;
                  return (
                    <Badge
                      key={studentId}
                      variant="secondary"
                      className="pl-2.5 pr-1 py-1 gap-1 flex items-center text-xs"
                    >
                      <span className="truncate max-w-[200px]" title={displayName}>
                        {displayName}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeStudent(studentId)}
                        className="rounded-full hover:bg-muted p-0.5"
                        aria-label={`Remove ${displayName}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })
              )}
            </div>

            {/* Member Selection Tabs */}
            <Tabs defaultValue="search" className="flex-1 flex flex-col min-h-0 mt-2">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="search">Search Enrolled Students</TabsTrigger>
                <TabsTrigger value="bulk">Bulk Paste IDs</TabsTrigger>
              </TabsList>

              {/* Tab 1: Search and Select */}
              <TabsContent
                value="search"
                className="flex-1 flex flex-col min-h-0 space-y-2 mt-2"
              >
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                <div className="flex-1 min-h-[140px] max-h-[200px] overflow-y-auto border rounded-md divide-y divide-border">
                  {loadingCandidates ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      Loading course students...
                    </div>
                  ) : filteredCandidates.length === 0 ? (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      {candidates.length === 0
                        ? "No students found in this course"
                        : "No students matching your search"}
                    </div>
                  ) : (
                    filteredCandidates.map((candidate) => {
                      const isSelected = selectedStudentIds.includes(
                        candidate.studentId,
                      );
                      return (
                        <div
                          key={candidate.studentId}
                          onClick={() => toggleStudent(candidate.studentId)}
                          className={`flex items-center justify-between p-2.5 text-sm cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate">{candidate.name}</span>
                            <span className="text-xs text-muted-foreground">
                              #{candidate.studentId}
                            </span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 shrink-0" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>

              {/* Tab 2: Bulk ID Textarea */}
              <TabsContent
                value="bulk"
                className="flex-1 flex flex-col min-h-0 space-y-2 mt-2"
              >
                <Textarea
                  placeholder="Paste student IDs separated by commas, spaces, or newlines (e.g. 1001, 1002, 1003)..."
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  className="h-28 text-sm font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleApplyBulk}
                  disabled={!bulkInput.trim()}
                  className="self-end"
                >
                  Add IDs to Members
                </Button>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : mode === "create"
                  ? "Create Sub-Leaderboard"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
