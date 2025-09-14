import { Card, CardContent } from "~/components/ui/card";
import { MagicCard } from "~/components/magicui/magic-card";
import { useTheme } from "~/components/ThemeProvider";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  const { actualTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="p-0 max-w-sm w-full shadow-none border-none">
        <MagicCard
          gradientColor={
            mounted && actualTheme === "dark" ? "#262626" : "#D9D9D955"
          }
          className="p-0"
        >
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-lg font-medium">Loading...</p>
              <p className="text-sm text-muted-foreground">
                Please wait while we prepare your content.
              </p>
            </div>
          </CardContent>
        </MagicCard>
      </Card>
    </div>
  );
}
