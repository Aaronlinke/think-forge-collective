/**
 * SVRC - Self-Verifying Reality Compiler
 * Logik-Prüfsystem mit Paradox-Erkennung
 * 
 * Komponenten:
 * 1. Axiom-System: Grundlegende Wahrheiten
 * 2. Paradox-Engine: Widerspruchserkennung (Tarjan SCC)
 * 3. Decision-Engine: TRUE / FALSE / UNDECIDABLE
 */

export type TruthValue = 'TRUE' | 'FALSE' | 'UNDECIDABLE' | 'PARADOX';

export interface Axiom {
  id: string;
  statement: string;
  value: boolean;
  dependencies: string[]; // IDs anderer Axiome
}

export interface LogicalStatement {
  id: string;
  statement: string;
  type: 'AXIOM' | 'DERIVED' | 'QUERY';
  dependencies: string[];
}

export interface EvaluationResult {
  statement: string;
  value: TruthValue;
  confidence: number; // 0-1
  reasoning: string[];
  paradoxChain?: string[];
}

/**
 * Tarjan's Strongly Connected Components (SCC) Algorithmus
 * Findet Zyklen im Abhängigkeitsgraphen → Paradoxien
 */
class TarjanSCC {
  private index = 0;
  private stack: string[] = [];
  private onStack = new Set<string>();
  private indices = new Map<string, number>();
  private lowlinks = new Map<string, number>();
  private sccs: string[][] = [];

  constructor(private graph: Map<string, string[]>) {}

  findSCCs(): string[][] {
    this.index = 0;
    this.stack = [];
    this.onStack.clear();
    this.indices.clear();
    this.lowlinks.clear();
    this.sccs = [];

    for (const node of this.graph.keys()) {
      if (!this.indices.has(node)) {
        this.strongconnect(node);
      }
    }

    return this.sccs;
  }

  private strongconnect(v: string): void {
    this.indices.set(v, this.index);
    this.lowlinks.set(v, this.index);
    this.index++;
    this.stack.push(v);
    this.onStack.add(v);

    const neighbors = this.graph.get(v) || [];
    for (const w of neighbors) {
      if (!this.indices.has(w)) {
        this.strongconnect(w);
        this.lowlinks.set(v, Math.min(
          this.lowlinks.get(v)!,
          this.lowlinks.get(w)!
        ));
      } else if (this.onStack.has(w)) {
        this.lowlinks.set(v, Math.min(
          this.lowlinks.get(v)!,
          this.indices.get(w)!
        ));
      }
    }

    if (this.lowlinks.get(v) === this.indices.get(v)) {
      const scc: string[] = [];
      let w: string;
      do {
        w = this.stack.pop()!;
        this.onStack.delete(w);
        scc.push(w);
      } while (w !== v);
      
      if (scc.length > 1) {
        this.sccs.push(scc);
      }
    }
  }
}

/**
 * SVRC Decision Engine
 */
export class SVRCDecisionEngine {
  private axioms: Map<string, Axiom> = new Map();
  private statements: Map<string, LogicalStatement> = new Map();
  private evaluationCache: Map<string, EvaluationResult> = new Map();

  constructor() {
    this.initializeBaseAxioms();
  }

  /**
   * Basis-Axiome (mathematische Grundlagen)
   */
  private initializeBaseAxioms(): void {
    const baseAxioms: Axiom[] = [
      {
        id: 'identity',
        statement: 'A = A (Identität)',
        value: true,
        dependencies: []
      },
      {
        id: 'non-contradiction',
        statement: '¬(A ∧ ¬A) (Widerspruchsfreiheit)',
        value: true,
        dependencies: []
      },
      {
        id: 'excluded-middle',
        statement: 'A ∨ ¬A (Ausgeschlossenes Drittes)',
        value: true,
        dependencies: []
      },
      {
        id: 'modus-ponens',
        statement: '(A ∧ (A→B)) → B',
        value: true,
        dependencies: []
      },
      {
        id: 'hash-irreversible',
        statement: 'H(x) → x ist nicht effizient berechenbar',
        value: true,
        dependencies: []
      },
      {
        id: 'ecdlp-hard',
        statement: 'Q = d·G → d ist nicht effizient berechenbar',
        value: true,
        dependencies: []
      }
    ];

    for (const axiom of baseAxioms) {
      this.axioms.set(axiom.id, axiom);
    }
  }

