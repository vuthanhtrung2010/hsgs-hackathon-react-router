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
import { Home, ArrowLeft, Construction } from "lucide-react";

export default function NotFound() {
  const { actualTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
                <Construction className="h-16 w-16 text-muted-foreground" />
                <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">!</span>
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Page not found</CardTitle>
            <CardDescription className="text-lg mt-2">
              This page does not exist or is in under development.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                The page you&apos;re looking for doesn&apos;t exist or is
                currently being worked on. Please check the URL or navigate back
                to continue exploring.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button asChild className="flex-1">
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Homepage
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </MagicCard>
      </Card>
    </div>
  );
}
