import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { AlertCircle, LoaderCircle } from "lucide-react";

import { useAuth } from "../components/AuthProvider";
import { Button } from "../components/ui/button";
import {
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, login, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const callbackUrl = searchParams.get("callbackUrl") || "/";

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
      setError("Unable to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100svh-10rem)] items-center justify-center px-5 py-12">
      <div className="w-full max-w-sm clay-card p-0 overflow-hidden">
        <CardHeader className="border-b border-border p-6 sm:p-8">
          <CardTitle className="text-2xl text-center font-semibold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {error && (
                <div
                  role="alert"
                  className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-3"
                >
                  <AlertCircle
                    size={20}
                    className="shrink-0"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 break-words text-sm leading-relaxed">
                    {error}
                  </span>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  autoComplete="username"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="rounded-xl h-11 px-3"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm">
                    Password
                  </Label>
                </div>
                <Input
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="rounded-xl h-11 px-3"
                />
              </div>
            </div>
            <CardFooter className="flex-col gap-2 p-0 mt-8">
              <Button
                type="submit"
                className="w-full h-11 rounded-xl"
                disabled={isLoading}
              >
                {isLoading && (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {isLoading ? "Signing in…" : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </div>
    </div>
  );
}
