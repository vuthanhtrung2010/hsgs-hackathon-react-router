import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AlertCircle } from "lucide-react";

import { useAuth } from "../components/AuthProvider";
import { useTheme } from "../components/ThemeProvider";
import { MagicCard } from "../components/magicui/magic-card";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import Loading from "../components/Loading";

export default function LoginPage() {
  const { actualTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate(callbackUrl);
    }
  }, [user, authLoading, navigate, callbackUrl]);

  // Show loading while checking authentication
  if (authLoading) {
    return <Loading />;
  }

  // Don't render the form if user is authenticated
  if (user) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formRef.current) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Login failed";
        try {
          const errorText = await response.text();
          if (errorText) {
            // Try to parse as JSON first
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error || errorText;
            } catch {
              // If not JSON, use the text as is
              errorMessage = errorText;
            }
          }
        } catch {
          // If we can't read the response body, use the default error message
        }
        setError(errorMessage);
        return;
      }

      const result = await response.json();

      if (result.user) {
        // Login successful, update auth context
        login(result.token || "", result.user);
        navigate(callbackUrl);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Unexpected error occurred");
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30">
      <div className="w-full max-w-sm clay-card p-0 overflow-hidden">
        <CardHeader className="border-b border-border/50 p-6 bg-primary/5">
          <CardTitle className="text-2xl text-center text-primary">
            Welcome Back!
          </CardTitle>
          <CardDescription className="text-center text-base">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-3">
                  <AlertCircle size={20} />
                  <span className="font-medium">{error}</span>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-base ml-1">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="rounded-xl border-2 focus-visible:ring-primary/50 h-10 px-4"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-base ml-1">
                    Password
                  </Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="rounded-xl border-2 focus-visible:ring-primary/50 h-10 px-4"
                />
              </div>
            </div>
            <CardFooter className="flex-col gap-2 p-0 mt-8">
              <Button
                type="submit"
                className="w-full clay-btn py-6 text-lg hover:brightness-110"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </div>
    </div>
  );
}
