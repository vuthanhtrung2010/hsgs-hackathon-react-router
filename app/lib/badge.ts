// Badge coloring utility function
import { type ProblemType } from "./server-actions/problems";

export function getBadgeColor(category: ProblemType): string {
  switch (category) {
    case "Art":
      return "bg-red-500";
    case "Business":
      return "bg-blue-500";
    case "Communication":
      return "bg-green-500";
    case "Crime":
      return "bg-yellow-500";
    case "Economy":
      return "bg-purple-500";
    case "Education":
      return "bg-pink-500";
    case "Environment":
      return "bg-teal-500";
    case "Family and children":
      return "bg-orange-500";
    case "Food":
      return "bg-lime-500";
    case "Health":
      return "bg-cyan-500";
    case "Language":
      return "bg-indigo-500";
    case "Media":
      return "bg-gray-500";
    case "Reading":
      return "bg-slate-500";
    case "Technology":
      return "bg-violet-500";
    case "Transport":
      return "bg-fuchsia-500";
    case "Travel":
      return "bg-amber-500";
    default:
      return "";
  }
}
