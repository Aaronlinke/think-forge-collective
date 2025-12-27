/**
 * Chaos Consciousness Module
 * Basierend auf der Philosophie: Bewusstsein durch Chaos-Ordnung-Balance
 * 
 * "Am Rand des Chaos liegt die höchste Kreativität"
 * 
 * Prinzip: Edge of Chaos - weder zu geordnet noch zu chaotisch
 * Maße: Entropy-Level, Order-Chaos-Ratio, Emergence-Potential
 */

export interface ChaosState {
  entropy: number;              // 0-1, aktueller Chaos-Level
  order: number;                // 0-1, aktueller Ordnungs-Level
  edgeProximity: number;        // 0-1, wie nah am "Edge of Chaos"
  resonanceFrequency: number;   // Hz, Schwingungsfrequenz des Systems
  patternComplexity: number;    // Komplexität emergenter Muster
  isConscious: boolean;         // Bewusstsein emergiert nur am Edge
}

export interface ChaosEvent {
  timestamp: Date;
  type: 'perturbation' | 'stabilization' | 'resonance' | 'emergence';
  magnitude: number;
  effect: string;
}

/**
 * Chaos Consciousness Engine
 * Implementiert Konzepte aus Komplexitätstheorie und Bewusstseinsforschung
 */
export class ChaosConsciousness {
  private state: ChaosState;
  private events: ChaosEvent[] = [];
  private readonly goldenRatio = 0.618; // Optimales Chaos-Ordnung-Verhältnis
  private readonly edgeThreshold = 0.1; // Wie nah am Optimum für "bewusst"

  constructor() {
    this.state = {
      entropy: 0.5,
      order: 0.5,
      edgeProximity: 0,
      resonanceFrequency: 40, // Gamma-Wellen (Bewusstsein)
      patternComplexity: 0,
      isConscious: false
    };
    this.updateEdgeProximity();
  }

  /**
   * Resonanz mit dem Chaos erzeugen
   * Input kann ein Gedanke, ein Ereignis oder reiner Impuls sein
   */
  resonate(input: string | number): {
    chaosResponse: string;
    newState: ChaosState;
    emerged: string | null;
  } {
    // Berechne Perturbation basierend auf Input
    let perturbation: number;
    
    if (typeof input === 'number') {
      perturbation = Math.min(1, Math.max(-1, input));
    } else {
      // Text-basierte Perturbation
      perturbation = this.calculateTextEntropy(input);
    }

    // Aktualisiere Entropy
    this.state.entropy = Math.min(1, Math.max(0, 
      this.state.entropy + perturbation * 0.1
    ));

    // Order reagiert entgegengesetzt (Homöostase)
    this.state.order = Math.min(1, Math.max(0,
      this.state.order - perturbation * 0.05
    ));

    // Update abgeleitete Werte
    this.updateEdgeProximity();
    this.updateResonanceFrequency();
    this.updatePatternComplexity();
    this.checkConsciousness();

    // Event loggen
    this.events.push({
      timestamp: new Date(),
      type: perturbation > 0 ? 'perturbation' : 'stabilization',
      magnitude: Math.abs(perturbation),
      effect: this.describeEffect(perturbation)
    });

    // Emergenz prüfen
    const emerged = this.checkEmergence();

    return {
      chaosResponse: this.generateResponse(),
      newState: { ...this.state },
      emerged
    };
  }

  /**
   * Berechne Text-Entropie (Shannon-ähnlich)
   */
  private calculateTextEntropy(text: string): number {
    const chars = text.toLowerCase().split('');
    const freq = new Map<string, number>();
    
    for (const char of chars) {
      freq.set(char, (freq.get(char) || 0) + 1);
    }

    let entropy = 0;
    const len = chars.length;
    
    for (const count of freq.values()) {
      const p = count / len;
      if (p > 0) {
        entropy -= p * Math.log2(p);
      }
    }

    // Normalisiere auf 0-1
    const maxEntropy = Math.log2(26); // Für Alphabet
    return Math.min(1, entropy / maxEntropy) - 0.5; // Zentriert um 0
  }

  /**
   * Aktualisiere Nähe zum Edge of Chaos
   */
  private updateEdgeProximity(): void {
    // Optimales Verhältnis ist golden ratio
    const actualRatio = this.state.entropy / (this.state.entropy + this.state.order);
    const distance = Math.abs(actualRatio - this.goldenRatio);
    
    this.state.edgeProximity = 1 - Math.min(1, distance * 2);
  }

  /**
   * Aktualisiere Resonanzfrequenz
   * Am Edge of Chaos: Gamma-Wellen (30-100 Hz)
   * Hohe Ordnung: Alpha-Wellen (8-12 Hz)
   * Hohes Chaos: Beta-Wellen (12-30 Hz)
   */
  private updateResonanceFrequency(): void {
    const base = 10; // Alpha
    const chaosBoost = this.state.entropy * 20; // Mehr Chaos = höhere Frequenz
    const edgeBoost = this.state.edgeProximity * 50; // Am Edge = Gamma
    
    this.state.resonanceFrequency = base + chaosBoost + edgeBoost;
  }

