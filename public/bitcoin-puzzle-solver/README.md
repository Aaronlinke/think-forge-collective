# 🦘 Bitcoin Puzzle Solver - Kangaroo Algorithmus

Implementierung von Pollard's Kangaroo (Lambda) Algorithmus für Bitcoin Puzzle Solving.

## ⚡ Schnellstart

```bash
# Selbsttest durchführen
python kangaroo_solver.py --test

# Puzzle #40 lösen (Demonstration)
python kangaroo_solver.py --puzzle 40 --max-ops 10000000

# Eigenen Public Key suchen
python kangaroo_solver.py --pubkey 02ABC123... --bits 50
```

## 🔧 Voraussetzungen

- Python 3.8+
- Keine externen Dependencies (pure Python)

## 📊 Performance-Hinweise

| Implementierung | Geschwindigkeit | Für Puzzles |
|-----------------|-----------------|-------------|
| **Dieses Script (Python)** | ~50.000 ops/sec | #1-40 |
| iceland2k14 (Python+GPU) | ~50M ops/sec | #40-55 |
| JeanLucPons Kangaroo (CUDA) | ~2B ops/sec | #55-70 |
| BitCrack (CUDA) | ~1B ops/sec | Brute-Force |

## 🎯 Für ernsthafte Puzzle-Lösung

Für Puzzles ab #50 benötigst du GPU-Tools:

1. **JeanLucPons Kangaroo** (Empfohlen)
   ```bash
   git clone https://github.com/JeanLucPons/Kangaroo
   cd Kangaroo && make gpu=1
   ./kangaroo -t 0 -gpu input.txt
   ```

2. **iceland2k14 Kangaroo** (Python + GPU)
   ```bash
   git clone https://github.com/iceland2k14/kangaroo
   pip install numba cupy
   python kangaroo.py
   ```

## 📐 Algorithmus-Erklärung

Der Kangaroo-Algorithmus nutzt zwei "Kängurus":

```
Tame Kangaroo: Startet bei bekanntem Punkt (range_end * G)
Wild Kangaroo: Startet beim Ziel-Punkt (target_pubkey)

Beide springen mit pseudo-zufälligen Distanzen.
Wenn sie kollidieren → Private Key = tame_distance - wild_distance
```

**Komplexität:** O(√n) statt O(n) für Brute-Force

## ⚠️ Wichtige Hinweise

- **Nur für offizielle Bitcoin Puzzles** (publicpuzzle.info)
- Niemals gegen fremde Wallets verwenden
- Pure Python ist zu langsam für Puzzles ab #50
- Für echte Lösungsversuche: GPU-Hardware erforderlich

## 📚 Ressourcen

- [Bitcoin Puzzle Info](https://privatekeys.pw/puzzles/bitcoin-puzzle-tx)
- [Pollard's Kangaroo Paper](https://www.ams.org/journals/mcom/1978-32-143/S0025-5718-1978-0491431-9/)
- [secp256k1 Spezifikation](https://www.secg.org/sec2-v2.pdf)

## 🧮 Mathematische Grundlagen

```
Kurve: y² = x³ + 7 (mod p)
p = 2²⁵⁶ - 2³² - 977
n = FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141 (Ordnung)
G = Generator-Punkt
```

Das Discrete-Log-Problem: Finde k, sodass k·G = PublicKey
