"use client";

import Link from "next/link";
import { Video, Github, Twitter, Mail } from "lucide-react";

const product = [
  { label: "Features", href: "#features" },
  { label: "AI", href: "#ai" },
  { label: "Recordings", href: "#recordings" },
  { label: "Pricing", href: "#pricing" },
];
const legal = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Security", href: "#features" },
];
const resources = [
  { label: "Docs", href: "/#docs" },
  { label: "Documentation", href: "/docs" },
  { label: "Contact", href: "#contact" },
  { label: "Recordings", href: "/recordings" },
];

export function FooterSection() {
  return (
    <footer id="contact" className="border-t border-white/10 bg-zinc-950/80 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Video className="h-8 w-8 text-blue-500" />
              <span className="text-lg font-semibold text-white">Blumen Meet</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-500">
              Next-generation video meetings with AI intelligence, cloud recording, and a premium
              experience on every device.
            </p>
            <div className="mt-6 flex gap-3">
              {[Twitter, Github, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition hover:text-white hover:bg-white/10"
                  aria-label="Social"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Product</p>
            <ul className="mt-4 space-y-2">
              {product.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-zinc-400 hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Legal</p>
            <ul className="mt-4 space-y-2">
              {legal.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-sm text-zinc-400 hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Resources</p>
            <ul className="mt-4 space-y-2">
              {resources.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-zinc-400 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Blumen Meet. All rights reserved.</p>
          <p className="text-xs text-zinc-600">Built by ZarrukCode · Next.js · Tailwind</p>
        </div>
      </div>
    </footer>
  );
}
