import { storage } from "./storage";
import { WebSocket, WebSocketServer } from "ws";
import type { Server } from "http";

let wss: WebSocketServer;
const clients = new Map<string, WebSocket>();

// Initializes the WebSocket server and sets up connection handling
export function initWebSocketServer(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(2, 10);
    clients.set(clientId, ws);

    console.log(`WebSocket client connected: ${clientId}`);

    ws.send(JSON.stringify({
      type: 'systemStatus',
      data: { status: 'online' }
    }));

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received message from client ${clientId}:`, data);

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
}

// Broadcasts a message to all connected clients
export const broadcastMessage = (type: string, data: any) => {
  if (!wss) return;

  const message = JSON.stringify({ type, data });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// Extracted logic for a single step of mission processing for testability
export async function performMissionStep(missionId: number, broadcaster = broadcastMessage): Promise<{ shouldContinue: boolean }> {
    const mission = await storage.getMission(missionId);

    if (!mission || !['active', 'processing'].includes(mission.status)) {
        return { shouldContinue: false };
    }

    const currentProgress = mission.progress + Math.floor(Math.random() * 5) + 1;

    if (currentProgress >= 100) {
        const completedMission = await storage.updateMissionStatus(missionId, 'completed', 100);
        const result = {
            completionTime: new Date().toISOString(),
            status: 'success',
            measurements: {
                entanglement: Math.random().toFixed(4),
                coherence: Math.random().toFixed(4),
                fidelity: Math.random().toFixed(4),
            },
        };
        await storage.updateMissionResult(missionId, result);
        if (completedMission) {
            broadcaster('missionUpdated', { ...completedMission, result });
        }
        return { shouldContinue: false };
    } else {
        const updatedMission = await storage.updateMissionStatus(missionId, 'processing', currentProgress);
        if (updatedMission) {
            broadcaster('missionUpdated', updatedMission);
        }
        return { shouldContinue: true };
    }
}


// Main function to start and manage mission processing
export async function processMission(missionId: number, stepFunction = performMissionStep, broadcaster = broadcastMessage): Promise<void> {
  const mission = await storage.getMission(missionId);
  if (!mission || mission.status !== 'active') return;

  await storage.updateMissionStatus(missionId, 'processing', mission.progress);
  broadcaster('missionUpdated', { ...mission, status: 'processing' });

  const processInterval = setInterval(async () => {
    const { shouldContinue } = await stepFunction(missionId);
    if (!shouldContinue) {
      clearInterval(processInterval);
    }
  }, 3000);
}