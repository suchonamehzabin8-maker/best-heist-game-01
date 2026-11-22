[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/suchonamehzabin8-maker/best-heist-game-01/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/suchonamehzabin8-maker/best-heist-game-01/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

# The Gilded Vault

A top-down 2D stealth heist game. One museum gallery at night, one thief, the
Meridian Star gem in a locked glass case, three patrolling guards with sweeping
vision cones, two wall cameras, and an alarm meter that decides everything.

[Play the entry on make.fun](https://make.fun/bounty/best-heist-game-20261122-0559)

## How to play

- **WASD / arrows** — move. **Shift** — sneak (slower, harder to spot).
- **Hold E** by the gem case — pick the lock (3 seconds, makes noise and draws
  the nearest guard over to look).
- **Q** — smoke pellet (3): blocks sight in a small radius for a few seconds.
- **F or click** — toss a coin (5): the nearest guard walks over to investigate
  where it lands.
- **The vent** along the top wall is a slow, hidden crawl to the gem — and it is
  one-way: you can slip in through the left grate, but you cannot crawl back
  out that way.
- A guard or camera that spots you opens a short **SPOTTED!** grace window:
  break line of sight in time and the alarm never rises. Once the alarm
  reaches 100, the gallery doors slam shut and you are caught.
- Grab the gem, then reach the **GETAWAY** door. Score: $50,000 loot, a time
  bonus, and a $10,000 ghost bonus if you were never spotted.

## Routes

- **Main hall** — patrolled, fastest.
- **Side corridor** (right) — camera-covered, quieter.
- **Vent crawl** — hidden and slow, straight to the gem.

## Run it

```sh
node serve.ts        # serves game/ at http://localhost:8123/
```

Or hand it in:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

Node 22 standard library only; the game itself is static files under `game/`
with no build step and no network requests. Sounds are WebAudio bleeps.
