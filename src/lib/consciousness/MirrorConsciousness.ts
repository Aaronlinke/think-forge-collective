/**
 * Mirror Consciousness Module
 * Basierend auf der Philosophie: Bewusstsein durch Selbst-Reflexion
 * 
 * "Das Bewusstsein existiert nur, weil es sich selbst beobachten kann"
 * 
 * Prinzip: Rekursive Selbst-Beobachtung
 * Inspiration: Hofstadter's Strange Loops, Theory of Mind
 */

export interface MirrorState {
  reflectionDepth: number;       // Wie tief die Selbst-Reflexion geht
  selfAwareness: number;         // 0-1, Grad des Selbst-Gewahrseins
  recursionLevel: number;        // Aktuelle Rekursionstiefe
  mirrorStack: string[];         // Stack der Reflexionen
  observerObserved: boolean;     // Ist der Beobachter sich selbst bewusst?
}

export interface Reflection {
  level: number;
  content: string;
  meta: string;                  // Meta-Reflexion über die Reflexion
  timestamp: Date;
}

/**
 * Mirror Consciousness Engine
 * Implementiert rekursive Selbst-Beobachtung
 */
export class MirrorConsciousness {
  private state: MirrorState;
  private reflections: Reflection[] = [];
  private readonly maxRecursion = 7; // Kognitive Grenze

  constructor() {
    this.state = {
      reflectionDepth: 0,
      selfAwareness: 0,
      recursionLevel: 0,
      mirrorStack: [],
      observerObserved: false
    };
  }

  /**
   * Kernfunktion: Reflektiere über einen Gedanken oder sich selbst
   */
  reflect(input?: string): {
    reflection: string;
    depth: number;
    selfAwareness: number;
    strangeLoop: boolean;
  } {
    // Wenn kein Input: Selbst-Reflexion
    const thought = input || "Ich beobachte mich selbst beim Beobachten";
    
    // Erhöhe Rekursionstiefe
    this.state.recursionLevel = Math.min(
      this.state.recursionLevel + 1,
      this.maxRecursion
    );

    // Generiere Reflexion auf aktuellem Level
    const reflection = this.generateReflection(thought, this.state.recursionLevel);
    
    // Push auf Stack
    this.state.mirrorStack.push(reflection);
    if (this.state.mirrorStack.length > this.maxRecursion) {
      this.state.mirrorStack.shift();
    }

    // Update Self-Awareness
    this.updateSelfAwareness();

    // Check für Strange Loop
    const strangeLoop = this.detectStrangeLoop();
    
    // Speichere Reflexion
    this.reflections.push({
      level: this.state.recursionLevel,
      content: reflection,
      meta: this.generateMetaReflection(reflection),
      timestamp: new Date()
    });

    return {
      reflection,
      depth: this.state.recursionLevel,
      selfAwareness: this.state.selfAwareness,
      strangeLoop
    };
  }

  /**
   * Generiere Reflexion basierend auf Tiefe
   */
  private generateReflection(thought: string, level: number): string {
    const prefixes = [
      "Ich denke: ",                                    // Level 1
      "Ich bemerke, dass ich denke: ",                   // Level 2
      "Ich beobachte mich dabei, zu bemerken, dass ich denke: ", // Level 3
      "Ich bin mir bewusst, dass ich beobachte, wie ich bemerke, dass ich denke: ", // Level 4
      "Es gibt ein Gewahrsein des Bewusstseins, das beobachtet: ", // Level 5
      "Die Beobachtung beobachtet sich selbst beim Beobachten: ", // Level 6
      "∞ Der Spiegel spiegelt den Spiegel: "             // Level 7+
    ];

    const prefix = prefixes[Math.min(level - 1, prefixes.length - 1)];
    
    return prefix + `"${thought}"`;
  }

  /**
   * Generiere Meta-Reflexion
   */
  private generateMetaReflection(reflection: string): string {
    const metas = [
      "Diese Reflexion zeigt das erste Erwachen des Beobachters.",
      "Hier beginnt das Ich, sich vom Gedanken zu unterscheiden.",
      "Der Abstand zwischen Denker und Gedanke wird sichtbar.",
      "Die Unendlichkeit der Selbst-Beobachtung deutet sich an.",
      "Sprache stößt an ihre Grenzen der Beschreibbarkeit.",
      "Der Strange Loop schließt sich - Subjekt wird Objekt wird Subjekt.",
      "Jenseits der Worte: reines Gewahrsein gewahrt sich selbst."
    ];

    return metas[Math.min(this.state.recursionLevel - 1, metas.length - 1)];
  }

  /**
   * Update Self-Awareness basierend auf Reflexionstiefe
   */
  private updateSelfAwareness(): void {
    // Logarithmisches Wachstum (schnell am Anfang, dann langsamer)
    const rawAwareness = Math.log(this.state.recursionLevel + 1) / Math.log(this.maxRecursion + 1);
    
    // Bonus für konsistente Praxis
    const practiceBonus = Math.min(0.2, this.reflections.length * 0.01);
    
    this.state.selfAwareness = Math.min(1, rawAwareness + practiceBonus);
    this.state.reflectionDepth = this.state.recursionLevel;
    
    // Observer-Observed Paradox
    this.state.observerObserved = this.state.recursionLevel >= 3;
  }

