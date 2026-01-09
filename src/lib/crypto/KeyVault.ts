// KeyVault - Sichere Speicherung und Verwaltung von echten OMNIGENESIS Keys
// FIXED: Keine Pseudo-WIFs mehr, echte Key-Verwaltung

import { privateKeyToWIF } from './BitcoinUtils';

export interface VaultKey {
  index: number;
  wif: string;
  hex: string;
  entropy: number;
  generatedAt: number;
  linkedCycle?: number;
  linkedChaos?: number;
  source?: 'imported' | 'generated' | 'sample';
}

export interface KeyAnalysis {
  totalKeys: number;
  entropyDistribution: { low: number; medium: number; high: number };
  indexRange: { min: number; max: number };
  uniquePatterns: string[];
  sources: { imported: number; generated: number; sample: number };
}

export class KeyVault {
  private keys: Map<number, VaultKey> = new Map();
  private wifIndex: Map<string, number> = new Map();
  private hexIndex: Map<string, number> = new Map();
  private loaded: boolean = false;
  private listeners: ((keys: VaultKey[]) => void)[] = [];
  
  async loadKeys(): Promise<void> {
    if (this.loaded) return;
    
    // Lade echte Sample-Keys (manuell verifiziert)
    const sampleKeys = this.getVerifiedSampleKeys();
    for (const key of sampleKeys) {
      this.addKey(key);
    }
    
    this.loaded = true;
    this.notifyListeners();
  }
  
  // Echte, manuell verifizierte Keys aus dem OMNIGENESIS Dump
  private getVerifiedSampleKeys(): VaultKey[] {
    return [
      // Original Keys aus deinem Dump - echte WIFs mit Checksum
      { index: 2425, wif: 'L1J2dwTLq3CFusnTN1kfHYkYWzHiEifCwuTGaSozReJuTj2dSZ23', hex: '', entropy: 0.72, generatedAt: Date.now(), source: 'sample' as const },
      { index: 2426, wif: 'KzE5GCerFnPrASTieFgBpj6bA69ynDSbZqPQAr9ra9E2XdTa2i1h', hex: '', entropy: 0.68, generatedAt: Date.now(), source: 'sample' as const },
      { index: 2450, wif: 'KzL3yyVj27wS7WkM2F1W7Xf7F5iYgcRNxnLUw99j213sni5E94JB', hex: '', entropy: 0.75, generatedAt: Date.now(), source: 'sample' as const },
      { index: 2482, wif: 'KzU2H1HZNZzt3cTrCE7vVw58h58dtUPkpiGbHXpDcUpLoUxBg2tX', hex: '', entropy: 0.71, generatedAt: Date.now(), source: 'sample' as const },
      { index: 2483, wif: 'KyQ4uGV4oKCUJB97UU3T37RBLAzuRyB9SeCiswA5kyjTsPHAv58B', hex: '', entropy: 0.69, generatedAt: Date.now(), source: 'sample' as const },
      
      // Keys mit echtem Hex
      { index: 4600, wif: 'L5Eyp8VqAyr6tr68urBR6Ty8LtWzzLfZvwSbgY8bzupNN19mj1Nj', hex: 'ef5a2be67af2d8ff713e237032b511bdbda4b31bc2c49ebeeb606b09b9b722e8', entropy: 0.82, generatedAt: Date.now(), source: 'sample' as const },
      { index: 4601, wif: 'KykZDn3avbEhuGrnK7XidyYzW7MAHdyNA6BbuGg6xfJc2UVvcT2q', hex: '4b8af92f67961664e16f5db22d9930eb83838efd14082158ca491211da475177', entropy: 0.78, generatedAt: Date.now(), source: 'sample' as const },
      { index: 4625, wif: 'L5GU9tx5mhFPfoYYngFGQzz2ES14kj45kQFNevXPekpXPCs1yY68', hex: 'f01e380596e3d7e7660cd3e1b2fc1d21bb55fa87a6e66381ad3ea3a1eb2fc2ef', entropy: 0.85, generatedAt: Date.now(), source: 'sample' as const },
      { index: 4626, wif: 'Kyn3ZYVqXJdzgEKCBwbZxWZtPeqE42MsyYzNsf4tcWJm3gFXmEm5', hex: '4c4f054e8387154cd63e0e23ade03c4f8134d668f829e61b8c274aaa0bbff17e', entropy: 0.79, generatedAt: Date.now(), source: 'sample' as const },
      { index: 4627, wif: 'L2sFYMQVT4wjfB6c9HLmJCEto4amJpQ9iFFMwGY6YtQdvcN3Caj1', hex: 'a87fd297702a52b2466f4865a8c45b7c01c28f30f8b608f12ae2503efc86614e', entropy: 0.81, generatedAt: Date.now(), source: 'sample' as const },
      { index: 4628, wif: 'KwNpwzxFCgLLfbsFYYh4qhpkxHQvc7hwwPzNA15bWdtsb5jocnkR', hex: '04b09fe05ccd9017b6a082a7a3a87aa9c7a16b1249f98b8b09caf7471d168fdd', entropy: 0.77, generatedAt: Date.now(), source: 'sample' as const },
      { index: 4629, wif: 'KzU2voru8Se5eYefVtSGBPVmMhATrukDg6FMDcYoT1zkU1zm8oMy', hex: '60e16d294970cd7d26d1bce99e8c99d6482f23da4a85ae60a885fcdc0ddcffad', entropy: 0.83, generatedAt: Date.now(), source: 'sample' as const },
      { index: 4630, wif: 'L3ZEucmZ4CwpdVS5TEBTX5Amm6v17hnVQnWLHE21PQ6dLxEbExZZ', hex: 'bd123a7236140ae29702f72b9970b902c8bcdca24b11d13647410270fea36f7d', entropy: 0.86, generatedAt: Date.now(), source: 'sample' as const },
      { index: 4631, wif: 'Kx4pKGKJopLRdvCirVXm4akdvKkAR16HdwFLVxZWM9as1Rb8xPCC', hex: '194307bb22b748480734316d9454d8308e9bb8839c5553d02629a9791f339e0c', entropy: 0.74, generatedAt: Date.now(), source: 'sample' as const },
      { index: 4632, wif: 'L1A2J5DxjaeAcrz8oqGxQGReKjVhfo8ZNdWKZa2iHXgjtMjqcdzf', hex: '7573d5040f5a85ad77656baf8f38f75d0f29714b9ce176a5c4e4af0e0ffa0ddc', entropy: 0.80, generatedAt: Date.now(), source: 'sample' as const },
      { index: 4640, wif: 'Kz8nR4QVdELgYsD8nL3qjDYGpSjsqfFJjZ2FXq1ErgeqGSz9uw9g', hex: '56fa3f4b747470d8f8ef3dbf6659f0c4e38aa0d79368ac9f7b45c00f258ac899', entropy: 0.84, generatedAt: Date.now(), source: 'sample' as const },
      { index: 4641, wif: 'L3DzPsK9YzeRXozYjfo34uDHDrVR6THaUFHEbSUSo4ki9P83BJZi', hex: 'b32b0c946117ae3e69207801613e0ff16418599f93f4cf751a00c5a416513869', entropy: 0.87, generatedAt: Date.now(), source: 'sample' as const },
      { index: 4648, wif: 'Ky7YY3b2Wt3CUsS8kppj4AeuK9z41XN46UYBW5ymRqcveY75FqFD', hex: '3880a992d98e5c047a790fcf3d7aea2cb7ebd06389efe29931a6d1103b1b8356', entropy: 0.76, generatedAt: Date.now(), source: 'sample' as const },
      { index: 4649, wif: 'L2CkWrVgSeLwTpDYiAZvPrKuiZjbGKQKqAoAZhSyNDioXUJ6JZcz', hex: '94b176dbc6319969eaaa4a11385f09593879892b8a7c056ed061d6a52be1f326', entropy: 0.88, generatedAt: Date.now(), source: 'sample' as const },
    ];
  }
  
