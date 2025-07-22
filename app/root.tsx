import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import "~/styles/rating.css";
import "~/styles/table.css";
import { Navbar } from "./components/Navbar";
import { ThemeProvider } from "./components/ThemeProvider";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">{message}</h1>
          <p className="text-lg text-muted-foreground">{details}</p>
          {import.meta.env.DEV && stack && (
            <pre className="text-left text-sm bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-3 overflow-auto">
              {stack}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
