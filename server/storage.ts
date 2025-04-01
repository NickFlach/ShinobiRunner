import { 
  users, type User, type InsertUser,
  glyphs, type Glyph, type InsertGlyph,
  logicModules, type LogicModule, type InsertLogicModule,
  quantumServices, type QuantumService, type InsertQuantumService,
  missions, type Mission, type InsertMission,
  missionLogics, type MissionLogic, type InsertMissionLogic,
  authTokens, type AuthToken, type InsertAuthToken
} from "@shared/schema";
import { nanoid } from "nanoid";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;

  // Glyph operations
  getGlyph(id: number): Promise<Glyph | undefined>;
  getGlyphByName(name: string): Promise<Glyph | undefined>;
  createGlyph(glyph: InsertGlyph): Promise<Glyph>;
  listGlyphs(): Promise<Glyph[]>;

  // Logic module operations
  getLogicModule(id: number): Promise<LogicModule | undefined>;
  getLogicModuleByName(name: string): Promise<LogicModule | undefined>;
  createLogicModule(module: InsertLogicModule): Promise<LogicModule>;
  listLogicModules(): Promise<LogicModule[]>;

  // Quantum service operations
  getQuantumService(id: number): Promise<QuantumService | undefined>;
  getQuantumServiceByName(name: string): Promise<QuantumService | undefined>;
  createQuantumService(service: InsertQuantumService): Promise<QuantumService>;
  listQuantumServices(): Promise<QuantumService[]>;

  // Mission operations
  getMission(id: number): Promise<Mission | undefined>;
  getMissionByMissionId(missionId: string): Promise<Mission | undefined>;
  createMission(mission: InsertMission): Promise<Mission>;
  updateMissionStatus(id: number, status: string, progress: number): Promise<Mission | undefined>;
  updateMissionResult(id: number, result: any): Promise<Mission | undefined>;
  listMissions(): Promise<Mission[]>;
  listActiveMissions(): Promise<Mission[]>;

  // Mission Logic operations
  createMissionLogic(missionLogic: InsertMissionLogic): Promise<MissionLogic>;
  getLogicModulesForMission(missionId: number): Promise<LogicModule[]>;

  // Authentication operations
  createAuthToken(authToken: InsertAuthToken): Promise<AuthToken>;
  getAuthToken(token: string): Promise<AuthToken | undefined>;
  invalidateAuthToken(token: string): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private glyphs: Map<number, Glyph>;
  private logicModules: Map<number, LogicModule>;
  private quantumServices: Map<number, QuantumService>;
  private missions: Map<number, Mission>;
  private missionLogics: Map<number, MissionLogic>;
  private authTokens: Map<number, AuthToken>;
  
  // Counters for auto-incrementing IDs
  private userIdCounter: number;
  private glyphIdCounter: number;
  private logicModuleIdCounter: number;
  private serviceIdCounter: number;
  private missionIdCounter: number;
  private missionLogicIdCounter: number;
  private authTokenIdCounter: number;

  constructor() {
    this.users = new Map();
    this.glyphs = new Map();
    this.logicModules = new Map();
    this.quantumServices = new Map();
    this.missions = new Map();
    this.missionLogics = new Map();
    this.authTokens = new Map();
    
    this.userIdCounter = 1;
    this.glyphIdCounter = 1;
    this.logicModuleIdCounter = 1;
    this.serviceIdCounter = 1;
    this.missionIdCounter = 1;
    this.missionLogicIdCounter = 1;
    this.authTokenIdCounter = 1;
    
    // Initialize with default data
    this.seedDefaultData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Glyph methods
  async getGlyph(id: number): Promise<Glyph | undefined> {
    return this.glyphs.get(id);
  }

  async getGlyphByName(name: string): Promise<Glyph | undefined> {
    return Array.from(this.glyphs.values()).find(
      (glyph) => glyph.name === name,
    );
  }

  async createGlyph(insertGlyph: InsertGlyph): Promise<Glyph> {
    const id = this.glyphIdCounter++;
    const now = new Date();
    const glyph: Glyph = { ...insertGlyph, id, createdAt: now };
    this.glyphs.set(id, glyph);
    return glyph;
  }

  async listGlyphs(): Promise<Glyph[]> {
    return Array.from(this.glyphs.values());
  }

  // Logic module methods
  async getLogicModule(id: number): Promise<LogicModule | undefined> {
    return this.logicModules.get(id);
  }

  async getLogicModuleByName(name: string): Promise<LogicModule | undefined> {
    return Array.from(this.logicModules.values()).find(
      (module) => module.name === name,
    );
  }

  async createLogicModule(insertModule: InsertLogicModule): Promise<LogicModule> {
    const id = this.logicModuleIdCounter++;
    const now = new Date();
    const module: LogicModule = { ...insertModule, id, createdAt: now };
    this.logicModules.set(id, module);
    return module;
  }

  async listLogicModules(): Promise<LogicModule[]> {
    return Array.from(this.logicModules.values());
  }

  // Quantum service methods
  async getQuantumService(id: number): Promise<QuantumService | undefined> {
    return this.quantumServices.get(id);
  }

  async getQuantumServiceByName(name: string): Promise<QuantumService | undefined> {
    return Array.from(this.quantumServices.values()).find(
      (service) => service.name === name,
    );
  }

  async createQuantumService(insertService: InsertQuantumService): Promise<QuantumService> {
    const id = this.serviceIdCounter++;
    const now = new Date();
    const service: QuantumService = { ...insertService, id, createdAt: now };
    this.quantumServices.set(id, service);
    return service;
  }

  async listQuantumServices(): Promise<QuantumService[]> {
    return Array.from(this.quantumServices.values());
  }

  // Mission methods
  async getMission(id: number): Promise<Mission | undefined> {
    return this.missions.get(id);
  }

  async getMissionByMissionId(missionId: string): Promise<Mission | undefined> {
    return Array.from(this.missions.values()).find(
      (mission) => mission.missionId === missionId,
    );
  }

  async createMission(insertMission: InsertMission): Promise<Mission> {
    const id = this.missionIdCounter++;
    const now = new Date();
    const missionId = `SHIN-${nanoid(5).toUpperCase()}`;
    
    const mission: Mission = { 
      ...insertMission, 
      id,
      missionId,
      status: 'pending',
      progress: 0,
      result: null,
      createdAt: now,
      updatedAt: now
    };
    
    this.missions.set(id, mission);
    return mission;
  }

  async updateMissionStatus(id: number, status: string, progress: number): Promise<Mission | undefined> {
    const mission = this.missions.get(id);
    if (!mission) return undefined;
    
    const updatedMission = {
      ...mission,
      status,
      progress,
      updatedAt: new Date()
    };
    
    this.missions.set(id, updatedMission);
    return updatedMission;
  }

  async updateMissionResult(id: number, result: any): Promise<Mission | undefined> {
    const mission = this.missions.get(id);
    if (!mission) return undefined;
    
    const updatedMission = {
      ...mission,
      result,
      updatedAt: new Date()
    };
    
    this.missions.set(id, updatedMission);
    return updatedMission;
  }

  async listMissions(): Promise<Mission[]> {
    return Array.from(this.missions.values());
  }

  async listActiveMissions(): Promise<Mission[]> {
    return Array.from(this.missions.values()).filter(
      (mission) => ['pending', 'active', 'processing'].includes(mission.status)
    );
  }

  // Mission Logic methods
  async createMissionLogic(insertMissionLogic: InsertMissionLogic): Promise<MissionLogic> {
    const id = this.missionLogicIdCounter++;
    const missionLogic: MissionLogic = { ...insertMissionLogic, id };
    this.missionLogics.set(id, missionLogic);
    return missionLogic;
  }

  async getLogicModulesForMission(missionId: number): Promise<LogicModule[]> {
    const missionLogicEntries = Array.from(this.missionLogics.values()).filter(
      ml => ml.missionId === missionId
    );
    
    const logicModules: LogicModule[] = [];
    for (const entry of missionLogicEntries) {
      const module = await this.getLogicModule(entry.logicId);
      if (module) logicModules.push(module);
    }
    
    return logicModules;
  }

  // Authentication methods
  async createAuthToken(insertAuthToken: InsertAuthToken): Promise<AuthToken> {
    const id = this.authTokenIdCounter++;
    const now = new Date();
    const authToken: AuthToken = { ...insertAuthToken, id, createdAt: now };
    this.authTokens.set(id, authToken);
    return authToken;
  }

  async getAuthToken(token: string): Promise<AuthToken | undefined> {
    return Array.from(this.authTokens.values()).find(
      (authToken) => authToken.token === token,
    );
  }

  async invalidateAuthToken(token: string): Promise<void> {
    const authToken = await this.getAuthToken(token);
    if (authToken) {
      this.authTokens.delete(authToken.id);
    }
  }

  // Seed with initial data
  private seedDefaultData(): void {
    // Add default admin user
    this.createUser({
      username: "quantum_supervisor",
      password: "secured_password", // In production, this would be hashed
      role: "admin"
    });

    // Add default glyphs
    this.createGlyph({
      symbol: "🜁",
      name: "EntropicRecovery",
      description: "Repairs quantum state entropy in damaged qubits",
      code: null
    });

    this.createGlyph({
      symbol: "🜆",
      name: "QuantumSignal",
      description: "Optimizes quantum signal transmission paths",
      code: null
    });

    this.createGlyph({
      symbol: "🜇",
      name: "EthicsEnforcer",
      description: "Enforces ethical constraints on quantum operations",
      code: null
    });

    // Add default logic modules
    this.createLogicModule({
      name: "EntropyMapper",
      description: "Maps entropy patterns in quantum systems",
      type: "analysis",
      status: "active"
    });

    this.createLogicModule({
      name: "EthicsEnforcer",
      description: "Enforces ethical guidelines for quantum operations",
      type: "governance",
      status: "active"
    });

    this.createLogicModule({
      name: "QuantumKernel",
      description: "Core quantum execution environment",
      type: "execution",
      status: "active"
    });

    this.createLogicModule({
      name: "ZKValidator",
      description: "Zero-knowledge proof validator for quantum states",
      type: "security",
      status: "inactive"
    });

    // Add default quantum services
    this.createQuantumService({
      name: "IBM Q",
      provider: "IBM",
      endpoint: "https://api.quantum-computing.ibm.com/",
      status: "active",
      credentials: null
    });

    this.createQuantumService({
      name: "Amazon Braket",
      provider: "AWS",
      endpoint: "https://braket.aws.amazon.com/",
      status: "active",
      credentials: null
    });

    this.createQuantumService({
      name: "Qiskit Runtime",
      provider: "IBM",
      endpoint: "https://runtime.quantum-computing.ibm.com/",
      status: "active",
      credentials: null
    });

    this.createQuantumService({
      name: "Local Simulator",
      provider: "Local",
      endpoint: "local://simulator",
      status: "active",
      credentials: null
    });

    // Add sample mission
    this.createMission({
      name: "Entropy Repair Operation",
      glyphId: 1,
      target: "/subspace/entropy-repair",
      userId: 1,
      serviceId: 1,
      config: {
        securityLevel: 3,
        priority: "high"
      }
    }).then(mission => {
      // Update mission to be active with progress
      this.updateMissionStatus(mission.id, "active", 75);
      
      // Add logic modules to mission
      this.createMissionLogic({
        missionId: mission.id,
        logicId: 1 // EntropyMapper
      });
      
      this.createMissionLogic({
        missionId: mission.id,
        logicId: 2 // EthicsEnforcer
      });
    });

    // Add another sample mission
    this.createMission({
      name: "Quantum Signal Optimization",
      glyphId: 2,
      target: "/braket/task-processor",
      userId: 1,
      serviceId: 2,
      config: {
        securityLevel: 2,
        priority: "medium"
      }
    }).then(mission => {
      // Update mission to be processing
      this.updateMissionStatus(mission.id, "processing", 45);
      
      // Add logic modules to mission
      this.createMissionLogic({
        missionId: mission.id,
        logicId: 3 // QuantumKernel
      });
    });

    // Add a third sample mission
    this.createMission({
      name: "Ethics Validation Run",
      glyphId: 3,
      target: "/quantum/ethics-validation",
      userId: 1,
      serviceId: 3,
      config: {
        securityLevel: 3,
        priority: "high"
      }
    }).then(mission => {
      // Update mission to be pending authorization
      this.updateMissionStatus(mission.id, "pending", 20);
      
      // Add logic modules to mission
      this.createMissionLogic({
        missionId: mission.id,
        logicId: 2 // EthicsEnforcer
      });
    });
  }
}

export const storage = new MemStorage();
