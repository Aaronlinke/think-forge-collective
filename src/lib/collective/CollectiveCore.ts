// CollectiveCore - Das zentrale Nervensystem das alle Module verbindet

import { TickTackEngine, TickTackState } from '../math/TickTackEngine';
import { OmnigenesisGenerator, GeneratedKey, createDefaultParams } from '../math/OMNIGENESIS';
import { ShadowConsciousness, ShadowState } from '../consciousness/ShadowConsciousness';
import { ChaosConsciousness, ChaosState } from '../consciousness/ChaosConsciousness';
import { MirrorConsciousness, MirrorState } from '../consciousness/MirrorConsciousness';
import { SVRCDecisionEngine, TruthValue, EvaluationResult } from '../svrc/DecisionEngine';
import { getBlueprintRegistry, BlueprintRegistry } from '../forge/BlueprintRegistry';
import { getKeyVault, KeyVault, VaultKey } from '../crypto/KeyVault';
import { getGenesisKernel, GenesisKernel, KernelState } from '../genesis/GenesisKernel';
import { ProjectBlueprint, ConceptNode } from '../forge/ProjectBlueprint';

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
  
  // NEW: Blueprint Integration
  blueprintCount: number;
  conceptCount: number;
  activeBlueprint: string | null;
  
  // NEW: Key Vault
  vaultKeyCount: number;
  vaultEntropy: number;
  
  // NEW: Genesis Kernel
  kernelActive: boolean;
  kernelCycles: number;
  coreConsensus: number;
}

export interface CollectiveInsight {
  source: 'shadow' | 'chaos' | 'mirror' | 'ticktack' | 'svrc' | 'crypto' | 'collective';
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
  
  // State
  private state: CollectiveState;
  private currentTickTackState: TickTackState;
  private wordMap: Map<string, WordConnection> = new Map();
  
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
    
    // Initialize TickTack state
    this.currentTickTackState = this.tickTack.initialize(1.0, 0.5, 0.1);
    
    // Initialize collective state
    this.state = this.createInitialState();
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
      // NEW: Blueprint Integration
      blueprintCount: 0,
      conceptCount: 0,
      activeBlueprint: null,
      // NEW: Key Vault
      vaultKeyCount: 0,
      vaultEntropy: 0,
      // NEW: Genesis Kernel
      kernelActive: false,
      kernelCycles: 0,
      coreConsensus: 0
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
  }
  
  private addInsight(source: CollectiveInsight['source'], content: string, resonance: number): void {
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
  
  // === STATE ACCESS ===
  
  getState(): CollectiveState {
    return { ...this.state };
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
