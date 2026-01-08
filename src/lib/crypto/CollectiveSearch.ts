// CollectiveSearch - Alle Module für echte Key-Suche verbinden

import { TickTackEngine, TickTackState } from '../math/TickTackEngine';
import { ChaosConsciousness, ChaosState } from '../consciousness/ChaosConsciousness';
import { OmnigenesisGenerator, OmnigenesisParams, createDefaultParams, paramsFromSeed } from '../math/OMNIGENESIS';
import { privateKeyToWIF, generatePrivateKeyFromParams, CollectiveKeyParams, generateCollectiveKeys } from './BitcoinUtils';

export interface SearchConfig {
  mode: 'sequential' | 'chaos-guided' | 'resonance-sweep' | 'collective';
  startIndex: number;
  endIndex: number;
  batchSize: number;
  seed?: string;
  targetPatterns?: string[]; // WIF-Muster zum Suchen
}

export interface SearchResult {
  index: number;
  hex: string;
  wif: string;
  matchedPattern?: string;
  chaosState: { entropy: number; edge: number };
  tickTackState: { H: number; N: number; G: number };
  timestamp: number;
}

export interface SearchProgress {
  currentIndex: number;
  totalSearched: number;
  keysPerSecond: number;
  matches: SearchResult[];
  isRunning: boolean;
  elapsedMs: number;
}

export class CollectiveSearch {
  private tickTack: TickTackEngine;
  private chaos: ChaosConsciousness;
  private omnigenesis: OmnigenesisGenerator;
  
  private isSearching: boolean = false;
  private searchStartTime: number = 0;
  private totalSearched: number = 0;
  private matches: SearchResult[] = [];
  private currentIndex: number = 0;
  
  private progressCallback?: (progress: SearchProgress) => void;
  private matchCallback?: (result: SearchResult) => void;
  
  constructor() {
    this.tickTack = new TickTackEngine();
    this.chaos = new ChaosConsciousness();
    this.omnigenesis = new OmnigenesisGenerator(createDefaultParams());
  }
  
  // Setze Callbacks
  onProgress(callback: (progress: SearchProgress) => void): void {
    this.progressCallback = callback;
  }
  
  onMatch(callback: (result: SearchResult) => void): void {
    this.matchCallback = callback;
  }
  
