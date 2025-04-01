import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { fetchQuantumServices } from "@/lib/quantumServices";
import { Monitor, Zap, Shield } from "lucide-react";
import { QuantumCard } from "@/components/ui/quantum-card";
import { QuantumProgress } from "@/components/ui/quantum-progress";
import { verifyCloakTrace } from "@/lib/cloakTraceAuth";
import Chart from "chart.js/auto";

interface SystemStatus {
  status: string;
  connectedBackends: number;
  lastVerification: string;
}

interface CloakTraceStatus {
  authenticated: boolean;
  verificationTime: string;
  handshakeIntegrity: number;
  quantumAuthentication: number;
}

interface StatusCardsProps {
  onStatusUpdate?: (status: SystemStatus) => void;
}

const StatusCards: React.FC<StatusCardsProps> = ({ onStatusUpdate }) => {
  const [status, setStatus] = useState<SystemStatus>({
    status: "online",
    connectedBackends: 0,
    lastVerification: new Date().toISOString()
  });
  
  const [cloakTraceStatus, setCloakTraceStatus] = useState<CloakTraceStatus>({
    authenticated: true,
    verificationTime: new Date().toISOString(),
    handshakeIntegrity: 100,
    quantumAuthentication: 100
  });
  
  const [activeRunners, setActiveRunners] = useState<number>(7);
  const [activeRunnersTrend, setActiveRunnersTrend] = useState<number[]>([4, 3, 5, 6, 5, 7, 7]);
  
  useEffect(() => {
    // Fetch system status
    const getSystemStatus = async () => {
      try {
        const response = await apiRequest('GET', '/api/system-status');
        const data = await response.json();
        
        setStatus({
          status: data.status || "online",
          connectedBackends: data.connectedBackends || 0,
          lastVerification: data.lastVerification || new Date().toISOString()
        });
        
        if (onStatusUpdate) {
          onStatusUpdate({
            status: data.status || "online",
            connectedBackends: data.connectedBackends || 0,
            lastVerification: data.lastVerification || new Date().toISOString()
          });
        }
      } catch (error) {
        console.error("Error fetching system status:", error);
      }
    };
    
    // Fetch quantum services
    const getQuantumServices = async () => {
      try {
        const services = await fetchQuantumServices();
        setStatus(prev => ({
          ...prev,
          connectedBackends: services.filter(s => s.status === "active").length
        }));
      } catch (error) {
        console.error("Error fetching quantum services:", error);
      }
    };
    
    // Verify CloakTrace authentication
    const verifyCloakTraceAuth = async () => {
      try {
        const authStatus = await verifyCloakTrace();
        setCloakTraceStatus(authStatus);
      } catch (error) {
        console.error("Error verifying CloakTrace:", error);
      }
    };
    
    getSystemStatus();
    getQuantumServices();
    verifyCloakTraceAuth();
    
    // Initialize chart
    const ctx = document.getElementById('runnersChart') as HTMLCanvasElement;
    if (ctx) {
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Active Runners',
            data: activeRunnersTrend,
            fill: true,
            backgroundColor: 'rgba(0, 153, 255, 0.1)',
            borderColor: '#0099ff',
            tension: 0.4,
            pointBackgroundColor: '#0099ff',
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.5)'
              },
              suggestedMax: 10
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.05)'
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.5)'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
      
      return () => {
        chart.destroy();
      };
    }
  }, [onStatusUpdate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Quantum Backends Card */}
      <QuantumCard 
        glowing={true}
        icon={<Monitor className="h-6 w-6" />}
        title={<h3 className="text-gray-400 text-sm mb-1">Quantum Backends</h3>}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">{status.connectedBackends}</span>
          <span className="text-sm text-gray-400">connected</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-[#0a0a0a] rounded p-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00cc66]"></span>
            <span className="text-xs">IBM Q</span>
          </div>
          <div className="bg-[#0a0a0a] rounded p-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00cc66]"></span>
            <span className="text-xs">Amazon Braket</span>
          </div>
          <div className="bg-[#0a0a0a] rounded p-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ffaa00]"></span>
            <span className="text-xs">Qiskit Runtime</span>
          </div>
          <div className="bg-[#0a0a0a] rounded p-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00cc66]"></span>
            <span className="text-xs">Local Simulator</span>
          </div>
        </div>
      </QuantumCard>
      
      {/* Active Runners Card */}
      <QuantumCard
        icon={<Zap className="h-6 w-6" />}
        title={<h3 className="text-gray-400 text-sm mb-1">Active Runners</h3>}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold">{activeRunners}</span>
          <span className="text-sm text-[#00cc66]">+2 today</span>
        </div>
        <div className="mt-4">
          <canvas id="runnersChart" height="60"></canvas>
        </div>
      </QuantumCard>
      
      {/* CloakTrace Security Card */}
      <QuantumCard
        icon={<Shield className="h-6 w-6" />}
        title={<h3 className="text-gray-400 text-sm mb-1">CloakTrace Security</h3>}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-[#00cc66]">
            {cloakTraceStatus.authenticated ? 'Secured' : 'Unsecured'}
          </span>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs">Handshake Integrity</span>
            <span className="text-xs text-[#00cc66]">{cloakTraceStatus.handshakeIntegrity}%</span>
          </div>
          <QuantumProgress 
            value={cloakTraceStatus.handshakeIntegrity} 
            variant="success"
            height="xs"
          />
          
          <div className="flex justify-between items-center">
            <span className="text-xs">Quantum Authentication</span>
            <span className="text-xs text-[#00cc66]">{cloakTraceStatus.quantumAuthentication}%</span>
          </div>
          <QuantumProgress 
            value={cloakTraceStatus.quantumAuthentication}
            variant="success"
            height="xs"
          />
        </div>
      </QuantumCard>
    </div>
  );
};

export default StatusCards;
