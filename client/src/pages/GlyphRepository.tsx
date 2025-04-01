import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { PlusIcon, Search, FilterIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QuantumCard } from "@/components/ui/quantum-card";

interface Glyph {
  id: number;
  symbol: string;
  name: string;
  description: string;
  code: string | null;
}

const GlyphRepository: React.FC = () => {
  const { toast } = useToast();
  const [glyphs, setGlyphs] = useState<Glyph[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGlyph, setNewGlyph] = useState({
    symbol: "🜁",
    name: "",
    description: "",
    code: ""
  });

  useEffect(() => {
    const fetchGlyphs = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', '/api/glyphs');
        const data = await response.json();
        setGlyphs(data);
      } catch (error) {
        console.error("Error fetching glyphs:", error);
        toast({
          title: "Error",
          description: "Failed to load quantum glyphs",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGlyphs();
  }, [toast]);

  const handleCreateGlyph = async () => {
    try {
      if (!newGlyph.name.trim() || !newGlyph.description.trim()) {
        toast({
          title: "Validation Error",
          description: "Name and description are required",
          variant: "destructive",
        });
        return;
      }

      const response = await apiRequest('POST', '/api/glyphs', newGlyph);
      const createdGlyph = await response.json();
      
      setGlyphs(prev => [...prev, createdGlyph]);
      setNewGlyph({
        symbol: "🜁",
        name: "",
        description: "",
        code: ""
      });
      setShowCreateDialog(false);
      
      toast({
        title: "Glyph Created",
        description: `The glyph "${createdGlyph.name}" has been added to the repository`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error creating glyph:", error);
      toast({
        title: "Error",
        description: "Failed to create quantum glyph",
        variant: "destructive",
      });
    }
  };

  const glyphSymbols = ["🜁", "🜂", "🜃", "🜄", "🜅", "🜆", "🜇", "🜈", "🜉", "🜊", "🜋", "🜌"];
  
  const filteredGlyphs = glyphs.filter(glyph => 
    glyph.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    glyph.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const gradients = [
    "from-[#6a11cb] to-[#2575fc]",
    "from-[#0099ff] to-[#2575fc]",
    "from-[#ffaa00] to-[#2575fc]",
    "from-[#00cc66] to-[#0099ff]",
    "from-[#ff3366] to-[#ffaa00]"
  ];

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
                <h2 className="text-2xl font-semibold mb-1">Quantum Glyph Repository</h2>
                <p className="text-gray-400">Manage and deploy quantum glyph patterns for computation</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#6a11cb] to-[#2575fc] rounded-md text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <PlusIcon className="h-5 w-5" />
                  New Glyph
                </Button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search glyphs..."
                  className="pl-9 bg-[#1e1e1e] border-[#333333]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <FilterIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Glyphs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full text-center py-12 text-gray-400">
                  Loading quantum glyphs...
                </div>
              ) : filteredGlyphs.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-400">
                  {searchTerm ? "No glyphs found matching your search" : "No glyphs found in the repository"}
                </div>
              ) : (
                filteredGlyphs.map((glyph, index) => (
                  <QuantumCard 
                    key={glyph.id}
                    className="hover:border-[#0099ff]/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded bg-gradient-to-r ${gradients[index % gradients.length]} flex items-center justify-center font-mono text-xl`}>
                        {glyph.symbol}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{glyph.name}</h3>
                        <p className="text-sm text-gray-400 mt-1">{glyph.description}</p>
                        
                        <div className="mt-4 flex justify-end">
                          <Button variant="outline" size="sm" className="text-xs">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </QuantumCard>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create Glyph Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#1e1e1e] border-[#333333] text-white">
          <DialogHeader>
            <DialogTitle>Create New Quantum Glyph</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="symbol">Glyph Symbol</Label>
              <div className="flex flex-wrap gap-2 p-2 bg-[#0a0a0a] rounded-md border border-[#333333]">
                {glyphSymbols.map(symbol => (
                  <button
                    key={symbol}
                    className={`w-8 h-8 flex items-center justify-center rounded text-lg ${
                      newGlyph.symbol === symbol 
                        ? 'bg-gradient-to-r from-[#6a11cb] to-[#2575fc]' 
                        : 'bg-[#1e1e1e] hover:bg-[#333333]'
                    }`}
                    onClick={() => setNewGlyph({...newGlyph, symbol})}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newGlyph.name}
                onChange={(e) => setNewGlyph({...newGlyph, name: e.target.value})}
                className="bg-[#0a0a0a] border-[#333333]"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newGlyph.description}
                onChange={(e) => setNewGlyph({...newGlyph, description: e.target.value})}
                className="bg-[#0a0a0a] border-[#333333]"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="code">Quantum Code (Optional)</Label>
              <Textarea
                id="code"
                value={newGlyph.code}
                onChange={(e) => setNewGlyph({...newGlyph, code: e.target.value})}
                className="bg-[#0a0a0a] border-[#333333] font-mono text-sm"
                rows={5}
                placeholder="// Quantum code for this glyph"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#6a11cb] to-[#2575fc]"
              onClick={handleCreateGlyph}
            >
              Create Glyph
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GlyphRepository;
