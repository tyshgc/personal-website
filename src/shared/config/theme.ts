export const theme = {
  font: {
    sans: '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", "Helvetica Neue", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif',
    mono: '"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace',
  },
  color: {
    ink: "#0a0a0a",
    paper: "#fafafa",
    surface: "#171717",
    line: "#262626",
    muted: "#737373",
    accent: "#84cc16",
  },
  layout: {
    containerMaxWidth: "max-w-4xl",
    sectionPaddingY: "py-16",
  },
} as const;

export type Theme = typeof theme;
