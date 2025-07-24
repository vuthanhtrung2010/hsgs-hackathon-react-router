import TextType from "~/components/TextType";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "HSGS: Hackathon 2025" },
    { name: "description", content: "Welcome to HSGS Hackathon 2025!" },
  ];
}

export default function Home() {
  return (
    <div className="font-sans min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">
        <TextType
          text={["Welcome to HSGS Hackathon 2025!", "This is made by Trung.", "Yikes"]}
          typingSpeed={75}
          pauseDuration={1500}
          deletingSpeed={50}
          loop={true}
          className="text-center text-blue-600"
          showCursor={true}
          cursorCharacter="_"
          cursorClassName="text-blue-600"
        />
      </h1>
    </div>
  );
}