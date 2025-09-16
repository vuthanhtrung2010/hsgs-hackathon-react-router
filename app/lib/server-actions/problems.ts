export interface Course {
  courseId: string;
  name: string;
  canvasUrl: string;
}

export type ProblemType =
  | "Art"
  | "Business"
  | "Communication"
  | "Crime"
  | "Economy"
  | "Education"
  | "Environment"
  | "Family and children"
  | "Food"
  | "Health"
  | "Language"
  | "Media"
  | "Reading"
  | "Technology"
  | "Transport"
  | "Travel";

export interface Problem {
  problemId: string;
  name: string;
  course: Course;
  type: string[]; // Array of problem types (can be any strings from quiz titles)
  rating: number;
}

export async function getProblems(): Promise<Problem[]> {
  try {
    // Use environment variable or fallback to localhost
    const baseUrl =
      process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/problems`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const problems = (await response.json()) as Problem[];
    return problems;
  } catch (error) {
    console.error("Error fetching problems:", error);

    // Return mock data as fallback
    return [
      {
        problemId: "1",
        name: "Array Manipulation Basics",
        course: {
          courseId: "cs101",
          name: "Introduction to Programming",
          canvasUrl: "https://canvas.example.com/courses/cs101",
        },
        type: ["Technology", "Education"],
        rating: 4.5,
      },
      {
        problemId: "2",
        name: "String Processing Challenge",
        course: {
          courseId: "cs102",
          name: "Data Structures",
          canvasUrl: "https://canvas.example.com/courses/cs102",
        },
        type: ["Technology", "Language"],
        rating: 4.2,
      },
      {
        problemId: "3",
        name: "Environmental Impact Analysis",
        course: {
          courseId: "env101",
          name: "Environmental Science",
          canvasUrl: "https://canvas.example.com/courses/env101",
        },
        type: ["Environment", "Business"],
        rating: 4.8,
      },
      {
        problemId: "4",
        name: "Healthcare Data Mining",
        course: {
          courseId: "med101",
          name: "Medical Informatics",
          canvasUrl: "https://canvas.example.com/courses/med101",
        },
        type: ["Health", "Technology"],
        rating: 4.6,
      },
      {
        problemId: "5",
        name: "Media Content Classification",
        course: {
          courseId: "media101",
          name: "Digital Media",
          canvasUrl: "https://canvas.example.com/courses/media101",
        },
        type: ["Media", "Technology", "Communication"],
        rating: 4.3,
      },
      {
        problemId: "6",
        name: "Economic Forecasting Model",
        course: {
          courseId: "econ101",
          name: "Economics",
          canvasUrl: "https://canvas.example.com/courses/econ101",
        },
        type: ["Economy", "Business"],
        rating: 4.7,
      },
      {
        problemId: "7",
        name: "Transportation Optimization",
        course: {
          courseId: "ops101",
          name: "Operations Research",
          canvasUrl: "https://canvas.example.com/courses/ops101",
        },
        type: ["Transport", "Technology"],
        rating: 4.4,
      },
      {
        problemId: "8",
        name: "Food Safety Analysis",
        course: {
          courseId: "food101",
          name: "Food Science",
          canvasUrl: "https://canvas.example.com/courses/food101",
        },
        type: ["Food", "Health"],
        rating: 4.6,
      },
    ];
  }
}
