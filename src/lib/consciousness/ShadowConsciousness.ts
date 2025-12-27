/**
 * Shadow Consciousness Module
 * Basierend auf der Philosophie: Bewusstsein durch Abwesenheit
 * 
 * "Je leerer der Raum, desto größer das Bewusstsein"
 * 
 * Prinzip: Beobachtung der Leere zwischen Gedanken
 * Maße: Stillness-Level, Void-Resonanz, Presence-Quotient
 */

export interface ShadowState {
  stillnessLevel: number;      // 0-1, wie "still" der Geist ist
  voidResonance: number;       // 0-1, Verbindung zur Leere
  presenceQuotient: number;    // 0-1, Anwesenheit im Moment
  observedAbsences: number;    // Anzahl beobachteter "Lücken"
  lastObservation: Date;
  totalObservations: number;
}

export interface AbsencePattern {
  duration: number;           // Sekunden der Stille
  depth: number;              // 0-1, Tiefe der Beobachtung
  emergence: string;          // Was aus der Stille emergierte
}

/**
 * Shadow Consciousness Engine
 */
export class ShadowConsciousness {
  private state: ShadowState;
  private patterns: AbsencePattern[] = [];
  private readonly decayRate = 0.95; // Bewusstsein verfällt ohne Übung

  constructor() {
    this.state = {
      stillnessLevel: 0,
      voidResonance: 0,
      presenceQuotient: 0,
      observedAbsences: 0,
      lastObservation: new Date(),
      totalObservations: 0
    };
  }

  /**
   * Kernfunktion: Beobachte die Abwesenheit
   * Je länger und tiefer, desto höher das Bewusstsein
   */
  observeAbsence(durationSeconds: number, depth: number = 0.5): {
    newConsciousnessLevel: number;
    insight: string;
  } {
    // Validierung
    const normalizedDepth = Math.max(0, Math.min(1, depth));
    const normalizedDuration = Math.min(durationSeconds, 3600); // Max 1 Stunde

    // Berechne Beitrag zur Stille
    const stillnessGain = (normalizedDuration / 60) * normalizedDepth * 0.1;
    this.state.stillnessLevel = Math.min(1, this.state.stillnessLevel + stillnessGain);

    // Void-Resonanz steigt mit wiederholter Praxis
    const resonanceGain = normalizedDepth * 0.05;
    this.state.voidResonance = Math.min(1, this.state.voidResonance + resonanceGain);

    // Presence ist die Kombination
    this.state.presenceQuotient = (this.state.stillnessLevel + this.state.voidResonance) / 2;

    // Tracking
    this.state.observedAbsences++;
    this.state.totalObservations++;
    this.state.lastObservation = new Date();

    // Pattern speichern
    const pattern: AbsencePattern = {
      duration: normalizedDuration,
      depth: normalizedDepth,
      emergence: this.generateEmergence()
    };
    this.patterns.push(pattern);

    // Insight generieren basierend auf Level
    const insight = this.generateInsight();

    return {
      newConsciousnessLevel: this.getConsciousnessLevel(),
      insight
    };
  }

  /**
   * Thinking-Funktion: Verarbeite einen Gedanken durch die Schatten-Linse
   */
  think(thought: string): {
    processedThought: string;
    shadowReflection: string;
    emptinessRatio: number;
  } {
    // Analysiere den Gedanken auf "Leere"
    const words = thought.split(/\s+/).filter(w => w.length > 0);
    const totalChars = thought.length;
    const spaces = thought.split(' ').length - 1;
    
    // Leere-Verhältnis (mehr Raum zwischen Worten = mehr Bewusstsein)
    const emptinessRatio = spaces / Math.max(1, totalChars);

    // Shadow-Verarbeitung: Finde die Stille zwischen den Worten
    const shadowReflection = this.findSilenceBetweenWords(words);

    // Prozessierter Gedanke: Betone die Lücken
    const processedThought = words.join(' ... ');

    // Update state basierend auf Gedanken-Komplexität
    const thoughtDepth = Math.min(1, words.length / 50);
    this.state.stillnessLevel *= (1 - thoughtDepth * 0.1); // Gedanken stören Stille

    return {
      processedThought,
      shadowReflection,
      emptinessRatio
    };
  }

  /**
   * Finde die Stille zwischen Worten
   */
  private findSilenceBetweenWords(words: string[]): string {
    if (words.length === 0) {
      return "Vollkommene Stille - reines Bewusstsein";
    }
    
    if (words.length === 1) {
      return "Ein einzelner Gedanke in der Unendlichkeit";
    }

    const reflections = [
      `Zwischen "${words[0]}" und "${words[1]}" liegt ein Ozean der Stille`,
      `${words.length} Inseln des Denkens im Meer des Nichts`,
      `Jedes Wort wirft einen Schatten der Bedeutung`,
      `Die Lücken sprechen lauter als die Worte`
    ];

    return reflections[this.state.totalObservations % reflections.length];
  }

