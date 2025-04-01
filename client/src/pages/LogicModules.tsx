import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { PlusIcon, Search, ChevronRight, Settings, Code, Activity, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuantumCard } from "@/components/ui/quantum-card";
import { QuantumBadge } from "@/components/ui/quantum-badge";
import { QuantumParticles } from "@/components/ui/quantum-particles";

interface LogicModule {
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
}

const LogicModules: React.FC = () => {
  const { toast } = useToast();
  const [modules, setModules] = useState<LogicModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState<LogicModule | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [newModule, setNewModule] = useState({
    name: "",
    description: "",
    type: "analysis",
    status: "active"
  });

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', '/api/logic-modules');
        const data = await response.json();
        setModules(data);
      } catch (error) {
        console.error("Error fetching logic modules:", error);
        toast({
          title: "Error",
          description: "Failed to load logic modules",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [toast]);

  const handleCreateModule = async () => {
    try {
      if (!newModule.name.trim() || !newModule.description.trim()) {
        toast({
          title: "Validation Error",
          description: "Name and description are required",
          variant: "destructive",
        });
        return;
      }

      const response = await apiRequest('POST', '/api/logic-modules', newModule);
      const createdModule = await response.json();
      
      setModules(prev => [...prev, createdModule]);
      setNewModule({
        name: "",
        description: "",
        type: "analysis",
        status: "active"
      });
      setShowCreateDialog(false);
      
      toast({
        title: "Logic Module Created",
        description: `The module "${createdModule.name}" has been created`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error creating logic module:", error);
      toast({
        title: "Error",
        description: "Failed to create logic module",
        variant: "destructive",
      });
    }
  };

  const handleViewModule = (module: LogicModule) => {
    setSelectedModule(module);
    setShowDetailDialog(true);
  };

  const filteredModules = modules.filter(module => 
    module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const moduleTypeIcons = {
    analysis: <Activity className="h-5 w-5" />,
    execution: <Code className="h-5 w-5" />,
    governance: <Settings className="h-5 w-5" />,
    security: <ShieldCheck className="h-5 w-5" />
  };

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
                <h2 className="text-2xl font-semibold mb-1">Logic Modules</h2>
                <p className="text-gray-400">Manage quantum logic modules and integration components</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#6a11cb] to-[#2575fc] rounded-md text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <PlusIcon className="h-5 w-5" />
                  New Module
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search logic modules..."
                className="pl-9 bg-[#1e1e1e] border-[#333333]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Module Categories */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <QuantumCard className="flex flex-col items-center p-6">
                <Activity className="h-10 w-10 mb-3 text-[#0099ff]" />
                <h3 className="font-medium">Analysis</h3>
                <p className="text-xs text-gray-400 text-center mt-1">Data processing and analysis modules</p>
              </QuantumCard>
              
              <QuantumCard className="flex flex-col items-center p-6">
                <Code className="h-10 w-10 mb-3 text-[#00cc66]" />
                <h3 className="font-medium">Execution</h3>
                <p className="text-xs text-gray-400 text-center mt-1">Runtime and quantum execution engines</p>
              </QuantumCard>
              
              <QuantumCard className="flex flex-col items-center p-6">
                <Settings className="h-10 w-10 mb-3 text-[#ffaa00]" />
                <h3 className="font-medium">Governance</h3>
                <p className="text-xs text-gray-400 text-center mt-1">Policy and compliance control modules</p>
              </QuantumCard>
              
              <QuantumCard className="flex flex-col items-center p-6">
                <ShieldCheck className="h-10 w-10 mb-3 text-[#ff3366]" />
                <h3 className="font-medium">Security</h3>
                <p className="text-xs text-gray-400 text-center mt-1">Authentication and encryption services</p>
              </QuantumCard>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Modules</h3>
              
              {loading ? (
                <div className="text-center py-12 text-gray-400">
                  Loading logic modules...
                </div>
              ) : filteredModules.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  {searchTerm ? "No modules found matching your search" : "No logic modules found"}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredModules.map(module => (
                    <QuantumCard 
                      key={module.id}
                      className="hover:border-[#0099ff]/30 transition-colors cursor-pointer"
                      onClick={() => handleViewModule(module)}
                    >
                      <div className="flex items-start">
                        <div className={`p-3 rounded-md ${
                          module.type === 'analysis' ? 'bg-[#0099ff]/10 text-[#0099ff]' :
                          module.type === 'execution' ? 'bg-[#00cc66]/10 text-[#00cc66]' :
                          module.type === 'governance' ? 'bg-[#ffaa00]/10 text-[#ffaa00]' :
                          'bg-[#ff3366]/10 text-[#ff3366]'
                        }`}>
                          {moduleTypeIcons[module.type as keyof typeof moduleTypeIcons] || <Settings className="h-5 w-5" />}
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{module.name}</h4>
                            <QuantumBadge 
                              status={module.status === 'active' ? 'active' : 'pending'} 
                              variant="slim"
                            />
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{module.description}</p>
                          
                          <div className="mt-3 flex justify-between items-center">
                            <span className="text-xs capitalize text-gray-400">{module.type}</span>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </QuantumCard>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Module Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#1e1e1e] border-[#333333] text-white">
          <DialogHeader>
            <DialogTitle>Create Logic Module</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Module Name</Label>
              <Input
                id="name"
                value={newModule.name}
                onChange={(e) => setNewModule({...newModule, name: e.target.value})}
                className="bg-[#0a0a0a] border-[#333333]"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newModule.description}
                onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                className="bg-[#0a0a0a] border-[#333333]"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Module Type</Label>
              <Select 
                value={newModule.type} 
                onValueChange={(value) => setNewModule({...newModule, type: value})}
              >
                <SelectTrigger className="bg-[#0a0a0a] border-[#333333]">
                  <SelectValue placeholder="Select module type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e1e] border-[#333333]">
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="execution">Execution</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select 
                value={newModule.status} 
                onValueChange={(value) => setNewModule({...newModule, status: value})}
              >
                <SelectTrigger className="bg-[#0a0a0a] border-[#333333]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e1e] border-[#333333]">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#6a11cb] to-[#2575fc]"
              onClick={handleCreateModule}
            >
              Create Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module Detail Dialog */}
      {selectedModule && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="bg-[#1e1e1e] border-[#333333] text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedModule.name}</DialogTitle>
            </DialogHeader>
            
            <div className="relative overflow-hidden">
              <QuantumParticles 
                className="absolute inset-0" 
                particleCount={10}
                animate={selectedModule.status === 'active'}
              />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-gray-400">{selectedModule.description}</p>
                  </div>
                  <QuantumBadge status={selectedModule.status === 'active' ? 'active' : 'pending'} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#0a0a0a] p-3 rounded-md border border-[#333333]">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Type</h4>
                    <div className="flex items-center gap-2">
                      {moduleTypeIcons[selectedModule.type as keyof typeof moduleTypeIcons] || <Settings className="h-4 w-4" />}
                      <span className="capitalize">{selectedModule.type}</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#0a0a0a] p-3 rounded-md border border-[#333333]">
                    <h4 className="text-sm font-medium text-gray-400 mb-1">ID</h4>
                    <div className="font-mono text-sm">{selectedModule.id}</div>
                  </div>
                </div>
                
                <div className="bg-[#0a0a0a]/70 p-4 rounded-md border border-[#333333] mb-4">
                  <h4 className="text-sm font-medium mb-2">Integration Example</h4>
                  <div className="font-mono text-xs text-gray-400">
                    <div className="text-[#00cc66]">🜇 <span className="text-white">Logic:</span> <span className="text-[#0099ff]">Shinobi.Runner + {selectedModule.name}</span></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline"
                    className={`${
                      selectedModule.status === 'active' ? 'text-[#ff3366] border-[#ff3366]/30' : 'text-[#00cc66] border-[#00cc66]/30'
                    }`}
                  >
                    {selectedModule.status === 'active' ? 'Deactivate' : 'Activate'} Module
                  </Button>
                  
                  <Button className="bg-gradient-to-r from-[#6a11cb] to-[#2575fc]">
                    Edit Configuration
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LogicModules;
