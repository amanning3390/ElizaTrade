import { AgentRuntime } from '@elizaos/core';
import type { Character, IAgentRuntime, UUID } from '@elizaos/core';
import { createDatabaseAdapter } from '@elizaos/plugin-sql';
import { createTradingCharacter } from './character';
import type { Plugin } from '@elizaos/core';
import { tradingPlugin } from './plugins';

// Store runtimes in memory (for serverless, this will be per-request)
// In production, you might want to use a cache like Redis
const runtimeCache = new Map<UUID, IAgentRuntime>();

export interface CreateRuntimeOptions {
  agentId?: UUID;
  character?: Character;
  userId: string;
  settings?: Record<string, any>;
  plugins?: Plugin[];
}

/**
 * Creates or retrieves an AgentRuntime for a user's trading agent
 */
export async function createAgentRuntime(
  options: CreateRuntimeOptions
): Promise<IAgentRuntime> {
  const { agentId, character, userId, settings, plugins = [] } = options;

  // Use provided character or create default trading character
  const tradingCharacter = character || createTradingCharacter(undefined, settings);

  // Generate agent ID if not provided
  const finalAgentId = agentId || tradingCharacter.id || (userId as UUID);

  // Check cache first
  if (runtimeCache.has(finalAgentId)) {
    const cached = runtimeCache.get(finalAgentId)!;
    // Verify it's still valid
    if (cached.character.name === tradingCharacter.name) {
      return cached;
    }
  }

  // Get database URL from environment
  const postgresUrl = process.env.DATABASE_URL;
  if (!postgresUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Create database adapter
  const adapter = createDatabaseAdapter(
    {
      postgresUrl,
    },
    finalAgentId
  );

  // Include trading plugin
  const allPlugins = [...plugins, tradingPlugin];

  // Create runtime
  const runtime = new AgentRuntime({
    agentId: finalAgentId,
    character: tradingCharacter,
    adapter,
    plugins: allPlugins,
    settings: {
      POSTGRES_URL: postgresUrl,
      ...settings,
    },
  });

  // Initialize the runtime
  await runtime.initialize();

  // Cache the runtime
  runtimeCache.set(finalAgentId, runtime);

  return runtime;
}

/**
 * Gets an existing runtime from cache
 */
export function getAgentRuntime(agentId: UUID): IAgentRuntime | null {
  return runtimeCache.get(agentId) || null;
}

/**
 * Removes a runtime from cache (e.g., when agent is stopped)
 */
export function removeAgentRuntime(agentId: UUID): void {
  const runtime = runtimeCache.get(agentId);
  if (runtime) {
    // Cleanup if needed
    runtimeCache.delete(agentId);
  }
}

/**
 * Clears all cached runtimes (useful for testing or cleanup)
 */
export function clearRuntimeCache(): void {
  runtimeCache.clear();
}

