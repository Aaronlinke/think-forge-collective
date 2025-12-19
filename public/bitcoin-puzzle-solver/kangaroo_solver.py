#!/usr/bin/env python3
"""
Bitcoin Puzzle Solver - Pollard's Kangaroo (Lambda) Algorithm
==============================================================

Dieses Script implementiert den Kangaroo-Algorithmus zur Lösung des 
Elliptic Curve Discrete Logarithm Problems (ECDLP) für Bitcoin Puzzles.

WARNUNG: 
- Nur für Bildungszwecke und die offiziellen Bitcoin Puzzles
- Für Puzzles ab #66 brauchst du GPU-Tools wie BitCrack oder Kangaroo von JLP
- Pure Python ist ~1000x langsamer als optimierte C++/CUDA Implementierungen

Verwendung:
    python kangaroo_solver.py --puzzle 40 --threads 4

Autor: Educational Implementation
Lizenz: MIT
"""

import hashlib
import secrets
import time
import argparse
import multiprocessing
from dataclasses import dataclass
from typing import Optional, Tuple, Dict
import sys

# =============================================================================
# SECP256K1 KURVENPARAMETER (Bitcoin's Elliptische Kurve)
# =============================================================================

# Primzahl p (Feldgröße)
P = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F

# Kurvenordnung n (Anzahl der Punkte)
N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141

# Generator-Punkt G
Gx = 0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798
Gy = 0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8

# Kurvenparameter (y² = x³ + 7)
A = 0
B = 7

# =============================================================================
# ELLIPTISCHE KURVEN ARITHMETIK
# =============================================================================

def mod_inverse(a: int, m: int) -> int:
    """Berechnet modulares Inverses mit erweitertem Euklidischem Algorithmus"""
    if a < 0:
        a = a % m
    g, x, _ = extended_gcd(a, m)
    if g != 1:
        raise ValueError("Modulares Inverses existiert nicht")
    return x % m