  /**
   * Füge neues Axiom hinzu
   */
  addAxiom(id: string, statement: string, value: boolean, dependencies: string[] = []): void {
    this.axioms.set(id, { id, statement, value, dependencies });
    this.evaluationCache.clear();
  }

  /**
   * Füge Statement zur Evaluation hinzu
   */
  addStatement(id: string, statement: string, dependencies: string[] = []): void {
    this.statements.set(id, {
      id,
      statement,
      type: 'DERIVED',
      dependencies
    });
    this.evaluationCache.clear();
  }

  /**
   * Paradox-Erkennung mit Tarjan SCC
   */
  detectParadoxes(): string[][] {
    const graph = new Map<string, string[]>();
    
    // Baue Abhängigkeitsgraph
    for (const [id, axiom] of this.axioms) {
      graph.set(id, axiom.dependencies);
    }
    for (const [id, stmt] of this.statements) {
      graph.set(id, stmt.dependencies);
    }

    const tarjan = new TarjanSCC(graph);
    return tarjan.findSCCs();
  }

  /**
   * Hauptfunktion: Evaluiere eine Aussage
   */
  evaluate(query: string): EvaluationResult {
    // Check Cache
    if (this.evaluationCache.has(query)) {
      return this.evaluationCache.get(query)!;
    }

    const reasoning: string[] = [];
    let value: TruthValue = 'UNDECIDABLE';
    let confidence = 0;

    // 1. Check auf bekannte Axiome
    for (const [id, axiom] of this.axioms) {
      if (this.matchesStatement(query, axiom.statement)) {
        value = axiom.value ? 'TRUE' : 'FALSE';
        confidence = 1;
        reasoning.push(`Matched Axiom [${id}]: ${axiom.statement}`);
        break;
      }
    }

    // 2. Check auf Paradoxien
    const paradoxes = this.detectParadoxes();
    if (paradoxes.length > 0) {
      for (const scc of paradoxes) {
        if (scc.some(id => this.containsReference(query, id))) {
          value = 'PARADOX';
          confidence = 0;
          reasoning.push(`Zirkuläre Abhängigkeit erkannt: ${scc.join(' ↔ ')}`);
          
          const result: EvaluationResult = {
            statement: query,
            value,
            confidence,
            reasoning,
            paradoxChain: scc
          };
          this.evaluationCache.set(query, result);
          return result;
        }
      }
    }

    // 3. Pattern-basierte Analyse
    const patterns = this.analyzePatterns(query);
    reasoning.push(...patterns.reasoning);
    
    if (patterns.determined) {
      value = patterns.value;
      confidence = patterns.confidence;
    }

    // 4. Kryptographische Statements
    const cryptoResult = this.analyzeCryptoStatement(query);
    if (cryptoResult.determined) {
      value = cryptoResult.value;
      confidence = cryptoResult.confidence;
      reasoning.push(...cryptoResult.reasoning);
    }

    const result: EvaluationResult = {
      statement: query,
      value,
      confidence,
      reasoning
    };

    this.evaluationCache.set(query, result);
    return result;
  }

  /**
   * Pattern-Analyse für logische Aussagen
   */
  private analyzePatterns(query: string): {
    determined: boolean;
    value: TruthValue;
    confidence: number;
    reasoning: string[];
  } {
    const reasoning: string[] = [];
    const lowerQuery = query.toLowerCase();

    // Tautologien
    if (lowerQuery.includes('oder nicht') || 
        lowerQuery.includes('or not') ||
        lowerQuery.match(/\bA\s*(oder|or)\s*¬A\b/i)) {
      return {
        determined: true,
        value: 'TRUE',
        confidence: 1,
        reasoning: ['Tautologie erkannt (A ∨ ¬A)']
      };
    }

    // Kontradiktionen
    if (lowerQuery.includes('und nicht zugleich') ||
        lowerQuery.match(/\bA\s*(und|and)\s*¬A\b/i)) {
      return {
        determined: true,
        value: 'FALSE',
        confidence: 1,
        reasoning: ['Kontradiktion erkannt (A ∧ ¬A)']
      };
    }

    // Selbstreferenz-Paradoxien
    if (lowerQuery.includes('diese aussage ist falsch') ||
        lowerQuery.includes('this statement is false') ||
        lowerQuery.includes('lügner-paradox')) {
      return {
        determined: true,
        value: 'PARADOX',
        confidence: 1,
        reasoning: ['Selbstreferenz-Paradox (Lügner-Typ)']
      };
    }

    // WENN-DANN Konstrukte
    const wennDann = query.match(/wenn\s+(.+?)\s+dann\s+(.+)/i);
    if (wennDann) {
      reasoning.push(`Konditional erkannt: WENN [${wennDann[1]}] DANN [${wennDann[2]}]`);
      // Weitere Analyse der Bedingung könnte hier erfolgen
    }

    return {
      determined: false,
      value: 'UNDECIDABLE',
      confidence: 0.5,
      reasoning
    };
  }

