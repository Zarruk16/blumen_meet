"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Loader from "./components/Loader";
import { LandingBackground } from "@/components/layout/LandingBackground";
import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { HeroSection } from "@/sections/Hero/HeroSection";
import { TrustStrip } from "@/sections/TrustStrip";
import { FeaturesSection } from "@/sections/Features/FeaturesSection";
import { AISection } from "@/sections/AI/AISection";
import { ProductPreviewSection } from "@/sections/ProductPreview/ProductPreviewSection";
import { RecordingsSection } from "@/sections/Recordings/RecordingsSection";
import { WorkspaceSection } from "@/sections/Workspace/WorkspaceSection";
import { DocsSection } from "@/sections/Docs/DocsSection";
import { CTASection } from "@/sections/CTA/CTASection";
import { FooterSection } from "@/sections/Footer/FooterSection";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#workspace" || hash === "#recordings" || hash === "#docs") {
        setTimeout(() => {
          document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [status]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-zinc-950 text-white antialiased [&_section]:min-w-0">
      <LandingBackground />
      <LandingNavbar />
      <main>
        <HeroSection />
        <TrustStrip />
        <FeaturesSection />
        <AISection />
        <ProductPreviewSection />
        <RecordingsSection authenticated={status === "authenticated"} />
        <WorkspaceSection
          session={session}
          isAuthenticated={status === "authenticated"}
        />
        <DocsSection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
}