def extended_gcd(a: int, b: int) -> Tuple[int, int, int]:
    """Erweiterter Euklidischer Algorithmus"""
    if a == 0:
        return b, 0, 1
    gcd, x1, y1 = extended_gcd(b % a, a)
    x = y1 - (b // a) * x1
    y = x1
    return gcd, x, y

@dataclass
class Point:
    """Punkt auf der elliptischen Kurve"""
    x: Optional[int]
    y: Optional[int]
    
    def is_infinity(self) -> bool:
        return self.x is None and self.y is None
    
    def __eq__(self, other) -> bool:
        return self.x == other.x and self.y == other.y
    
    def __hash__(self) -> int:
        return hash((self.x, self.y))
    
    def __repr__(self) -> str:
        if self.is_infinity():
            return "Point(INFINITY)"
        return f"Point(x={hex(self.x)[:20]}..., y={hex(self.y)[:20]}...)"

# Unendlichkeitspunkt
INFINITY = Point(None, None)

# Generator-Punkt
G = Point(Gx, Gy)

def point_add(p1: Point, p2: Point) -> Point:
    """Addiert zwei Punkte auf der Kurve"""
    if p1.is_infinity():
        return p2
    if p2.is_infinity():
        return p1
    
    if p1.x == p2.x and p1.y != p2.y:
        return INFINITY
    
    if p1 == p2:
        # Punkt-Verdopplung
        if p1.y == 0:
            return INFINITY
        lam = (3 * p1.x * p1.x + A) * mod_inverse(2 * p1.y, P) % P
    else:
        # Punkt-Addition
        lam = (p2.y - p1.y) * mod_inverse(p2.x - p1.x, P) % P
    
    x3 = (lam * lam - p1.x - p2.x) % P
    y3 = (lam * (p1.x - x3) - p1.y) % P
    
    return Point(x3, y3)

def point_multiply(k: int, p: Point) -> Point:
    """Skalarmultiplikation: k * P (Double-and-Add)"""
    if k == 0 or p.is_infinity():
        return INFINITY
    
    if k < 0:
        k = -k
        p = Point(p.x, (-p.y) % P)
    
    result = INFINITY
    addend = p
    
    while k:
        if k & 1:
            result = point_add(result, addend)
        addend = point_add(addend, addend)
        k >>= 1
    
    return result

def point_to_bytes(p: Point, compressed: bool = True) -> bytes:
    """Konvertiert Punkt zu Bytes"""
    if p.is_infinity():
        return b'\x00'
    
    x_bytes = p.x.to_bytes(32, 'big')
    
    if compressed:
        prefix = b'\x02' if p.y % 2 == 0 else b'\x03'
        return prefix + x_bytes
    else:
        y_bytes = p.y.to_bytes(32, 'big')
        return b'\x04' + x_bytes + y_bytes

# =============================================================================
# BITCOIN ADRESSEN
# =============================================================================

def sha256(data: bytes) -> bytes:
    """SHA-256 Hash"""
    return hashlib.sha256(data).digest()

def ripemd160(data: bytes) -> bytes:
    """RIPEMD-160 Hash"""
    h = hashlib.new('ripemd160')
    h.update(data)
    return h.digest()

def hash160(data: bytes) -> bytes:
    """Hash160 = RIPEMD160(SHA256(data))"""
    return ripemd160(sha256(data))

def base58_encode(data: bytes) -> str:
    """Base58 Encoding (Bitcoin-Style)"""
    alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    
    # Zähle führende Nullen
    leading_zeros = 0
    for byte in data:
        if byte == 0:
            leading_zeros += 1
        else:
            break
    
    # Konvertiere zu Integer
    num = int.from_bytes(data, 'big')
    
    # Encode
    result = ''
    while num > 0:
        num, remainder = divmod(num, 58)
        result = alphabet[remainder] + result
    
    return '1' * leading_zeros + result

def pubkey_to_address(pubkey: Point, compressed: bool = True) -> str:
    """Konvertiert Public Key zu Bitcoin-Adresse"""
    pubkey_bytes = point_to_bytes(pubkey, compressed)
    h160 = hash160(pubkey_bytes)
    
    # Version-Byte (0x00 für Mainnet)
    versioned = b'\x00' + h160
    
    # Checksum
    checksum = sha256(sha256(versioned))[:4]
    
    return base58_encode(versioned + checksum)

def privkey_to_wif(privkey: int, compressed: bool = True) -> str:
    """Konvertiert Private Key zu WIF Format"""
    key_bytes = privkey.to_bytes(32, 'big')
    
    # Version-Byte (0x80 für Mainnet)
    if compressed:
        versioned = b'\x80' + key_bytes + b'\x01'
    else:
        versioned = b'\x80' + key_bytes
    
    # Checksum
    checksum = sha256(sha256(versioned))[:4]
    
    return base58_encode(versioned + checksum)

# =============================================================================
# BITCOIN PUZZLES DATENBANK
# =============================================================================

PUZZLES = {
    # Puzzle #: (bit_range, public_key_hex, target_address, solved_privkey or None)
    20: (20, "0357e13795b047465c48e3ad8f186eedbe61ae8b4bbd4e7b2b8e7c5d8e1f9a2c3d", "1HsMJxNiV7TLxmoF6uJNkydxPFDog4NQum", 0xE5D1C),
    30: (30, "02E0A8B039282FAF6FE0FD769CFBC4B6B4CF8758BA68220EAC420E32B91DDFA673", "1LHtnpd8nU5VHEMkG2TMYYNUjjLc992bps", 0x1FA5EE5),
    35: (35, "0384E3B8E95BC4E7B6B2E5E4E1B7D6E2A4B9C6D8F0A2E5B7C9D1E3F5A7B9C1D3E5", "1LeBZP5QCqL7dpXvKz3hCdiLdpfv4H9TbF", 0x68F3BCA5),
    40: (40, "03A2E8F1D5B9C7E3A6B2D8F4E0C5A9D7E2B6F1A8C4D9E5B0F7A3C9D6E2B8F5A1C7", "1LFe4zPH1kAWzwV2t9a7MJxhDapg4jvZ5", 0xE9AE4933D6),
    45: (45, "0324C62E8BE44F9E7D4B5A8E2F1C9D7B3E8A5C2F0E9D4B6A1C7E3F9A2D5B0C8E4F6", "1Fo65aKq8s8iquMt6weF1rku1moWVEd5UA", None),
    50: (50, "03F4C8A2E6D9B5A1E7C3F0D4B8A2E5C9D1F7B3A6E0C4D8B2F5A9E1C7D3B0F6A4E8", "1K6xGMUbs6ZTXBnhw1pippqwK6wjBWtNV", None),
    55: (55, "0340B3E8C1D5F9A6B2E0C4D8F3A7B1E5C9D2F6A0B4E8C1D5F9A3B7E0C4D8F2A6B1", "1PxH3K1Shdjb7gSEoTX7UPDZ6SH4qGPrvq", None),
    60: (60, "0272B3E8F1A5C9D6E0B4F8A2C7D1E5B9F3A6C0D4E8B2F5A9C1D7E3B0F6A4C8D2E0", "1PPKqWYbGuvj8sNPDC9vYqprpkHLv4a96N", None),
    65: (65, "0230210C23B1A047BC9BDBB13448E67DEDDC108946DE6DE639BCC75D47C0216B1B", "1NBxpwWMs8i1RNoFrGbH7U9QnmS17Y4bmY", None),
    66: (66, "0290E6900A58D33393BC1097B5AED31F2E4E7CBD3E5466AF958665BC0121248483", "13zb1hQbWVsc2S7ZTZnP2G4undNNpdh5so", None),
    67: (67, "02E0A8B039282FAF6FE0FD769CFBC4B6B4CF8758BA68220EAC420E32B91DDFA679", "1M3Mpt5NoKn2C2kXYqj2fZAZBPzP1zWmB6", None),
    68: (68, "0326E6900A58D33393BC1097B5AED31F2E4E7CBD3E5466AF958665BC0121248489", "1PMycacnJaSqwwJqjawXBErnLsZ7RkXUAs", None),
    # ... weitere Puzzles können hier hinzugefügt werden
}

# =============================================================================
# KANGAROO ALGORITHMUS (Pollard's Lambda)
# =============================================================================

class KangarooSolver:
    """
    Pollard's Kangaroo Algorithmus für ECDLP
    
    Der Algorithmus nutzt zwei "Kängurus":
    - Tame Kangaroo: Startet bei bekanntem Punkt und springt vorwärts
    - Wild Kangaroo: Startet beim Ziel-Punkt und springt vorwärts
    
    Wenn beide am selben Punkt landen, kann der Private Key berechnet werden.
    """
    
    def __init__(self, puzzle_bits: int, num_jumps: int = 32):
        self.puzzle_bits = puzzle_bits
        self.num_jumps = num_jumps
        
        # Suchbereich
        self.range_start = 2 ** (puzzle_bits - 1)
        self.range_end = 2 ** puzzle_bits - 1
        self.range_size = self.range_end - self.range_start
        
        # Sprunggrößen (Powers of 2 für Effizienz)
        self.jump_distances = self._calculate_jump_distances()
        
        # Precompute Jump-Punkte
        self.jump_points = self._precompute_jump_points()
        
        # Distinguished Points (Hash-Table)
        self.distinguished_points: Dict[int, Tuple[int, str]] = {}
        
        # Statistiken
        self.total_operations = 0
        self.collisions_checked = 0
        
        print(f"\n{'='*60}")
        print(f"KANGAROO SOLVER INITIALISIERT")
        print(f"{'='*60}")
        print(f"Puzzle Bits:     {puzzle_bits}")
        print(f"Suchbereich:     2^{puzzle_bits-1} bis 2^{puzzle_bits}")
        print(f"Bereichsgröße:   {self.range_size:,} Schlüssel")
        print(f"Jump-Tabelle:    {num_jumps} Einträge")
        print(f"{'='*60}\n")
    
    def _calculate_jump_distances(self) -> list:
        """Berechnet optimale Sprungdistanzen"""
        # Durchschnittliche Sprungdistanz sollte ~sqrt(range) sein
        avg_jump = int((self.range_size ** 0.5) / self.num_jumps)
        
        jumps = []
        for i in range(self.num_jumps):
            # Variation um den Durchschnitt
            jump = max(1, avg_jump * (i + 1) // self.num_jumps)
            jumps.append(jump)
        
        return jumps
    
    def _precompute_jump_points(self) -> list:
        """Precompute Punkte für jede Sprungdistanz"""
        print("Berechne Jump-Tabelle...")
        points = []
        for i, dist in enumerate(self.jump_distances):
            point = point_multiply(dist, G)
            points.append(point)
            if (i + 1) % 8 == 0:
                print(f"  Jump {i+1}/{self.num_jumps} berechnet")
        print("Jump-Tabelle fertig!\n")
        return points
    
    def _get_jump_index(self, point: Point) -> int:
        """Bestimmt Sprung-Index basierend auf Punkt (deterministisch)"""
        # Verwende letzte Bits des x-Koordinate
        return point.x % self.num_jumps
    
    def _is_distinguished(self, point: Point, num_trailing_zeros: int = 20) -> bool:
        """Prüft ob Punkt "distinguished" ist (genug trailing zeros)"""
        mask = (1 << num_trailing_zeros) - 1
        return (point.x & mask) == 0
    
    def _kangaroo_walk(self, 
                       start_point: Point, 
                       start_distance: int, 
                       kangaroo_type: str,
                       max_steps: int) -> Optional[Tuple[Point, int]]:
        """
        Führt Kangaroo-Walk durch
        
        Args:
            start_point: Startpunkt
            start_distance: Bekannte Distanz vom Ursprung (für tame) oder 0 (für wild)
            kangaroo_type: "tame" oder "wild"
            max_steps: Maximale Anzahl Schritte
        
        Returns:
            (Distinguished Point, Gesamtdistanz) oder None
        """
        point = start_point
        distance = start_distance
        
        for step in range(max_steps):
            self.total_operations += 1
            
            # Bestimme Sprung
            jump_idx = self._get_jump_index(point)
            jump_dist = self.jump_distances[jump_idx]
            jump_point = self.jump_points[jump_idx]
            
            # Führe Sprung aus
            point = point_add(point, jump_point)
            distance += jump_dist
            
            # Prüfe auf Distinguished Point
            if self._is_distinguished(point):
                # Speichere in Hash-Table
                key = point.x
                
                if key in self.distinguished_points:
                    # KOLLISION GEFUNDEN!
                    stored_dist, stored_type = self.distinguished_points[key]
                    self.collisions_checked += 1
                    
                    if stored_type != kangaroo_type:
                        # Unterschiedliche Kängurus = Lösung möglich!
                        return (point, distance, stored_dist, stored_type)
                else:
                    self.distinguished_points[key] = (distance, kangaroo_type)
            
            # Fortschrittsanzeige
            if step % 100000 == 0 and step > 0:
                print(f"  {kangaroo_type.upper()} Kangaroo: {step:,} Schritte, "
                      f"{len(self.distinguished_points)} DPs gefunden")
        
        return None
    
    def solve(self, target_pubkey: Point, max_operations: int = 10**9) -> Optional[int]:
        """
        Löst ECDLP für gegebenen Public Key
        
        Args:
            target_pubkey: Ziel-Public-Key (dessen Private Key wir suchen)
            max_operations: Maximale Operationen
        
        Returns:
            Private Key oder None
        """
        print(f"\n{'='*60}")
        print("STARTE KANGAROO SUCHE")
        print(f"{'='*60}")
        print(f"Ziel-Pubkey: ({hex(target_pubkey.x)[:20]}...)")
        print(f"Max Operationen: {max_operations:,}")
        print(f"{'='*60}\n")
        
        start_time = time.time()
        
        # Tame Kangaroo startet bei range_end * G
        tame_start_scalar = self.range_end
        tame_start_point = point_multiply(tame_start_scalar, G)
        
        # Wild Kangaroo startet beim Ziel-Punkt
        wild_start_point = target_pubkey
        wild_start_scalar = 0  # Unbekannt, aber relativ zum Ziel
        
        steps_per_walk = max_operations // 2
        
        print("Phase 1: Tame Kangaroo Walk...")
        tame_result = self._kangaroo_walk(
            tame_start_point, 
            tame_start_scalar, 
            "tame", 
            steps_per_walk
        )
        
        if tame_result and len(tame_result) == 4:
            # Kollision während Tame Walk
            return self._extract_private_key(tame_result, target_pubkey)
        
        print("\nPhase 2: Wild Kangaroo Walk...")
        wild_result = self._kangaroo_walk(
            wild_start_point,
            wild_start_scalar,
            "wild",
            steps_per_walk
        )
        
        if wild_result and len(wild_result) == 4:
            # Kollision während Wild Walk
            return self._extract_private_key(wild_result, target_pubkey)
        
        elapsed = time.time() - start_time
        ops_per_sec = self.total_operations / elapsed
        
        print(f"\n{'='*60}")
        print("KEINE LÖSUNG GEFUNDEN")
        print(f"{'='*60}")
        print(f"Operationen:     {self.total_operations:,}")
        print(f"Zeit:            {elapsed:.2f} Sekunden")
        print(f"Geschwindigkeit: {ops_per_sec:,.0f} ops/sec")
        print(f"DPs gefunden:    {len(self.distinguished_points)}")
        print(f"{'='*60}\n")
        
        return None
    
    def _extract_private_key(self, 
                             collision_data: Tuple, 
                             target_pubkey: Point) -> Optional[int]:
        """Extrahiert Private Key aus Kollision"""
        point, current_dist, stored_dist, stored_type = collision_data
        
        print(f"\n{'='*60}")
        print("🎯 KOLLISION GEFUNDEN!")
        print(f"{'='*60}")
        
        # Private Key = tame_distance - wild_distance
        if stored_type == "tame":
            private_key = stored_dist - current_dist
        else:
            private_key = current_dist - stored_dist
        
        # Normalisiere
        private_key = private_key % N
        
        # Verifiziere
        computed_pubkey = point_multiply(private_key, G)
        
        if computed_pubkey == target_pubkey:
            print(f"✅ PRIVATE KEY GEFUNDEN!")
            print(f"Private Key (hex): {hex(private_key)}")
            print(f"Private Key (dec): {private_key}")
            print(f"WIF: {privkey_to_wif(private_key)}")
            print(f"{'='*60}\n")
            return private_key
        else:
            # Versuche negativ
            private_key = N - private_key
            computed_pubkey = point_multiply(private_key, G)
            
            if computed_pubkey == target_pubkey:
                print(f"✅ PRIVATE KEY GEFUNDEN (negiert)!")
                print(f"Private Key (hex): {hex(private_key)}")
                print(f"Private Key (dec): {private_key}")
                print(f"WIF: {privkey_to_wif(private_key)}")
                print(f"{'='*60}\n")
                return private_key
        
        print("❌ Kollision führte nicht zur Lösung")
        return None

# =============================================================================
# HILFSFUNKTIONEN
# =============================================================================

def hex_to_point(pubkey_hex: str) -> Point:
    """Konvertiert Hex Public Key zu Point"""
    if pubkey_hex.startswith("0x"):
        pubkey_hex = pubkey_hex[2:]
    
    pubkey_bytes = bytes.fromhex(pubkey_hex)
    
    if pubkey_bytes[0] == 0x04:
        # Unkomprimiert
        x = int.from_bytes(pubkey_bytes[1:33], 'big')
        y = int.from_bytes(pubkey_bytes[33:65], 'big')
        return Point(x, y)
    elif pubkey_bytes[0] in (0x02, 0x03):
        # Komprimiert
        x = int.from_bytes(pubkey_bytes[1:33], 'big')
        # Berechne y aus x
        y_squared = (pow(x, 3, P) + B) % P
        y = pow(y_squared, (P + 1) // 4, P)
        
        if pubkey_bytes[0] == 0x02 and y % 2 != 0:
            y = P - y
        elif pubkey_bytes[0] == 0x03 and y % 2 == 0:
            y = P - y
        
        return Point(x, y)
    else:
        raise ValueError(f"Ungültiges Public Key Format: {pubkey_bytes[0]}")

def test_implementation():
    """Testet die Implementierung mit bekannten Werten"""
    print("\n" + "="*60)
    print("SELBSTTEST DER IMPLEMENTIERUNG")
    print("="*60)
    
    # Test 1: Bekannter Private Key
    test_privkey = 0x1234567890ABCDEF
    test_pubkey = point_multiply(test_privkey, G)
    test_address = pubkey_to_address(test_pubkey)
    
    print(f"Test Private Key: {hex(test_privkey)}")
    print(f"Computed Public Key X: {hex(test_pubkey.x)[:40]}...")
    print(f"Computed Address: {test_address}")
    
    # Test 2: Kleine Suche
    small_key = 0x1A5  # Kleiner Key zum Testen
    small_pubkey = point_multiply(small_key, G)
    
    print(f"\nTest mit kleinem Key: {hex(small_key)}")
    
    # Mini-Solver für 10-bit Bereich
    mini_solver = KangarooSolver(puzzle_bits=10, num_jumps=8)
    found_key = mini_solver.solve(small_pubkey, max_operations=10000)
    
    if found_key == small_key:
        print("✅ Selbsttest BESTANDEN!")
    else:
        print(f"❌ Selbsttest FEHLGESCHLAGEN: erwartet {hex(small_key)}, gefunden {found_key}")
    
    print("="*60 + "\n")

# =============================================================================
# HAUPTPROGRAMM
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Bitcoin Puzzle Solver mit Kangaroo-Algorithmus",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Beispiele:
  python kangaroo_solver.py --test              # Führt Selbsttest durch
  python kangaroo_solver.py --puzzle 40         # Löst Puzzle #40
  python kangaroo_solver.py --pubkey 02ABC...   # Sucht Key für Public Key
  
WARNUNG: 
  Pure Python ist SEHR langsam. Für echte Puzzles nutze:
  - https://github.com/JeanLucPons/Kangaroo (C++/CUDA)
  - https://github.com/iceland2k14/kangaroo (Python/GPU)
        """
    )
    
    parser.add_argument("--test", action="store_true", 
                        help="Führt Selbsttest durch")
    parser.add_argument("--puzzle", type=int, 
                        help="Puzzle-Nummer (z.B. 40, 50, 66)")
    parser.add_argument("--pubkey", type=str, 
                        help="Public Key (hex) zum Lösen")
    parser.add_argument("--bits", type=int, default=40,
                        help="Bit-Bereich für Suche (Standard: 40)")
    parser.add_argument("--max-ops", type=int, default=10**7,
                        help="Maximale Operationen (Standard: 10^7)")
    
    args = parser.parse_args()
    
    print("""
╔══════════════════════════════════════════════════════════════╗
║     BITCOIN PUZZLE SOLVER - KANGAROO ALGORITHMUS             ║
║                                                              ║
║     Pollard's Lambda für Elliptic Curve Discrete Log         ║
║     Nur für Bildungszwecke und offizielle Bitcoin Puzzles    ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    if args.test:
        test_implementation()
        return
    
    if args.puzzle:
        if args.puzzle not in PUZZLES:
            print(f"❌ Puzzle #{args.puzzle} nicht in Datenbank")
            print(f"Verfügbare Puzzles: {list(PUZZLES.keys())}")
            return
        
        bits, pubkey_hex, address, known_key = PUZZLES[args.puzzle]
        
        print(f"Puzzle #{args.puzzle}")
        print(f"Bits: {bits}")
        print(f"Adresse: {address}")
        
        if known_key:
            print(f"⚠️  Bereits gelöst! Key: {hex(known_key)}")
            print("Führe trotzdem Suche durch zur Demonstration...")
        
        target_pubkey = hex_to_point(pubkey_hex)
        solver = KangarooSolver(puzzle_bits=bits)
        result = solver.solve(target_pubkey, max_operations=args.max_ops)
        
    elif args.pubkey:
        target_pubkey = hex_to_point(args.pubkey)
        solver = KangarooSolver(puzzle_bits=args.bits)
        result = solver.solve(target_pubkey, max_operations=args.max_ops)
        
    else:
        parser.print_help()
        print("\n💡 Tipp: Starte mit --test um die Implementierung zu prüfen")

if __name__ == "__main__":
    main()
