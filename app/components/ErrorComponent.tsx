"use client";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { MagicCard } from "~/components/magicui/magic-card";
import { useTheme } from "~/components/ThemeProvider";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorComponent({ error, reset }: ErrorProps) {
  const { actualTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="p-0 max-w-lg w-full shadow-none border-none">
        <MagicCard
          gradientColor={
            mounted && actualTheme === "dark" ? "#262626" : "#D9D9D955"
          }
          className="p-0"
        >
          <CardHeader className="text-center p-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <AlertTriangle className="h-16 w-16 text-red-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              Something went wrong!
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              An unexpected error occurred while processing your request.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                We&apos;re sorry for the inconvenience. Please try refreshing
                the page or return to the homepage. If the problem persists,
                please contact support.
              </p>
              {process.env.NODE_ENV !== "production" && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-3 text-left">
                  <p className="text-sm font-mono text-red-600 dark:text-red-400 break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-red-500 mt-1">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button onClick={reset} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Homepage
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </MagicCard>
      </Card>
    </div>
  );
}