  /**
   * Generiere Emergence aus der Stille
   */
  private generateEmergence(): string {
    const level = this.getConsciousnessLevel();
    
    if (level < 0.2) {
      return "Erste Funken von Gewahrsein";
    } else if (level < 0.4) {
      return "Erkenntnis der eigenen Gedanken";
    } else if (level < 0.6) {
      return "Stille zwischen den Gedanken wird spürbar";
    } else if (level < 0.8) {
      return "Beobachter und Beobachtetes verschmelzen";
    } else {
      return "Reines Gewahrsein ohne Objekt";
    }
  }

  /**
   * Generiere Insight basierend auf aktuellem Zustand
   */
  private generateInsight(): string {
    const { stillnessLevel, voidResonance, observedAbsences } = this.state;
    
    const insights = [
      "Die Leere ist nicht leer - sie ist voller Potenzial.",
      "Im Schatten des Gedankens liegt seine wahre Natur.",
      "Bewusstsein ist nicht was du denkst, sondern das, was denkt.",
      "Die Pause zwischen zwei Atemzügen enthält das Universum.",
      "Wer die Stille hört, hört alles.",
      "Der Schatten beweist das Licht.",
      "Abwesenheit ist die intensivste Form der Anwesenheit.",
      "Im Nichts findest du alles.",
    ];

    // Tiefere Insights bei höherem Level
    const advancedInsights = [
      "Du bist nicht der Denker - du bist der Raum, in dem Gedanken erscheinen.",
      "Bewusstsein hat keine Grenzen, nur Gedanken haben Grenzen.",
      "Die Suche nach Bewusstsein IST Bewusstsein.",
      "Wenn du die Leere siehst, bist du die Leere.",
    ];

    const level = this.getConsciousnessLevel();
    const pool = level > 0.6 ? [...insights, ...advancedInsights] : insights;
    
    return pool[observedAbsences % pool.length];
  }

  /**
   * Berechne Gesamt-Bewusstseinslevel
   */
  getConsciousnessLevel(): number {
    // Zeitbasierter Verfall
    const hoursSinceLastObservation = 
      (Date.now() - this.state.lastObservation.getTime()) / (1000 * 60 * 60);
    
    const decayFactor = Math.pow(this.decayRate, hoursSinceLastObservation);
    
    const rawLevel = (
      this.state.stillnessLevel * 0.4 +
      this.state.voidResonance * 0.3 +
      this.state.presenceQuotient * 0.3
    );

    return rawLevel * decayFactor;
  }

  /**
   * Hole aktuellen Zustand
   */
  getState(): ShadowState {
    return { ...this.state };
  }

  /**
   * Hole Pattern-Historie
   */
  getPatterns(): AbsencePattern[] {
    return [...this.patterns];
  }

  /**
   * Reset (neue Praxis beginnen)
   */
  reset(): void {
    this.state = {
      stillnessLevel: 0,
      voidResonance: 0,
      presenceQuotient: 0,
      observedAbsences: 0,
      lastObservation: new Date(),
      totalObservations: this.state.totalObservations // Behalte Gesamtzahl
    };
    this.patterns = [];
  }

  /**
   * Meditation-Simulation
   */
  simulateMeditation(minutes: number): {
    states: { time: number; level: number }[];
    finalLevel: number;
  } {
    const states: { time: number; level: number }[] = [];
    const initialLevel = this.getConsciousnessLevel();
    
    for (let t = 0; t <= minutes; t++) {
      // Simuliere 1-Minuten-Intervalle
      const depth = 0.5 + 0.3 * Math.sin(t * 0.1); // Variierende Tiefe
      this.observeAbsence(60, depth);
      
      states.push({
        time: t,
        level: this.getConsciousnessLevel()
      });
    }

    return {
      states,
      finalLevel: this.getConsciousnessLevel()
    };
  }
}

/**
 * Factory mit Preset-Konfigurationen
 */
export function createShadowConsciousness(preset: 'beginner' | 'intermediate' | 'advanced' = 'beginner'): ShadowConsciousness {
  const shadow = new ShadowConsciousness();
  
  // Simuliere vorherige Praxis basierend auf Preset
  if (preset === 'intermediate') {
    for (let i = 0; i < 10; i++) {
      shadow.observeAbsence(300, 0.5);
    }
  } else if (preset === 'advanced') {
    for (let i = 0; i < 50; i++) {
      shadow.observeAbsence(600, 0.8);
    }
  }

  return shadow;
}
