export interface IUsersListData {
  id: string;
  name: string;
  shortName: string;
  course: {
    courseId: number;
    courseName: string;
    rating: number;
  };
}

export interface Recommendations {
  quizId: string;
  quizName: string;
  cluster: string;
  rating: number;
}

export interface Clusters {
  ART: number | null;
  BUSINESS: number | null;
  COMMUNICATION: number | null;
  CRIME: number | null;
  ECONOMY: number | null;
  EDUCATION: number | null;
  ENVIRONMENT: number | null;
  "FAMILY AND CHILDREN": number | null;
  FOOD: number | null;
  HEALTH: number | null;
  LANGUAGE: number | null;
  MEDIA: number | null;
  READING: number | null;
  TECHNOLOGY: number | null;
  TRANSPORT: number | null;
  TRAVEL: number | null;
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
  clusters: Clusters;
}

export interface IUserData {
  id: string;
  name: string;
  shortName: string;
  rating: number;
  avatarURL: string;
  courses?: Course[];
}

export async function getRankings(courseId?: string): Promise<IUsersListData[]> {
  try {
    const url = `/api/ranking/${courseId || 'default'}`;
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error; // Re-throw to handle in the calling function
  }
}

export async function getCourses(): Promise<{ id: string; name: string }[]> {
  try {
    const url = '/api/courses';
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
    return [
      { id: "default", name: "Default Course" }
    ];
  }
}
