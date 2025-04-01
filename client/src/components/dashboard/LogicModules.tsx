import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { onMessage } from "@/lib/websocket";
import { Shield } from "lucide-react";
import { QuantumParticles } from "@/components/ui/quantum-particles";

interface LogicModule {
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
}

interface LogicModulesProps {
  onConfigureModules?: () => void;
}

const LogicModules: React.FC<LogicModulesProps> = ({ onConfigureModules }) => {
  const [modules, setModules] = useState<LogicModule[]>([]);
  const [cloakTraceLastVerified, setCloakTraceLastVerified] = useState<string>(
    new Date().toISOString()
  );
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch logic modules
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', '/api/logic-modules');
        const data = await response.json();
        setModules(data);
      } catch (error) {
        console.error("Error fetching logic modules:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchModules();
    
    // Subscribe to module updates via WebSocket
    const unsubscribe = onMessage('logicModuleCreated', (module) => {
      setModules(prev => [...prev, module]);
    });
    
    // Fetch CloakTrace verification time
    const fetchCloakTraceStatus = async () => {
      try {
        const response = await apiRequest('POST', '/api/cloak-trace/verify');
        const data = await response.json();
        setCloakTraceLastVerified(data.verificationTime || new Date().toISOString());
      } catch (error) {
        console.error("Error fetching CloakTrace status:", error);
      }
    };
    
    fetchCloakTraceStatus();
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const handleConfigure = () => {
    if (onConfigureModules) {
      onConfigureModules();
    }
  };
  
  // Format verification time
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch (e) {
      return "Unknown";
    }
  };

  return (
    <div className="bg-[#1e1e1e] rounded-lg border border-[#333333] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Logic Modules</h3>
        <button 
          className="text-sm text-[#0099ff] hover:underline"
          onClick={handleConfigure}
        >
          Configure
        </button>
      </div>
      
      <div className="relative overflow-hidden bg-[#0a0a0a] rounded-lg border border-[#333333] p-4">
        <QuantumParticles className="absolute inset-0 opacity-40 pointer-events-none" />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm">Module Configuration</h4>
            <span className="text-xs px-2 py-1 rounded bg-[#00cc66]/20 text-[#00cc66]">Active</span>
          </div>
          
          <div className="font-mono text-sm bg-[#0a0a0a]/70 p-3 rounded-md">
            <div className="text-gray-400">// Shinobi.Runner Logic Configuration</div>
            <div className="text-[#00cc66]">🜁 <span className="text-white">ExecuteMission:</span> <span className="text-[#0099ff]">EntropicRecovery</span></div>
            <div className="text-[#00cc66]">🜆 <span className="text-white">Logic:</span> <span className="text-[#0099ff]">Shinobi.Runner + 🜹EntropyMapper + EthicsEnforcer</span></div>
            <div className="text-[#00cc66]">🜇 <span className="text-white">Deploy to:</span> <span className="text-[#0099ff]">/subspace/entropy-repair</span></div>
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2">Module Integrations</h4>
            <div className="grid grid-cols-2 gap-2">
              {loading ? (
                <div className="col-span-2 text-center text-gray-400 py-2">
                  Loading modules...
                </div>
              ) : modules.length === 0 ? (
                <div className="col-span-2 text-center text-gray-400 py-2">
                  No modules found
                </div>
              ) : (
                modules.map(module => (
                  <div key={module.id} className="flex items-center gap-2 p-2 rounded bg-[#0a0a0a]/70">
                    <div className={`w-3 h-3 rounded-full ${
                      module.status === 'active' 
                        ? 'bg-[#00cc66]' 
                        : module.status === 'warning' 
                        ? 'bg-[#ffaa00]' 
                        : 'bg-[#ff3366]'
                    }`}></div>
                    <span className="text-xs">{module.name}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium text-sm mb-2">CloakTrace Authentication</h4>
        <div className="bg-[#0a0a0a] rounded-lg p-3 border border-[#333333]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#00cc66]" />
              <span className="font-medium text-sm">Quantum Authentication Handshake</span>
            </div>
            <span className="text-xs px-2 py-1 rounded bg-[#00cc66]/20 text-[#00cc66]">Secured</span>
          </div>
          <div className="text-xs text-gray-400">
            Last verification: <span className="text-white">{formatTime(cloakTraceLastVerified)}</span> • <span className="text-[#00cc66]">All checks passed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogicModules;
