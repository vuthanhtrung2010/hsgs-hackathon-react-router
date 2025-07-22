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
      <h1 className="text-4xl font-bold">Welcome</h1>
    </div>
  );
}