import TextType from "~/components/TextType";
import { AnnouncementsList } from "~/components/AnnouncementsList";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "HSGS: Hackathon 2025" },
    { name: "description", content: "Welcome to HSGS Hackathon 2025!" },
  ];
}

export default function Home() {
  return (
    <div className="font-sans min-h-screen">
      {/* Hero Section */}
      <div className="flex items-center justify-center py-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <TextType
              text={[
                "Welcome to HSGS Hackathon 2025!",
                "This is made by Trung.",
                "Yikes",
              ]}
              typingSpeed={75}
              pauseDuration={1500}
              deletingSpeed={50}
              loop={true}
              className="text-center text-blue-600 dark:text-blue-400"
              showCursor={true}
              cursorCharacter="_"
              cursorClassName="text-blue-600 dark:text-blue-400"
            />
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest announcements and important information for the hackathon.
          </p>
        </div>
      </div>

      {/* Announcements Section */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">📢 Announcements</h2>
          <p className="text-muted-foreground">Latest updates and important information</p>
        </div>
        
        <AnnouncementsList />
      </div>
    </div>
  );
}
