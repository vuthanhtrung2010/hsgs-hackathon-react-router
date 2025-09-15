// Badge coloring utility function

export function getBadgeColor(category: string): string {
  const colorMap: Record<string, string> = {
    "Art": "bg-red-500",
    "Business": "bg-blue-500",
    "Communication": "bg-green-500",
    "Crime": "bg-yellow-500",
    "Economy": "bg-purple-500",
    "Education": "bg-pink-500",
    "Environment": "bg-teal-500",
    "Family and children": "bg-orange-500",
    "Food": "bg-lime-500",
    "Health": "bg-cyan-500",
    "Language": "bg-indigo-500",
    "Media": "bg-gray-500",
    "Reading": "bg-slate-500",
    "Technology": "bg-violet-500",
    "Transport": "bg-fuchsia-500",
    "Travel": "bg-amber-500",
  };

  return colorMap[category] || "bg-gray-400"; // Default color for unknown types
}
