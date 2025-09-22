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
      {/* Announcements Section */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">📢 Announcements</h2>
          <p className="text-muted-foreground">
            Latest updates and important information
          </p>
        </div>

        <AnnouncementsList />
      </div>
    </div>
  );
}
