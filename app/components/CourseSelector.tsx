import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useEffect, useState } from "react";
import { getCourses } from "~/lib/server-actions/users";

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

  if (loading) {
    return (
      <div
        className={`w-48 h-10 bg-muted animate-pulse rounded-md ${className}`}
      />
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <Select value={selectedCourseId} onValueChange={onCourseChange}>
      <SelectTrigger className={`w-48 ${className}`}>
        <SelectValue placeholder="Select a course" />
      </SelectTrigger>
      <SelectContent>
        {courses.map((course) => (
          <SelectItem key={course.id} value={course.id}>
            {course.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
