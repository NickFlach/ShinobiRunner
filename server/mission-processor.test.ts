import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { storage } from './storage';
import { performMissionStep, processMission } from './mission-processor';

// Mock the entire storage module
vi.mock('./storage', () => ({
  storage: {
    getMission: vi.fn(),
    updateMissionStatus: vi.fn(),
    updateMissionResult: vi.fn(),
  },
}));

describe('performMissionStep', () => {
  let mockBroadcaster: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks before each test to ensure isolation
    vi.resetAllMocks();
    // Create a fresh mock for each test
    mockBroadcaster = vi.fn();
    // Mock Math.random for predictable progress
    vi.spyOn(global.Math, 'random').mockReturnValue(0.8); // Guarantees progress increment is 5
  });

  afterEach(() => {
    // Restore original implementations
    vi.restoreAllMocks();
  });

  it('should stop if mission is not found or not active', async () => {
    (storage.getMission as vi.Mock).mockResolvedValueOnce(null);
    let result = await performMissionStep(1, mockBroadcaster);
    expect(result.shouldContinue).toBe(false);

    (storage.getMission as vi.Mock).mockResolvedValueOnce({ status: 'paused' });
    result = await performMissionStep(1, mockBroadcaster);
    expect(result.shouldContinue).toBe(false);
    expect(mockBroadcaster).not.toHaveBeenCalled();
  });

  it('should update progress and continue', async () => {
    const mission = { id: 1, status: 'processing', progress: 50 };
    const updatedMission = { ...mission, progress: 55 };
    (storage.getMission as vi.Mock).mockResolvedValue(mission);
    (storage.updateMissionStatus as vi.Mock).mockResolvedValue(updatedMission);

    const result = await performMissionStep(1, mockBroadcaster);

    expect(storage.updateMissionStatus).toHaveBeenCalledWith(1, 'processing', 55);
    expect(mockBroadcaster).toHaveBeenCalledWith('missionUpdated', updatedMission);
    expect(result.shouldContinue).toBe(true);
  });

  it('should complete the mission and stop', async () => {
    const mission = { id: 1, status: 'processing', progress: 98 };
    const completedMission = { ...mission, status: 'completed', progress: 100 };
    (storage.getMission as vi.Mock).mockResolvedValue(mission);
    (storage.updateMissionStatus as vi.Mock).mockResolvedValue(completedMission);

    const result = await performMissionStep(1, mockBroadcaster);

    expect(storage.updateMissionStatus).toHaveBeenCalledWith(1, 'completed', 100);
    expect(storage.updateMissionResult).toHaveBeenCalled();
    expect(mockBroadcaster).toHaveBeenCalledWith('missionUpdated', expect.objectContaining({ result: expect.any(Object) }));
    expect(result.shouldContinue).toBe(false);
  });
});

describe('processMission', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initiate processing and call step function periodically', async () => {
    const mission = { id: 1, status: 'active', progress: 0 };
    (storage.getMission as vi.Mock).mockResolvedValue(mission);

    const mockStepFunction = vi.fn().mockResolvedValue({ shouldContinue: true });
    const mockBroadcaster = vi.fn();

    await processMission(1, mockStepFunction, mockBroadcaster);

    // Check initial status update and broadcast
    expect(storage.updateMissionStatus).toHaveBeenCalledWith(1, 'processing', 0);
    expect(mockBroadcaster).toHaveBeenCalledWith('missionUpdated', expect.objectContaining({ status: 'processing' }));

    // Check that the interval is running
    await vi.advanceTimersByTimeAsync(3000);
    expect(mockStepFunction).toHaveBeenCalledTimes(1);

    // Stop the loop
    mockStepFunction.mockResolvedValue({ shouldContinue: false });
    await vi.advanceTimersByTimeAsync(3000);
    expect(mockStepFunction).toHaveBeenCalledTimes(2);

    // It should not be called again
    await vi.advanceTimersByTimeAsync(3000);
    expect(mockStepFunction).toHaveBeenCalledTimes(2);
  });
});