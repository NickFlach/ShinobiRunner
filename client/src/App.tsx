import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { initializeWebSocket } from "@/lib/websocket";
import { initiateCloakTraceHandshake, verifyCloakTrace } from "@/lib/cloakTraceAuth";

// Pages
import Dashboard from "@/pages/Dashboard";
import Missions from "@/pages/Missions";
import GlyphRepository from "@/pages/GlyphRepository";
import CloakTraceAuth from "@/pages/CloakTraceAuth";
import LogicModules from "@/pages/LogicModules";
import QuantumServices from "@/pages/QuantumServices";
import QuantumMessages from "@/pages/QuantumMessages";
import Settings from "@/pages/Settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/missions" component={Missions} />
      <Route path="/glyph-repository" component={GlyphRepository} />
      <Route path="/cloak-trace-auth" component={CloakTraceAuth} />
      <Route path="/logic-modules" component={LogicModules} />
      <Route path="/quantum-services" component={QuantumServices} />
      <Route path="/quantum-messages" component={QuantumMessages} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection when app loads
    initializeWebSocket();

    // Initialize CloakTrace authentication
    const initAuth = async () => {
      try {
        setIsVerifying(true);
        // Initialize a new handshake
        await initiateCloakTraceHandshake();
        // Verify the authentication right away
        await verifyCloakTrace();
      } catch (error) {
        console.error("Error initializing CloakTrace:", error);
      } finally {
        setIsVerifying(false);
      }
    };

    initAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
