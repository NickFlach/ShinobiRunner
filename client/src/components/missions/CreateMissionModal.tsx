import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { QuantumProgress } from "@/components/ui/quantum-progress";
import { fetchQuantumServices } from "@/lib/quantumServices";

interface CreateMissionModalProps {
  onClose: () => void;
  onMissionCreated: () => void;
  initialGlyphId?: number;
}

interface Glyph {
  id: number;
  symbol: string;
  name: string;
  description: string;
}

interface LogicModule {
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
}

interface QuantumService {
  id: number;
  name: string;
  provider: string;
  status: string;
}

const CreateMissionModal: React.FC<CreateMissionModalProps> = ({
  onClose,
  onMissionCreated,
  initialGlyphId
}) => {
  const { toast } = useToast();
  
  // Mission form state
  const [missionName, setMissionName] = useState("");
  const [selectedGlyphId, setSelectedGlyphId] = useState<number | undefined>(initialGlyphId);
  const [targetPath, setTargetPath] = useState("/quantum/mission-target");
  const [selectedServiceId, setSelectedServiceId] = useState<number | undefined>(undefined);
  const [selectedLogicModules, setSelectedLogicModules] = useState<number[]>([]);
  const [securityLevel, setSecurityLevel] = useState(3);
  
  // Data loading state
  const [glyphs, setGlyphs] = useState<Glyph[]>([]);
  const [logicModules, setLogicModules] = useState<LogicModule[]>([]);
  const [services, setServices] = useState<QuantumService[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch glyphs
        const glyphsResponse = await apiRequest('GET', '/api/glyphs');
        const glyphsData = await glyphsResponse.json();
        setGlyphs(glyphsData);
        
        // If no initial glyph is selected, select the first one
        if (!initialGlyphId && glyphsData.length > 0) {
          setSelectedGlyphId(glyphsData[0].id);
        }
        
        // Fetch logic modules
        const modulesResponse = await apiRequest('GET', '/api/logic-modules');
        const modulesData = await modulesResponse.json();
        setLogicModules(modulesData);
        
        // Select active modules by default
        setSelectedLogicModules(
          modulesData
            .filter((module: LogicModule) => module.status === 'active')
            .slice(0, 2)
            .map((module: LogicModule) => module.id)
        );
        
        // Fetch quantum services
        const servicesData = await fetchQuantumServices();
        setServices(servicesData);
        
        // Select the first active service
        const activeService = servicesData.find(service => service.status === 'active');
        if (activeService) {
          setSelectedServiceId(activeService.id);
        }
      } catch (error) {
        console.error("Error fetching data for mission creation:", error);
        toast({
          title: "Error",
          description: "Failed to load mission creation data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [initialGlyphId, toast]);

  const handleCreateMission = async () => {
    try {
      if (!missionName.trim()) {
        toast({
          title: "Validation Error",
          description: "Mission name is required",
          variant: "destructive",
        });
        return;
      }
      
      if (!selectedGlyphId) {
        toast({
          title: "Validation Error",
          description: "Please select a quantum glyph",
          variant: "destructive",
        });
        return;
      }
      
      if (!selectedServiceId) {
        toast({
          title: "Validation Error",
          description: "Please select a quantum backend",
          variant: "destructive",
        });
        return;
      }
      
      setCreating(true);
      
      // Create mission
      const response = await apiRequest('POST', '/api/missions', {
        name: missionName,
        glyphId: selectedGlyphId,
        target: targetPath,
        userId: 1, // Default user ID
        serviceId: selectedServiceId,
        logicModuleIds: selectedLogicModules,
        config: {
          securityLevel,
          priority: securityLevel >= 3 ? "high" : securityLevel === 2 ? "medium" : "low"
        }
      });
      
      const createdMission = await response.json();
      
      toast({
        title: "Mission Created",
        description: `Mission ${createdMission.missionId} has been created successfully`,
        variant: "success",
      });
      
      onMissionCreated();
    } catch (error) {
      console.error("Error creating mission:", error);
      toast({
        title: "Error",
        description: "Failed to create mission",
        variant: "destructive",
      });
      setCreating(false);
    }
  };

  const handleToggleLogicModule = (moduleId: number) => {
    setSelectedLogicModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-[#1e1e1e] border-[#333333] text-white max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Mission</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-t-transparent border-[#0099ff] rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading mission components...</p>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Mission Name</Label>
              <Input
                id="name"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                className="bg-[#0a0a0a] border-[#333333]"
                placeholder="Enter mission name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="glyph">Select Quantum Glyph</Label>
              <Select 
                value={selectedGlyphId?.toString()} 
                onValueChange={(value) => setSelectedGlyphId(parseInt(value))}
              >
                <SelectTrigger className="bg-[#0a0a0a] border-[#333333]">
                  <SelectValue placeholder="Select a glyph" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e1e] border-[#333333]">
                  {glyphs.map(glyph => (
                    <SelectItem key={glyph.id} value={glyph.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{glyph.symbol}</span>
                        <span>{glyph.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedGlyphId && (
                <p className="text-xs text-gray-400 mt-1">
                  {glyphs.find(g => g.id === selectedGlyphId)?.description}
                </p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="target">Target Deployment</Label>
              <Input
                id="target"
                value={targetPath}
                onChange={(e) => setTargetPath(e.target.value)}
                className="bg-[#0a0a0a] border-[#333333] font-mono text-sm"
                placeholder="/quantum/target/path"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="logicModules">Logic Modules</Label>
              <div className="grid grid-cols-2 gap-2">
                {logicModules.map(module => (
                  <div 
                    key={module.id}
                    className={`bg-[#0a0a0a] rounded p-2 flex items-center gap-2 border border-[#333333] ${
                      module.status !== 'active' ? 'opacity-60' : ''
                    }`}
                  >
                    <Checkbox 
                      id={`module-${module.id}`}
                      checked={selectedLogicModules.includes(module.id)}
                      onCheckedChange={() => handleToggleLogicModule(module.id)}
                      disabled={module.status !== 'active'}
                      className="bg-[#0a0a0a] border-[#333333] text-[#0099ff]"
                    />
                    <Label 
                      htmlFor={`module-${module.id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {module.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="service">Quantum Backend</Label>
              <Select 
                value={selectedServiceId?.toString()} 
                onValueChange={(value) => setSelectedServiceId(parseInt(value))}
              >
                <SelectTrigger className="bg-[#0a0a0a] border-[#333333]">
                  <SelectValue placeholder="Select a quantum service" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e1e] border-[#333333]">
                  {services.map(service => (
                    <SelectItem 
                      key={service.id} 
                      value={service.id.toString()}
                      disabled={service.status !== 'active'}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          service.status === 'active' ? 'bg-[#00cc66]' : 'bg-[#ff3366]'
                        }`}></div>
                        <span>{service.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="security">Security Level</Label>
              <div className="flex items-center gap-3">
                <Slider
                  id="security"
                  min={1}
                  max={3}
                  step={1}
                  value={[securityLevel]}
                  onValueChange={(values) => setSecurityLevel(values[0])}
                  className="flex-1"
                />
                <span className="text-sm font-medium min-w-[80px] text-right">
                  {securityLevel === 1 ? "Minimal" : 
                   securityLevel === 2 ? "Standard" : "Maximum"}
                </span>
              </div>
              <div className="mt-1">
                <QuantumProgress 
                  value={securityLevel} 
                  max={3}
                  variant={securityLevel === 3 ? "success" : securityLevel === 2 ? "default" : "warning"}
                />
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            disabled={loading || creating || !selectedGlyphId || !selectedServiceId}
            className="bg-gradient-to-r from-[#6a11cb] to-[#2575fc]"
            onClick={handleCreateMission}
          >
            {creating ? "Deploying..." : "Deploy Runner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMissionModal;
