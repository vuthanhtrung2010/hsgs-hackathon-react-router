import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  BookOpen,
  Search,
  SlidersHorizontal,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileSearch,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "~/components/ui/command";
import { type Problem } from "~/lib/server-actions/problems";
import RatingDisplay from "~/components/RatingDisplay";
import CourseSelector from "~/components/CourseSelector";
import "~/styles/rating.css";
import type { Route } from "./+types/problems";
import { Config } from "~/config";

const PROBLEMS_PER_PAGE = 25;

type SortField = "name" | "rating" | "course";
type SortOrder = "asc" | "desc" | null;

export async function loader({}: Route.LoaderArgs): Promise<{
  problems: Problem[];
  courses: any[];
}> {
  try {
    const baseUrl =
      process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "https://api.example.com";

    // Fetch both problems and courses in parallel
    const [problemsResponse, coursesResponse] = await Promise.all([
      fetch(new URL("/api/problems", baseUrl).toString()),
      fetch(new URL("/api/courses", baseUrl).toString()),
    ]);

    const problems = problemsResponse.ok
      ? ((await problemsResponse.json()) as Problem[])
      : [];
    const courses = coursesResponse.ok
      ? ((await coursesResponse.json()) as any[])
      : [{ id: "default", name: "Default Course" }];

    return { problems, courses };
  } catch (error) {
    console.error("Error loading data:", error);
    return {
      problems: [],
      courses: [{ id: "default", name: "Default Course" }],
    };
  }
}

export function meta({}: Route.MetaArgs): Route.MetaDescriptors {
  return [
    { title: `Problems - ${Config.siteDescription}` },
    {
      name: "description",
      content: `Browse programming problems and challenges on ${Config.sitename}. Filter by course, type, and difficulty.`,
    },
  ];
}

