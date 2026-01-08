// BitcoinUtils - Echte Bitcoin-Schlüssel-Operationen

// SHA256 via SubtleCrypto (Browser)
async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
  return new Uint8Array(hashBuffer);
}

// Double SHA256 für Bitcoin
async function doubleSha256(data: Uint8Array): Promise<Uint8Array> {
  const first = await sha256(data);
  return sha256(first);
}

// Base58 Alphabet (Bitcoin)
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Base58 Encode
function base58Encode(data: Uint8Array): string {
  let num = BigInt(0);
  for (const byte of data) {
    num = num * BigInt(256) + BigInt(byte);
  }
  
  let result = '';
  while (num > 0) {
    const remainder = Number(num % BigInt(58));
    result = BASE58_ALPHABET[remainder] + result;
    num = num / BigInt(58);
  }
  
  // Leading zeros
  for (const byte of data) {
    if (byte === 0) {
      result = '1' + result;
    } else {
      break;
    }
  }
  
  return result;
}

// Base58 Decode
function base58Decode(str: string): Uint8Array {
  let num = BigInt(0);
  for (const char of str) {
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) throw new Error(`Invalid Base58 character: ${char}`);
    num = num * BigInt(58) + BigInt(index);
  }
  
  // Convert to bytes
  const bytes: number[] = [];
  while (num > 0) {
    bytes.unshift(Number(num % BigInt(256)));
    num = num / BigInt(256);
  }
  
  // Leading zeros
  for (const char of str) {
    if (char === '1') {
      bytes.unshift(0);
    } else {
      break;
    }
  }
  
  return new Uint8Array(bytes);
}

// Hex zu Bytes
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// Bytes zu Hex
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Private Key zu WIF (Wallet Import Format)
export async function privateKeyToWIF(privateKeyHex: string, compressed: boolean = true, mainnet: boolean = true): Promise<string> {
  // Prefix: 0x80 für Mainnet, 0xEF für Testnet
  const prefix = mainnet ? '80' : 'ef';
  const suffix = compressed ? '01' : '';
  
  const payload = hexToBytes(prefix + privateKeyHex + suffix);
  const checksum = await doubleSha256(payload);
  
  // WIF = Base58(payload + checksum[0:4])
  const wifBytes = new Uint8Array(payload.length + 4);
  wifBytes.set(payload);
  wifBytes.set(checksum.slice(0, 4), payload.length);
  
  return base58Encode(wifBytes);
}

// WIF zu Private Key
export async function wifToPrivateKey(wif: string): Promise<{ privateKeyHex: string; compressed: boolean; mainnet: boolean }> {
  const decoded = base58Decode(wif);
  
  // Verify checksum
  const payload = decoded.slice(0, -4);
  const checksum = decoded.slice(-4);
  const calculated = await doubleSha256(payload);
  
  for (let i = 0; i < 4; i++) {
    if (checksum[i] !== calculated[i]) {
      throw new Error('Invalid WIF checksum');
    }
  }
  
  const prefix = payload[0];
  const mainnet = prefix === 0x80;
  
  // Check if compressed
  const compressed = payload.length === 34 && payload[33] === 0x01;
  const privateKeyBytes = compressed ? payload.slice(1, 33) : payload.slice(1);
  
  return {
    privateKeyHex: bytesToHex(privateKeyBytes),
    compressed,
    mainnet
  };
}

// Generiere Private Key aus verschiedenen Quellen
export function generatePrivateKeyFromParams(
  h: bigint,
  n: bigint,
  g: bigint,
  o: bigint,
  r: bigint,
  index: number,
  chaosEntropy: number = 0,
  tickTackEnergy: number = 0
): string {
  // secp256k1 Ordnung
  const N = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
  
  // Affine Transformation: k = (h + n*g + o + i) mod N
  const k = ((h + n * g + o + BigInt(index)) % N + N) % N;
  
  // Chaos-Modulation
  const chaosOffset = BigInt(Math.floor(chaosEntropy * 1000000)) % N;
  
  // TickTack-Modulation
  const tickTackOffset = BigInt(Math.floor(Math.abs(tickTackEnergy) * 1000000)) % N;
  
  // Kombiniere alles
  let d = (k + chaosOffset + tickTackOffset) % N;
  
  // Stelle sicher dass d > 0 und < N
  if (d === BigInt(0)) d = BigInt(1);
  
  return d.toString(16).padStart(64, '0');
}

// Validiere WIF Format
export function isValidWIF(wif: string): boolean {
  if (!wif || wif.length < 51 || wif.length > 52) return false;
  
  const firstChar = wif[0];
  // Mainnet: K, L (compressed) oder 5 (uncompressed)
  // Testnet: c (compressed) oder 9 (uncompressed)
  const validPrefixes = ['K', 'L', '5', 'c', '9'];
  
  return validPrefixes.includes(firstChar);
}

// Generiere Random Private Key
export function generateRandomPrivateKey(): string {
  const N = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
  
  // Generiere 32 random bytes
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  
  let num = BigInt(0);
  for (const byte of randomBytes) {
    num = num * BigInt(256) + BigInt(byte);
  }
  
  // Mod N und nicht 0
  num = num % N;
  if (num === BigInt(0)) num = BigInt(1);
  
  return num.toString(16).padStart(64, '0');
}

// Batch-Generierung mit Chaos & TickTack
export interface CollectiveKeyParams {
  baseH: bigint;
  baseN: bigint;
  baseG: bigint;
  baseO: bigint;
  baseR: bigint;
  chaosEntropy: number;
  chaosEdge: number;
  tickTackH: number;
  tickTackN: number;
  tickTackG: number;
}

export async function generateCollectiveKeys(
  params: CollectiveKeyParams,
  startIndex: number,
  count: number
): Promise<{ index: number; hex: string; wif: string }[]> {
  const results: { index: number; hex: string; wif: string }[] = [];
  
  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    
    // Chaos beeinflusst die Parameter dynamisch
    const chaosModulation = Math.sin(params.chaosEdge * Math.PI * 2 + i * 0.1);
    const tickTackModulation = params.tickTackH * params.tickTackN;
    
    const hex = generatePrivateKeyFromParams(
      params.baseH,
      params.baseN + BigInt(Math.floor(chaosModulation * 1000)),
      params.baseG,
      params.baseO,
      params.baseR,
      index,
      params.chaosEntropy + chaosModulation * 0.1,
      tickTackModulation
    );
    
    const wif = await privateKeyToWIF(hex, true, true);
    
    results.push({ index, hex, wif });
  }
  
  return results;
}
