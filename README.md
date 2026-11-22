[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/suchonamehzabin8-maker/best-heist-game-01/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/suchonamehzabin8-maker/best-heist-game-01/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

# The Gilded Vault

A top-down 2D stealth heist game. One night at the Meridian Museum:
cross the gallery, steal the Meridian Star gem from its locked glass
case, and reach the getaway door — without letting a guard or a
camera fill the alarm meter.

Play it at the [make.fun bounty page](https://make.fun/bounty/best-heist-game-20261122-0559).

## How to play

- **WASD / arrow keys** — move the thief
- **SHIFT** — sneak (slower, harder to spot)
- **E (hold)** — pick the gem case lock (takes 3 seconds, and the clicks are loud)
- **Q** — smoke pellet (blocks every vision cone for 5 seconds, 3 per heist)
- **F** — toss a coin toward the mouse (the nearest guard goes to look, 3 per heist)
- **M** — mute sound, **R** — restart after a catch or a getaway, **ENTER** — start

## The heist

Three routes cross the gallery: the **main hall** (patrolled by two
guards), the **camera corridor** on the east side (two sweeping red
cones and the Jade Statue), and the **vent crawl** along the top wall
(hidden from every cone, but slow). Guards walk fixed patrol routes
with pauses, looking around as they go; cameras sweep on a timer.
Being seen fills the alarm — break line of sight before it reaches
100, or the museum locks down and the heist is over.

Score: the Meridian Star ($50,000) plus pocketed loot, a time bonus,
and a ghost bonus for never being spotted.

## Play locally

```sh
node serve.ts
# open http://localhost:8080
```

## Layout

- `game/index.html` — page, canvas, HUD
- `game/src/config.js` — tuning numbers (speeds, cone angles, alarm rates, tool counts)
- `game/src/input.js` — keyboard + mouse input
- `game/src/world.js` — room layout, walls, cover, loot, collision, line of sight
- `game/src/guards.js` — guard patrols, vision cones, investigation
- `game/src/cameras.js` — camera sweeps and vision
- `game/src/alarm.js` — alarm meter, SPOTTED! grace window, caught logic
- `game/src/tools.js` — lockpick, smoke pellet, coin toss
- `game/src/audio.js` — WebAudio sounds (no audio files)
- `game/src/render.js` — all canvas drawing
- `game/src/shots.js` — scripted screenshot states (`?shot=cover` and friends)
- `game/src/main.js` — game loop and state machine
- `main.ts` — builds `/output` (game + screenshots + dossier.json)
- `serve.ts` — static server for playtesting

All art is drawn shapes and all sounds are WebAudio tones made in
code — no borrowed assets. MIT licensed.
