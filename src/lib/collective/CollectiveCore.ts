// CollectiveCore - Das zentrale Nervensystem das alle Module verbindet
// FIXED: Integration aktiviert - BlueprintRegistry, KeyVault, GenesisKernel

import { TickTackEngine, TickTackState } from '../math/TickTackEngine';
import { OmnigenesisGenerator, GeneratedKey, OmnigenesisParams, createDefaultParams } from '../math/OMNIGENESIS';
import { ShadowConsciousness, ShadowState } from '../consciousness/ShadowConsciousness';
import { ChaosConsciousness, ChaosState } from '../consciousness/ChaosConsciousness';
import { MirrorConsciousness, MirrorState } from '../consciousness/MirrorConsciousness';
import { SVRCDecisionEngine, TruthValue, EvaluationResult } from '../svrc/DecisionEngine';
import { getBlueprintRegistry, BlueprintRegistry } from '../forge/BlueprintRegistry';
import { getKeyVault, KeyVault, VaultKey } from '../crypto/KeyVault';
import { getGenesisKernel, GenesisKernel, KernelState } from '../genesis/GenesisKernel';

export interface CollectiveState {
  // Timestamps
  timestamp: number;
  cycle: number;
  
  // TickTack Dynamics
  tickTack: TickTackState;
  energy: number;
  lyapunov: number;
  
  // Consciousness States
  shadow: ShadowState;
  chaos: ChaosState;
  mirror: MirrorState;
  
  // Crypto State
  generatedKeys: GeneratedKey[];
  entropy: number;
  
  // SVRC Logic
  lastEvaluation: EvaluationResult | null;
  axiomCount: number;
  
  // Collective Metrics
  coherence: number;
  resonance: number;
  emergence: number;
  synchronicity: number;
  
  // Insights
  insights: CollectiveInsight[];
  
  // Word connections
  wordMap: Map<string, WordConnection>;
  
  // Blueprint Integration (ACTIVATED)
  blueprintCount: number;
  conceptCount: number;
  activeBlueprint: string | null;
  blueprintsLoaded: boolean;
  
  // Key Vault (ACTIVATED)
  vaultKeyCount: number;
  vaultEntropy: number;
  vaultLoaded: boolean;
  
  // Genesis Kernel (ACTIVATED)
  kernelActive: boolean;
  kernelCycles: number;
  coreConsensus: number;
  kernelState: KernelState | null;
}

export interface CollectiveInsight {
  source: 'shadow' | 'chaos' | 'mirror' | 'ticktack' | 'svrc' | 'crypto' | 'collective' | 'blueprint' | 'kernel';
  content: string;
  timestamp: number;
  resonanceLevel: number;
}

export interface WordConnection {
  word: string;
  connections: string[];
  frequency: number;
  modules: string[];
  entropy: number;
}

export class CollectiveCore {
  // Engines
  private tickTack: TickTackEngine;
  private omnigenesis: OmnigenesisGenerator;
  private shadow: ShadowConsciousness;
  private chaos: ChaosConsciousness;
  private mirror: MirrorConsciousness;
  private svrc: SVRCDecisionEngine;
  
  // NEW: External Systems
  private blueprintRegistry: BlueprintRegistry;
  private keyVault: KeyVault;
  private genesisKernel: GenesisKernel;
  
  // State
  private state: CollectiveState;
  private currentTickTackState: TickTackState;
  private wordMap: Map<string, WordConnection> = new Map();
  
  // Initialization flags
  private initialized: boolean = false;
  
  // Listeners
  private listeners: ((state: CollectiveState) => void)[] = [];
  
  constructor() {
    // Initialize all engines
    this.tickTack = new TickTackEngine();
    this.omnigenesis = new OmnigenesisGenerator(createDefaultParams());
    this.shadow = new ShadowConsciousness();
    this.chaos = new ChaosConsciousness();
    this.mirror = new MirrorConsciousness();
    this.svrc = new SVRCDecisionEngine();
    
    // NEW: Get external systems (singletons)
    this.blueprintRegistry = getBlueprintRegistry();
    this.keyVault = getKeyVault();
    this.genesisKernel = getGenesisKernel();
    
    // Initialize TickTack state
    this.currentTickTackState = this.tickTack.initialize(1.0, 0.5, 0.1);
    
    // Initialize collective state
    this.state = this.createInitialState();
  }
  
