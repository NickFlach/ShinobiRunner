import React, { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { onMessage } from "@/lib/websocket";
import { Plus } from "lucide-react";

interface Glyph {
  id: number;
  symbol: string;
  name: string;
  description: string;
}

interface GlyphRegistryProps {
  onSelectGlyph?: (glyph: Glyph) => void;
  onCreateGlyph?: () => void;
}

const GlyphRegistry: React.FC<GlyphRegistryProps> = ({ 
  onSelectGlyph,
  onCreateGlyph
}) => {
  const [glyphs, setGlyphs] = useState<Glyph[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch glyphs
    const fetchGlyphs = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', '/api/glyphs');
        const data = await response.json();
        setGlyphs(data);
      } catch (error) {
        console.error("Error fetching glyphs:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGlyphs();
    
    // Subscribe to glyph updates via WebSocket
    const unsubscribe = onMessage('glyphCreated', (glyph) => {
      setGlyphs(prev => [...prev, glyph]);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  const handleAddGlyph = () => {
    if (onCreateGlyph) {
      onCreateGlyph();
    }
  };
  
  const handleSelectGlyph = (glyph: Glyph) => {
    if (onSelectGlyph) {
      onSelectGlyph(glyph);
    }
  };
  
  // Define gradient variations for glyph icons
  const gradients = [
    "from-[#6a11cb] to-[#2575fc]",
    "from-[#0099ff] to-[#2575fc]",
    "from-[#ffaa00] to-[#2575fc]"
  ];
  
  return (
    <div className="bg-[#1e1e1e] rounded-lg border border-[#333333] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Quantum Glyph Registry</h3>
        <button 
          className="text-sm text-[#0099ff] hover:underline"
          onClick={handleAddGlyph}
        >
          View All
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          <div className="bg-[#0a0a0a] rounded-md p-3 border border-[#333333]/50 text-center text-gray-400">
            Loading glyphs...
          </div>
        ) : glyphs.length === 0 ? (
          <div className="bg-[#0a0a0a] rounded-md p-3 border border-[#333333]/50 text-center text-gray-400">
            No glyphs found
          </div>
        ) : (
          glyphs.slice(0, 3).map((glyph, index) => (
            <div 
              key={glyph.id} 
              className="bg-[#0a0a0a] rounded-md p-3 border border-[#333333]/50 hover:border-[#0099ff]/50 transition-colors flex items-start justify-between cursor-pointer"
              onClick={() => handleSelectGlyph(glyph)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded bg-gradient-to-r ${gradients[index % gradients.length]} flex items-center justify-center font-mono`}>
                  <span className="text-lg">{glyph.symbol}</span>
                </div>
                <div>
                  <h4 className="font-medium">{glyph.name}</h4>
                  <p className="text-xs text-gray-400">{glyph.description}</p>
                </div>
              </div>
              <div className="flex items-center">
                <button 
                  className="text-[#0099ff] hover:text-white p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectGlyph(glyph);
                  }}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GlyphRegistry;
