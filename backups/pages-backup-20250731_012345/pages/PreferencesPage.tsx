import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Link, Redirect } from "wouter";
import { MainLayout } from "@/components/MainLayout";
import { PartnerPreferences } from "@/components/preferences/PartnerPreferences";
import { CommunicationPreferences } from "@/components/preferences/CommunicationPreferences";

// Define preference categories
const PreferenceCategories = {
  PARTNER: "partner",
  COMMUNICATION: "communication",
} as const;

type PreferenceCategory = typeof PreferenceCategories[keyof typeof PreferenceCategories];

const PreferencesPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeCategory, setActiveCategory] = useState<PreferenceCategory>(PreferenceCategories.PARTNER);

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    return <Redirect to="/auth" />;
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Preferences</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              <nav className="space-y-1">
                <button
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeCategory === PreferenceCategories.PARTNER
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveCategory(PreferenceCategories.PARTNER)}
                >
                  Partner Preferences
                </button>
                <button
                  className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                    activeCategory === PreferenceCategories.COMMUNICATION
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveCategory(PreferenceCategories.COMMUNICATION)}
                >
                  Communication Preferences
                </button>
              </nav>

              <div className="mt-8">
                <Link href="/profile">
                  <a className="text-primary hover:underline block mb-2">← Back to Profile</a>
                </Link>
                <Link href="/dashboard">
                  <a className="text-primary hover:underline block">← Back to Dashboard</a>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            {activeCategory === PreferenceCategories.PARTNER && <PartnerPreferences />}
            {activeCategory === PreferenceCategories.COMMUNICATION && <CommunicationPreferences />}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PreferencesPage;