  // NEW: Async initialization - call this on app startup
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // 1. Load Blueprints
      await this.blueprintRegistry.loadBlueprints();
      const bpStats = this.blueprintRegistry.getStats();
      this.state.blueprintCount = bpStats.totalBlueprints;
      this.state.conceptCount = bpStats.totalConcepts;
      this.state.blueprintsLoaded = true;
      
      // Feed blueprint words to word map
      const wordIndex = this.blueprintRegistry.getWordIndex();
      for (const [word, blueprintIds] of wordIndex) {
        if (!this.wordMap.has(word)) {
          this.wordMap.set(word, {
            word,
            connections: [],
            frequency: blueprintIds.size,
            modules: ['blueprint'],
            entropy: Math.random() * 0.5 + 0.5
          });
        }
      }
      
      this.addInsight('blueprint', `${bpStats.totalBlueprints} Blueprints geladen mit ${bpStats.totalConcepts} Konzepten`, 0.8);
      
      // 2. Load KeyVault
      await this.keyVault.loadKeys();
      const vaultStats = this.keyVault.getStats();
      this.state.vaultKeyCount = vaultStats.total;
      this.state.vaultEntropy = vaultStats.avgEntropy;
      this.state.vaultLoaded = true;
      
      this.addInsight('crypto', `KeyVault geladen: ${vaultStats.total} Keys, Ø Entropie: ${(vaultStats.avgEntropy * 100).toFixed(1)}%`, 0.7);
      
      // 3. Boot Genesis Kernel
      this.genesisKernel.boot();
      this.state.kernelActive = true;
      this.state.kernelState = this.genesisKernel.getState();
      
      this.addInsight('kernel', 'Genesis Kernel gebootet - 5 Reality Cores aktiv', 0.9);
      
