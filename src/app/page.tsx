
"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { Suspense } from "react";
import MainPageHandler from "@/components/main-page-handler";
import { UserMenu } from "@/components/user-menu";
import LandingPage from "./landing/page";
import { APIProvider } from "@vis.gl/react-google-maps";
import OnboardingWizard from "@/components/admin/onboarding-wizard";

export default function Home() {
  const { user, loading, logout, profile } = useAuth();
  
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">A carregar...</div>;
  }

  if (!user) {
    return <LandingPage />;
  }
  
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <Suspense fallback={<div>A carregar...</div>}>
            <MainPageHandler 
                userMenu={<UserMenu user={user} loading={loading} logout={logout} profile={profile} />} 
            />
            <OnboardingWizard />
        </Suspense>
    </APIProvider>
  );
}
