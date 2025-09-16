"use client";

import * as React from "react";
import { ThemeProvider as AppThemeProvider } from "../../../ThemeProvider";

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <AppThemeProvider>{children}</AppThemeProvider>;
}