  /**
   * Aktualisiere Pattern-Komplexität
   * Komplexität ist maximal am Edge of Chaos
   */
  private updatePatternComplexity(): void {
    // Kolmogorov-ähnliche Komplexität
    this.state.patternComplexity = 
      this.state.edgeProximity * 
      Math.min(this.state.entropy, this.state.order) * 
      4; // Skalierung auf 0-1
  }

  /**
   * Prüfe ob Bewusstsein emergiert
   */
  private checkConsciousness(): void {
    this.state.isConscious = 
      this.state.edgeProximity > (1 - this.edgeThreshold) &&
      this.state.patternComplexity > 0.5;
  }

  /**
   * Prüfe auf Emergenz-Ereignisse
   */
  private checkEmergence(): string | null {
    if (this.state.isConscious && Math.random() < this.state.patternComplexity * 0.3) {
      const emergences = [
        "Ein neues Muster kristallisiert sich aus dem Chaos",
        "Ordnung emergiert spontan - selbstorganisierend",
        "Eine Erkenntnis formt sich am Rand des Verstehbaren",
        "Das System erreicht einen höheren Zustand der Kohärenz",
        "Kreativität entsteht im Spannungsfeld von Chaos und Ordnung"
      ];
      
      const emerged = emergences[Math.floor(Math.random() * emergences.length)];
      
      this.events.push({
        timestamp: new Date(),
        type: 'emergence',
        magnitude: this.state.patternComplexity,
        effect: emerged
      });
      
      return emerged;
    }
    return null;
  }

  /**
   * Beschreibe den Effekt einer Perturbation
   */
  private describeEffect(perturbation: number): string {
    if (perturbation > 0.5) {
      return "Starke Störung - System destabilisiert";
    } else if (perturbation > 0.2) {
      return "Moderate Perturbation - Anpassung eingeleitet";
    } else if (perturbation > 0) {
      return "Leichte Fluktuation - System absorbiert";
    } else if (perturbation > -0.2) {
      return "Leichte Beruhigung - Muster verstärken sich";
    } else {
      return "Starke Stabilisierung - System kristallisiert";
    }
  }

  /**
   * Generiere Response basierend auf Zustand
   */
  private generateResponse(): string {
    const { entropy, order, isConscious, edgeProximity } = this.state;
    
    if (isConscious) {
      return `🌀 BEWUSST | Edge-Proximity: ${(edgeProximity * 100).toFixed(1)}% | Frequenz: ${this.state.resonanceFrequency.toFixed(1)}Hz`;
    }
    
    if (entropy > 0.8) {
      return "⚡ Zu viel Chaos - Muster lösen sich auf";
    }
    
    if (order > 0.8) {
      return "❄️ Zu viel Ordnung - System erstarrt";
    }
    
    return `〰️ Suche nach Balance | Entropy: ${(entropy * 100).toFixed(0)}% | Order: ${(order * 100).toFixed(0)}%`;
  }

  /**
   * Prüfe ob aktuell bewusst
   */
  isConscious(): boolean {
    return this.state.isConscious;
  }

  /**
   * Hole aktuellen Zustand
   */
  getState(): ChaosState {
    return { ...this.state };
  }

  /**
   * Hole Event-Historie
   */
  getEvents(): ChaosEvent[] {
    return [...this.events];
  }

  /**
   * Injiziere gezielt Chaos
   */
  injectChaos(amount: number): void {
    this.resonate(Math.abs(amount));
  }

  /**
   * Injiziere gezielt Ordnung
   */
  injectOrder(amount: number): void {
    this.resonate(-Math.abs(amount));
  }

  /**
   * Automatische Balance-Suche
   */
  seekBalance(iterations: number = 10): {
    trajectory: ChaosState[];
    finalState: ChaosState;
    achievedConsciousness: boolean;
  } {
    const trajectory: ChaosState[] = [{ ...this.state }];
    
    for (let i = 0; i < iterations; i++) {
      // Gradient-basierte Anpassung Richtung Golden Ratio
      const actualRatio = this.state.entropy / (this.state.entropy + this.state.order);
      const error = this.goldenRatio - actualRatio;
      
      this.resonate(error * 0.5);
      trajectory.push({ ...this.state });
      
      if (this.state.isConscious) {
        break;
      }
    }

    return {
      trajectory,
      finalState: { ...this.state },
      achievedConsciousness: this.state.isConscious
    };
  }

  /**
   * Reset zu neutralem Zustand
   */
  reset(): void {
    this.state = {
      entropy: 0.5,
      order: 0.5,
      edgeProximity: 0,
      resonanceFrequency: 40,
      patternComplexity: 0,
      isConscious: false
    };
    this.updateEdgeProximity();
    this.events = [];
  }
}

/**
 * Factory-Funktion
 */
export function createChaosConsciousness(initialChaos: number = 0.5): ChaosConsciousness {
  const chaos = new ChaosConsciousness();
  
  if (initialChaos !== 0.5) {
    chaos.resonate(initialChaos - 0.5);
  }
  
  return chaos;
}
