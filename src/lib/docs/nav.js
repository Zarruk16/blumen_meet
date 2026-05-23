export const DOCS_NAV = [
  {
    title: "Overview",
    items: [
      { href: "/docs", label: "Introduction" },
      { href: "/docs/getting-started", label: "Getting started" },
    ],
  },
  {
    title: "Platform",
    items: [
      { href: "/docs/authentication", label: "Authentication" },
      { href: "/docs/join-hosting", label: "Join & hosting" },
      { href: "/docs/limits", label: "Plans & limits" },
    ],
  },
  {
    title: "API reference",
    items: [
      { href: "/docs/api/meetings", label: "Meetings" },
      { href: "/docs/api/usage", label: "Usage" },
    ],
  },
];

export function getDocsTitle(pathname) {
  for (const group of DOCS_NAV) {
    const item = group.items.find((i) => i.href === pathname);
    if (item) return item.label;
  }
  return "Documentation";
}