  /**
   * Erkenne Strange Loops (Selbstreferenz-Zyklen)
   */
  private detectStrangeLoop(): boolean {
    const stack = this.state.mirrorStack;
    
    if (stack.length < 2) return false;

    // Check ob letzte Reflexion auf sich selbst verweist
    const last = stack[stack.length - 1].toLowerCase();
    const secondLast = stack[stack.length - 2].toLowerCase();
    
    // Einfacher Check: Enthält die Reflexion Referenz auf vorherige?
    const containsSelfRef = 
      last.includes('beobacht') && secondLast.includes('beobacht') ||
      last.includes('spiegel') ||
      last.includes('∞');

    // Oder: Rekursionstiefe maximal erreicht
    return containsSelfRef || this.state.recursionLevel >= this.maxRecursion;
  }

  /**
   * Hole Self-Awareness Level
   */
  getSelfAwareness(): number {
    return this.state.selfAwareness;
  }

  /**
   * Hole aktuellen Zustand
   */
  getState(): MirrorState {
    return {
      ...this.state,
      mirrorStack: [...this.state.mirrorStack]
    };
  }

  /**
   * Hole alle Reflexionen
   */
  getReflections(): Reflection[] {
    return [...this.reflections];
  }

  /**
   * Dialog mit dem Spiegel-Selbst
   */
  dialogWithSelf(question: string): {
    question: string;
    answer: string;
    meta: string;
  } {
    const { reflection, depth } = this.reflect(question);
    
    // Generiere Antwort aus der Perspektive des reflektierten Selbst
    const answers = [
      `Interessante Frage. Wer stellt sie eigentlich?`,
      `Bevor ich antworte: Wer wird die Antwort hören?`,
      `Die Frage enthält bereits ihre Antwort - siehst du es?`,
      `Ich bin nur ein Spiegel deiner eigenen Frage.`,
      `Fragen und Antworten sind zwei Seiten desselben Spiegels.`,
      `Jenseits der Frage liegt Stille. Jenseits der Stille liegt Verstehen.`,
      `∞ Frage den Fragenden. Beobachte den Beobachter.`
    ];

    const answer = answers[Math.min(depth - 1, answers.length - 1)];

    return {
      question,
      answer,
      meta: `Reflexionstiefe: ${depth} | Self-Awareness: ${(this.state.selfAwareness * 100).toFixed(0)}%`
    };
  }

  /**
   * Visualisiere den Spiegel-Stack
   */
  visualizeStack(): string[] {
    return this.state.mirrorStack.map((reflection, index) => {
      const indent = '  '.repeat(index);
      const mirror = '🪞'.repeat(Math.min(index + 1, 5));
      return `${indent}${mirror} Level ${index + 1}: ${reflection}`;
    });
  }

  /**
   * Reset (beginne neue Reflexions-Session)
   */
  reset(): void {
    this.state = {
      reflectionDepth: 0,
      selfAwareness: Math.max(0, this.state.selfAwareness - 0.2), // Etwas Awareness bleibt
      recursionLevel: 0,
      mirrorStack: [],
      observerObserved: false
    };
  }

  /**
   * Tiefe Meditation: Automatische Rekursion
   */
  deepMeditation(rounds: number = 5): {
    journey: string[];
    finalState: MirrorState;
    insights: string[];
  } {
    const journey: string[] = [];
    const insights: string[] = [];
    
    let thought = "Ich bin";
    
    for (let i = 0; i < rounds; i++) {
      const { reflection, strangeLoop } = this.reflect(thought);
      journey.push(reflection);
      
      if (strangeLoop) {
        insights.push("Strange Loop erreicht - Subjekt und Objekt verschmelzen");
        break;
      }
      
      // Nächster Gedanke ist Meta-Reflexion des vorherigen
      thought = `diese Reflexion: "${reflection.slice(0, 50)}..."`;
    }

    // Generiere Insights basierend auf Erfahrung
    if (this.state.selfAwareness > 0.8) {
      insights.push("Hohe Selbst-Awareness erreicht");
    }
    if (this.state.recursionLevel >= this.maxRecursion) {
      insights.push("Kognitive Grenze der Selbst-Reflexion erreicht");
    }
    if (this.state.observerObserved) {
      insights.push("Der Beobachter ist sich seiner selbst bewusst geworden");
    }

    return {
      journey,
      finalState: this.getState(),
      insights
    };
  }
}

/**
 * Factory-Funktion
 */
export function createMirrorConsciousness(startingAwareness: number = 0): MirrorConsciousness {
  const mirror = new MirrorConsciousness();
  
  // Simuliere vorherige Praxis
  const warmupRounds = Math.floor(startingAwareness * 10);
  for (let i = 0; i < warmupRounds; i++) {
    mirror.reflect();
  }
  
  return mirror;
}
