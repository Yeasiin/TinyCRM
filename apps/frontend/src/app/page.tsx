import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { TrustBar } from "@/components/landing/trust-bar";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { FeatureGridSection } from "@/components/landing/feature-grid";
import { DashboardShowcaseSection } from "@/components/landing/dashboard-showcase";
import { OwnYourDataSection } from "@/components/landing/own-your-data";
import { TechStackSection } from "@/components/landing/tech-stack";
import { FinalCtaSection } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Tinycrm - Your CRM, powered by Google Sheets",
  description:
    "Tinycrm is the lightweight CRM that lives in your Google Sheets. Manage leads, deals, customers, and tasks with a clean modern dashboard while your data stays safely in your own Google Drive.",
  keywords: [
    "CRM",
    "Google Sheets",
    "Lead Management",
    "Sales Pipeline",
    "Spreadsheet CRM",
    "Lightweight CRM",
  ],
  openGraph: {
    title: "Tinycrm - Your CRM, powered by Google Sheets",
    description:
      "Manage leads, deals, customers, and tasks with a clean modern CRM while your data stays safely inside your own Google Drive.",
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <main>
        <HeroSection />
        <TrustBar />
        <HowItWorksSection />
        <FeatureGridSection />
        <DashboardShowcaseSection />
        <OwnYourDataSection />
        <TechStackSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
