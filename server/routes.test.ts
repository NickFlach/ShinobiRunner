import { vi, describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from './routes';
import { storage } from './storage';

// Mock the storage module
vi.mock('./storage', () => ({
  storage: {
    listQuantumServices: vi.fn(),
    createUser: vi.fn(),
    listUsers: vi.fn(),
    createGlyph: vi.fn(),
    listGlyphs: vi.fn(),
    getGlyph: vi.fn(),
    createLogicModule: vi.fn(),
    listLogicModules: vi.fn(),
    createQuantumService: vi.fn(),
    createMission: vi.fn(),
    createMissionLogic: vi.fn(),
    listMissions: vi.fn(),
    listActiveMissions: vi.fn(),
    getMission: vi.fn(),
    updateMissionStatus: vi.fn(),
    updateMissionResult: vi.fn(),
    getLogicModulesForMission: vi.fn(),
    createQuantumMessage: vi.fn(),
    listQuantumMessages: vi.fn(),
    getQuantumMessageByMessageId: vi.fn(),
    updateQuantumMessageStatus: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
registerRoutes(app);

describe('API Routes', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  describe('User Routes', () => {
    it('POST /api/users - should create a user', async () => {
      const userData = { username: 'test', password: 'password', role: 'admin' };
      const newUser = { id: 1, ...userData };
      (storage.createUser as vi.Mock).mockResolvedValue(newUser);
      const res = await request(app).post('/api/users').send(userData);
      expect(res.status).toBe(201);
      expect(res.body).toEqual(newUser);
    });
    it('GET /api/users - should return all users', async () => {
      const users = [{ id: 1, username: 'test', password: 'password', role: 'admin' }];
      (storage.listUsers as vi.Mock).mockResolvedValue(users);
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(users);
    });
  });

  describe('Glyph Routes', () => {
    it('POST /api/glyphs - should create a glyph', async () => {
        const glyphData = { symbol: 'α', name: 'Alpha', description: 'The first' };
        (storage.createGlyph as vi.Mock).mockResolvedValue({ id: 1, ...glyphData });
        const res = await request(app).post('/api/glyphs').send(glyphData);
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ id: 1, ...glyphData });
    });
    it('GET /api/glyphs - should return all glyphs', async () => {
        const glyphs = [{ id: 1, symbol: 'α', name: 'Alpha', description: 'The first' }];
        (storage.listGlyphs as vi.Mock).mockResolvedValue(glyphs);
        const res = await request(app).get('/api/glyphs');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(glyphs);
    });
    it('GET /api/glyphs/:id - should return a single glyph', async () => {
        const glyph = { id: 1, symbol: 'α', name: 'Alpha', description: 'The first' };
        (storage.getGlyph as vi.Mock).mockResolvedValue(glyph);
        const res = await request(app).get('/api/glyphs/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(glyph);
    });
  });

  describe('Logic Module Routes', () => {
      it('POST /api/logic-modules - should create a logic module', async () => {
          const moduleData = { name: 'Test Module', description: 'A test module', type: 'core' };
          (storage.createLogicModule as vi.Mock).mockResolvedValue({ id: 1, ...moduleData });
          const res = await request(app).post('/api/logic-modules').send(moduleData);
          expect(res.status).toBe(201);
          expect(res.body).toEqual({ id: 1, ...moduleData });
      });
      it('GET /api/logic-modules - should return all logic modules', async () => {
          const modules = [{ id: 1, name: 'Test Module', description: 'A test module', type: 'core' }];
          (storage.listLogicModules as vi.Mock).mockResolvedValue(modules);
          const res = await request(app).get('/api/logic-modules');
          expect(res.status).toBe(200);
          expect(res.body).toEqual(modules);
      });
  });

  describe('Quantum Service Routes', () => {
      it('POST /api/quantum-services - should create a quantum service', async () => {
          const serviceData = { name: 'QS1', provider: 'TestProvider', endpoint: 'http://test.com' };
          const newService = { id: 1, ...serviceData, credentials: 'creds' };
          (storage.createQuantumService as vi.Mock).mockResolvedValue(newService);
          const res = await request(app).post('/api/quantum-services').send(serviceData);
          expect(res.status).toBe(201);
          // Credentials should not be returned
          expect(res.body).not.toHaveProperty('credentials');
          expect(res.body.name).toBe('QS1');
      });
      it('GET /api/quantum-services - should return all quantum services', async () => {
          const services = [{ id: 1, name: 'QS1', provider: 'TestProvider', endpoint: 'http://test.com', credentials: 'creds' }];
          (storage.listQuantumServices as vi.Mock).mockResolvedValue(services);
          const res = await request(app).get('/api/quantum-services');
          expect(res.status).toBe(200);
          expect(res.body[0]).not.toHaveProperty('credentials');
      });
  });

  describe('Mission Routes', () => {
    it('POST /api/missions - should create a new mission', async () => {
      const missionData = {
        name: 'Test Mission',
        glyphId: 1,
        target: 'Test Target',
        userId: 1,
        serviceId: 1,
        config: { details: 'some config' },
      };
      const newMission = {
        id: 1,
        missionId: 'test-mission-123',
        ...missionData,
        status: 'pending',
        progress: 0,
      };

      (storage.createMission as vi.Mock).mockResolvedValue(newMission);

      const res = await request(app)
        .post('/api/missions')
        .send(missionData);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(newMission);
      expect(storage.createMission).toHaveBeenCalledWith(missionData);
    });

    it('GET /api/missions - should return all missions', async () => {
        const missions = [{ id: 1, name: 'Test Mission' }];
        (storage.listMissions as vi.Mock).mockResolvedValue(missions);
        const res = await request(app).get('/api/missions');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(missions);
    });

    it('GET /api/missions/active - should return active missions', async () => {
        const missions = [{ id: 1, name: 'Active Mission', status: 'active' }];
        (storage.listActiveMissions as vi.Mock).mockResolvedValue(missions);
        const res = await request(app).get('/api/missions/active');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(missions);
    });

    it('GET /api/missions/:id - should return a single mission with logic modules', async () => {
        const mission = { id: 1, name: 'Detailed Mission' };
        const logicModules = [{ id: 1, name: 'Logic Module' }];
        (storage.getMission as vi.Mock).mockResolvedValue(mission);
        (storage.getLogicModulesForMission as vi.Mock).mockResolvedValue(logicModules);
        const res = await request(app).get('/api/missions/1');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ...mission, logicModules });
    });

    it('POST /api/missions/:id/pause - should pause a mission', async () => {
      const mission = { id: 1, status: 'active', progress: 50 };
      const pausedMission = { ...mission, status: 'paused' };

      (storage.getMission as vi.Mock).mockResolvedValue(mission);
      (storage.updateMissionStatus as vi.Mock).mockResolvedValue(pausedMission);

      const res = await request(app).post('/api/missions/1/pause');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(pausedMission);
      expect(storage.updateMissionStatus).toHaveBeenCalledWith(1, 'paused', 50);
    });

    it('POST /api/missions/:id/resume - should resume a mission', async () => {
      const mission = { id: 1, status: 'paused', progress: 50 };
      const resumedMission = { ...mission, status: 'active' };

      (storage.getMission as vi.Mock).mockResolvedValue(mission);
      (storage.updateMissionStatus as vi.Mock).mockResolvedValue(resumedMission);

      const res = await request(app).post('/api/missions/1/resume');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(resumedMission);
      expect(storage.updateMissionStatus).toHaveBeenCalledWith(1, 'active', 50);
    });

    it('POST /api/missions/:id/abort - should abort a mission', async () => {
      const mission = { id: 1, status: 'active', progress: 50 };
      const abortedMission = { ...mission, status: 'aborted' };

      (storage.getMission as vi.Mock).mockResolvedValue(mission);
      (storage.updateMissionStatus as vi.Mock).mockResolvedValue(abortedMission);

      const res = await request(app).post('/api/missions/1/abort');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(abortedMission);
      expect(storage.updateMissionStatus).toHaveBeenCalledWith(1, 'aborted', 50);
    });
  });

  describe('Quantum Message Routes', () => {
    it('POST /api/quantum-messages - should create a quantum message', async () => {
        const messageData = { messageId: 'qm-1', userId: 1, recipient: 'test', recipientEndpoint: 'http://test.com', subject: 'Hello', content: 'World', quantumKey: 'key', encryptionHash: 'hash' };
        (storage.createQuantumMessage as vi.Mock).mockResolvedValue({ id: 1, ...messageData });
        const res = await request(app).post('/api/quantum-messages').send(messageData);
        expect(res.status).toBe(201);
        expect(res.body).toEqual({ id: 1, ...messageData });
    });
    it('GET /api/quantum-messages - should return all quantum messages', async () => {
        const messages = [{ id: 1, subject: 'Hello' }];
        (storage.listQuantumMessages as vi.Mock).mockResolvedValue(messages);
        const res = await request(app).get('/api/quantum-messages');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(messages);
    });
    it('GET /api/quantum-messages/:messageId/status - should return message status', async () => {
        const message = { transmissionStatus: 'delivered', transmittedAt: new Date().toISOString() };
        (storage.getQuantumMessageByMessageId as vi.Mock).mockResolvedValue(message);
        const res = await request(app).get('/api/quantum-messages/qm-1/status');
        expect(res.status).toBe(200);
        expect(res.body).toEqual(message);
    });
    it('PATCH /api/quantum-messages/:id/status - should update message status', async () => {
        const updatedMessage = { id: 1, status: 'delivered' };
        (storage.updateQuantumMessageStatus as vi.Mock).mockResolvedValue(updatedMessage);
        const res = await request(app).patch('/api/quantum-messages/1/status').send({ status: 'delivered' });
        expect(res.status).toBe(200);
        expect(res.body).toEqual(updatedMessage);
    });
  });
});
