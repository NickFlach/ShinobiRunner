import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MissionsTable from "@/components/dashboard/MissionsTable";
import CreateMissionModal from "@/components/missions/CreateMissionModal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { PlusIcon, FilterIcon, SortAscIcon } from "lucide-react";
import { QuantumCard } from "@/components/ui/quantum-card";
import { QuantumBadge } from "@/components/ui/quantum-badge";

interface Mission {
  id: number;
  missionId: string;
  name: string;
  status: string;
  progress: number;
  createdAt: string;
}

const Missions: React.FC = () => {
  const { toast } = useToast();
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', '/api/missions');
        const data = await response.json();
        setMissions(data);
      } catch (error) {
        console.error("Error fetching missions:", error);
        toast({
          title: "Error",
          description: "Failed to load missions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, [toast]);

  const handleCreateMission = () => {
    setShowMissionModal(true);
  };

  const handleMissionCreated = () => {
    setShowMissionModal(false);
    toast({
      title: "Mission Created",
      description: "Your mission has been deployed successfully",
      variant: "success",
    });
    
    // Refresh missions list
    apiRequest('GET', '/api/missions')
      .then(response => response.json())
      .then(data => setMissions(data))
      .catch(error => console.error("Error fetching missions:", error));
  };

  const handleMissionCancelled = () => {
    setShowMissionModal(false);
  };

  // Calculate mission statistics
  const activeMissions = missions.filter(m => ['active', 'processing'].includes(m.status)).length;
  const completedMissions = missions.filter(m => m.status === 'completed').length;
  const pendingMissions = missions.filter(m => m.status === 'pending').length;

  return (
    <div className="h-screen flex flex-col">
      <Header systemStatus="online" />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-auto p-4">
          <div className="container mx-auto">
            {/* Page Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Missions Control</h2>
                <p className="text-gray-400">Create, monitor, and manage quantum missions</p>
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

            {/* Mission Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <QuantumCard>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-semibold text-[#0099ff]">{activeMissions}</span>
                  <span className="text-sm text-gray-400 mt-1">Active Missions</span>
                </div>
              </QuantumCard>
              
              <QuantumCard>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-semibold text-[#00cc66]">{completedMissions}</span>
                  <span className="text-sm text-gray-400 mt-1">Completed Missions</span>
                </div>
              </QuantumCard>
              
              <QuantumCard>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-semibold text-[#ffaa00]">{pendingMissions}</span>
                  <span className="text-sm text-gray-400 mt-1">Pending Missions</span>
                </div>
              </QuantumCard>
            </div>

            {/* Filter Controls */}
            <div className="mb-4 flex flex-wrap gap-3">
              <Button
                variant={filter === 'all' ? "default" : "outline"}
                onClick={() => setFilter('all')}
                className="text-sm"
              >
                All Missions
              </Button>
              <Button
                variant={filter === 'active' ? "default" : "outline"}
                onClick={() => setFilter('active')}
                className="text-sm"
              >
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#00cc66]"></div>
                  Active
                </div>
              </Button>
              <Button
                variant={filter === 'pending' ? "default" : "outline"}
                onClick={() => setFilter('pending')}
                className="text-sm"
              >
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#ffaa00]"></div>
                  Pending
                </div>
              </Button>
              <Button
                variant={filter === 'completed' ? "default" : "outline"}
                onClick={() => setFilter('completed')}
                className="text-sm"
              >
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#0099ff]"></div>
                  Completed
                </div>
              </Button>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <FilterIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <SortAscIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Missions Table */}
            <MissionsTable />
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

export default Missions;
