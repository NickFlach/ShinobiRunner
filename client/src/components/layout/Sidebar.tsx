import React from "react";
import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Zap, 
  Package, 
  Shield, 
  Layers, 
  Cpu, 
  Settings,
  LogOut
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed = false,
  onLogout = () => console.log("Logout clicked")
}) => {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", icon: <BarChart3 className="h-5 w-5" />, label: "Dashboard" },
    { path: "/missions", icon: <Zap className="h-5 w-5" />, label: "Missions" },
    { path: "/glyph-repository", icon: <Package className="h-5 w-5" />, label: "Glyph Repository" },
    { path: "/cloak-trace-auth", icon: <Shield className="h-5 w-5" />, label: "CloakTrace Auth" },
    { path: "/logic-modules", icon: <Layers className="h-5 w-5" />, label: "Logic Modules" },
    { path: "/quantum-services", icon: <Cpu className="h-5 w-5" />, label: "Quantum Services" },
    { path: "/settings", icon: <Settings className="h-5 w-5" />, label: "Settings" }
  ];

  return (
    <aside className={`bg-[#0a0a0a] ${collapsed ? 'w-16' : 'w-16 md:w-56'} border-r border-[#333333] flex flex-col`}>
      <nav className="p-2 flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <a 
                  className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                    location === item.path 
                      ? "bg-gradient-to-r from-[#6a11cb]/20 to-[#2575fc]/20 border border-[#0099ff]/30" 
                      : "hover:bg-[#1e1e1e]/50 text-gray-400 hover:text-white"
                  }`}
                >
                  {item.icon}
                  {!collapsed && <span className="hidden md:inline">{item.label}</span>}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-2 border-t border-[#333333]">
        {!collapsed && (
          <div className="hidden md:block p-3 rounded-md bg-[#1e1e1e]/50 mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Quantum Resources</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[#ffaa00]/20 text-[#ffaa00]">75%</span>
            </div>
            <div className="h-1.5 bg-[#0a0a0a] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#ffaa00] to-[#0099ff] w-3/4 rounded-full"></div>
            </div>
          </div>
        )}
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1e1e1e]/50 text-gray-400 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="hidden md:inline">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
