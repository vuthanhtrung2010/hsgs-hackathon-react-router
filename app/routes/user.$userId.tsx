"use client";

import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import type { IUserData, getUserData } from "~/lib/server-actions/users";
import { getRatingClass, getRatingTitle } from "~/lib/rating";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import RatingChart from "~/components/RatingChart";
import RatingDisplay from "~/components/RatingDisplay";
import ClusterRadarChart from "~/components/ClusterRadarChart";
import RecommendationsPanel from "~/components/RecommendationsPanel";
import CourseSelector from "~/components/CourseSelector";
import Loading from "~/components/Loading";
import NotFound from "~/components/NotFound";
import type { Route } from "./+types/user.$userId";
import { Config } from "~/config";

export async function meta({ params }: Route.MetaArgs) {
  try {
    const { getUserData } = await import("~/lib/server-actions/users");
    const user = await getUserData(params.userId);
    if (!user) {
      return [
        { title: `No such user - ${Config.siteDescription}` },
        { name: "description", content: "User not found" },
      ];
    }
    return [
      { title: `User ${user.name} - ${Config.siteDescription}` },
      { name: "description", content: `Profile of user ${user.name}. Rating: ${user.rating}` },
    ];
  } catch {
    return [
      { title: `No such user - ${Config.siteDescription}` },
      { name: "description", content: "User not found" },
    ];
  }
}

interface UserPageProps {
  userRank?: number;
}

export default function UserPage({ userRank }: UserPageProps) {
  const params = useParams();
  const userId = params.userId as string;
  const [userData, setUserData] = useState<IUserData | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current course data
  const currentCourse = userData?.courses?.find(course => course.courseId === selectedCourseId) || userData?.courses?.[0];

  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        const { getUserData } = await import("~/lib/server-actions/users");
        const user = await getUserData(userId);
        if (!user) {
          setError("User not found");
          return;
        }
        setUserData(user);
      } catch (err) {
        console.error("Failed to load user data:", err);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [userId]);

  // Separate effect to set default course
  useEffect(() => {
    if (userData?.courses && userData.courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(userData.courses[0].courseId);
    }
  }, [userData, selectedCourseId]);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
  };

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto py-8 px-4">
        <Loading />
      </main>
    );
  }

  if (error || !userData) {
    return <NotFound />;
  }

  return (
    <main className="max-w-6xl mx-auto py-8 px-4">
      <div className="user-profile grid md:grid-cols-[250px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="user-sidebar">
          <div className="mb-6 flex flex-col items-center">
            {userData.avatarURL ? (
              <img
                src={userData.avatarURL}
                alt={`${userData.name}'s avatar`}
                width={128}
                height={128}
                className="w-32 h-32 rounded-full mb-4"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mb-4">
                <FontAwesomeIcon
                  icon={faUser}
                  className="w-16 h-16 text-gray-500"
                />
              </div>
            )}
            <h1
              className={`text-2xl font-bold ${getRatingClass(
                userData.rating
              )} text-center`}
            >
              {userData.name}
            </h1>
            <p className="text-muted-foreground text-center mb-4">
              {getRatingTitle(userData.rating)}
            </p>

            {/* Rating Statistics */}
            <div className="bg-card border rounded-lg p-4 w-full">
              {userRank && (
                <div className="flex justify-between items-center mb-3">
                  <span className="text-muted-foreground">Rank by rating:</span>
                  <span className="font-bold text-lg">#{userRank}</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-3">
                <span className="text-muted-foreground">Rating (avg):</span>
                <RatingDisplay rating={userData.rating} showIcon={true} />
              </div>
              {currentCourse && (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-muted-foreground">
                      Min. rating:
                    </span>
                    <RatingDisplay rating={currentCourse.minRating} showIcon={true} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Max. rating:
                    </span>
                    <RatingDisplay rating={currentCourse.maxRating} showIcon={true} />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4 mt-4">
            <Link
              to={`/user/${userData.id}/submissions`}
              className="text-primary hover:underline block"
            >
              View all submissions
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <div className="user-content">
          {/* Course Selector */}
          {userData.courses && userData.courses.length > 1 && (
            <div className="mb-6 flex items-center gap-4">
              <span className="text-sm font-medium">Course:</span>
              <CourseSelector 
                selectedCourseId={selectedCourseId}
                onCourseChange={handleCourseChange}
              />
            </div>
          )}

          {currentCourse && (
            <>
              {/* IELTS Skills & Recommendations */}
              <div className="grid lg:grid-cols-[2fr_1fr] gap-6 mb-6">
                <ClusterRadarChart 
                  clusters={currentCourse.clusters} 
                  userName={userData.name}
                />
                <RecommendationsPanel 
                  recommendations={currentCourse.recommendations}
                  userRating={userData.rating}
                />
              </div>

              {/* Rating History */}
              <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Rating History - {currentCourse.courseName}</h2>
                {currentCourse.ratingChanges && currentCourse.ratingChanges.length > 0 ? (
                  <div className="w-full">
                    <RatingChart
                      ratingChanges={currentCourse.ratingChanges}
                      minRating={currentCourse.minRating}
                      maxRating={currentCourse.maxRating}
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-[300px] bg-muted/20 rounded-md border border-border">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        No rating history available for this course
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