export default function Problems({ loaderData }: Route.ComponentProps) {
  const { problems: initialProblems, courses } = loaderData;
  const [problems, setProblems] = useState<Problem[]>(initialProblems || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("rating");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.id || "",
  );
  const [selectedProblemTypes, setSelectedProblemTypes] = useState<string[]>(
    [],
  );

  // Initialize with first course from loader
  useEffect(() => {
    if (courses && courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  useEffect(() => {
    setProblems(initialProblems || []);
  }, [initialProblems]);

  // Collect all unique problem types from the data
  const availableProblemTypes = useMemo(() => {
    const typeSet = new Set<string>();
    problems.forEach((problem) => {
      problem.type.forEach((type) => typeSet.add(type));
    });
    return Array.from(typeSet).sort();
  }, [problems]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortOrder("asc");
      }
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field)
      return <ArrowUpDown className="size-3.5 opacity-50" aria-hidden="true" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="size-3.5 text-primary" aria-hidden="true" />
    ) : (
      <ArrowDown className="size-3.5 text-primary" aria-hidden="true" />
    );
  };

  const sortProblems = useCallback(
    (problems: Problem[]) => {
      if (!sortField || !sortOrder) return problems;

      return [...problems].sort((a, b) => {
        let aValue: number | string;
        let bValue: number | string;

        switch (sortField) {
          case "name":
            aValue = a.name;
            bValue = b.name;
            if (typeof aValue === "string" && typeof bValue === "string") {
              return sortOrder === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
            }
            break;
          case "rating":
            aValue = a.rating;
            bValue = b.rating;
            const ratingComparison = (aValue as number) - (bValue as number);
            return sortOrder === "asc" ? ratingComparison : -ratingComparison;
          case "course":
            aValue = a.course.name;
            bValue = b.course.name;
            if (typeof aValue === "string" && typeof bValue === "string") {
              return sortOrder === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
            }
            break;
          default:
            return 0;
        }

        return 0;
      });
    },
    [sortField, sortOrder],
  );

  // Derive results during render so server-rendered pages show real data immediately.
  const filteredProblems = useMemo(() => {
    let filtered = problems;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((problem) =>
        problem.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by course
    if (selectedCourseId && selectedCourseId !== "all") {
      filtered = filtered.filter(
        (problem) => problem.course.courseId === selectedCourseId,
      );
    }

    // Filter by problem types
    if (selectedProblemTypes.length > 0) {
      filtered = filtered.filter((problem) =>
        problem.type.some((type) => selectedProblemTypes.includes(type)),
      );
    }

    return sortProblems(filtered);
  }, [
    searchTerm,
    problems,
    sortField,
    sortOrder,
    selectedCourseId,
    selectedProblemTypes,
    sortProblems,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedCourseId,
    selectedProblemTypes,
    sortField,
    sortOrder,
  ]);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  const handleProblemTypeToggle = (type: string) => {
    setSelectedProblemTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedProblemTypes([]);
    setSelectedCourseId("all");
  };

  const totalPages = Math.ceil(filteredProblems.length / PROBLEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROBLEMS_PER_PAGE;
  const endIndex = startIndex + PROBLEMS_PER_PAGE;
  const currentProblems = filteredProblems.slice(startIndex, endIndex);

  const typeBadges = (problem: Problem) => (
    <div className="flex flex-wrap gap-1.5">
      {problem.type.map((type) => (
        <Badge
          key={type}
          variant="secondary"
          className="max-w-full rounded-md bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground"
        >
          <span className="truncate" title={type}>
            {type}
          </span>
        </Badge>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-7 flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-secondary text-primary">
          <BookOpen className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            Problem library
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Find your next challenge. Build on what you know.
          </p>
        </div>
      </div>

      <section
        aria-label="Problem filters"
        className="mb-6 rounded-2xl border border-border bg-card p-4 sm:p-5"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="problem-search"
              className="mb-2 block text-xs font-medium text-muted-foreground"
            >
              Search the library
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-3 size-4 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="problem-search"
                type="text"
                placeholder="Search problems by name…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-10 rounded-xl bg-background/50 pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1 top-1 flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="min-w-0 flex-1 lg:w-64 lg:flex-none">
              <span
                id="course-label"
                className="mb-2 block text-xs font-medium text-muted-foreground"
              >
                Course
              </span>
              <CourseSelector
                selectedCourseId={selectedCourseId}
                onCourseChange={handleCourseChange}
                courses={[...courses, { id: "all", name: "All Courses" }]}
                className="w-full"
              />
            </div>
            <div className="sm:self-end">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full gap-2 sm:w-auto">
                    <SlidersHorizontal aria-hidden="true" />
                    Topics
                    {selectedProblemTypes.length > 0 && (
                      <span className="flex size-5 items-center justify-center rounded-md bg-secondary text-xs text-secondary-foreground">
                        {selectedProblemTypes.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl p-0"
                >
                  <Command label="Find a topic">
                    <CommandInput
                      placeholder="Find a topic…"
                      aria-label="Find a topic"
                    />
                    <CommandList className="max-h-72">
                      <CommandEmpty>No topics found.</CommandEmpty>
                      <CommandGroup heading="Filter by one or more topics">
                        {availableProblemTypes.map((type) => (
                          <CommandItem
                            key={type}
                            value={type}
                            onSelect={() => handleProblemTypeToggle(type)}
                            className="my-1 min-h-10 cursor-pointer gap-3 rounded-lg px-3"
                          >
                            <span
                              aria-hidden="true"
                              className={`flex size-4 shrink-0 items-center justify-center rounded border ${selectedProblemTypes.includes(type) ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}
                            >
                              {selectedProblemTypes.includes(type) && (
                                <Check className="size-3" />
                              )}
                            </span>
                            <span className="min-w-0 flex-1 break-words">
                              {type}
                            </span>
                            <span className="sr-only">
                              {selectedProblemTypes.includes(type)
                                ? "selected"
                                : "not selected"}
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                  <p className="border-t border-border px-3 py-2.5 text-xs text-muted-foreground">
                    Matches any selected topic.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        {selectedProblemTypes.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            {selectedProblemTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleProblemTypeToggle(type)}
                aria-label={`Remove topic ${type}`}
                title={type}
                className="inline-flex h-8 max-w-56 items-center gap-2 rounded-full border border-border px-3 text-xs hover:bg-muted"
              >
                <span className="truncate">{type}</span>
                <X
                  className="size-3 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedProblemTypes([])}
              className="text-xs text-muted-foreground"
            >
              Clear topics
            </Button>
          </div>
        )}
      </section>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted-foreground">
          <span className="font-medium tabular-nums text-foreground">
            {filteredProblems.length.toLocaleString()}
          </span>{" "}
          {filteredProblems.length === 1 ? "problem" : "problems"}
          {filteredProblems.length > 0 && (
            <span className="ml-2 hidden text-xs sm:inline">
              Showing {startIndex + 1}–
              {Math.min(endIndex, filteredProblems.length)}
            </span>
          )}
        </p>
        <div className="flex items-center gap-3">
          {(searchTerm || selectedProblemTypes.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-muted-foreground"
            >
              Reset filters
            </Button>
          )}
          <div className="sm:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown aria-hidden="true" />
                  Sort
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-48 p-1.5">
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  Sort problems by
                </p>
                {(["name", "rating", "course"] as SortField[]).map((field) => (
                  <Button
                    key={field}
                    variant="ghost"
                    onClick={() => handleSort(field)}
                    className="w-full justify-between capitalize"
                  >
                    {field}
                    {getSortIcon(field)}
                  </Button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {currentProblems.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-16 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <FileSearch className="size-6" aria-hidden="true" />
            </span>
            <h2 className="text-base font-semibold">
              {searchTerm || selectedProblemTypes.length > 0
                ? "No matching problems"
                : "No problems in this course yet"}
            </h2>
            <p className="mt-2 max-w-sm break-words text-sm leading-relaxed text-muted-foreground">
              {searchTerm
                ? `Try another search instead of “${searchTerm}”, or adjust your filters.`
                : "Try a different course or topic to discover more exercises."}
            </p>
            <Button variant="outline" className="mt-5" onClick={resetFilters}>
              Reset filters
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full table-fixed text-sm">
                <caption className="sr-only">
                  Problems matching the selected course, topics, and search.
                </caption>
                <thead>
                  <tr className="border-b border-border bg-muted/60">
                    {(
                      [
                        {
                          field: "name",
                          label: "Problem",
                          className: "w-[40%]",
                        },
                        {
                          field: "rating",
                          label: "Rating",
                          className: "w-[14%]",
                        },
                        { field: null, label: "Topics", className: "w-[23%]" },
                        {
                          field: "course",
                          label: "Course",
                          className: "w-[23%]",
                        },
                      ] as const
                    ).map(({ field, label, className }) => (
                      <th
                        key={label}
                        scope="col"
                        aria-sort={
                          field && sortField === field
                            ? sortOrder === "asc"
                              ? "ascending"
                              : "descending"
                            : undefined
                        }
                        className={`px-5 py-1 text-left text-xs font-medium text-muted-foreground ${className}`}
                      >
                        {field ? (
                          <button
                            type="button"
                            onClick={() => handleSort(field)}
                            className="flex min-h-11 w-full items-center gap-2 text-left hover:text-foreground"
                          >
                            {label}
                            {getSortIcon(field)}
                          </button>
                        ) : (
                          label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentProblems.map((problem) => (
                    <tr
                      key={problem.problemId}
                      className="group transition-colors hover:bg-secondary/40"
                    >
                      <td className="px-5 py-4 align-top">
                        <Link
                          to={problem.course.canvasUrl}
                          className="inline-flex min-h-8 items-start gap-2 break-words font-medium leading-relaxed text-foreground hover:text-primary hover:underline [overflow-wrap:anywhere]"
                        >
                          {problem.name}
                          <ExternalLink
                            className="mt-1 size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                            aria-hidden="true"
                          />
                        </Link>
                      </td>
                      <td className="px-5 py-4 align-top tabular-nums">
                        <div className="flex min-h-8 items-start pt-1">
                          {problem.rating === 0 || problem.rating === 1500 ? (
                            <span className="text-xs text-muted-foreground">
                              Unrated
                            </span>
                          ) : (
                            <RatingDisplay
                              rating={Math.round(problem.rating)}
                              showIcon
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        {typeBadges(problem)}
                      </td>
                      <td className="break-words px-5 py-4 align-top text-xs leading-relaxed text-muted-foreground">
                        {problem.course.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul
              className="divide-y divide-border sm:hidden"
              aria-label="Problems"
            >
              {currentProblems.map((problem) => (
                <li key={problem.problemId} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={problem.course.canvasUrl}
                      className="inline-flex min-h-8 min-w-0 flex-1 items-start break-words text-sm font-medium leading-relaxed hover:text-primary [overflow-wrap:anywhere]"
                    >
                      {problem.name}
                    </Link>
                    <span className="shrink-0 pt-0.5 text-xs tabular-nums">
                      {problem.rating === 0 || problem.rating === 1500 ? (
                        <span className="text-muted-foreground">Unrated</span>
                      ) : (
                        <RatingDisplay
                          rating={Math.round(problem.rating)}
                          showIcon
                        />
                      )}
                    </span>
                  </div>
                  <p className="mt-1.5 break-words text-xs leading-relaxed text-muted-foreground">
                    {problem.course.name}
                  </p>
                  {problem.type.length > 0 && (
                    <div className="mt-3">{typeBadges(problem)}</div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
        {totalPages > 1 && (
          <nav
            aria-label="Problem pages"
            className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 sm:px-5"
          >
            <p className="text-xs tabular-nums text-muted-foreground">
              Page{" "}
              <span className="font-medium text-foreground">{currentPage}</span>{" "}
              of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft aria-hidden="true" />
                <span>Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((page) => Math.min(page + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <span>Next</span>
                <ChevronRight aria-hidden="true" />
              </Button>
            </div>
          </nav>
        )}
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs leading-relaxed text-muted-foreground">
        <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
        Problems open in your course’s learning platform.
      </p>
    </div>
  );
}
