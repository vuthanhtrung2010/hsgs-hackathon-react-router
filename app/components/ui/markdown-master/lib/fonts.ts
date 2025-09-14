// Simple font configuration for React Router
// Using CSS imports instead of Next.js font optimization

// JetBrains Mono for code editor
export const jetBrainsMono = {
  className: 'font-mono',
  style: { fontFamily: 'JetBrains Mono, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }
};

// Inter for general UI
export const inter = {
  className: 'font-sans',
  style: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
};

// Font configurations array for UI selection
export const fontConfigs = [
  { name: 'JetBrains Mono', font: jetBrainsMono },
  { name: 'Inter', font: inter },
];