import { HeroSection } from "@/components/sections/HeroSection";
import { FinancialPerformance } from "@/components/sections/FinancialPerformance";
import { EngagementHighlights } from "@/components/sections/EngagementHighlights";
import { NavigationSidebar } from "@/components/ui/navigation-sidebar";
import { DataRoomButton } from "@/components/ui/data-room-button";

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <NavigationSidebar />
      <div className="md:ml-64">
        {/* Top Data Room Button */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4 flex justify-end">
          <DataRoomButton />
        </div>

        <div id="hero">
          <HeroSection />
        </div>
        <div id="financial">
          <FinancialPerformance />
        </div>
        <div id="engagement">
          <EngagementHighlights />
        </div>

        {/* Bottom Data Room Button */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 flex justify-center md:justify-end">
          <DataRoomButton />
        </div>
      </div>
    </main>
  );
}