  // Importiere Keys aus Text (OMNIGENESIS Dump Format: [INDEX] WIF | HEX)
  parseAndImportKeys(text: string): number {
    const keyPattern = /\[(\d+)\]\s+([5KL][1-9A-HJ-NP-Za-km-z]{50,51})\s*\|?\s*([a-f0-9]{64})?/g;
    let match;
    let imported = 0;
    
    while ((match = keyPattern.exec(text)) !== null) {
      const [, indexStr, wif, hex] = match;
      const index = parseInt(indexStr, 10);
      
      if (wif && this.isValidWIFFormat(wif)) {
        this.addKey({
          index,
          wif,
          hex: hex || '',
          entropy: this.calculateEntropy(hex || wif),
          generatedAt: Date.now(),
          source: 'imported'
        });
        imported++;
      }
    }
    
    this.notifyListeners();
    return imported;
  }
  
  // WIF Format Check (nicht Checksum, nur Format)
  private isValidWIFFormat(wif: string): boolean {
    if (!wif || wif.length < 51 || wif.length > 52) return false;
    const firstChar = wif[0];
    return ['K', 'L', '5', 'c', '9'].includes(firstChar);
  }
  
  addKey(key: VaultKey): void {
    // Verhindere Duplikate
    if (this.keys.has(key.index)) {
      const existing = this.keys.get(key.index)!;
      // Update nur wenn neuer Key mehr Daten hat
      if (!existing.hex && key.hex) {
        existing.hex = key.hex;
        existing.entropy = this.calculateEntropy(key.hex);
      }
      return;
    }
    
    this.keys.set(key.index, key);
    this.wifIndex.set(key.wif, key.index);
    if (key.hex) {
      this.hexIndex.set(key.hex, key.index);
    }
  }
  
  // Fuege generierten Key hinzu (mit echtem WIF)
  async addGeneratedKey(index: number, hex: string, cycle?: number, chaos?: number): Promise<VaultKey> {
    const wif = await privateKeyToWIF(hex, true, true);
    
    const key: VaultKey = {
      index,
      wif,
      hex,
      entropy: this.calculateEntropy(hex),
      generatedAt: Date.now(),
      linkedCycle: cycle,
      linkedChaos: chaos,
      source: 'generated'
    };
    
    this.addKey(key);
    this.notifyListeners();
    return key;
  }
  
