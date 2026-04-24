import { useState, useEffect, useCallback } from 'react';
import { 
  getCollectiveCore, 
  CollectiveState, 
  CollectiveCore,
  WordConnection,
  initializeCollective
} from '@/lib/collective/CollectiveCore';
import { GeneratedKey } from '@/lib/math/OMNIGENESIS';
import { OmnigenesisParams } from '@/lib/math/OMNIGENESIS';
import { EvaluationResult, TruthValue } from '@/lib/svrc/DecisionEngine';
import { VaultKey } from '@/lib/crypto/KeyVault';
import { KernelState, RealityCoreType } from '@/lib/genesis/GenesisKernel';
import { ProjectBlueprint, ConceptNode } from '@/lib/forge/ProjectBlueprint';

export const useCollectiveCore = () => {
  const [core] = useState<CollectiveCore>(() => getCollectiveCore());
  const [state, setState] = useState<CollectiveState>(() => core.getState());
  const [isRunning, setIsRunning] = useState(false);
  const [isInitialized, setIsInitialized] = useState(core.isInitialized());
  
  // Initialize on mount if not already initialized
  useEffect(() => {
    if (!core.isInitialized()) {
      initializeCollective().then(() => {
        setIsInitialized(true);
        setState(core.getState());
      });
    }
  }, [core]);
  
  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = core.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, [core]);
  
  // Auto-pulse when running
  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(() => {
      core.pulse();
    }, 100);
    
    return () => clearInterval(interval);
  }, [isRunning, core]);
  
  // Actions
  const pulse = useCallback(() => {
    return core.pulse();
  }, [core]);
  
  const startPulsing = useCallback(() => {
    setIsRunning(true);
  }, []);
  
  const stopPulsing = useCallback(() => {
    setIsRunning(false);
  }, []);
  
  const togglePulsing = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);
  
  const processInput = useCallback((text: string) => {
    core.processInput(text);
  }, [core]);
  
  const generateKeys = useCallback((count?: number): GeneratedKey[] => {
    return core.generateCryptoKeys(count);
  }, [core]);

  const configureOmnigenesis = useCallback((params: OmnigenesisParams) => {
    core.configureOmnigenesis(params);
  }, [core]);

  const syncCollectiveMesh = useCallback((input?: string) => {
    return core.syncCollectiveMesh(input);
  }, [core]);
  
  const evaluateStatement = useCallback((statement: string): EvaluationResult => {
    return core.evaluateStatement(statement);
  }, [core]);
  
  const addAxiom = useCallback((
    id: string, 
    statement: string, 
    value: TruthValue, 
    dependencies?: string[]
  ) => {
    core.addAxiom(id, statement, value, dependencies);
  }, [core]);
  
  const getWordNetwork = useCallback((): WordConnection[] => {
    return core.getWordNetwork();
  }, [core]);
  
  const reset = useCallback(() => {
    core.reset();
    setIsRunning(false);
  }, [core]);
  
  // === NEW: Blueprint Access ===
  const searchBlueprints = useCallback((query: string): ProjectBlueprint[] => {
    return core.searchBlueprints(query);
  }, [core]);
  
  const getAllBlueprints = useCallback((): ProjectBlueprint[] => {
    return core.getBlueprintRegistry().getAllBlueprints();
  }, [core]);
  
  const getConceptGraph = useCallback((): ConceptNode[] => {
    return core.getBlueprintRegistry().getConceptGraph();
  }, [core]);
  
  const setActiveBlueprint = useCallback((id: string | null) => {
    core.setActiveBlueprint(id);
  }, [core]);
  
  // === NEW: KeyVault Access ===
  const getVaultKeys = useCallback((): VaultKey[] => {
    return core.getKeyVault().getAllKeys();
  }, [core]);
  
  const searchVaultKeys = useCallback((query: string): VaultKey[] => {
    return core.getKeyVault().searchKeys(query);
  }, [core]);
  
  const addKeyToVault = useCallback(async (hex: string, cycle?: number): Promise<VaultKey> => {
    return core.addKeyToVault(hex, cycle);
  }, [core]);
  
  const getVaultStats = useCallback(() => {
    return core.getKeyVault().getStats();
  }, [core]);
  
  // === NEW: Genesis Kernel Access ===
  const getKernelState = useCallback((): KernelState | null => {
    return state.kernelState;
  }, [state.kernelState]);
  
  const sendKernelCommand = useCallback((
    type: 'ACTIVATE' | 'DEACTIVATE' | 'SYNC' | 'OVERRIDE',
    targetCore?: RealityCoreType
  ) => {
    core.sendKernelCommand(type, targetCore);
  }, [core]);
  
  const getAllCores = useCallback(() => {
    return core.getGenesisKernel().getAllCores();
  }, [core]);
  
  // === Direct Engine Access (for advanced usage) ===
  const getTickTackEngine = useCallback(() => {
    return core.getTickTackEngine();
  }, [core]);
  
  const getChaosConsciousness = useCallback(() => {
    return core.getChaosConsciousness();
  }, [core]);
  
  const getShadowConsciousness = useCallback(() => {
    return core.getShadowConsciousness();
  }, [core]);
  
  const getMirrorConsciousness = useCallback(() => {
    return core.getMirrorConsciousness();
  }, [core]);
  
  const getOmnigenesis = useCallback(() => {
    return core.getOmnigenesis();
  }, [core]);
  
  const getSVRCEngine = useCallback(() => {
    return core.getSVRCEngine();
  }, [core]);
  
  return {
    // State
    state,
    isRunning,
    isInitialized,
    
    // Core actions
    pulse,
    startPulsing,
    stopPulsing,
    togglePulsing,
    processInput,
    reset,
    
    // Crypto
    generateKeys,
    configureOmnigenesis,
    syncCollectiveMesh,
    addKeyToVault,
    getVaultKeys,
    searchVaultKeys,
    getVaultStats,
    
    // SVRC
    evaluateStatement,
    addAxiom,
    
    // Word Network
    getWordNetwork,
    
    // Blueprints
    searchBlueprints,
    getAllBlueprints,
    getConceptGraph,
    setActiveBlueprint,
    
    // Genesis Kernel
    getKernelState,
    sendKernelCommand,
    getAllCores,
    
    // Direct Engine Access
    getTickTackEngine,
    getChaosConsciousness,
    getShadowConsciousness,
    getMirrorConsciousness,
    getOmnigenesis,
    getSVRCEngine,
    
    // Raw core reference
    core
  };
};
