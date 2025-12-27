/**
 * Tick-Tack-Engine: Dynamisches System mit Vorwärts- und Rückwärts-Iteration
 * 
 * Rekursive Definitionen:
 * H(t+1) = H(t) + α·N(t) - β·G(t)
 * N(t+1) = γ·N(t) + δ·|H(t)|
 * G(t+1) = G(t) + η·(H(t) + N(t))
 * 
 * Koeffizienten (empirisch bestimmt):
 * α = 0.245 (Intention-zu-Realität Kopplung)
 * β = 0.152 (Gravitations-Dämpfung)
 * γ = 0.985 (Intentions-Persistenz)
 * δ = 0.112 (Realitäts-Feedback)
 * η = 0.088 (Gravitations-Akkumulation)
 */

export interface TickTackState {
  t: number;      // Zeitschritt
  H: number;      // Realitäts-Koordinate (Horizont)
  N: number;      // Intentions-Vektor (Wille/Fokus)
  G: number;      // Gravitations-Akkumulator
}

export interface TickTackCoefficients {
  alpha: number;  // α - Intention→Realität
  beta: number;   // β - Gravitations-Dämpfung
  gamma: number;  // γ - Intentions-Persistenz
  delta: number;  // δ - Realitäts-Feedback
  eta: number;    // η - Gravitations-Wachstum
}

export const DEFAULT_COEFFICIENTS: TickTackCoefficients = {
  alpha: 0.245,
  beta: 0.152,
  gamma: 0.985,
  delta: 0.112,
  eta: 0.088
};

/**
 * Tick-Tack Engine
 * Implementiert vorwärts und rückwärts Zeitberechnung
 */
export class TickTackEngine {
  private coefficients: TickTackCoefficients;
  private history: TickTackState[] = [];

  constructor(coefficients: TickTackCoefficients = DEFAULT_COEFFICIENTS) {
    this.coefficients = coefficients;
  }

  /**
   * Initialisiere das System mit Anfangszustand
   */
  initialize(H0: number, N0: number, G0: number): TickTackState {
    const state: TickTackState = { t: 0, H: H0, N: N0, G: G0 };
    this.history = [state];
    return state;
  }

  /**
   * VORWÄRTS-Schritt: t → t+1
   * 
   * H(t+1) = H(t) + α·N(t) - β·G(t)
   * N(t+1) = γ·N(t) + δ·|H(t)|
   * G(t+1) = G(t) + η·(H(t) + N(t))
   */
  stepForward(state: TickTackState): TickTackState {
    const { alpha, beta, gamma, delta, eta } = this.coefficients;
    const { t, H, N, G } = state;

    const H_next = H + alpha * N - beta * G;
    const N_next = gamma * N + delta * Math.abs(H);
    const G_next = G + eta * (H + N);

    const newState: TickTackState = {
      t: t + 1,
      H: H_next,
      N: N_next,
      G: G_next
    };

    this.history.push(newState);
    return newState;
  }

  /**
   * RÜCKWÄRTS-Schritt: t → t-1
   * Invertierte Gleichungen (algebraische Umformung)
   * 
   * Von:
   * H(t) = H(t-1) + α·N(t-1) - β·G(t-1)
   * N(t) = γ·N(t-1) + δ·|H(t-1)|
   * G(t) = G(t-1) + η·(H(t-1) + N(t-1))
   * 
   * Zu:
   * Iterative Näherung weil nicht-linear (|H|)
   */
  stepBackward(state: TickTackState): TickTackState {
    const { alpha, beta, gamma, delta, eta } = this.coefficients;
    const { t, H, N, G } = state;

    if (t <= 0) {
      console.warn('Kann nicht vor t=0 zurückgehen');
      return state;
    }

    // Iterative Rekonstruktion (Newton-ähnlich)
    let H_prev = H;
    let N_prev = N / gamma; // Erste Schätzung
    let G_prev = G;

    // 10 Iterationen für Konvergenz
    for (let iter = 0; iter < 10; iter++) {
      // Schätze H_prev aus N_prev und G_prev
      H_prev = H - alpha * N_prev + beta * G_prev;
      
      // Korrigiere N_prev
      N_prev = (N - delta * Math.abs(H_prev)) / gamma;
      
      // Korrigiere G_prev
      G_prev = G - eta * (H_prev + N_prev);
    }

    const prevState: TickTackState = {
      t: t - 1,
      H: H_prev,
      N: N_prev,
      G: G_prev
    };

    return prevState;
  }

