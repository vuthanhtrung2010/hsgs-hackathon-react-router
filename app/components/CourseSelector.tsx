import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { getCourses } from "~/lib/server-actions/users";
import { cn } from "~/lib/utils";

interface CourseData {
  id: string;
  name: string;
}

interface CourseSelectorProps {
  selectedCourseId?: string;
  onCourseChange: (courseId: string) => void;
  className?: string;
  courses?: CourseData[]; // Accept courses as a prop
}

export default function CourseSelector({
  selectedCourseId,
  onCourseChange,
  className,
  courses: propCourses,
}: CourseSelectorProps) {
  const [courses, setCourses] = useState<CourseData[]>(propCourses || []);
  const [loading, setLoading] = useState(!propCourses);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      try {
        const coursesData = await getCourses();
        setCourses(coursesData);

        // If no course is selected, select the first one
        if (!selectedCourseId && coursesData.length > 0) {
          onCourseChange(coursesData[0].id);
        }
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!propCourses) {
      loadCourses();
    } else {
      setCourses(propCourses);
      setLoading(false);
    }
  }, [propCourses, selectedCourseId, onCourseChange]);

  // Use prop courses if provided, otherwise use state courses
  const displayCourses = propCourses || courses;
  const selectedCourse = displayCourses.find(
    (course) =>
      course.id === selectedCourseId ||
      (course as any).randomId === selectedCourseId,
  );

  if (loading) {
    return (
      <Button
        variant="outline"
        className={cn("w-[240px] max-w-full justify-between gap-3", className)}
        disabled
      >
        Loading...
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Course"
          className={cn(
            "w-[240px] max-w-full justify-between gap-3",
            className,
          )}
        >
          <span
            className="min-w-0 truncate text-left"
            title={selectedCourse?.name}
          >
            {selectedCourse ? selectedCourse.name : "Select course..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-60 max-w-[calc(100vw-2rem)] rounded-xl p-0"
      >
        <Command label="Search courses">
          <CommandInput
            placeholder="Search courses..."
            aria-label="Search courses"
          />
          <CommandList>
            <CommandEmpty>No course found.</CommandEmpty>
            <CommandGroup>
              {displayCourses.map((course) => (
                <CommandItem
                  key={course.id}
                  className="my-1 min-h-10 rounded-lg"
                  value={course.id}
                  keywords={[course.name]}
                  onSelect={(currentValue) => {
                    onCourseChange(currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCourseId === course.id ||
                        (course as any).randomId === selectedCourseId
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <span className="min-w-0 break-words">{course.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
