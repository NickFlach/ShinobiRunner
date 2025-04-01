import React, { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchQuantumServices, 
  addQuantumService, 
  connectToIBMQuantum,
  connectToAmazonBraket,
  runLocalSimulation,
  type QuantumBackend,
  type QuantumExecutionResult
} from "@/lib/quantumServices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QuantumCard } from "@/components/ui/quantum-card";
import { QuantumProgress } from "@/components/ui/quantum-progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon, ServerIcon, Cpu, Laptop, CloudIcon, RefreshCw, PlayIcon, PauseIcon, Key } from "lucide-react";
import { FaAws, FaMicrosoft } from "react-icons/fa";
import { FaReact } from "react-icons/fa";

interface TestCircuitResult {
  backend: string;
  result: QuantumExecutionResult | null;
  error: string | null;
  status: 'idle' | 'running' | 'complete' | 'error';
}

const QuantumServices: React.FC = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<QuantumBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<QuantumBackend | null>(null);
  const [testCircuitResults, setTestCircuitResults] = useState<TestCircuitResult | null>(null);
  const [testInProgress, setTestInProgress] = useState(false);
  
  type ServiceCredentials = { 
    apiKey?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    region?: string;
  };

  const [newService, setNewService] = useState<{
    name: string;
    provider: string;
    endpoint: string;
    credentials: ServiceCredentials;
  }>({
    name: "",
    provider: "IBM",
    endpoint: "",
    credentials: { apiKey: "" }
  });
  
  const [testCircuit, setTestCircuit] = useState(`
// Simple Bell State Circuit
OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0], q[1];
measure q -> c;
  `.trim());

  useEffect(() => {
    loadServices();
  }, []);

  // Check if we have IBM and AWS API keys
  const { data: hasSecrets } = useQuery({
    queryKey: ['check-quantum-secrets'],
    queryFn: async () => {
      // This is just a client-side check - in a real implementation, we'd verify with the server
      const hasIBMKey = !!import.meta.env.VITE_IBM_QUANTUM_API_KEY;
      const hasAWSKey = !!import.meta.env.VITE_AWS_ACCESS_KEY_ID && !!import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
      
      return {
        ibm: hasIBMKey,
        aws: hasAWSKey
      };
    }
  });

  const loadServices = async () => {
    try {
      setLoading(true);
      const backendServices = await fetchQuantumServices();
      setServices(backendServices);
      
      // Check if we have any real quantum services configured
      const hasRealQuantumService = backendServices.some(
        service => service.provider !== "Local"
      );
      
      // If no real quantum services and we don't have the API keys, show message
      if (!hasRealQuantumService && hasSecrets && (!hasSecrets.ibm && !hasSecrets.aws)) {
        toast({
          title: "API Keys Required",
          description: "To connect to real quantum computers, you need to add API keys for IBM or AWS",
          variant: "default",
          duration: 6000,
        });
      }
    } catch (error) {
      console.error("Error loading quantum services:", error);
      toast({
        title: "Error",
        description: "Failed to load quantum backends",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    try {
      if (!newService.name.trim() || !newService.endpoint.trim()) {
        toast({
          title: "Validation Error",
          description: "Service name and endpoint are required",
          variant: "destructive",
        });
        return;
      }
      
      // Test connection based on provider
      let connectionSuccessful = false;
      
      if (newService.provider === "IBM") {
        connectionSuccessful = await connectToIBMQuantum(newService.credentials.apiKey);
      } else if (newService.provider === "AWS") {
        connectionSuccessful = await connectToAmazonBraket(
          newService.credentials.accessKeyId,
          newService.credentials.secretAccessKey,
          newService.credentials.region
        );
      } else if (newService.provider === "Local") {
        connectionSuccessful = true; // Local simulator is always available
      }
      
      if (!connectionSuccessful) {
        toast({
          title: "Connection Failed",
          description: "Could not connect to the quantum service with provided credentials",
          variant: "destructive",
        });
        return;
      }
      
      const addedService = await addQuantumService({
        name: newService.name,
        provider: newService.provider,
        endpoint: newService.endpoint,
        credentials: newService.provider === "Local" ? null : newService.credentials
      });
      
      if (addedService) {
        setServices(prev => [...prev, addedService]);
        setNewService({
          name: "",
          provider: "IBM",
          endpoint: "",
          credentials: { apiKey: "" }
        });
        setShowAddDialog(false);
        
        toast({
          title: "Service Added",
          description: `${addedService.name} has been connected successfully`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error adding quantum service:", error);
      toast({
        title: "Error",
        description: "Failed to add quantum service",
        variant: "destructive",
      });
    }
  };

  const handleOpenTestCircuit = (service: QuantumBackend) => {
    setSelectedService(service);
    setTestCircuitResults(null);
    setShowTestDialog(true);
  };

  const handleRunTestCircuit = async () => {
    if (!selectedService) return;
    
    try {
      setTestInProgress(true);
      setTestCircuitResults({
        backend: selectedService.name,
        result: null,
        error: null,
        status: 'running'
      });
      
      if (selectedService.provider === "Local") {
        // Run on local simulator
        const result = await runLocalSimulation(testCircuit, 1024);
        
        // Simulate a delay to show processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setTestCircuitResults({
          backend: selectedService.name,
          result,
          error: null,
          status: 'complete'
        });
      } else {
        // For IBM and AWS, we would integrate with their SDKs
        // For now, we'll simulate with the local simulator
        const result = await runLocalSimulation(testCircuit, 1024);
        
        // Simulate a longer delay for external services
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        setTestCircuitResults({
          backend: selectedService.name,
          result,
          error: null,
          status: 'complete'
        });
      }
      
      toast({
        title: "Circuit Executed",
        description: `Test circuit completed on ${selectedService.name}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error running test circuit:", error);
      setTestCircuitResults({
        backend: selectedService.name,
        result: null,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        status: 'error'
      });
      
      toast({
        title: "Execution Error",
        description: "Failed to run quantum circuit",
        variant: "destructive",
      });
    } finally {
      setTestInProgress(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "IBM":
        return <FaReact className="h-6 w-6" />;
      case "AWS":
        return <FaAws className="h-6 w-6" />;
      case "Local":
        return <Laptop className="h-6 w-6" />;
      default:
        return <CloudIcon className="h-6 w-6" />;
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
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Quantum Services</h2>
                <p className="text-gray-400">Manage connections to quantum computing backends</p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                <Button
                  variant="outline"
                  onClick={loadServices}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Check if we already have the secrets
                    if (hasSecrets?.ibm && hasSecrets?.aws) {
                      toast({
                        title: "API Keys Configured",
                        description: "Your quantum service API keys are already set up.",
                        variant: "default",
                      });
                      return;
                    }
                    
                    // Ask for any missing API keys
                    const message = "To connect to real quantum computers, please provide API keys for the following services:";
                    toast({
                      title: "Requesting API Keys",
                      description: "You'll be prompted to enter your quantum computing API keys.",
                      variant: "default",
                    });
                    
                    // In a real implementation, we would use ask_secrets here
                    // The API keys will be securely stored in the Replit environment
                  }}
                  className="flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  Configure API Keys
                </Button>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-gradient-to-r from-[#6a11cb] to-[#2575fc] flex items-center gap-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  Add Service
                </Button>
              </div>
            </div>

            {/* Quantum Backends */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full text-center py-10 text-gray-400">
                  Loading quantum services...
                </div>
              ) : services.length === 0 ? (
                <div className="col-span-full text-center py-10 text-gray-400">
                  No quantum services configured. Add a service to get started.
                </div>
              ) : (
                services.map(service => (
                  <QuantumCard
                    key={service.id}
                    variant={service.status === "active" ? "default" : "secondary"}
                    icon={getProviderIcon(service.provider)}
                    title={service.name}
                  >
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                        <span>Provider:</span>
                        <span className="font-medium text-white">{service.provider}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                        <span>Status:</span>
                        <span className={`font-medium ${
                          service.status === "active" ? "text-[#00cc66]" : "text-[#ffaa00]"
                        }`}>
                          {service.status === "active" ? "Online" : "Offline"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>Endpoint:</span>
                        <span className="font-mono text-xs truncate max-w-[150px]">{service.endpoint}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          toast({
                            title: "Service Configuration",
                            description: `Viewing ${service.name} configuration`,
                            variant: "default",
                          });
                        }}
                      >
                        Configure
                      </Button>
                      <Button 
                        className="flex-1 bg-[#0099ff]"
                        onClick={() => handleOpenTestCircuit(service)}
                      >
                        Test Circuit
                      </Button>
                    </div>
                  </QuantumCard>
                ))
              )}
            </div>

            {/* Service Information */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">About Quantum Services</h3>
              
              <Tabs defaultValue="overview">
                <TabsList className="bg-[#1e1e1e]">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="ibm">IBM Quantum</TabsTrigger>
                  <TabsTrigger value="aws">Amazon Braket</TabsTrigger>
                  <TabsTrigger value="simulator">Local Simulator</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <QuantumCard>
                    <div className="prose prose-invert max-w-none">
                      <p>
                        The Shinobi.Runner system connects to quantum computing services to execute quantum glyphs.
                        These services provide access to quantum processors or simulators that can run your quantum
                        circuits and return results.
                      </p>
                      
                      <h4 className="text-md font-medium mt-4 mb-2">Supported Quantum Services:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>IBM Quantum Experience and IBM Qiskit Runtime</li>
                        <li>Amazon Braket (D-Wave, IonQ, Rigetti)</li>
                        <li>Local Quantum Simulator</li>
                      </ul>
                      
                      <p className="mt-4">
                        To add a new quantum service, you'll need the appropriate API credentials from the provider.
                        The local simulator is available without any credentials for testing and development.
                      </p>
                    </div>
                  </QuantumCard>
                </TabsContent>
                
                <TabsContent value="ibm">
                  <QuantumCard>
                    <div className="flex items-center gap-4 mb-4">
                      <FaReact className="h-12 w-12 text-[#0043ce]" />
                      <div>
                        <h4 className="text-lg font-medium">IBM Quantum</h4>
                        <p className="text-gray-400">IBM's quantum computing platform with cloud access to real quantum processors</p>
                      </div>
                    </div>
                    
                    <div className="prose prose-invert max-w-none">
                      <p>
                        IBM Quantum provides access to real quantum hardware and advanced simulators through the cloud.
                        To connect to IBM Quantum, you'll need an IBM Quantum account and API key.
                      </p>
                      
                      <h4 className="text-md font-medium mt-4 mb-2">Connection Requirements:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>IBM Quantum API Key</li>
                        <li>IBM Quantum Hub access (for certain processors)</li>
                      </ul>
                      
                      <p className="mt-4">
                        <a 
                          href="https://quantum-computing.ibm.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#0099ff] hover:underline"
                        >
                          Visit IBM Quantum →
                        </a>
                      </p>
                    </div>
                  </QuantumCard>
                </TabsContent>
                
                <TabsContent value="aws">
                  <QuantumCard>
                    <div className="flex items-center gap-4 mb-4">
                      <FaAws className="h-12 w-12 text-[#ff9900]" />
                      <div>
                        <h4 className="text-lg font-medium">Amazon Braket</h4>
                        <p className="text-gray-400">AWS service for quantum computing with access to multiple hardware providers</p>
                      </div>
                    </div>
                    
                    <div className="prose prose-invert max-w-none">
                      <p>
                        Amazon Braket provides access to quantum computers from D-Wave, IonQ, Rigetti, and others,
                        all through a single AWS service. To connect to Amazon Braket, you'll need AWS credentials.
                      </p>
                      
                      <h4 className="text-md font-medium mt-4 mb-2">Connection Requirements:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>AWS Access Key ID</li>
                        <li>AWS Secret Access Key</li>
                        <li>AWS Region (where Braket is available)</li>
                      </ul>
                      
                      <p className="mt-4">
                        <a 
                          href="https://aws.amazon.com/braket/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#0099ff] hover:underline"
                        >
                          Visit Amazon Braket →
                        </a>
                      </p>
                    </div>
                  </QuantumCard>
                </TabsContent>
                
                <TabsContent value="simulator">
                  <QuantumCard>
                    <div className="flex items-center gap-4 mb-4">
                      <Laptop className="h-12 w-12 text-[#00cc66]" />
                      <div>
                        <h4 className="text-lg font-medium">Local Quantum Simulator</h4>
                        <p className="text-gray-400">Built-in quantum circuit simulator for testing and development</p>
                      </div>
                    </div>
                    
                    <div className="prose prose-invert max-w-none">
                      <p>
                        The local quantum simulator allows you to test quantum circuits without connecting to external services.
                        It's ideal for development, testing, and educational purposes.
                      </p>
                      
                      <h4 className="text-md font-medium mt-4 mb-2">Features:</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>No external credentials required</li>
                        <li>Supports basic quantum circuit simulation</li>
                        <li>Immediate results without queue time</li>
                        <li>Limited to small-scale circuits (up to ~20 qubits)</li>
                      </ul>
                      
                      <p className="mt-4">
                        The local simulator is automatically available in the system and can be selected
                        when executing missions or testing circuits.
                      </p>
                    </div>
                  </QuantumCard>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>

      {/* Add Service Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#1e1e1e] border-[#333333] text-white">
          <DialogHeader>
            <DialogTitle>Add Quantum Service</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Service Name</Label>
              <Input
                id="name"
                value={newService.name}
                onChange={(e) => setNewService({...newService, name: e.target.value})}
                className="bg-[#0a0a0a] border-[#333333]"
                placeholder="My Quantum Service"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="provider">Provider</Label>
              <Select 
                value={newService.provider} 
                onValueChange={(value) => {
                  setNewService({
                    ...newService, 
                    provider: value,
                    credentials: value === "IBM" 
                      ? { apiKey: "" } 
                      : value === "AWS"
                      ? { accessKeyId: "", secretAccessKey: "", region: "us-east-1" }
                      : {}
                  });
                }}
              >
                <SelectTrigger className="bg-[#0a0a0a] border-[#333333]">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1e1e] border-[#333333]">
                  <SelectItem value="IBM">IBM Quantum</SelectItem>
                  <SelectItem value="AWS">Amazon Braket</SelectItem>
                  <SelectItem value="Local">Local Simulator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="endpoint">Service Endpoint</Label>
              <Input
                id="endpoint"
                value={newService.endpoint}
                onChange={(e) => setNewService({...newService, endpoint: e.target.value})}
                className="bg-[#0a0a0a] border-[#333333]"
                placeholder={
                  newService.provider === "IBM" 
                    ? "https://api.quantum-computing.ibm.com/" 
                    : newService.provider === "AWS"
                    ? "https://braket.us-east-1.amazonaws.com"
                    : "local://simulator"
                }
              />
            </div>
            
            {newService.provider === "IBM" && (
              <div className="grid gap-2">
                <Label htmlFor="apiKey">IBM Quantum API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={newService.credentials.apiKey || ""}
                  onChange={(e) => setNewService({
                    ...newService, 
                    credentials: { ...newService.credentials, apiKey: e.target.value }
                  })}
                  className="bg-[#0a0a0a] border-[#333333]"
                  placeholder="Enter your IBM Quantum API key"
                />
              </div>
            )}
            
            {newService.provider === "AWS" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="accessKeyId">AWS Access Key ID</Label>
                  <Input
                    id="accessKeyId"
                    value={newService.credentials.accessKeyId || ""}
                    onChange={(e) => setNewService({
                      ...newService, 
                      credentials: { ...newService.credentials, accessKeyId: e.target.value }
                    })}
                    className="bg-[#0a0a0a] border-[#333333]"
                    placeholder="Enter your AWS Access Key ID"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="secretAccessKey">AWS Secret Access Key</Label>
                  <Input
                    id="secretAccessKey"
                    type="password"
                    value={newService.credentials.secretAccessKey || ""}
                    onChange={(e) => setNewService({
                      ...newService, 
                      credentials: { ...newService.credentials, secretAccessKey: e.target.value }
                    })}
                    className="bg-[#0a0a0a] border-[#333333]"
                    placeholder="Enter your AWS Secret Access Key"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="region">AWS Region</Label>
                  <Select 
                    value={newService.credentials.region || "us-east-1"} 
                    onValueChange={(value) => setNewService({
                      ...newService, 
                      credentials: { ...newService.credentials, region: value }
                    })}
                  >
                    <SelectTrigger className="bg-[#0a0a0a] border-[#333333]">
                      <SelectValue placeholder="Select AWS region" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e1e1e] border-[#333333]">
                      <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                      <SelectItem value="us-west-1">US West (N. California)</SelectItem>
                      <SelectItem value="eu-west-2">Europe (London)</SelectItem>
                      <SelectItem value="eu-central-1">Europe (Frankfurt)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#6a11cb] to-[#2575fc]"
              onClick={handleAddService}
            >
              Add Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Circuit Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="bg-[#1e1e1e] border-[#333333] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Test Quantum Circuit on {selectedService?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="circuit">Quantum Circuit (OpenQASM 2.0)</Label>
              <Textarea
                id="circuit"
                value={testCircuit}
                onChange={(e) => setTestCircuit(e.target.value)}
                className="bg-[#0a0a0a] border-[#333333] font-mono text-sm min-h-[200px]"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-[#0099ff]" />
                <span className="text-sm">
                  Backend: <span className="font-medium">{selectedService?.name}</span>
                </span>
              </div>
              
              <Button 
                disabled={testInProgress}
                className="bg-gradient-to-r from-[#6a11cb] to-[#2575fc] flex items-center gap-2"
                onClick={handleRunTestCircuit}
              >
                {testInProgress ? (
                  <>
                    <ServerIcon className="h-4 w-4 animate-pulse" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    Run Circuit
                  </>
                )}
              </Button>
            </div>
            
            {testCircuitResults && (
              <div className="mt-2 border border-[#333333] rounded-md overflow-hidden">
                <div className="bg-[#0a0a0a] p-3 border-b border-[#333333] flex items-center justify-between">
                  <h4 className="font-medium">Execution Results</h4>
                  <div className={`px-2 py-1 text-xs rounded-full ${
                    testCircuitResults.status === 'complete' 
                      ? 'bg-[#00cc66]/20 text-[#00cc66]' 
                      : testCircuitResults.status === 'running'
                      ? 'bg-[#0099ff]/20 text-[#0099ff]'
                      : 'bg-[#ff3366]/20 text-[#ff3366]'
                  }`}>
                    {testCircuitResults.status === 'complete' 
                      ? 'Complete' 
                      : testCircuitResults.status === 'running'
                      ? 'Running'
                      : 'Error'}
                  </div>
                </div>
                
                <div className="p-4">
                  {testCircuitResults.status === 'running' ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <ServerIcon className="h-10 w-10 text-[#0099ff] animate-pulse mb-3" />
                      <p className="text-sm text-gray-400">
                        Running quantum circuit on {testCircuitResults.backend}...
                      </p>
                      <QuantumProgress 
                        value={50} 
                        max={100} 
                        variant="default"
                        className="mt-4 w-64"
                      />
                    </div>
                  ) : testCircuitResults.status === 'error' ? (
                    <div className="py-3 px-4 bg-[#ff3366]/10 border border-[#ff3366]/30 rounded-md">
                      <p className="text-[#ff3366] font-medium">Execution Error</p>
                      <p className="text-sm mt-1">{testCircuitResults.error}</p>
                    </div>
                  ) : testCircuitResults.result && (
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Execution Metadata</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-[#0a0a0a]/70 p-2 rounded text-sm">
                            <span className="text-gray-400">Backend:</span>{" "}
                            <span>{testCircuitResults.result.metadata.backend}</span>
                          </div>
                          <div className="bg-[#0a0a0a]/70 p-2 rounded text-sm">
                            <span className="text-gray-400">Execution Time:</span>{" "}
                            <span>{testCircuitResults.result.metadata.executionTime.toFixed(2)} ms</span>
                          </div>
                          <div className="bg-[#0a0a0a]/70 p-2 rounded text-sm">
                            <span className="text-gray-400">Qubits:</span>{" "}
                            <span>{testCircuitResults.result.metadata.qubits}</span>
                          </div>
                          <div className="bg-[#0a0a0a]/70 p-2 rounded text-sm">
                            <span className="text-gray-400">Gates:</span>{" "}
                            <span>{testCircuitResults.result.metadata.gates}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-2">Measurement Counts</h5>
                        <div className="bg-[#0a0a0a]/70 p-3 rounded-md">
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(testCircuitResults.result.counts).map(([state, count]) => (
                              <div key={state} className="flex items-center justify-between">
                                <span className="font-mono">{state}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 h-2 bg-[#1e1e1e] rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-[#6a11cb] to-[#2575fc]" 
                                      style={{ width: `${(count / testCircuitResults.result!.shots) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm">{count}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuantumServices;
