import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { renderMarkdown } from "../lib/markdown";
import { useEffect, useState } from "react";
import type { Announcement } from "~/types";
import styles from "../ProblemPage.module.css";
import "katex/dist/katex.min.css";

interface AnnouncementCardProps {
  announcement: Announcement;
  onClick?: () => void;
}

export function AnnouncementCard({
  announcement,
  onClick,
}: AnnouncementCardProps) {
  const [renderedContent, setRenderedContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const createdDate = new Date(announcement.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  useEffect(() => {
    const processMarkdown = async () => {
      try {
        const html = await renderMarkdown(announcement.content);
        setRenderedContent(html);
      } catch (error) {
        console.error("Error rendering markdown:", error);
        setRenderedContent("<p>Failed to render content</p>");
      } finally {
        setIsLoading(false);
      }
    };

    processMarkdown();
  }, [announcement.content]);

  return (
    <Card
      className="transition-all border-l-4 border-l-blue-500 mb-6"
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-bold text-xl leading-tight">
            {announcement.title}
          </h3>
          <Badge variant="secondary" className="shrink-0">
            {createdDate}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : announcement.content ? (
          <div className={`${styles.problemProse} prose content-description`}>
            <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
          </div>
        ) : (
          <p className="text-muted-foreground italic">No content</p>
        )}
      </CardContent>
    </Card>
  );
}