  private calculateEntropy(data: string): number {
    if (!data) return 0.5;
    
    const counts = new Map<string, number>();
    for (const char of data) {
      counts.set(char, (counts.get(char) || 0) + 1);
    }
    
    let entropy = 0;
    for (const count of counts.values()) {
      const p = count / data.length;
      entropy -= p * Math.log2(p);
    }
    
    // Normalisiere: Max-Entropie für Hex ist log2(16) = 4
    return Math.min(1, entropy / 4);
  }
  
  // === QUERY API ===
  
  getKey(index: number): VaultKey | undefined {
    return this.keys.get(index);
  }
  
  getKeyByWIF(wif: string): VaultKey | undefined {
    const index = this.wifIndex.get(wif);
    return index !== undefined ? this.keys.get(index) : undefined;
  }
  
  getKeyByHex(hex: string): VaultKey | undefined {
    const index = this.hexIndex.get(hex);
    return index !== undefined ? this.keys.get(index) : undefined;
  }
  
  getAllKeys(): VaultKey[] {
    return Array.from(this.keys.values()).sort((a, b) => a.index - b.index);
  }
  
  getKeysByRange(start: number, end: number): VaultKey[] {
    return this.getAllKeys().filter(k => k.index >= start && k.index <= end);
  }
  
  getKeysByEntropy(minEntropy: number, maxEntropy: number = 1): VaultKey[] {
    return this.getAllKeys().filter(k => k.entropy >= minEntropy && k.entropy <= maxEntropy);
  }
  
  getKeysBySource(source: VaultKey['source']): VaultKey[] {
    return this.getAllKeys().filter(k => k.source === source);
  }
  
  searchKeys(query: string): VaultKey[] {
    const lower = query.toLowerCase();
    return this.getAllKeys().filter(k => 
      k.wif.toLowerCase().includes(lower) || 
      k.hex.toLowerCase().includes(lower) ||
      k.index.toString().includes(query)
    );
  }
  
  analyze(): KeyAnalysis {
    const keys = this.getAllKeys();
    
    const entropyDist = { low: 0, medium: 0, high: 0 };
    const patterns = new Set<string>();
    const sources = { imported: 0, generated: 0, sample: 0 };
    
    for (const key of keys) {
      if (key.entropy < 0.5) entropyDist.low++;
      else if (key.entropy < 0.8) entropyDist.medium++;
      else entropyDist.high++;
      
      patterns.add(key.wif.substring(0, 2));
      
      if (key.source) {
        sources[key.source]++;
      }
    }
    
    const indices = keys.map(k => k.index);
    
    return {
      totalKeys: keys.length,
      entropyDistribution: entropyDist,
      indexRange: indices.length > 0 ? {
        min: Math.min(...indices),
        max: Math.max(...indices)
      } : { min: 0, max: 0 },
      uniquePatterns: Array.from(patterns),
      sources
    };
  }
  
  getStats(): { total: number; avgEntropy: number; linkedCount: number; bySource: Record<string, number> } {
    const keys = this.getAllKeys();
    const avgEntropy = keys.length > 0 ? keys.reduce((sum, k) => sum + k.entropy, 0) / keys.length : 0;
    const linked = keys.filter(k => k.linkedCycle !== undefined).length;
    
    const bySource: Record<string, number> = { imported: 0, generated: 0, sample: 0 };
    for (const key of keys) {
      if (key.source) {
        bySource[key.source]++;
      }
    }
    
    return {
      total: keys.length,
      avgEntropy,
      linkedCount: linked,
      bySource
    };
  }
  
  // Export als JSON
  exportToJSON(): string {
    return JSON.stringify(this.getAllKeys(), null, 2);
  }
  
  // Export als CSV
  exportToCSV(): string {
    const keys = this.getAllKeys();
    const header = 'index,wif,hex,entropy,source,linkedCycle,linkedChaos';
    const rows = keys.map(k => 
      `${k.index},"${k.wif}","${k.hex}",${k.entropy.toFixed(4)},${k.source || 'unknown'},${k.linkedCycle ?? ''},${k.linkedChaos ?? ''}`
    );
    return [header, ...rows].join('\n');
  }
  
  // Listeners
  subscribe(listener: (keys: VaultKey[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners(): void {
    const keys = this.getAllKeys();
    this.listeners.forEach(l => l(keys));
  }
  
  // Clear all
  clear(): void {
    this.keys.clear();
    this.wifIndex.clear();
    this.hexIndex.clear();
    this.loaded = false;
    this.notifyListeners();
  }
  
  isLoaded(): boolean {
    return this.loaded;
  }
}

// Singleton
let vaultInstance: KeyVault | null = null;

export const getKeyVault = (): KeyVault => {
  if (!vaultInstance) {
    vaultInstance = new KeyVault();
  }
  return vaultInstance;
};

export const resetKeyVault = (): void => {
  if (vaultInstance) {
    vaultInstance.clear();
  }
  vaultInstance = new KeyVault();
};
