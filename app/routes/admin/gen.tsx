import React, { useState, useEffect } from "react";
import { useLoaderData } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalculator,
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/gen";

const DEFAULT_TOPICS = {
  10: [
    "Mệnh đề - Tập hợp",
    "Bất phương trình và hệ bất phương trình bậc nhất hai ẩn",
    "Hệ thức lượng trong tam giác",
    "Vector",
    "Các số đặc trưng của mẫu số liệu, không ghép nhóm",
    "Hàm số, đồ thị và ứng dụng",
    "Phương pháp tọa độ trong mặt phẳng",
    "Đại số tổ hợp",
    "Tính xác suất theo định nghĩa cổ điển"
  ],
  11: [
    "Hàm số lượng giác - Phương trình lượng giác",
    "Dãy số - Cấp số cộng - Cấp số nhân",
    "Các số đặc trưng đo xu thế trung tâm của mẫu số liệu ghép nhóm",
    "Quan hệ song song trong không gian",
    "Giới hạn - Hàm số liên tục",
    "Hàm số mũ - Hàm số Logarit",
    "Quan hệ vuông góc trong không gian",
    "Các quy tắc tính xác suất",
    "Đạo hàm"
  ],
  12: [
    "Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số",
    "Vector và hệ trục tọa độ trong không gian",
    "Các số đặc trưng đo mức độ phân tán của mẫu số liệu ghép nhóm",
    "Nguyên hàm - Tích phân",
    "Phương pháp tọa độ trong không gian",
    "Xác suất có điều kiện"
  ]
};

// Create flat list of topics with class information
const TOPIC_OPTIONS = Object.entries(DEFAULT_TOPICS).flatMap(([grade, topics]) =>
  topics.map(topic => ({
    value: `${grade}-${topic}`,
    label: topic,
    topic,
    grade: parseInt(grade)
  }))
);

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
  topicValue?: string; // Store the selected topic value for display
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Manual question creation
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<MathQuestion>>(
    {
      topic: "",
      grade: 11,
      topicValue: "",
      difficulty: DIFFICULTY_LEVELS[0],
      question: QUESTION_TYPES[0],
      n: 10,
    },
  );
  const [openTopicSelector, setOpenTopicSelector] = useState(false);
  const [openCourseSelector, setOpenCourseSelector] = useState(false);

  const handleTopicSelect = (topicOption: typeof TOPIC_OPTIONS[0]) => {
    setCurrentQuestion({
      ...currentQuestion,
      topic: topicOption.topic,
      grade: topicOption.grade,
      topicValue: topicOption.value,
    });
    setOpenTopicSelector(false);
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourseId(courseId);
    setOpenCourseSelector(false);
  };

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  const addQuestion = () => {
    if (
      !currentQuestion.topic ||
      !currentQuestion.grade ||
      !currentQuestion.topicValue ||
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
      topicValue: "",
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

      const formData = new FormData();
      formData.append("course", selectedCourseId);
      formData.append("name", quizName);
      formData.append("file", csvFile);

      const response = await fetch("/api/admin/gen", {
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

      <div className="grid grid-cols-1 gap-6">
        {/* Course and Quiz Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="course-select">Course</Label>
              <Popover open={openCourseSelector} onOpenChange={setOpenCourseSelector}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCourseSelector}
                    className="w-full justify-between"
                  >
                    {selectedCourseId
                      ? courses.find((course) => course.id === selectedCourseId)?.name
                      : "Select course..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search courses..." />
                    <CommandList>
                      <CommandEmpty>No courses found.</CommandEmpty>
                      <CommandGroup>
                        {courses.map((course) => (
                          <CommandItem
                            key={course.id}
                            value={course.name}
                            onSelect={() => handleCourseSelect(course.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCourseId === course.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {course.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Popover open={openTopicSelector} onOpenChange={setOpenTopicSelector}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openTopicSelector}
                    className="w-full justify-between"
                  >
                    {currentQuestion.topic
                      ? TOPIC_OPTIONS.find(
                          (topic) => topic.value === currentQuestion.topicValue
                        )?.label
                      : "Select topic..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search topics..." />
                    <CommandList>
                      <CommandEmpty>No topics found.</CommandEmpty>
                      <CommandGroup>
                        {TOPIC_OPTIONS.map((topicOption) => (
                          <CommandItem
                            key={topicOption.value}
                            value={topicOption.label}
                            onSelect={() => handleTopicSelect(topicOption)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                currentQuestion.topicValue === topicOption.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{topicOption.label}</span>
                              <span className="text-xs text-muted-foreground">
                                Class {topicOption.grade}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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

    </div>
  );
}
