import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertGlyphSchema, 
  insertLogicModuleSchema,
  insertQuantumServiceSchema,
  insertMissionSchema,
  insertMissionLogicSchema,
  insertQuantumMessageSchema
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Declare WebSocket server for managing connections
let wss: WebSocketServer;
const clients = new Map<string, WebSocket>();

// Broadcasts a message to all connected clients
const broadcastMessage = (type: string, data: any) => {
  const message = JSON.stringify({ type, data });
  
  clients.forEach((client, id) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup WebSocket server
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(2, 10);
    clients.set(clientId, ws);
    
    console.log(`WebSocket client connected: ${clientId}`);
    
    // Send initial system status
    ws.send(JSON.stringify({
      type: 'systemStatus',
      data: { status: 'online' }
    }));
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received message from client ${clientId}:`, data);
        
        // Handle client messages
        if (data.type === 'requestMissionsUpdate') {
          const missions = await storage.listMissions();
          ws.send(JSON.stringify({
            type: 'missionsUpdate',
            data: missions
          }));
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
    
    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`WebSocket client disconnected: ${clientId}`);
    });
  });

  // API routes
  app.get('/api/system-status', async (_req: Request, res: Response) => {
    const services = await storage.listQuantumServices();
    const activeServices = services.filter(s => s.status === 'active').length;
    
    res.json({
      status: 'online',
      connectedBackends: activeServices,
      lastVerification: new Date().toISOString()
    });
  });

  // User routes
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: 'Failed to create user' });
      }
    }
  });

  app.get('/api/users', async (_req: Request, res: Response) => {
    const users = await storage.listUsers();
    res.json(users);
  });

  // Glyph routes
  app.post('/api/glyphs', async (req: Request, res: Response) => {
    try {
      const glyphData = insertGlyphSchema.parse(req.body);
      const newGlyph = await storage.createGlyph(glyphData);
      res.status(201).json(newGlyph);
      
      // Broadcast new glyph to clients
      broadcastMessage('glyphCreated', newGlyph);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: 'Failed to create glyph' });
      }
    }
  });

  app.get('/api/glyphs', async (_req: Request, res: Response) => {
    const glyphs = await storage.listGlyphs();
    res.json(glyphs);
  });

  app.get('/api/glyphs/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid glyph ID' });
    }
    
    const glyph = await storage.getGlyph(id);
    if (!glyph) {
      return res.status(404).json({ error: 'Glyph not found' });
    }
    
    res.json(glyph);
  });

  // Logic Module routes
  app.post('/api/logic-modules', async (req: Request, res: Response) => {
    try {
      const moduleData = insertLogicModuleSchema.parse(req.body);
      const newModule = await storage.createLogicModule(moduleData);
      res.status(201).json(newModule);
      
      // Broadcast new logic module to clients
      broadcastMessage('logicModuleCreated', newModule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: 'Failed to create logic module' });
      }
    }
  });

  app.get('/api/logic-modules', async (_req: Request, res: Response) => {
    const modules = await storage.listLogicModules();
    res.json(modules);
  });

  // Quantum Service routes
  app.post('/api/quantum-services', async (req: Request, res: Response) => {
    try {
      const serviceData = insertQuantumServiceSchema.parse(req.body);
      const newService = await storage.createQuantumService(serviceData);
      
      // Don't return credentials in response
      const { credentials, ...safeService } = newService;
      
      res.status(201).json(safeService);
      
      // Broadcast new service to clients
      broadcastMessage('quantumServiceCreated', safeService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: 'Failed to create quantum service' });
      }
    }
  });

  app.get('/api/quantum-services', async (_req: Request, res: Response) => {
    const services = await storage.listQuantumServices();
    
    // Don't expose credentials in response
    const safeServices = services.map(({ credentials, ...service }) => service);
    
    res.json(safeServices);
  });

  // Mission routes
  app.post('/api/missions', async (req: Request, res: Response) => {
    try {
      const missionData = insertMissionSchema.parse(req.body);
      const newMission = await storage.createMission(missionData);
      
      // Add logic modules to mission if provided
      if (req.body.logicModuleIds && Array.isArray(req.body.logicModuleIds)) {
        for (const logicId of req.body.logicModuleIds) {
          await storage.createMissionLogic({
            missionId: newMission.id,
            logicId
          });
        }
      }
      
      res.status(201).json(newMission);
      
      // Start mission processing
      processMission(newMission.id);
      
      // Broadcast new mission to clients
      broadcastMessage('missionCreated', newMission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: 'Failed to create mission' });
      }
    }
  });

  app.get('/api/missions', async (_req: Request, res: Response) => {
    const missions = await storage.listMissions();
    res.json(missions);
  });

  app.get('/api/missions/active', async (_req: Request, res: Response) => {
    const missions = await storage.listActiveMissions();
    res.json(missions);
  });

  app.get('/api/missions/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid mission ID' });
    }
    
    const mission = await storage.getMission(id);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    
    // Get associated logic modules
    const logicModules = await storage.getLogicModulesForMission(mission.id);
    
    res.json({
      ...mission,
      logicModules
    });
  });

  app.post('/api/missions/:id/pause', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid mission ID' });
    }
    
    const mission = await storage.getMission(id);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    
    const updatedMission = await storage.updateMissionStatus(id, 'paused', mission.progress);
    
    if (updatedMission) {
      // Broadcast mission update to clients
      broadcastMessage('missionUpdated', updatedMission);
      res.json(updatedMission);
    } else {
      res.status(500).json({ error: 'Failed to pause mission' });
    }
  });

  app.post('/api/missions/:id/resume', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid mission ID' });
    }
    
    const mission = await storage.getMission(id);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    
    const updatedMission = await storage.updateMissionStatus(id, 'active', mission.progress);
    
    if (updatedMission) {
      // Resume mission processing
      processMission(id);
      
      // Broadcast mission update to clients
      broadcastMessage('missionUpdated', updatedMission);
      res.json(updatedMission);
    } else {
      res.status(500).json({ error: 'Failed to resume mission' });
    }
  });

  app.post('/api/missions/:id/abort', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid mission ID' });
    }
    
    const mission = await storage.getMission(id);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    
    const updatedMission = await storage.updateMissionStatus(id, 'aborted', mission.progress);
    
    if (updatedMission) {
      // Broadcast mission update to clients
      broadcastMessage('missionUpdated', updatedMission);
      res.json(updatedMission);
    } else {
      res.status(500).json({ error: 'Failed to abort mission' });
    }
  });

  app.post('/api/missions/:id/authorize', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid mission ID' });
    }
    
    const mission = await storage.getMission(id);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    
    const updatedMission = await storage.updateMissionStatus(id, 'active', mission.progress);
    
    if (updatedMission) {
      // Start mission processing
      processMission(id);
      
      // Broadcast mission update to clients
      broadcastMessage('missionUpdated', updatedMission);
      res.json(updatedMission);
    } else {
      res.status(500).json({ error: 'Failed to authorize mission' });
    }
  });

  // Quantum Message routes
  app.post('/api/quantum-messages', async (req: Request, res: Response) => {
    try {
      const messageData = insertQuantumMessageSchema.parse(req.body);
      const newMessage = await storage.createQuantumMessage(messageData);
      res.status(201).json(newMessage);
      
      // Broadcast new quantum message to clients
      broadcastMessage('quantumMessageCreated', newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: fromZodError(error).message });
      } else {
        res.status(500).json({ error: 'Failed to create quantum message' });
      }
    }
  });

  app.get('/api/quantum-messages', async (_req: Request, res: Response) => {
    const messages = await storage.listQuantumMessages();
    res.json(messages);
  });

  app.get('/api/quantum-messages/:messageId/status', async (req: Request, res: Response) => {
    const messageId = req.params.messageId;
    
    const message = await storage.getQuantumMessageByMessageId(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Quantum message not found' });
    }
    
    res.json({
      transmissionStatus: message.transmissionStatus,
      transmittedAt: message.transmittedAt
    });
  });

  // CloakTrace authentication route
  app.post('/api/cloak-trace/verify', (_req: Request, res: Response) => {
    // Simulate quantum authentication verification
    const isAuthenticated = true;
    const verificationTime = new Date().toISOString();
    
    res.json({
      authenticated: isAuthenticated,
      verificationTime,
      handshakeIntegrity: 100,
      quantumAuthentication: 100
    });
  });

  return httpServer;
}

// Function to process missions
async function processMission(missionId: number): Promise<void> {
  const mission = await storage.getMission(missionId);
  if (!mission || mission.status !== 'active') return;

  // Update to processing status
  await storage.updateMissionStatus(missionId, 'processing', mission.progress);
  
  // Simulate mission progress updates
  let currentProgress = mission.progress;
  
  const processInterval = setInterval(async () => {
    const updatedMission = await storage.getMission(missionId);
    
    // Stop if mission no longer active
    if (!updatedMission || !['active', 'processing'].includes(updatedMission.status)) {
      clearInterval(processInterval);
      return;
    }
    
    // Increment progress
    currentProgress += Math.floor(Math.random() * 5) + 1;
    
    if (currentProgress >= 100) {
      currentProgress = 100;
      clearInterval(processInterval);
      
      // Complete the mission
      const completedMission = await storage.updateMissionStatus(missionId, 'completed', 100);
      const result = {
        completionTime: new Date().toISOString(),
        status: 'success',
        measurements: {
          entanglement: Math.random().toFixed(4),
          coherence: Math.random().toFixed(4),
          fidelity: Math.random().toFixed(4)
        }
      };
      
      await storage.updateMissionResult(missionId, result);
      
      if (completedMission) {
        // Broadcast mission completed to clients
        broadcastMessage('missionUpdated', {
          ...completedMission,
          result
        });
      }
    } else {
      // Update mission progress
      const updatedMission = await storage.updateMissionStatus(missionId, 'processing', currentProgress);
      
      if (updatedMission) {
        // Broadcast mission update to clients
        broadcastMessage('missionUpdated', updatedMission);
      }
    }
  }, 3000); // Update every 3 seconds
}
