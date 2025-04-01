import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { 
  initiateCloakTraceHandshake, 
  verifyCloakTrace, 
  type CloakTraceState 
} from "@/lib/cloakTraceAuth";
import { Button } from "@/components/ui/button";
import { QuantumCard } from "@/components/ui/quantum-card";
import { QuantumProgress } from "@/components/ui/quantum-progress";
import { QuantumParticles } from "@/components/ui/quantum-particles";
import { Shield, RefreshCw, Lock, Key, CheckCircle, AlertCircle } from "lucide-react";

const CloakTraceAuth: React.FC = () => {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<CloakTraceState>({
    authenticated: false,
    verificationTime: "",
    handshakeIntegrity: 0,
    quantumAuthentication: 0
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    // Verify CloakTrace on mount
    verifyAuthentication();
  }, [refreshCount]);

  const verifyAuthentication = async () => {
    try {
      setIsVerifying(true);
      
      // Generate a new quantum key for handshake
      await initiateCloakTraceHandshake();
      
      // Verify the authentication
      const result = await verifyCloakTrace();
      setAuthState(result);
      
      if (result.authenticated) {
        toast({
          title: "Authentication Successful",
          description: "CloakTrace quantum authentication verified",
          variant: "success",
        });
      } else {
        toast({
          title: "Authentication Failed",
          description: "CloakTrace verification could not be completed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying CloakTrace:", error);
      toast({
        title: "Authentication Error",
        description: "An error occurred during quantum authentication",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRefreshAuth = () => {
    setRefreshCount(prev => prev + 1);
  };

  // Format verification time
  const formatTime = (isoString: string) => {
    if (!isoString) return "Not available";
    
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header systemStatus="online" />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-auto p-4">
          <div className="container mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-1">CloakTrace Authentication</h2>
              <p className="text-gray-400">Quantum-secured authentication and verification system</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Authentication Status */}
              <QuantumCard 
                glowing={authState.authenticated}
                variant={authState.authenticated ? "success" : "error"}
                icon={<Shield className="h-6 w-6" />}
                title="Authentication Status"
              >
                <div className="mt-4 flex flex-col items-center justify-center py-6">
                  <div className="relative mb-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${
                      authState.authenticated ? 'border-[#00cc66]' : 'border-[#ff3366]'
                    }`}>
                      {authState.authenticated ? (
                        <CheckCircle className="h-12 w-12 text-[#00cc66]" />
                      ) : (
                        <AlertCircle className="h-12 w-12 text-[#ff3366]" />
                      )}
                    </div>
                    {isVerifying && (
                      <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-[#0099ff] animate-spin"></div>
                    )}
                  </div>
                  
                  <h3 className={`text-xl font-semibold ${
                    authState.authenticated ? 'text-[#00cc66]' : 'text-[#ff3366]'
                  }`}>
                    {authState.authenticated ? 'Quantum Authentication Verified' : 'Authentication Failed'}
                  </h3>
                  
                  <p className="text-sm text-gray-400 mt-2">
                    Last verified: {formatTime(authState.verificationTime)}
                  </p>
                  
                  <Button
                    onClick={handleRefreshAuth}
                    disabled={isVerifying}
                    className="mt-6 bg-[#1e1e1e] hover:bg-[#333333] flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {isVerifying ? 'Verifying...' : 'Verify Again'}
                  </Button>
                </div>
              </QuantumCard>

              {/* Authentication Metrics */}
              <QuantumCard
                title="Authentication Metrics"
                className="relative overflow-hidden"
              >
                <QuantumParticles 
                  className="absolute inset-0" 
                  particleCount={15}
                  animate={authState.authenticated}
                />
                
                <div className="relative z-10">
                  <div className="space-y-6 mt-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <Lock className="h-5 w-5 text-[#0099ff] mr-2" />
                        <span className="font-medium">Handshake Integrity</span>
                        <span className="ml-auto text-sm">{authState.handshakeIntegrity}%</span>
                      </div>
                      <QuantumProgress 
                        value={authState.handshakeIntegrity} 
                        max={100} 
                        variant={authState.handshakeIntegrity > 70 ? "success" : "warning"}
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-2">
                        <Key className="h-5 w-5 text-[#0099ff] mr-2" />
                        <span className="font-medium">Quantum Authentication</span>
                        <span className="ml-auto text-sm">{authState.quantumAuthentication}%</span>
                      </div>
                      <QuantumProgress 
                        value={authState.quantumAuthentication} 
                        max={100} 
                        variant={authState.quantumAuthentication > 70 ? "success" : "warning"}
                      />
                    </div>
                    
                    <div className="p-4 bg-[#0a0a0a] rounded-lg border border-[#333333] mt-6">
                      <h4 className="text-sm font-medium mb-2">Quantum Key Signature</h4>
                      <div className="font-mono text-xs text-gray-400 break-all">
                        {isVerifying ? (
                          <div className="h-4 w-full bg-[#1e1e1e] rounded animate-pulse"></div>
                        ) : authState.authenticated ? (
                          `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
                        ) : (
                          'No valid quantum signature'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </QuantumCard>
            </div>

            {/* Security Information */}
            <div className="mt-6">
              <QuantumCard>
                <h3 className="text-lg font-semibold mb-4">About CloakTrace Authentication</h3>
                <div className="prose prose-invert max-w-none">
                  <p>
                    CloakTrace is an autonomous, quantum-secured authentication system designed specifically for Shinobi.Runner operations.
                    It leverages quantum key distribution and post-quantum cryptography to ensure missions are only executed by authorized entities.
                  </p>
                  
                  <h4 className="text-md font-medium mt-4 mb-2">Key Security Features:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Quantum-authenticated handshake layer</li>
                    <li>Zero-knowledge proof validation</li>
                    <li>Post-quantum cryptographic algorithms</li>
                    <li>Real-time integrity verification</li>
                    <li>Mission-specific authorization constraints</li>
                  </ul>
                </div>
              </QuantumCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CloakTraceAuth;
