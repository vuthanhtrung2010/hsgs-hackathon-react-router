import { useEffect, useState, useCallback } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faSort,
  faSortUp,
  faSortDown,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { type IUsersListData } from "~/lib/server-actions/users";
import { getRatingTitle } from "~/lib/rating";
import RatingDisplay from "~/components/RatingDisplay";
import CourseSelector from "~/components/CourseSelector";
import "~/styles/rating.css";
import Loading from "~/components/Loading";
import NameDisplay from "~/components/NameDisplay";
import type { Route } from "./+types/users";
import { Config } from "~/config";

const USERS_PER_PAGE = 50;

type SortField = "name" | "rating";
type SortOrder = "asc" | "desc" | null;

export async function loader() {
  try {
    const url = new URL(
      "/api/courses",
      process.env.VITE_API_BASE_URL ||
        import.meta.env.VITE_API_BASE_URL ||
        "https://api.example.com",
    );

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return [{ id: "default", name: "Default Course" }];
    }

    const courses = await response.json();
    return courses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [{ id: "default", name: "Default Course" }];
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Leaderboard - ${Config.siteDescription}` },
    {
      name: "description",
      content: `Leaderboard of users on ${Config.sitename}. View user ratings, ranks, and statistics.`,
    },
  ];
}

export default function UsersPage() {
  const courses = useLoaderData<{ id: string; name: string }[]>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<IUsersListData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUsersListData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("rating");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // Initialize with course from query string or first course sorted by name
  useEffect(() => {
    if (courses && courses.length > 0 && !selectedCourseId) {
      // Sort courses by name
      const sortedCourses = [...courses].sort((a, b) => a.name.localeCompare(b.name));
      
      // Check for course query parameter
      const courseParam = searchParams.get("course");
      const foundCourse = courseParam ? sortedCourses.find(c => c.id === courseParam) : null;
      
      if (foundCourse) {
        setSelectedCourseId(foundCourse.id);
      } else {
        // Remove invalid course param and use first course
        if (courseParam) {
          setSearchParams(new URLSearchParams());
        }
        setSelectedCourseId(sortedCourses[0].id);
      }
    }
  }, [courses, selectedCourseId, searchParams, setSearchParams]);

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
    if (sortField !== field) return faSort;
    if (sortOrder === "asc") return faSortUp;
    if (sortOrder === "desc") return faSortDown;
    return faSort;
  };

  const sortUsers = useCallback(
    (users: IUsersListData[]) => {
      if (!sortField || !sortOrder) return users;

      return [...users].sort((a, b) => {
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
            // Get the rating for the selected course
            aValue =
              a.course && a.course.courseId.toString() === selectedCourseId
                ? a.course.rating
                : 1500;
            bValue =
              b.course && b.course.courseId.toString() === selectedCourseId
                ? b.course.rating
                : 1500;

            const comparison = (aValue as number) - (bValue as number);
            return sortOrder === "asc" ? comparison : -comparison;
          default:
            return 0;
        }

        return 0;
      });
    },
    [sortField, sortOrder, selectedCourseId],
  );

  // Load users when course changes
  useEffect(() => {
    async function loadUsers() {
      if (!selectedCourseId) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/ranking/${selectedCourseId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const usersData = await response.json();
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to load users:", error);
        // Use mock data as fallback
        const mockUsers: IUsersListData[] = [
          {
            id: "26078",
            name: "Học Sinh",
            shortName: "Học Sinh",
            course: {
              courseId: parseInt(selectedCourseId),
              courseName: "IELTS Practice",
              rating: 1581,
            },
          },
          {
            id: "26079",
            name: "Nguyễn Hòa Bình",
            shortName: "Nguyễn Hòa Bình",
            course: {
              courseId: parseInt(selectedCourseId),
              courseName: "IELTS Practice",
              rating: 1541,
            },
          },
          {
            id: "26071",
            name: "An Hiep",
            shortName: "An Hiep",
            course: {
              courseId: parseInt(selectedCourseId),
              courseName: "IELTS Practice",
              rating: 1501,
            },
          },
        ];
        setUsers(mockUsers);
      } finally {
        setIsLoading(false);
      }
    }

    loadUsers();
  }, [selectedCourseId]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    filtered = sortUsers(filtered);

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users, sortField, sortOrder, sortUsers]);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    // Update URL with course query parameter
    setSearchParams({ course: courseId });
  };

  return (
    <main className="max-w-7xl mx-auto py-8 px-4">
      {!isLoaded && <Loading />}
      <div
        className={`users-page-container ${isLoaded ? "loaded" : "loading"}`}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4 flex items-center">
            <FontAwesomeIcon icon={faTrophy} className="mr-2 trophy-icon" />
            Leaderboard
          </h1>
          <hr className="mb-6" />

          {/* Course Selector */}
          <div className="mb-4 flex items-center gap-4">
            <span className="text-sm font-medium">Course:</span>
            <CourseSelector
              selectedCourseId={selectedCourseId}
              onCourseChange={handleCourseChange}
              courses={[...courses].sort((a, b) => a.name.localeCompare(b.name))}
            />
          </div>

          <div className="search-controls">
            <div className="search-input-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <Input
                type="text"
                placeholder="Search users by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear
              </Button>
            )}
          </div>
          <div className="results-info">
            {isLoading ? (
              <span>Loading users...</span>
            ) : (
              <>
                Showing {filteredUsers.length} users
                {totalPages > 1 && (
                  <>
                    {" "}
                    • Page {currentPage} of {totalPages}
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-800 dark:bg-white">
                  <th className="h-12 px-4 text-center align-middle font-medium text-white dark:text-gray-900 border-r border-gray-600 dark:border-gray-300 first:rounded-tl-md w-[4rem]">
                    Rank
                  </th>
                  <th
                    className="h-12 px-4 text-center align-middle font-medium text-white dark:text-gray-900 border-r border-gray-600 dark:border-gray-300 w-[8rem] cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-100"
                    onClick={() => handleSort("rating")}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Rating
                      <FontAwesomeIcon
                        icon={getSortIcon("rating")}
                        className="w-3 h-3"
                      />
                    </div>
                  </th>
                  <th
                    className="h-12 px-4 text-left align-middle font-medium text-white dark:text-gray-900 rounded-tr-md cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-100"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      <FontAwesomeIcon
                        icon={getSortIcon("name")}
                        className="w-3 h-3"
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="h-24 px-4 text-center text-muted-foreground"
                    >
                      <div className="flex items-center justify-center">
                        <Loading />
                      </div>
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="h-24 px-4 text-center text-muted-foreground"
                    >
                      <span>
                        {searchTerm
                          ? "No users found matching your search."
                          : "No users available."}
                      </span>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user, index) => {
                    const rating =
                      user.course &&
                      user.course.courseId.toString() === selectedCourseId
                        ? user.course.rating
                        : 1500;
                    return (
                      <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle text-center border-r border-border">
                          <span className="font-bold text-lg">
                            #{startIndex + index + 1}
                          </span>
                        </td>
                        <td className="p-4 align-middle text-center border-r border-border">
                          <RatingDisplay
                            rating={Math.round(rating)}
                            showIcon={true}
                          />
                        </td>
                        <td className="p-4 align-middle">
                          <Link
                            to={`/user/${user.id}`}
                            className="text-primary hover:underline font-medium"
                            title={getRatingTitle(Math.round(rating))}
                          >
                            <NameDisplay
                              name={user.name}
                              rating={Math.round(rating)}
                            />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {/* Page numbers */}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 7) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 4) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    pageNumber = totalPages - 6 + i;
                  } else {
                    pageNumber = currentPage - 3 + i;
                  }

                  if (
                    pageNumber === currentPage - 2 &&
                    currentPage > 4 &&
                    totalPages > 7
                  ) {
                    return (
                      <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  if (
                    pageNumber === currentPage + 2 &&
                    currentPage < totalPages - 3 &&
                    totalPages > 7
                  ) {
                    return (
                      <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={pageNumber === currentPage}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
        {currentUsers.length > 0 && (
          <div className="mt-6 text-sm text-muted-foreground">
            <p>
              Click on a name to view their profile and detailed statistics.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
