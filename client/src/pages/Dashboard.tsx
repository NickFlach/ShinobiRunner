import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import StatusCards from "@/components/dashboard/StatusCards";
import MissionsTable from "@/components/dashboard/MissionsTable";
import GlyphRegistry from "@/components/dashboard/GlyphRegistry";
import LogicModules from "@/components/dashboard/LogicModules";
import CreateMissionModal from "@/components/missions/CreateMissionModal";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [systemStatus, setSystemStatus] = useState<"online" | "limited" | "offline">("online");

  const handleCreateMission = () => {
    setShowMissionModal(true);
  };

  const handleMissionCreated = () => {
    setShowMissionModal(false);
    toast({
      title: "Mission Created",
      description: "Your mission has been deployed successfully.",
      variant: "success",
    });
  };

  const handleMissionCancelled = () => {
    setShowMissionModal(false);
  };

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been logged out of the system.",
      variant: "default",
    });
  };

  const handleViewMission = (mission: any) => {
    toast({
      title: "Mission Details",
      description: `Viewing mission ${mission.missionId}`,
      variant: "default",
    });
  };

  return (
    <div className="h-screen flex flex-col">
      <Header 
        systemStatus={systemStatus}
        onSettingsClick={() => {}}
        onNotificationsClick={() => {}}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar onLogout={handleLogout} />

        <main className="flex-1 overflow-auto p-4">
          <div className="container mx-auto">
            {/* Page Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Shinobi.Runner Dashboard</h2>
                <p className="text-gray-400">Manage and deploy quantum glyphs across distributed environments</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button
                  onClick={handleCreateMission}
                  className="px-4 py-2 bg-gradient-to-r from-[#6a11cb] to-[#2575fc] rounded-md text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <PlusIcon className="h-5 w-5" />
                  New Mission
                </Button>
              </div>
            </div>

            {/* System Status Overview */}
            <StatusCards 
              onStatusUpdate={(status) => {
                setSystemStatus(status.status as "online" | "limited" | "offline");
              }} 
            />

            {/* Active Missions */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Active Missions</h3>
                <button className="text-sm text-[#0099ff] flex items-center gap-1 hover:underline">
                  View All
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <MissionsTable onViewMission={handleViewMission} />
            </div>

            {/* Quantum & Logic Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlyphRegistry 
                onSelectGlyph={(glyph) => {
                  setShowMissionModal(true);
                }}
                onCreateGlyph={() => {
                  toast({
                    title: "Glyph Repository",
                    description: "Navigating to full glyph repository",
                    variant: "default",
                  });
                }}
              />

              <LogicModules 
                onConfigureModules={() => {
                  toast({
                    title: "Logic Modules",
                    description: "Navigating to logic module configuration",
                    variant: "default",
                  });
                }}
              />
            </div>
          </div>
        </main>
      </div>

      {showMissionModal && (
        <CreateMissionModal
          onClose={handleMissionCancelled}
          onMissionCreated={handleMissionCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;
