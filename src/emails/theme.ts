// Light on purpose: a clean light palette lets each client's native dark mode
// invert it, instead of us shipping dark and fighting the client.
export const emailTheme = {
  bg: "#ffffff",
  fg: "#3f3f46",
  muted: "#52525b",
  dim: "#a1a1aa",
  strong: "#09090b",
  panel: "#fafafa",
  rule: "#e4e4e7",
  fontStack:
    "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as const;
