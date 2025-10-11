export interface IUsersListData {
  id: string;
  name: string;
  shortName: string;
  course: {
    courseId: number;
    courseName: string;
    rating: number;
    quizzesCompleted?: number; // Number of completed quizzes
    quote?: string | null; // Course motivational quote
    quoteAuthor?: string | null; // Quote author
  };
}

export interface Recommendations {
  quizId: string;
  quizName: string;
  rating: number;
  canvasUrl: string;
}

export interface Course {
  courseId: string;
  courseName: string;
  minRating: number;
  maxRating: number;
  ratingChanges: {
    date: string;
    rating: number;
  }[];
  recommendations?: Recommendations[];
  clusters: Record<string, any>; // Simplified for compatibility
}

export interface IUserData {
  id: string;
  name: string;
  shortName: string;
  rating: number;
  avatarURL: string;
  courses?: Course[];
}

export async function getRankings(
  courseId?: string,
): Promise<IUsersListData[]> {
  try {
    const url = `/api/ranking/${courseId || "default"}`;
    const response = await fetch(url, {
      method: "GET",
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const data = await response.json();
    return data as IUsersListData[];
  } catch (error) {
    console.error("Error fetching users list:", error);
    throw error; // Re-throw to handle in the calling function
  }
}

export async function getUserData(userId: string): Promise<IUserData> {
  try {
    const url = `/api/users/${userId}`;
    const response = await fetch(url, {
      method: "GET",
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }

    const data = (await response.json()) as IUserData;
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error; // Re-throw to handle in the calling function
  }
}

export async function getCourses(): Promise<{ id: string; name: string }[]> {
  try {
    const url = "/api/courses";
    const response = await fetch(url, {
      method: "GET",
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.statusText}`);
    }

    const data = await response.json();
    return data as { id: string; name: string }[];
  } catch (error) {
    console.error("Error fetching courses:", error);
    // Return fallback courses if API fails
    return [{ id: "default", name: "Default Course" }];
  }
}
