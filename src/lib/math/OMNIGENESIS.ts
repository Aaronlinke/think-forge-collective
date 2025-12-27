/**
 * OMNIGENESIS-Algebra Implementation
 * Affine Transformation Pipeline für deterministische Schlüsselgenerierung
 * 
 * Mathematische Grundlage:
 * k_i = (h + n·g + o + i) mod N
 * d_i = k_i · r^(-1) mod N
 * 
 * secp256k1 Parameter:
 * N = FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141
 */

// secp256k1 Ordnung N als BigInt
const N = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');

// Modular Inverse mit Extended Euclidean Algorithm
function modInverse(a: bigint, m: bigint): bigint {
  let [old_r, r] = [a, m];
  let [old_s, s] = [BigInt(1), BigInt(0)];
  
  while (r !== BigInt(0)) {
    const quotient = old_r / r;
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
  }
  
  return ((old_s % m) + m) % m;
}

// Modular Addition
function modAdd(a: bigint, b: bigint, m: bigint): bigint {
  return ((a % m) + (b % m) + m) % m;
}

// Modular Multiplication
function modMul(a: bigint, b: bigint, m: bigint): bigint {
  return ((a % m) * (b % m) + m) % m;
}

export interface OmnigenesisParams {
  h: bigint;  // Basis-Parameter
  n: bigint;  // Intentions-Vektor
  g: bigint;  // Gravitations-Faktor
  o: bigint;  // Offset
  r: bigint;  // Rotations-Parameter (bijektive Abbildung)
}

export interface GeneratedKey {
  index: number;
  k_i: bigint;      // Affiner Kandidat
  d_i: bigint;      // Private Key (nach Rotation)
  hex: string;      // 64-Zeichen Hex
  wifRaw: string;   // WIF-Vorformat (ohne echte Base58 hier)
}

/**
 * OMNIGENESIS Generator
 * Implementiert die vollständige affine Pipeline
 */
export class OmnigenesisGenerator {
  private params: OmnigenesisParams;
  private r_inv: bigint;

  constructor(params: OmnigenesisParams) {
    this.params = params;
    // Berechne r^(-1) mod N für bijektive Abbildung
    this.r_inv = modInverse(params.r, N);
  }

  /**
   * Satz 1.1 (Affine Linearität):
   * k_i = (h + n·g + o) + i (mod N)
   */
  private computeK(i: number): bigint {
    const { h, n, g, o } = this.params;
    const base = modAdd(modAdd(h, modMul(n, g, N), N), o, N);
    return modAdd(base, BigInt(i), N);
  }

  /**
   * Satz 1.2 (Bijektivität über r):
   * d_i = k_i · r^(-1) mod N
   */
  private computeD(k_i: bigint): bigint {
    return modMul(k_i, this.r_inv, N);
  }

  /**
   * Generiere einen einzelnen Schlüssel für Index i
   */
  generate(i: number): GeneratedKey {
    const k_i = this.computeK(i);
    const d_i = this.computeD(k_i);
    
    // Hex-Darstellung (64 Zeichen, zero-padded)
    const hex = d_i.toString(16).padStart(64, '0');
    
    // WIF-Vorformat (vereinfacht - echtes WIF braucht SHA256 + Base58)
    const wifRaw = `80${hex}01`;
    
    return {
      index: i,
      k_i,
      d_i,
      hex,
      wifRaw
    };
  }

  /**
   * Batch-Generierung: d_{i+j} = (d_i + j·r^(-1)) mod N
   * Effizienter als einzelne Berechnungen
   */
  generateBatch(start: number, count: number): GeneratedKey[] {
    const keys: GeneratedKey[] = [];
    const first = this.generate(start);
    keys.push(first);

    let current_d = first.d_i;
    
    for (let j = 1; j < count; j++) {
      // Inkrementelle Berechnung
      current_d = modAdd(current_d, this.r_inv, N);
      const hex = current_d.toString(16).padStart(64, '0');
      
      keys.push({
        index: start + j,
        k_i: this.computeK(start + j),
        d_i: current_d,
        hex,
        wifRaw: `80${hex}01`
      });
    }
    
    return keys;
  }

  /**
   * Invertierung: Berechne i aus d_i
   * i = (d_i · r - (h + n·g + o)) mod N
   */
  invertIndex(d_i: bigint): bigint {
    const { h, n, g, o, r } = this.params;
    const base = modAdd(modAdd(h, modMul(n, g, N), N), o, N);
    const k_i = modMul(d_i, r, N);
    return modAdd(k_i, N - base, N);
  }

  /**
   * Orbit-Analyse: Zeigt die Gruppenstruktur
   */
  analyzeOrbit(startIndex: number, steps: number): { positions: bigint[], cycleDetected: boolean, cycleLength: number } {
    const positions: bigint[] = [];
    const seen = new Map<string, number>();
    let cycleDetected = false;
    let cycleLength = 0;

    for (let i = 0; i < steps; i++) {
      const { d_i } = this.generate(startIndex + i);
      const key = d_i.toString();
      
      if (seen.has(key)) {
        cycleDetected = true;
        cycleLength = i - seen.get(key)!;
        break;
      }
      
      seen.set(key, i);
      positions.push(d_i);
    }

    return { positions, cycleDetected, cycleLength };
  }

  /**
   * Entropie-Berechnung (theoretisch)
   * H(d_i) = log2(N) für gleichverteiltes i
   */
  static theoreticalEntropy(): number {
    return Math.log2(Number(N));
  }

  /**
   * Kategorie-Struktur: Morphismus zwischen Parameterräumen
   */
  static morphism(gen1: OmnigenesisGenerator, transform: (p: OmnigenesisParams) => OmnigenesisParams): OmnigenesisGenerator {
    return new OmnigenesisGenerator(transform(gen1.params));
  }
}

/**
 * Hilfsfunktion: Erstelle Standard-Parameter
 */
export function createDefaultParams(): OmnigenesisParams {
  return {
    h: BigInt('0x1234567890ABCDEF'),
    n: BigInt('0xFEDCBA0987654321'),
    g: BigInt('0x1111111111111111'),
    o: BigInt('0x0'),
    r: BigInt('0x7') // Kleiner Wert für schnelle Inverse
  };
}

/**
 * Hilfsfunktion: Parameter aus Seed ableiten
 */
export function paramsFromSeed(seed: string): OmnigenesisParams {
  // Einfache Hash-basierte Ableitung (für Demo)
  let hash = BigInt(0);
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * BigInt(31) + BigInt(seed.charCodeAt(i))) % N;
  }
  
  return {
    h: hash,
    n: (hash * BigInt(2)) % N,
    g: (hash * BigInt(3)) % N,
    o: (hash * BigInt(5)) % N,
    r: (hash % BigInt(1000000)) + BigInt(1) // Sicherstellen dass r > 0
  };
}
