import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { onMessage } from "@/lib/websocket";
import { Eye, Pause, Play, X, Check } from "lucide-react";
import { QuantumBadge, StatusType } from "@/components/ui/quantum-badge";
import { QuantumProgress } from "@/components/ui/quantum-progress";

interface MissionTableProps {
  onViewMission?: (mission: any) => void;
}

interface Mission {
  id: number;
  missionId: string;
  name: string;
  glyphId: number;
  target: string;
  status: StatusType;
  progress: number;
  glyph?: {
    symbol: string;
    name: string;
  };
}

const MissionsTable: React.FC<MissionTableProps> = ({ onViewMission }) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch active missions
    const fetchMissions = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', '/api/missions/active');
        const data = await response.json();
        
        // For each mission, fetch the glyph details
        const missionsWithGlyphs = await Promise.all(
          data.map(async (mission: Mission) => {
            try {
              const glyphResponse = await apiRequest('GET', `/api/glyphs/${mission.glyphId}`);
              const glyph = await glyphResponse.json();
              return {
                ...mission,
                glyph
              };
            } catch (error) {
              console.error(`Error fetching glyph for mission ${mission.id}:`, error);
              return mission;
            }
          })
        );
        
        setMissions(missionsWithGlyphs);
      } catch (error) {
        console.error("Error fetching missions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMissions();
    
    // Subscribe to mission updates via WebSocket
    const unsubscribe = onMessage('missionUpdated', (mission) => {
      setMissions(prev => 
        prev.map(m => m.id === mission.id ? { ...m, ...mission } : m)
      );
    });
    
    const newMissionUnsubscribe = onMessage('missionCreated', (mission) => {
      setMissions(prev => [...prev, mission]);
    });
    
    return () => {
      unsubscribe();
      newMissionUnsubscribe();
    };
  }, []);
  
  const handleViewMission = (mission: Mission) => {
    if (onViewMission) {
      onViewMission(mission);
    }
  };
  
  const handlePauseMission = async (id: number) => {
    try {
      await apiRequest('POST', `/api/missions/${id}/pause`);
      // The WebSocket will update the UI
    } catch (error) {
      console.error(`Error pausing mission ${id}:`, error);
    }
  };
  
  const handleResumeMission = async (id: number) => {
    try {
      await apiRequest('POST', `/api/missions/${id}/resume`);
      // The WebSocket will update the UI
    } catch (error) {
      console.error(`Error resuming mission ${id}:`, error);
    }
  };
  
  const handleAbortMission = async (id: number) => {
    try {
      await apiRequest('POST', `/api/missions/${id}/abort`);
      // The WebSocket will update the UI
    } catch (error) {
      console.error(`Error aborting mission ${id}:`, error);
    }
  };
  
  const handleAuthorizeMission = async (id: number) => {
    try {
      await apiRequest('POST', `/api/missions/${id}/authorize`);
      // The WebSocket will update the UI
    } catch (error) {
      console.error(`Error authorizing mission ${id}:`, error);
    }
  };

  return (
    <div className="bg-[#1e1e1e] rounded-lg border border-[#333333] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#0a0a0a] text-left">
              <th className="p-4 font-medium text-sm text-gray-400">Mission ID</th>
              <th className="p-4 font-medium text-sm text-gray-400">Glyph Type</th>
              <th className="p-4 font-medium text-sm text-gray-400">Target</th>
              <th className="p-4 font-medium text-sm text-gray-400">Status</th>
              <th className="p-4 font-medium text-sm text-gray-400">Progress</th>
              <th className="p-4 font-medium text-sm text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333333]">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400">
                  Loading missions...
                </td>
              </tr>
            ) : missions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400">
                  No active missions found
                </td>
              </tr>
            ) : (
              missions.map((mission) => (
                <tr key={mission.id} className="hover:bg-[#0a0a0a]/50">
                  <td className="p-4 font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <span 
                        className={`h-2 w-2 rounded-full ${
                          mission.status === 'active' || mission.status === 'processing' 
                            ? 'bg-[#00cc66]' 
                            : mission.status === 'pending' || mission.status === 'paused'
                            ? 'bg-[#ffaa00]'
                            : 'bg-[#ff3366]'
                        }`}
                      ></span>
                      <span>{mission.missionId}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-gradient-to-r from-[#6a11cb] to-[#2575fc] flex items-center justify-center">
                        <span className="text-xs font-mono">{mission.glyph?.symbol || '🜁'}</span>
                      </div>
                      <span>{mission.glyph?.name || mission.name}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm">{mission.target}</td>
                  <td className="p-4">
                    <QuantumBadge status={mission.status as StatusType} />
                  </td>
                  <td className="p-4">
                    <QuantumProgress 
                      value={mission.progress} 
                      variant={
                        mission.status === 'active' || mission.status === 'completed'
                          ? 'success'
                          : mission.status === 'processing' || mission.status === 'pending'
                          ? 'warning'
                          : 'error'
                      }
                      showLabel={true}
                      labelPosition="below"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-1 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white" 
                        title="View Details"
                        onClick={() => handleViewMission(mission)}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      
                      {mission.status === 'pending' ? (
                        <button 
                          className="p-1 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white" 
                          title="Approve Authorization"
                          onClick={() => handleAuthorizeMission(mission.id)}
                        >
                          <Check className="h-5 w-5" />
                        </button>
                      ) : mission.status === 'paused' ? (
                        <button 
                          className="p-1 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white" 
                          title="Resume Mission"
                          onClick={() => handleResumeMission(mission.id)}
                        >
                          <Play className="h-5 w-5" />
                        </button>
                      ) : (mission.status === 'active' || mission.status === 'processing') && (
                        <button 
                          className="p-1 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white" 
                          title="Pause Mission"
                          onClick={() => handlePauseMission(mission.id)}
                        >
                          <Pause className="h-5 w-5" />
                        </button>
                      )}
                      
                      <button 
                        className="p-1 rounded hover:bg-[#0a0a0a] text-gray-400 hover:text-white" 
                        title="Abort Mission"
                        onClick={() => handleAbortMission(mission.id)}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MissionsTable;
