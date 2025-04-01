import React, { useState, useEffect } from "react";
import { Bell, Settings } from "lucide-react";
import { verifyCloakTrace } from "@/lib/cloakTraceAuth";

interface HeaderProps {
  systemStatus?: "online" | "limited" | "offline";
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  systemStatus = "online",
  onSettingsClick,
  onNotificationsClick
}) => {
  const [status, setStatus] = useState(systemStatus);
  
  useEffect(() => {
    // Verify authentication on mount
    verifyCloakTrace();
    
    // Update status if prop changes
    setStatus(systemStatus);
  }, [systemStatus]);
  
  const statusColors = {
    online: "bg-[#00cc66]",
    limited: "bg-[#ffaa00]",
    offline: "bg-[#ff3366]"
  };
  
  const statusLabels = {
    online: "System Online",
    limited: "Limited Functionality",
    offline: "System Offline"
  };
  
  return (
    <header className="bg-[#0a0a0a] border-b border-[#333333] py-2 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#6a11cb] to-[#2575fc] rounded-md opacity-70 animate-pulse-slow"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-mono font-bold">SR</span>
            </div>
          </div>
          <h1 className="text-xl font-semibold">Shinobi.Runner</h1>
          <span className="bg-[#1e1e1e] px-2 py-1 rounded text-xs font-mono text-gray-400">v0.9.3-alpha</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-[#1e1e1e] px-3 py-1 rounded-full flex items-center gap-2 text-sm">
            <span className={`h-2 w-2 rounded-full ${statusColors[status]}`}></span>
            <span>{statusLabels[status]}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 text-gray-400 hover:text-white"
              onClick={onSettingsClick}
            >
              <Settings className="h-5 w-5" />
            </button>
            <button 
              className="p-2 text-gray-400 hover:text-white"
              onClick={onNotificationsClick}
            >
              <Bell className="h-5 w-5" />
            </button>
            <div className="ml-2 flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#6a11cb] to-[#2575fc] flex items-center justify-center text-xs font-medium">QS</div>
              <span className="hidden md:inline">Quantum Supervisor</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
