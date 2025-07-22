"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
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
import { type IUsersListData, getRankings } from "~/lib/server-actions/users";
import { getRatingTitle } from "~/lib/rating";
import RatingDisplay from "~/components/RatingDisplay";
import CourseSelector from "~/components/CourseSelector";
import "~/styles/rating.css";
import "~/styles/table.css";
import Loading from "~/components/Loading";
import NameDisplay from "~/components/NameDisplay";
import type { Route } from "./+types/users";
import { Config } from "~/config";

const USERS_PER_PAGE = 50;

type SortField = "name" | "rating";
type SortOrder = "asc" | "desc" | null;

export function meta({}: Route.MetaArgs) {
  return [
    { title: `Leaderboard - ${Config.siteDescription}` },
    { name: "description", content: `Leaderboard of users on ${Config.sitename}. View user ratings, ranks, and statistics.` },
  ];
}

export default function UsersPage() {
  const [users, setUsers] = useState<IUsersListData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUsersListData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("rating");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

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
            if (typeof aValue === 'string' && typeof bValue === 'string') {
              return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }
            break;
          case "rating":
            // Get the rating for the selected course
            aValue = (a.course && a.course.courseId.toString() === selectedCourseId) ? a.course.rating : 1500;
            bValue = (b.course && b.course.courseId.toString() === selectedCourseId) ? b.course.rating : 1500;
            
            const comparison = (aValue as number) - (bValue as number);
            return sortOrder === "asc" ? comparison : -comparison;
          default:
            return 0;
        }

        return 0;
      });
    },
    [sortField, sortOrder, selectedCourseId]
  );

  // Load users when course changes
  useEffect(() => {
    async function loadUsers() {
      if (!selectedCourseId) return;
      
      setIsLoading(true);
      try {
        const usersData = await getRankings(selectedCourseId);
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
              rating: 1581
            }
          },
          {
            id: "26079", 
            name: "Nguyễn Hòa Bình",
            shortName: "Nguyễn Hòa Bình",
            course: {
              courseId: parseInt(selectedCourseId),
              courseName: "IELTS Practice",
              rating: 1541
            }
          },
          {
            id: "26071",
            name: "An Hiep",
            shortName: "An Hiep", 
            course: {
              courseId: parseInt(selectedCourseId),
              courseName: "IELTS Practice",
              rating: 1501
            }
          }
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
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered = sortUsers(filtered);

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users, sortField, sortOrder, sortUsers]);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  return (
    <main className="max-w-7xl mx-auto py-8 px-4">
      {!isLoaded && <Loading />}
      <div className={`users-page-container ${isLoaded ? "loaded" : "loading"}`}>
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
        <div className="table-wrapper">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr className="data-table-header">
                  <th className="data-table-header-cell center" style={{ width: "4rem" }}>
                    Rank
                  </th>
                  <th
                    className="data-table-header-cell center sortable"
                    onClick={() => handleSort("rating")}
                    style={{ width: "8rem" }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      Rating
                      <FontAwesomeIcon icon={getSortIcon("rating")} className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="data-table-header-cell sortable"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      <FontAwesomeIcon icon={getSortIcon("name")} className="w-3 h-3" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="data-table-body-cell center" style={{ height: "6rem" }}>
                      <div className="flex items-center justify-center">
                        <Loading />
                      </div>
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="data-table-body-cell center" style={{ height: "6rem" }}>
                      <span className="text-muted-foreground">
                        {searchTerm
                          ? "No users found matching your search."
                          : "No users available."}
                      </span>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user, index) => {
                    const rating = (user.course && user.course.courseId.toString() === selectedCourseId) ? user.course.rating : 1500;
                    return (
                      <tr key={user.id} className="data-table-body-row">
                        <td className="data-table-body-cell center">
                          <span className="font-bold text-lg">#{startIndex + index + 1}</span>
                        </td>
                        <td className="data-table-body-cell center" style={{ verticalAlign: "middle" }}>
                          <RatingDisplay rating={Math.round(rating)} showIcon={true} />
                        </td>
                        <td className="data-table-body-cell">
                          <Link
                            to={`/user/${user.id}`}
                            className="username-link"
                            title={getRatingTitle(Math.round(rating))}
                          >
                            <NameDisplay name={user.name} rating={Math.round(rating)} />
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
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
        {currentUsers.length > 0 && (
          <div className="mt-6 text-sm text-muted-foreground">
            <p>Click on a name to view their profile and detailed statistics.</p>
          </div>
        )}
      </div>
    </main>
  );
}
