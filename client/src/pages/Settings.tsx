import React, { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { QuantumCard } from "@/components/ui/quantum-card";
import { verifyCloakTrace, clearAuthToken } from "@/lib/cloakTraceAuth";
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Monitor, 
  Database, 
  Cloud, 
  LogOut,
  RefreshCw
} from "lucide-react";

const Settings: React.FC = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  // User settings
  const [username, setUsername] = useState("quantum_supervisor");
  
  // Security settings
  const [authTimeout, setAuthTimeout] = useState(60);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);
  
  // Notification settings
  const [missionNotifications, setMissionNotifications] = useState(true);
  const [securityNotifications, setSecurityNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);
  
  // Display settings
  const [darkMode, setDarkMode] = useState(true);
  const [telemetryRefreshRate, setTelemetryRefreshRate] = useState(5);
  
  // System settings
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [debugModeEnabled, setDebugModeEnabled] = useState(false);
  const [loggingLevel, setLoggingLevel] = useState(2);
  
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear authentication token
      clearAuthToken();
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
        variant: "default",
      });
      
      // In a real app, we would redirect to login page
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const handleVerifyCloakTrace = async () => {
    try {
      const result = await verifyCloakTrace();
      
      if (result.authenticated) {
        toast({
          title: "Authentication Verified",
          description: "CloakTrace authentication is active and secure",
          variant: "success",
        });
      } else {
        toast({
          title: "Authentication Failed",
          description: "CloakTrace authentication verification failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify CloakTrace authentication",
        variant: "destructive",
      });
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
              <h2 className="text-2xl font-semibold mb-1">Settings</h2>
              <p className="text-gray-400">Configure your Shinobi.Runner system preferences</p>
            </div>

            <Tabs defaultValue="user" className="space-y-4">
              <TabsList className="bg-[#1e1e1e]">
                <TabsTrigger value="user" className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  User
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-1">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="display" className="flex items-center gap-1">
                  <Monitor className="h-4 w-4" />
                  Display
                </TabsTrigger>
                <TabsTrigger value="system" className="flex items-center gap-1">
                  <SettingsIcon className="h-4 w-4" />
                  System
                </TabsTrigger>
              </TabsList>

              <TabsContent value="user">
                <QuantumCard>
                  <h3 className="text-lg font-semibold mb-4">User Settings</h3>
                  
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-[#0a0a0a] border-[#333333]"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value="●●●●●●●●●●●●"
                        disabled
                        className="bg-[#0a0a0a] border-[#333333]"
                      />
                      <Button variant="outline" size="sm" className="w-fit mt-1">
                        Change Password
                      </Button>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value="Quantum Supervisor"
                        disabled
                        className="bg-[#0a0a0a] border-[#333333]"
                      />
                    </div>
                  </div>
                </QuantumCard>
              </TabsContent>

              <TabsContent value="security">
                <QuantumCard>
                  <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-400">Require quantum authentication for login</p>
                      </div>
                      <Switch
                        checked={twoFactorEnabled}
                        onCheckedChange={setTwoFactorEnabled}
                      />
                    </div>
                    
                    <div className="grid gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Authentication Timeout</h4>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[authTimeout]}
                            onValueChange={(value) => setAuthTimeout(value[0])}
                            max={120}
                            step={5}
                            className="flex-1"
                          />
                          <span className="text-sm w-16">{authTimeout} min</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Auto-Lock</h4>
                        <p className="text-sm text-gray-400">Lock system after inactivity period</p>
                      </div>
                      <Switch
                        checked={autoLockEnabled}
                        onCheckedChange={setAutoLockEnabled}
                      />
                    </div>
                    
                    <div className="bg-[#0a0a0a] p-4 rounded-md border border-[#333333]">
                      <h4 className="font-medium mb-2">CloakTrace Authentication</h4>
                      <p className="text-sm text-gray-400 mb-3">
                        Quantum-secured authentication system for mission execution
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleVerifyCloakTrace}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Verify Authentication
                        </Button>
                        <Button variant="outline">
                          Manage Keys
                        </Button>
                      </div>
                    </div>
                  </div>
                </QuantumCard>
              </TabsContent>

              <TabsContent value="notifications">
                <QuantumCard>
                  <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Mission Notifications</h4>
                        <p className="text-sm text-gray-400">Updates about mission status changes</p>
                      </div>
                      <Switch
                        checked={missionNotifications}
                        onCheckedChange={setMissionNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Security Alerts</h4>
                        <p className="text-sm text-gray-400">Important security-related notifications</p>
                      </div>
                      <Switch
                        checked={securityNotifications}
                        onCheckedChange={setSecurityNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">System Updates</h4>
                        <p className="text-sm text-gray-400">Notifications about system changes and updates</p>
                      </div>
                      <Switch
                        checked={systemNotifications}
                        onCheckedChange={setSystemNotifications}
                      />
                    </div>
                  </div>
                </QuantumCard>
              </TabsContent>

              <TabsContent value="display">
                <QuantumCard>
                  <h3 className="text-lg font-semibold mb-4">Display Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Dark Mode</h4>
                        <p className="text-sm text-gray-400">Use dark theme for UI elements</p>
                      </div>
                      <Switch
                        checked={darkMode}
                        onCheckedChange={setDarkMode}
                      />
                    </div>
                    
                    <div className="grid gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Telemetry Refresh Rate</h4>
                        <p className="text-sm text-gray-400 mb-2">
                          How often mission data is updated (seconds)
                        </p>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[telemetryRefreshRate]}
                            onValueChange={(value) => setTelemetryRefreshRate(value[0])}
                            min={1}
                            max={30}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm w-16">{telemetryRefreshRate}s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </QuantumCard>
              </TabsContent>

              <TabsContent value="system">
                <QuantumCard>
                  <h3 className="text-lg font-semibold mb-4">System Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Auto-Updates</h4>
                        <p className="text-sm text-gray-400">Automatically install system updates</p>
                      </div>
                      <Switch
                        checked={autoUpdateEnabled}
                        onCheckedChange={setAutoUpdateEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Debug Mode</h4>
                        <p className="text-sm text-gray-400">Enable detailed debug information</p>
                      </div>
                      <Switch
                        checked={debugModeEnabled}
                        onCheckedChange={setDebugModeEnabled}
                      />
                    </div>
                    
                    <div className="grid gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Logging Level</h4>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[loggingLevel]}
                            onValueChange={(value) => setLoggingLevel(value[0])}
                            min={0}
                            max={4}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm w-16">
                            {loggingLevel === 0 ? "None" :
                             loggingLevel === 1 ? "Error" :
                             loggingLevel === 2 ? "Warning" :
                             loggingLevel === 3 ? "Info" : "Debug"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#0a0a0a] p-4 rounded-md border border-[#333333] flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">System Version</h4>
                        <p className="text-sm text-gray-400">v0.9.3-alpha</p>
                      </div>
                      <Button variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Check for Updates
                      </Button>
                    </div>
                  </div>
                </QuantumCard>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-between">
              <Button 
                variant="destructive"
                className="flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline">
                  Reset to Defaults
                </Button>
                <Button 
                  className="bg-gradient-to-r from-[#6a11cb] to-[#2575fc]"
                  onClick={handleSaveSettings}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