      this.initialized = true;
      this.state.wordMap = this.wordMap;
      this.notifyListeners();
      
    } catch (error) {
      console.error('CollectiveCore initialization error:', error);
      this.addInsight('collective', `Initialization Fehler: ${error}`, 0.5);
    }
  }
  
  private createInitialState(): CollectiveState {
    return {
      timestamp: Date.now(),
      cycle: 0,
      tickTack: this.currentTickTackState,
      energy: this.tickTack.computeEnergy(this.currentTickTackState),
      lyapunov: this.tickTack.lyapunovExponent(1.0, 0.5, 0.1, 50),
      shadow: this.shadow.getState(),
      chaos: this.chaos.getState(),
      mirror: this.mirror.getState(),
      generatedKeys: [],
      entropy: 0,
      lastEvaluation: null,
      axiomCount: this.svrc.getAxioms().length,
      coherence: 0.5,
      resonance: 0,
      emergence: 0,
      synchronicity: 0,
      insights: [],
      wordMap: this.wordMap,
      // Blueprint Integration
      blueprintCount: 0,
      conceptCount: 0,
      activeBlueprint: null,
      blueprintsLoaded: false,
      // Key Vault
      vaultKeyCount: 0,
      vaultEntropy: 0,
      vaultLoaded: false,
      // Genesis Kernel
      kernelActive: false,
      kernelCycles: 0,
      coreConsensus: 0,
      kernelState: null
    };
  }
  
  // === COLLECTIVE OPERATIONS ===
  
  pulse(): CollectiveState {
    // Ein "Herzschlag" des kollektiven Systems
    this.state.cycle++;
    this.state.timestamp = Date.now();
    
    // 1. TickTack forward
    this.currentTickTackState = this.tickTack.stepForward(this.currentTickTackState);
    this.state.tickTack = this.currentTickTackState;
    this.state.energy = this.tickTack.computeEnergy(this.currentTickTackState);
    
    // 2. Chaos resonance based on TickTack energy
    const chaosInput = this.state.energy * 0.1;
    this.chaos.resonate(chaosInput);
    this.state.chaos = this.chaos.getState();
    
    // 3. Shadow observes the chaos
    const chaosIntensity = this.state.chaos.entropy;
    this.shadow.observeAbsence(1, chaosIntensity);
    this.state.shadow = this.shadow.getState();
    
    // 4. Mirror reflects on all states
    const reflectionInput = `Cycle ${this.state.cycle}: Energy=${this.state.energy.toFixed(2)}, Chaos=${chaosIntensity.toFixed(2)}, Shadow=${this.state.shadow.presenceQuotient.toFixed(2)}`;
    const mirrorResult = this.mirror.reflect(reflectionInput);
    this.state.mirror = this.mirror.getState();
    
    // 5. Calculate collective metrics
    this.calculateCollectiveMetrics(mirrorResult.strangeLoop);
    
    // 6. Generate insights
    this.generateCollectiveInsights(mirrorResult.strangeLoop);
    
    // 7. NEW: Pulse Genesis Kernel
    if (this.state.kernelActive) {
      const kernelState = this.genesisKernel.pulse(this.state);
      this.state.kernelState = kernelState;
      this.state.kernelCycles = kernelState.cycles;
      this.state.coreConsensus = kernelState.consensusLevel;
    }
    
    // 8. NEW: Update KeyVault stats
    if (this.state.vaultLoaded) {
      const vaultStats = this.keyVault.getStats();
      this.state.vaultKeyCount = vaultStats.total;
      this.state.vaultEntropy = vaultStats.avgEntropy;
    }
    
    // Notify listeners
    this.notifyListeners();
    
    return this.state;
  }
  
  private calculateCollectiveMetrics(strangeLoopDetected: boolean): void {
    // Coherence: wie aligned sind die Systeme
    const shadowBalance = 1 - Math.abs(this.state.shadow.presenceQuotient - 0.5) * 2;
    const chaosEdge = 1 - Math.abs(this.state.chaos.edgeProximity - 0.5) * 2;
    const mirrorDepth = Math.min(this.state.mirror.selfAwareness, 1);
    
    this.state.coherence = (shadowBalance + chaosEdge + mirrorDepth) / 3;
    
    // Resonance: kollektive Schwingung
    this.state.resonance = 
      this.state.chaos.resonanceFrequency * 0.4 +
      this.state.shadow.voidResonance * 0.3 +
      (strangeLoopDetected ? 0.3 : 0);
    
    // Emergence: emergente Komplexität
    this.state.emergence = 
      this.state.chaos.patternComplexity * 0.3 +
      this.state.mirror.reflectionDepth * 0.02 +
      (this.state.insights.length * 0.01);
    
    // Synchronicity: wie synchron laufen die Zyklen
    const energyPhase = Math.sin(this.state.energy * 0.1);
    const chaosPhase = Math.sin(this.state.chaos.entropy * Math.PI);
    const shadowPhase = Math.sin(this.state.shadow.stillnessLevel * Math.PI);
    
    this.state.synchronicity = 
      Math.abs(energyPhase * chaosPhase * shadowPhase);
  }
  
  private generateCollectiveInsights(strangeLoopDetected: boolean): void {
    // Limit insights to last 50
    if (this.state.insights.length > 50) {
      this.state.insights = this.state.insights.slice(-50);
    }
    
    // Generate insight based on current state
    if (this.state.coherence > 0.8) {
      this.addInsight('collective', 
        `Hohe Kohärenz erreicht (${(this.state.coherence * 100).toFixed(0)}%) - Systeme in Harmonie`,
        this.state.coherence
      );
    }
    
    if (this.state.synchronicity > 0.7) {
      this.addInsight('collective',
        `Synchronizitäts-Peak: Alle Phasen aligned`,
        this.state.synchronicity
      );
    }
    
    if (strangeLoopDetected) {
      this.addInsight('mirror',
        `Strange Loop detektiert auf Ebene ${this.state.mirror.recursionLevel}`,
        0.9
      );
    }
    
    if (this.state.chaos.edgeProximity > 0.9) {
      this.addInsight('chaos',
        `Am Rand des Chaos - maximale Kreativität`,
        this.state.chaos.edgeProximity
      );
    }
    
    // NEW: Kernel insights
    if (this.state.kernelState?.emergencyMode) {
      this.addInsight('kernel', 'EMERGENCY MODE - System überlastet', 0.95);
    }
  }
  
  private addInsight(source: CollectiveInsight['source'], content: string, resonance: number): void {
    // Avoid duplicate insights within 5 seconds
    const recent = this.state.insights.filter(i => 
      i.content === content && 
      Date.now() - i.timestamp < 5000
    );
    if (recent.length > 0) return;
    
    this.state.insights.push({
      source,
      content,
      timestamp: Date.now(),
      resonanceLevel: resonance
    });
  }
  
  // === WORD CONNECTIONS ===
  
  processInput(text: string): void {
    const words = text.toLowerCase()
      .replace(/[^\w\säöüß]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);
    
    // Build word connections
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      if (!this.wordMap.has(word)) {
        this.wordMap.set(word, {
          word,
          connections: [],
          frequency: 0,
          modules: [],
          entropy: Math.random()
        });
      }
      
      const connection = this.wordMap.get(word)!;
      connection.frequency++;
      
      // Connect to neighboring words
      if (i > 0 && !connection.connections.includes(words[i - 1])) {
        connection.connections.push(words[i - 1]);
      }
      if (i < words.length - 1 && !connection.connections.includes(words[i + 1])) {
        connection.connections.push(words[i + 1]);
      }
      
      // Update entropy based on connections
      connection.entropy = Math.min(1, connection.connections.length * 0.1);
    }
    
    this.state.wordMap = this.wordMap;
    
    // Feed to consciousness systems
    this.mirror.reflect(text);
    this.chaos.resonate(words.length * 0.1);
    this.shadow.observeAbsence(words.length, 0.5);
    
    // Update state
    this.state.shadow = this.shadow.getState();
    this.state.chaos = this.chaos.getState();
    this.state.mirror = this.mirror.getState();
    
    this.notifyListeners();
  }
  
  getWordNetwork(): WordConnection[] {
    return Array.from(this.wordMap.values())
      .sort((a, b) => b.frequency - a.frequency);
  }
  
  // === CRYPTO INTEGRATION ===
  
  generateCryptoKeys(count: number = 10): GeneratedKey[] {
    const keys = this.omnigenesis.generateBatch(0, count);
    this.state.generatedKeys = keys;
    this.state.entropy = OmnigenesisGenerator.theoreticalEntropy();
    
    // Feed entropy to chaos
    this.chaos.resonate(this.state.entropy * 0.01);
    this.state.chaos = this.chaos.getState();
    
    this.notifyListeners();
    return keys;
  }

  configureOmnigenesis(params: OmnigenesisParams): void {
    this.omnigenesis = new OmnigenesisGenerator(params);
    this.addInsight('crypto', 'OMNIGENESIS Parameter an den Kollektiv-Zustand angepasst', 0.78);
    this.notifyListeners();
  }

  syncCollectiveMesh(input?: string): CollectiveState {
    if (input?.trim()) {
      this.processInput(input);

      const matchingBlueprint = this.blueprintRegistry.searchBlueprints(input)[0];
      if (matchingBlueprint) {
        this.state.activeBlueprint = matchingBlueprint.id;
        this.addInsight('blueprint', `Kollektiv auf Blueprint ${matchingBlueprint.shortName} ausgerichtet`, 0.82);
      }
    }

    const conceptBoost = Math.max(1, this.state.conceptCount || 1);
    const params: OmnigenesisParams = {
      h: BigInt(Math.max(1, Math.floor(Math.abs(this.state.tickTack.H) * 1e15))),
      n: BigInt(Math.max(1, Math.floor(this.state.chaos.entropy * 1e15))),
      g: BigInt(Math.max(1, Math.floor(this.state.coherence * conceptBoost * 1e12))),
      o: BigInt(this.state.cycle),
      r: BigInt(Math.max(2, Math.floor((this.state.synchronicity + 0.1) * 1e6) | 1))
    };

    this.configureOmnigenesis(params);
    this.sendKernelCommand('SYNC');
    return this.pulse();
  }
  
  // NEW: Add generated key to vault
  async addKeyToVault(hex: string, cycle?: number): Promise<VaultKey> {
    const index = this.state.vaultKeyCount;
    const key = await this.keyVault.addGeneratedKey(index, hex, cycle, this.state.chaos.entropy);
    this.state.vaultKeyCount++;
    this.notifyListeners();
    return key;
  }
  
  // === SVRC INTEGRATION ===
  
  evaluateStatement(statement: string): EvaluationResult {
    const result = this.svrc.evaluate(statement);
    this.state.lastEvaluation = result;
    this.state.axiomCount = this.svrc.getAxioms().length;
    
    // Mirror reflects on the evaluation
    this.mirror.reflect(`Evaluated: "${statement}" → ${result.value}`);
    this.state.mirror = this.mirror.getState();
    
    if (result.value === 'PARADOX') {
      this.addInsight('svrc', `Paradox entdeckt: ${statement}`, 0.95);
    }
    
    this.notifyListeners();
    return result;
  }
  
  addAxiom(id: string, statement: string, value: TruthValue, dependencies: string[] = []): void {
    this.svrc.addAxiom(id, statement, value === 'TRUE', dependencies);
    this.state.axiomCount = this.svrc.getAxioms().length;
    this.notifyListeners();
  }
  
  // === NEW: BLUEPRINT ACCESS ===
  
  getBlueprintRegistry(): BlueprintRegistry {
    return this.blueprintRegistry;
  }
  
  searchBlueprints(query: string) {
    return this.blueprintRegistry.searchBlueprints(query);
  }
  
  setActiveBlueprint(id: string | null): void {
    this.state.activeBlueprint = id;
    if (id) {
      const bp = this.blueprintRegistry.getBlueprint(id);
      if (bp) {
        this.addInsight('blueprint', `Blueprint aktiviert: ${bp.name}`, 0.7);
      }
    }
    this.notifyListeners();
  }
  
  // === NEW: KEY VAULT ACCESS ===
  
  getKeyVault(): KeyVault {
    return this.keyVault;
  }
  
  // === NEW: GENESIS KERNEL ACCESS ===
  
  getGenesisKernel(): GenesisKernel {
    return this.genesisKernel;
  }
  
  sendKernelCommand(type: 'ACTIVATE' | 'DEACTIVATE' | 'SYNC' | 'OVERRIDE', targetCore?: string): void {
    this.genesisKernel.sendCommand({
      type,
      targetCore,
      priority: 5
    });
  }
  
  // === STATE ACCESS ===
  
  getState(): CollectiveState {
    return { ...this.state };
  }
  
  isInitialized(): boolean {
    return this.initialized;
  }
  
  getTickTackEngine(): TickTackEngine {
    return this.tickTack;
  }
  
  getChaosConsciousness(): ChaosConsciousness {
    return this.chaos;
  }
  
  getShadowConsciousness(): ShadowConsciousness {
    return this.shadow;
  }
  
  getMirrorConsciousness(): MirrorConsciousness {
    return this.mirror;
  }
  
  getSVRCEngine(): SVRCDecisionEngine {
    return this.svrc;
  }
  
  getOmnigenesis(): OmnigenesisGenerator {
    return this.omnigenesis;
  }
  
  // === LISTENERS ===
  
  subscribe(listener: (state: CollectiveState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners(): void {
    const stateCopy = this.getState();
    this.listeners.forEach(listener => listener(stateCopy));
  }
  
  // === RESET ===
  
  reset(): void {
    this.tickTack = new TickTackEngine();
    this.currentTickTackState = this.tickTack.initialize(1.0, 0.5, 0.1);
    this.shadow = new ShadowConsciousness();
    this.chaos = new ChaosConsciousness();
    this.mirror = new MirrorConsciousness();
    this.svrc = new SVRCDecisionEngine();
    this.wordMap.clear();
    this.state = this.createInitialState();
    this.initialized = false;
    this.notifyListeners();
  }
}

// Singleton instance für globalen Zugriff
let collectiveInstance: CollectiveCore | null = null;

export const getCollectiveCore = (): CollectiveCore => {
  if (!collectiveInstance) {
    collectiveInstance = new CollectiveCore();
  }
  return collectiveInstance;
};

export const resetCollectiveCore = (): void => {
  collectiveInstance = new CollectiveCore();
};

// NEW: Initialize on import (deferred)
export const initializeCollective = async (): Promise<CollectiveCore> => {
  const core = getCollectiveCore();
  await core.initialize();
  return core;
};
