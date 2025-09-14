import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="w-full py-6 flex flex-col items-center text-sm text-muted-foreground relative">
      {/* Backdrop blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-background/80"></div>

      {/* Content */}
      <div className="flex items-center gap-1 relative z-10">
        Made with <span className="inline-flex items-center">❤️</span> by{" "}
        <a
          href="https://github.com/vuthanhtrung2010"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Trung
        </a>
        <div className="mx-2 h-4 w-px bg-muted-foreground/50"></div>
        Fork it on{" "}
        <Link
          to="https://github.com/vuthanhtrung2010/hsgs-hackathon-react-router-cf"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Github
        </Link>
      </div>
    </footer>
  );
}