  /**
   * Kryptographie-spezifische Analyse
   */
  private analyzeCryptoStatement(query: string): {
    determined: boolean;
    value: TruthValue;
    confidence: number;
    reasoning: string[];
  } {
    const reasoning: string[] = [];
    const lowerQuery = query.toLowerCase();

    // SHA-256 Umkehrbarkeit
    if (lowerQuery.includes('sha256') || lowerQuery.includes('sha-256')) {
      if (lowerQuery.includes('umkehr') || lowerQuery.includes('revers') || 
          lowerQuery.includes('rückwärts') || lowerQuery.includes('invert')) {
        return {
          determined: true,
          value: 'FALSE',
          confidence: 0.999,
          reasoning: ['SHA-256 ist kryptographisch sicher und nicht effizient umkehrbar (Axiom hash-irreversible)']
        };
      }
    }

    // ECDLP (Discrete Log Problem)
    if (lowerQuery.includes('privat') && lowerQuery.includes('public') &&
        (lowerQuery.includes('berech') || lowerQuery.includes('find'))) {
      return {
        determined: true,
        value: 'FALSE',
        confidence: 0.999,
        reasoning: ['ECDLP auf secp256k1 ist rechnerisch unlösbar (Axiom ecdlp-hard)']
      };
    }

    // Nonce-Wiederverwendung
    if (lowerQuery.includes('nonce') && 
        (lowerQuery.includes('wiederverw') || lowerQuery.includes('reuse'))) {
      return {
        determined: true,
        value: 'TRUE',
        confidence: 1,
        reasoning: ['Nonce-Wiederverwendung in ECDSA ermöglicht Schlüssel-Berechnung: d = (s₁-s₂)⁻¹·(H(m₁)·s₂ - H(m₂)·s₁) mod N']
      };
    }

    // Lineare Nonces
    if (lowerQuery.includes('linear') && lowerQuery.includes('nonce')) {
      return {
        determined: true,
        value: 'TRUE',
        confidence: 1,
        reasoning: ['Lineare/vorhersagbare Nonces sind unsicher und ermöglichen Schlüssel-Rekonstruktion']
      };
    }

    return {
      determined: false,
      value: 'UNDECIDABLE',
      confidence: 0.5,
      reasoning
    };
  }

  /**
   * Hilfsfunktion: Statement-Matching
   */
  private matchesStatement(query: string, statement: string): boolean {
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9äöüß]/g, '');
    return normalize(query).includes(normalize(statement)) ||
           normalize(statement).includes(normalize(query));
  }

  /**
   * Hilfsfunktion: Referenz-Check
   */
  private containsReference(query: string, id: string): boolean {
    return query.toLowerCase().includes(id.toLowerCase());
  }

  /**
   * Alle Axiome abrufen
   */
  getAxioms(): Axiom[] {
    return Array.from(this.axioms.values());
  }

  /**
   * Axiom löschen
   */
  removeAxiom(id: string): boolean {
    const result = this.axioms.delete(id);
    if (result) {
      this.evaluationCache.clear();
    }
    return result;
  }

  /**
   * Cache leeren
   */
  clearCache(): void {
    this.evaluationCache.clear();
  }
}

/**
 * Factory-Funktion für Standard-Engine
 */
export function createSVRCEngine(): SVRCDecisionEngine {
  const engine = new SVRCDecisionEngine();
  
  // Zusätzliche domänenspezifische Axiome
  engine.addAxiom(
    'entropy-256',
    '256-bit Entropie ist unknackbar',
    true,
    ['ecdlp-hard']
  );
  
  engine.addAxiom(
    'deterministic-unsafe',
    'Deterministische lineare Schlüssel sind unsicher',
    true,
    []
  );

  return engine;
}
