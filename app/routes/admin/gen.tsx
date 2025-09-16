import React, { useState, useEffect } from "react";
import { useLoaderData } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalculator,
  faUpload,
  faDownload,
  faPlus,
  faTrash,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import type { Route } from "./+types/gen";

const DIFFICULTY_LEVELS = [
  "Nhận biết",
  "Thông hiểu",
  "Vận dụng",
  "Vận dụng cao",
];

const QUESTION_TYPES = ["Multiple choice", "Short answer"];

interface MathQuestion {
  id: string;
  topic: string;
  grade: number;
  difficulty: string;
  question: string;
  n: number;
}

export async function loader({}: Route.LoaderArgs): Promise<{
  courses: any[];
}> {
  try {
    const baseUrl =
      process.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_API_BASE_URL ||
      "https://api.example.com";

    const coursesResponse = await fetch(
      new URL("/api/courses", baseUrl).toString(),
    );
    const courses = coursesResponse.ok
      ? ((await coursesResponse.json()) as any[])
      : [];

    return { courses };
  } catch (error) {
    console.error("Error loading courses:", error);
    return { courses: [] };
  }
}

export default function MathGeneration() {
  const { courses } = useLoaderData<{ courses: any[] }>();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [quizName, setQuizName] = useState("Test_quiz");
  const [grade, setGrade] = useState<number>(11);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Manual question creation
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<MathQuestion>>(
    {
      topic: "",
      grade: 11,
      difficulty: DIFFICULTY_LEVELS[0],
      question: QUESTION_TYPES[0],
      n: 10,
    },
  );

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        setError("Please select a CSV file");
        return;
      }
      setCsvFile(file);
      setError("");
    }
  };

  const generateFromCSV = async () => {
    if (!csvFile || !selectedCourseId) {
      setError("Please select a course and CSV file");
      return;
    }

    setIsGenerating(true);
    setError("");
    setSuccess("");

    try {
      const genApiUrl =
        process.env.VITE_GEN_API_BASE_URL ||
        import.meta.env.VITE_GEN_API_BASE_URL ||
        "http://localhost:8000";

      const formData = new FormData();
      formData.append("course", selectedCourseId);
      formData.append("name", quizName);
      formData.append("grade", grade.toString());
      formData.append("file", csvFile);

      const url = new URL("/math", genApiUrl);
      const response = await fetch(url.toString(), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate math questions");
      }

      // Handle file download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "response.txt";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      setSuccess("Math questions generated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const addQuestion = () => {
    if (
      !currentQuestion.topic ||
      !currentQuestion.grade ||
      !currentQuestion.difficulty ||
      !currentQuestion.question ||
      !currentQuestion.n
    ) {
      setError("Please fill in all fields");
      return;
    }

    const newQuestion: MathQuestion = {
      id: Date.now().toString(),
      topic: currentQuestion.topic!,
      grade: currentQuestion.grade!,
      difficulty: currentQuestion.difficulty!,
      question: currentQuestion.question!,
      n: currentQuestion.n!,
    };

    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      topic: "",
      grade: 11,
      difficulty: DIFFICULTY_LEVELS[0],
      question: QUESTION_TYPES[0],
      n: 10,
    });
    setError("");
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const generateFromManual = async () => {
    if (questions.length === 0 || !selectedCourseId) {
      setError("Please add at least one question and select a course");
      return;
    }

    setIsGenerating(true);
    setError("");
    setSuccess("");

    try {
      // Create CSV content from manual questions
      const csvContent =
        "topic,grade,difficulty,question,n\n" +
        questions
          .map(
            (q) =>
              `"${q.topic}",${q.grade},"${q.difficulty}","${q.question}",${q.n}`,
          )
          .join("\n");

      const csvBlob = new Blob([csvContent], { type: "text/csv" });
      const csvFile = new File([csvBlob], "manual_questions.csv", {
        type: "text/csv",
      });

      const genApiUrl =
        process.env.VITE_GEN_API_BASE_URL ||
        import.meta.env.VITE_GEN_API_BASE_URL ||
        "http://localhost:8000";

      const formData = new FormData();
      formData.append("course", selectedCourseId);
      formData.append("name", quizName);
      formData.append("grade", grade.toString());
      formData.append("file", csvFile);

      const url = new URL("/math", genApiUrl);
      const response = await fetch(url.toString(), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate math questions");
      }

      // Handle file download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = "response.txt";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      setSuccess("Math questions generated successfully!");
      setQuestions([]); // Clear questions after successful generation
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FontAwesomeIcon icon={faCalculator} className="text-blue-500" />
          Math Question Generation
        </h1>
        <p className="text-muted-foreground">
          Generate math questions using CSV upload or manual creation
        </p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Upload Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUpload} />
              CSV Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="course-select">Course</Label>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger>
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
            </div>

            <div>
              <Label htmlFor="quiz-name">Quiz Name</Label>
              <Input
                id="quiz-name"
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
                placeholder="Enter quiz name"
              />
            </div>

            <div>
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                type="number"
                value={grade}
                onChange={(e) => setGrade(parseInt(e.target.value) || 11)}
                min="1"
                max="12"
              />
            </div>

            <div>
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
              />
              <p className="text-sm text-muted-foreground mt-1">
                CSV must contain: topic, grade, difficulty, question, n
              </p>
            </div>

            <Button
              onClick={generateFromCSV}
              disabled={!csvFile || !selectedCourseId || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="animate-spin mr-2"
                  />
                  Generating...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCalculator} className="mr-2" />
                  Generate from CSV
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Manual Creation Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FontAwesomeIcon icon={faPlus} />
              Manual Creation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={currentQuestion.topic || ""}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      topic: e.target.value,
                    })
                  }
                  placeholder="Enter topic"
                />
              </div>

              <div>
                <Label htmlFor="manual-grade">Grade</Label>
                <Input
                  id="manual-grade"
                  type="number"
                  value={currentQuestion.grade || 11}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      grade: parseInt(e.target.value) || 11,
                    })
                  }
                  min="1"
                  max="12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={currentQuestion.difficulty}
                  onValueChange={(value) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      difficulty: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="question-type">Question Type</Label>
                <Select
                  value={currentQuestion.question}
                  onValueChange={(value) =>
                    setCurrentQuestion({ ...currentQuestion, question: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="count">Number of Questions</Label>
              <Input
                id="count"
                type="number"
                value={currentQuestion.n || 10}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    n: parseInt(e.target.value) || 10,
                  })
                }
                min="1"
              />
            </div>

            <Button onClick={addQuestion} className="w-full">
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Question
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      {questions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Questions to Generate ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{question.topic}</div>
                    <div className="text-sm text-muted-foreground">
                      Grade {question.grade} • {question.difficulty} •{" "}
                      {question.question} • {question.n} questions
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(question.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-4">
              <Button
                onClick={generateFromManual}
                disabled={
                  questions.length === 0 || !selectedCourseId || isGenerating
                }
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin mr-2"
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCalculator} className="mr-2" />
                    Generate Questions
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setQuestions([])}
                disabled={isGenerating}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSV Format Help */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>CSV Format</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Your CSV file must contain these columns:
          </p>
          <div className="bg-muted p-3 rounded-lg font-mono text-sm">
            topic,grade,difficulty,question,n
            <br />
            "Giới hạn dãy số - Hàm số",11,"Nhận biết","Multiple choice",20
            <br />
            "Giới hạn dãy số - Hàm số",11,"Thông hiểu","Multiple choice",10
            <br />
            "Giới hạn dãy số - Hàm số",11,"Vận dụng","Short answer",10
            <br />
            "Giới hạn dãy số - Hàm số",11,"Vận dụng cao","Short answer",10
          </div>
          <div className="mt-3 space-y-2">
            <div>
              <strong>Difficulty options:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {DIFFICULTY_LEVELS.map((level) => (
                  <Badge key={level} variant="secondary" className="text-xs">
                    {level}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <strong>Question types:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {QUESTION_TYPES.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