  /**
   * Berechne Trajektorie von t=-T_back bis t=+T_forward
   */
  computeFullTrajectory(
    H0: number, 
    N0: number, 
    G0: number, 
    T_back: number, 
    T_forward: number
  ): TickTackState[] {
    const trajectory: TickTackState[] = [];
    
    // Starte bei t=0
    let current = this.initialize(H0, N0, G0);
    
    // Rückwärts rechnen
    const backwardStates: TickTackState[] = [];
    let backState = current;
    for (let i = 0; i < T_back; i++) {
      backState = this.stepBackward(backState);
      backwardStates.unshift(backState);
    }
    
    // Kombiniere: backward + [t=0] + forward
    trajectory.push(...backwardStates);
    trajectory.push(current);
    
    // Vorwärts rechnen
    for (let i = 0; i < T_forward; i++) {
      current = this.stepForward(current);
      trajectory.push(current);
    }
    
    return trajectory;
  }

  /**
   * Energie des Systems (invariante Größe?)
   * E(t) = H² + N² + G² - 2·H·N·G
   */
  computeEnergy(state: TickTackState): number {
    const { H, N, G } = state;
    return H * H + N * N + G * G - 2 * H * N * G;
  }

  /**
   * Phasenraum-Analyse: Attraktor-Erkennung
   */
  detectAttractor(states: TickTackState[]): {
    hasAttractor: boolean;
    attractorCenter?: { H: number; N: number; G: number };
    attractorRadius?: number;
  } {
    if (states.length < 10) {
      return { hasAttractor: false };
    }

    // Letzte 50% der Trajektorie analysieren
    const tail = states.slice(Math.floor(states.length / 2));
    
    // Mittelwert berechnen
    const avgH = tail.reduce((sum, s) => sum + s.H, 0) / tail.length;
    const avgN = tail.reduce((sum, s) => sum + s.N, 0) / tail.length;
    const avgG = tail.reduce((sum, s) => sum + s.G, 0) / tail.length;
    
    // Standardabweichung als "Radius"
    const variance = tail.reduce((sum, s) => {
      return sum + (s.H - avgH) ** 2 + (s.N - avgN) ** 2 + (s.G - avgG) ** 2;
    }, 0) / tail.length;
    
    const radius = Math.sqrt(variance);
    
    // Attraktor wenn Radius klein genug
    const hasAttractor = radius < 0.5;
    
    return {
      hasAttractor,
      attractorCenter: { H: avgH, N: avgN, G: avgG },
      attractorRadius: radius
    };
  }

  /**
   * Sensitivitäts-Analyse (Chaos-Indikator)
   * Kleine Änderung in Anfangsbedingung → große Änderung in Ergebnis?
   */
  lyapunovExponent(H0: number, N0: number, G0: number, steps: number = 100): number {
    const epsilon = 1e-8;
    
    // Originale Trajektorie
    const original = this.computeFullTrajectory(H0, N0, G0, 0, steps);
    
    // Perturbierte Trajektorie
    const perturbed = this.computeFullTrajectory(H0 + epsilon, N0, G0, 0, steps);
    
    // Logarithmische Divergenz
    let sumLogRatio = 0;
    for (let i = 1; i < original.length; i++) {
      const dist = Math.sqrt(
        (original[i].H - perturbed[i].H) ** 2 +
        (original[i].N - perturbed[i].N) ** 2 +
        (original[i].G - perturbed[i].G) ** 2
      );
      if (dist > 0) {
        sumLogRatio += Math.log(dist / epsilon);
      }
    }
    
    return sumLogRatio / steps;
  }

  /**
   * Getter für Historie
   */
  getHistory(): TickTackState[] {
    return [...this.history];
  }

  /**
   * Getter für Koeffizienten
   */
  getCoefficients(): TickTackCoefficients {
    return { ...this.coefficients };
  }

  /**
   * Setter für Koeffizienten
   */
  setCoefficients(coefficients: Partial<TickTackCoefficients>): void {
    this.coefficients = { ...this.coefficients, ...coefficients };
  }
}

/**
 * Helfer: Formatiere Zustand für Anzeige
 */
export function formatState(state: TickTackState, precision: number = 4): string {
  return `t=${state.t}: H=${state.H.toFixed(precision)}, N=${state.N.toFixed(precision)}, G=${state.G.toFixed(precision)}`;
}
