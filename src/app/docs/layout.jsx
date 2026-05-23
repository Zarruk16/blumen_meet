import { DocsShell } from "@/components/docs/DocsShell";

export const metadata = {
  title: "Documentation | Blumen Meet",
  description: "Connect to Blumen Meet — API reference, authentication, and integration guides.",
};

export default function DocsLayout({ children }) {
  return <DocsShell>{children}</DocsShell>;
}
