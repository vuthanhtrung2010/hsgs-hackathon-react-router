import { Github, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
        <p className="font-medium">HSGS<span className="text-primary">.</span> <span className="ml-2 font-normal">More space for learning.</span></p>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          <span className="flex items-center gap-1.5">Made with <Heart className="size-3 text-primary" aria-label="love" /> by <a href="https://github.com/vuthanhtrung2010" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-8 items-center font-medium text-foreground hover:text-primary hover:underline">Trung</a></span>
          <a href="https://github.com/vuthanhtrung2010/hsgs-hackathon-react-router-cf" target="_blank" rel="noopener noreferrer" className="flex min-h-8 items-center gap-1.5 transition-colors hover:text-foreground"><Github className="size-3.5" aria-hidden="true" /> View on GitHub</a>
        </div>
      </div>
    </footer>
  );
}
