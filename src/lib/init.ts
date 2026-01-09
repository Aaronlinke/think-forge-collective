// init.ts - Zentrale Initialisierung aller Systeme beim App-Start

import { initializeCollective, getCollectiveCore } from './collective/CollectiveCore';
import { getKeyVault } from './crypto/KeyVault';
import { getBlueprintRegistry } from './forge/BlueprintRegistry';
import { getGenesisKernel } from './genesis/GenesisKernel';

let isInitialized = false;
let initPromise: Promise<void> | null = null;

export interface SystemStatus {
  collective: boolean;
  blueprints: boolean;
  keyVault: boolean;
  genesisKernel: boolean;
  errors: string[];
}

// Initialisiere alle Systeme
export async function initializeSystems(): Promise<SystemStatus> {
  if (isInitialized) {
    const core = getCollectiveCore();
    const state = core.getState();
    return {
      collective: core.isInitialized(),
      blueprints: state.blueprintsLoaded,
      keyVault: state.vaultLoaded,
      genesisKernel: state.kernelActive,
      errors: []
    };
  }
  
  if (initPromise) {
    await initPromise;
    return initializeSystems();
  }
  
  const status: SystemStatus = {
    collective: false,
    blueprints: false,
    keyVault: false,
    genesisKernel: false,
    errors: []
  };
  
  initPromise = (async () => {
    try {
      console.log('[INIT] Starting Think Forge Collective initialization...');
      
      // Initialize CollectiveCore (which initializes all subsystems)
      const core = await initializeCollective();
      status.collective = true;
      
      // Verify subsystems
      const state = core.getState();
      status.blueprints = state.blueprintsLoaded;
      status.keyVault = state.vaultLoaded;
      status.genesisKernel = state.kernelActive;
      
      console.log('[INIT] System Status:', {
        blueprints: `${state.blueprintCount} loaded`,
        concepts: `${state.conceptCount} indexed`,
        keys: `${state.vaultKeyCount} in vault`,
        kernel: state.kernelActive ? 'ACTIVE' : 'inactive',
        kernelCores: state.kernelState ? Object.keys(state.kernelState.coreStates).length : 0
      });
      
      isInitialized = true;
      
    } catch (error) {
      console.error('[INIT] Initialization failed:', error);
      status.errors.push(String(error));
    }
  })();
  
  await initPromise;
  return status;
}

// Quick access to initialized systems
export function getSystems() {
  return {
    collective: getCollectiveCore(),
    blueprints: getBlueprintRegistry(),
    keyVault: getKeyVault(),
    kernel: getGenesisKernel()
  };
}

// Check if systems are ready
export function isSystemReady(): boolean {
  return isInitialized;
}

// Reset all systems
export async function resetSystems(): Promise<void> {
  isInitialized = false;
  initPromise = null;
  
  const core = getCollectiveCore();
  core.reset();
  
  // Re-initialize
  await initializeSystems();
}