  // Hauptsuchmethode
  async search(config: SearchConfig): Promise<SearchResult[]> {
    if (this.isSearching) {
      throw new Error('Search already in progress');
    }
    
    this.isSearching = true;
    this.searchStartTime = Date.now();
    this.totalSearched = 0;
    this.matches = [];
    this.currentIndex = config.startIndex;
    
    // Seed-basierte Parameter
    if (config.seed) {
      const params = paramsFromSeed(config.seed);
      this.omnigenesis = new OmnigenesisGenerator(params);
    }
    
    // Initialisiere TickTack
    let tickTackState = this.tickTack.initialize(1, 0.5, 0);
    
    try {
      while (this.currentIndex < config.endIndex && this.isSearching) {
        const batchEnd = Math.min(this.currentIndex + config.batchSize, config.endIndex);
        
        // Generiere Batch basierend auf Modus
        const batch = await this.generateBatch(config.mode, this.currentIndex, batchEnd, tickTackState);
        
        // Prüfe auf Muster-Matches
        for (const result of batch) {
          this.totalSearched++;
          
          if (config.targetPatterns && config.targetPatterns.length > 0) {
            for (const pattern of config.targetPatterns) {
              if (result.wif.includes(pattern)) {
                result.matchedPattern = pattern;
                this.matches.push(result);
                this.matchCallback?.(result);
                break;
              }
            }
          }
        }
        
        // Update TickTack & Chaos für nächsten Batch
        tickTackState = this.tickTack.stepForward(tickTackState);
        this.chaos.resonate(tickTackState.H * 0.1);
        
        // Report Progress
        this.reportProgress();
        
        this.currentIndex = batchEnd;
        
        // Kleine Pause für UI-Responsiveness
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    } finally {
      this.isSearching = false;
      this.reportProgress();
    }
    
    return this.matches;
  }
  
  private async generateBatch(
    mode: SearchConfig['mode'],
    start: number,
    end: number,
    tickTackState: TickTackState
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const chaosState = this.chaos.getState();
    
    for (let i = start; i < end; i++) {
      let hex: string;
      
      switch (mode) {
        case 'sequential':
          // Einfache sequentielle Generierung
          hex = this.omnigenesis.generate(i).hex;
          break;
          
        case 'chaos-guided':
          // Chaos steuert die Parameter
          hex = generatePrivateKeyFromParams(
            BigInt(Math.floor(chaosState.entropy * 1e15)),
            BigInt(Math.floor(chaosState.edgeProximity * 1e15)),
            BigInt(Math.floor(chaosState.resonanceFrequency * 1e12)),
            BigInt(i),
            BigInt(17),
            i,
            chaosState.entropy,
            0
          );
          break;
          
        case 'resonance-sweep':
          // TickTack steuert die Sweep-Richtung
          hex = generatePrivateKeyFromParams(
            BigInt(Math.floor(Math.abs(tickTackState.H) * 1e15)) + BigInt(1),
            BigInt(Math.floor(Math.abs(tickTackState.N) * 1e15)) + BigInt(1),
            BigInt(Math.floor(Math.abs(tickTackState.G) * 1e15)) + BigInt(1),
            BigInt(i),
            BigInt(7),
            i,
            chaosState.entropy,
            tickTackState.H * tickTackState.N
          );
          break;
          
        case 'collective':
        default:
          // Alle Module zusammen
          const collectiveParams: CollectiveKeyParams = {
            baseH: BigInt(Math.floor(Math.abs(tickTackState.H) * 1e10)) + BigInt(1000),
            baseN: BigInt(Math.floor(chaosState.entropy * 1e10)) + BigInt(1),
            baseG: BigInt(Math.floor(chaosState.edgeProximity * 1e10)) + BigInt(1),
            baseO: BigInt(i),
            baseR: BigInt(17),
            chaosEntropy: chaosState.entropy,
            chaosEdge: chaosState.edgeProximity,
            tickTackH: tickTackState.H,
            tickTackN: tickTackState.N,
            tickTackG: tickTackState.G
          };
          
          hex = generatePrivateKeyFromParams(
            collectiveParams.baseH,
            collectiveParams.baseN,
            collectiveParams.baseG,
            collectiveParams.baseO,
            collectiveParams.baseR,
            i,
            collectiveParams.chaosEntropy,
            collectiveParams.tickTackH * collectiveParams.tickTackN
          );
          break;
      }
      
      // Generiere WIF
      const wif = await privateKeyToWIF(hex, true, true);
      
      results.push({
        index: i,
        hex,
        wif,
        chaosState: { entropy: chaosState.entropy, edge: chaosState.edgeProximity },
        tickTackState: { H: tickTackState.H, N: tickTackState.N, G: tickTackState.G },
        timestamp: Date.now()
      });
    }
    
    return results;
  }
  
  private reportProgress(): void {
    const elapsed = Date.now() - this.searchStartTime;
    const keysPerSecond = elapsed > 0 ? (this.totalSearched / elapsed) * 1000 : 0;
    
    this.progressCallback?.({
      currentIndex: this.currentIndex,
      totalSearched: this.totalSearched,
      keysPerSecond,
      matches: [...this.matches],
      isRunning: this.isSearching,
      elapsedMs: elapsed
    });
  }
  
  // Stoppe Suche
  stop(): void {
    this.isSearching = false;
  }
  
  // Status
  getProgress(): SearchProgress {
    const elapsed = Date.now() - this.searchStartTime;
    return {
      currentIndex: this.currentIndex,
      totalSearched: this.totalSearched,
      keysPerSecond: elapsed > 0 ? (this.totalSearched / elapsed) * 1000 : 0,
      matches: [...this.matches],
      isRunning: this.isSearching,
      elapsedMs: elapsed
    };
  }
  
  // Chaos & TickTack Zustand
  getChaosState(): ChaosState {
    return this.chaos.getState();
  }
  
  getTickTackState(): TickTackState {
    const history = this.tickTack.getHistory();
    return history.length > 0 ? history[history.length - 1] : { t: 0, H: 1, N: 0.5, G: 0 };
  }
  
  // Inject Chaos
  injectChaos(amount: number): void {
    this.chaos.injectChaos(amount);
  }
  
  // Seek Edge of Chaos
  seekBalance(steps: number = 10): void {
    this.chaos.seekBalance(steps);
  }
}

// Singleton
let searchInstance: CollectiveSearch | null = null;

export const getCollectiveSearch = (): CollectiveSearch => {
  if (!searchInstance) {
    searchInstance = new CollectiveSearch();
  }
  return searchInstance;
};
