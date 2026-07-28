// --- 1. CORE DATA ---
const EVIDENCE = [
    { id: 'emf', label: 'EMF 5', icon: '📶', desc: "Must hit Level 5 (Red). Each ghost interaction has a 33% chance to produce EMF 5 if the ghost has this evidence." },
    { id: 'box', label: 'Box', icon: '📻', desc: "Lights OFF in the ghost's room. Must be in the same room (or nearby for ghosts that respond to everyone). Deogen responds in any lighting." },
    { id: 'uv', label: 'UV', icon: '🖐️', desc: "Green handprints." },
    { id: 'orb', label: 'Orbs', icon: '✨', desc: "Floating dots in NV." },
    { id: 'writing', label: 'Writing', icon: '📖', desc: "Ghost writes in book." },
    { id: 'freezing', label: 'Freeze', icon: '❄️', desc: "Below 0°C on thermometer. Note: visible breath appears below 5°C for all ghosts — breath alone does NOT confirm freezing evidence." },
    { id: 'dots', label: 'D.O.T.S', icon: '🟢', desc: "Green silhouette." }
];

const FILTERS = [
    { id: 'fast', label: '⚡ Speed Change' },
    { id: 'early', label: '⚠️ Early Hunter' },
    { id: 'quiet', label: '🤫 Quiet Footsteps (Myling)' },
    { id: 'guarantee', label: '✨ Guaranteed Ev' }
];

// Enhanced ghost descriptions with beginner-friendly explanations
// Replace the GHOSTS array in your script.js with this

const GHOSTS = [
    { 
        name: "Spirit", ev: ['emf','box','writing'], danger: "Med", hunt: "50%", speed: "1.7 m/s", blink: "Normal", forced: null,
        traits: ["Extended Smudge Protection"],
        desc: "The most common ghost with no special abilities. Often identified by process of elimination.",
        ability: "No unique hunt mechanics. When smudge sticks are used near it, the Spirit cannot hunt for at least 180 seconds (3 minutes). While any ghost can occasionally wait this long after a smudge, the Spirit will always wait at least this long — making it the only ghost where 180s is a guaranteed minimum, not just a possibility.",
        weakness:"Smudge Test: Use smudge sticks near the Spirit and start a timer. The Spirit will always wait at least <span class='hl-green'>180 seconds (3 minutes)</span> before hunting again — this is its guaranteed minimum. Important caveat: any ghost can occasionally wait this long by chance, so use the double-smudge method for reliability: wait ~160s, then smudge again. If it hunts within 60s of the second smudge, it's more than likely Spirit. Keep it in the forefront and select spirit by process of elimination",
        zeroEv: "The Spirit's ONLY tell is the smudge timer. Smudge it and time until the next hunt attempt — if it doesn't hunt for 3 full minutes, it's almost certainly a Spirit. Note: other ghosts CAN occasionally wait 180s too, so the double-smudge method is more reliable than a single test. The Spirit must always wait this long; for other ghosts it's just chance.",
        tags: [],
        speedStates: [{"label": "Normal", "speed": 1.7}]
    },
    { 
        name: "Wraith", ev: ['emf','box','dots'], danger: "Med", hunt: "50%", speed: "1.7 m/s", blink: "Normal", forced: null,
        traits: ["Teleports to Players", "Never Leaves Salt Footprints"],
        desc: "A floating ghost that can teleport to players. Never steps in or disturbs salt, making salt the key physical test.",
        ability: "Can randomly teleport to within 3 meters of any player, triggering an EMF 2 reading at the teleport location (EMF 5 if the Wraith has EMF5 as one of its evidence types). Because it floats, it never steps in or disturbs salt.",
        weakness:"Salt Test: Place salt piles across likely walking paths. If the ghost repeatedly walks through salt without disturbing it, suspect Wraith. If it disturbs salt, rule Wraith out. Also watch for EMF 2 spikes appearing near players in different rooms (teleport).",
        zeroEv: "Watch for random EMF readings appearing right next to a player in a room far from the active area — that's a Wraith teleport. In 0EV, use salt as a physical test: Wraith should not disturb it at all.",
        tags: ['guarantee'],
        speedStates: [{"label": "Normal", "speed": 1.7}]
    },
    { 
        name: "Phantom", ev: ['box','uv','dots'], danger: "Med", hunt: "50%", speed: "1.7 m/s", blink: "Slow", forced: null,
        traits: ["Drains Sanity Fast", "Vanishes in Photos"],
        desc: "Looking at a Phantom during events drains sanity faster (0.5%/s). Taking a photo (labelled 'Ghost') makes it disappear. Known bugs: can use its sanity-drain ability on dead players and on players outside the investigation area.",
        ability: "Drains about 0.5% sanity per second when you look directly at it during manifestations. During hunts, it stays invisible longer than other ghosts (slower blink rate = harder to see).",
        weakness:"Photo Test: Take a photo during a ghost event while the ghost is visible. If the ghost <span class='hl-green'>instantly disappears</span> from sight AND the photo is labelled as a 'Ghost' photo in the journal (meaning the photo registered correctly), it's a Phantom. If the photo is NOT labelled as Ghost, the Phantom will NOT disappear. The ghost model also won't appear in the photo itself even when it registers.",
        zeroEv: "Unusually fast sanity drain (0.5%/s) when looking directly at the ghost during events. Ghost blinking LESS during hunts than normal ghosts (stays invisible longer between flickers). Disappears when photographed during an event — but only if the photo is labelled as 'Ghost' in the journal; an unlabelled photo won't make it vanish.",
        tags: ['vis'],
        speedStates: [{"label": "Normal", "speed": 1.7}]
    },
    { 
        name: "Poltergeist", ev: ['box','uv','writing'], danger: "Med", hunt: "50%", speed: "1.7 m/s", blink: "Normal", forced: null,
        traits: ["Throws Many Objects", "Very Active"],
        desc: "Extremely active ghost that loves throwing objects. Can throw many items at once, draining sanity with each throw. Useless in empty rooms!",
        ability: "Can throw multiple objects simultaneously in a 3-meter radius. Each thrown item drains 2% sanity from nearby players. Will also throw objects during hunts. Completely ineffective in empty rooms with nothing to throw.",
        weakness:"Pile Test: Create a large pile of throwable objects in the active area. A Poltergeist can 'explode' the entire pile, scattering items in all directions simultaneously. Also note that Poltergeists throw objects <span class='hl-green'>every 0.5 seconds</span> during hunts (100% chance each interval) vs other ghosts' 50% chance — much more frequent mid-hunt throwing.",
        zeroEv: "Constant, heavy object throwing — way more than any other ghost. Objects thrown during hunts very frequently. Each thrown object drains 2% sanity from nearby players, so rapid sanity loss in a cluttered room is suspicious. Exploding a pile of objects is a near-certain tell.",
        tags: ['vis'],
        speedStates: [{"label": "Normal", "speed": 1.7}]
    },
    { 
        name: "Banshee", ev: ['uv','orb','dots'], danger: "Low", hunt: "Target Sanity", speed: "1.7 m/s", blink: "Normal", forced: null,
        traits: ["Targets One Player", "Unique Scream"],
        desc: "Chooses ONE player as its target at the start and focuses exclusively on them. Hunt threshold uses the target's sanity, NOT the team's average!",
        ability: "Randomly picks one player as its 'target' at contract start. Focuses exclusively on this player during hunts. Uses the TARGET's sanity only (not team average) to decide when to hunt. Target changes when any player dies (not just the target dying).",
        weakness:"Parabolic Mic Test: Point the parabolic mic toward the active area from outside. If you hear a <span class='hl-green'>unique screech/wail sound</span> that other ghosts don't make, it's a Banshee. Important: <strong>any player</strong> can hear this scream — not just the target. In multiplayer, watch who the ghost chases during hunts — it will always ignore other players and beeline for its target, even walking past them.",
        zeroEv: "In multiplayer: one player always gets chased regardless of others being nearby, and the ghost ignores everyone else mid-hunt. The Banshee hunts using its TARGET's sanity only (not team average), so it can hunt early if one player has low sanity even while others are high. Unique screech on parabolic mic is audible to any player, not just the target — a reliable solo and team tell.",
        tags: ['guarantee'],
        speedStates: [{"label": "Normal", "speed": 1.7}]
    },
    { 
        name: "Jinn", ev: ['emf','uv','freezing'], danger: "High", hunt: "50%", speed: "1.7-2.5 m/s", blink: "Normal", forced: null,
        traits: ["Fast with Power ON", "Sanity Zap", "Never Cuts Power"],
        desc: "Very territorial ghost that moves MUCH faster when the breaker is ON and it can see you. Can also drain 25% sanity instantly with an ability.",
        ability: "Speeds up to 2.5 m/s when chasing in line-of-sight and breaker is ON. Sanity drain ability: instantly drains 25% from nearby players when breaker is ON (gives EMF 2 or 5 at the breaker). Will never turn the breaker OFF. Bug: the 25% drain ability can affect players on the floor directly below (3m range is not blocked by floors).",
        weakness:"Breaker Speed Test: Make sure the breaker is ON. During a hunt, if the ghost is fast (2.5 m/s) when it has line-of-sight from more than 3m away, turn the breaker OFF. <span class='hl-green'>If it immediately drops to normal speed (1.7 m/s)</span>, it's a Jinn. Also watch for sudden 25% sanity drops near the ghost (breaker must be ON for this ability).",
        zeroEv: "Very fast movement during hunts ONLY when the breaker is on and the ghost has line-of-sight. Cutting the power removes the speed boost instantly. The Jinn will NEVER turn the breaker off itself (only other ghosts can do that). Sudden 25% sanity zaps near the ghost with the power on.",
        tags: ['fast'],
        speedStates: [{"label": "Normal", "speed": 1.7}, {"label": "LoS + breaker ON", "speed": 2.5}]
    },
    { 
        name: "Mare", ev: ['box','orb','writing'], danger: "Med", hunt: "60% (dark) / 40% (light)", speed: "1.7 m/s", blink: "Normal", forced: null,
        traits: ["Fears Light", "Hunts Earlier in Dark"],
        desc: "Empowered by darkness, weakened by light. Hunts earlier in dark rooms (60%) and less often in lit rooms (40%). Will immediately switch lights OFF and frequently breaks bulbs. Does not actively seek dark rooms — it roams more when its current room is lit, which tends to move it around frequently.",
        ability: "Hunts at 60% sanity in DARK rooms but only 40% sanity in LIT rooms. Will immediately turn lights OFF (within seconds) and frequently shatters bulbs. Can NEVER turn lights ON — only off. Note: despite patch notes suggesting otherwise, the Mare currently cannot turn TVs or computers on either (a known in-game bug).",
        weakness:"Light Test: Switch ON a light in the active area. A Mare can <span class='hl-red'>immediately</span> turn a light back off after you switch it on (within 4m, ~10s cooldown per light) — repeated instant shut-offs are a strong tell. It cannot turn lights ON, only off. You can also test hunt threshold: if it hunts in a lit room, sanity must be below 40%. In a dark room, it can hunt at 60%. Keeping the active area lit forces it to a lower hunt threshold.",
        zeroEv: "Lights constantly being switched off, never turned on. Frequent light bulb breaking events. Hunts earlier in dark areas (60%) but safer if room is lit (40% threshold). If a light goes off almost immediately after you turn it on, that's a strong Mare indicator. Note: the Mare does not seek out dark rooms — it simply roams more when its current room is lit, which tends to move it around the map frequently.",
        tags: ['early'],
        speedStates: [{"label": "Normal", "speed": 1.7}]
    },
    { 
        name: "Revenant", ev: ['orb','writing','freezing'], danger: "High", hunt: "50%", speed: "1.0 / 3.0 m/s", blink: "Normal", forced: null,
        traits: ["Fastest When Chasing", "Slowest When Searching"],
        desc: "The ultimate hunter. Extremely slow when searching (1.0 m/s) but VERY fast when it sees you (3.0 m/s). Nearly impossible to outrun once spotted!",
        ability: "Moves at only 1.0 m/s (very slow - half normal speed) when roaming without seeing anyone. Speeds up to 3.0 m/s (nearly twice normal!) when it has line of sight on a player. Constantly alternates between these speeds.",
        weakness:"Speed Listen Test: During a hunt, listen carefully when hidden. Revenant footsteps should be <span class='hl-green'>very slow (1 m/s)</span> when it hasn't seen anyone — slower than a walking player. If it suddenly spots someone, it rockets to 3 m/s (nearly sprint speed). This dramatic slow-to-fast switch is unmistakable. Break line of sight by ducking through a doorway to make it slow again.",
        zeroEv: "The Revenant's slow-to-fast speed pattern is its biggest tell: methodically slow footsteps while searching (1 m/s), then extremely rapid footsteps when it detects a player (3 m/s). If you hear it speed up without being chased, it may have detected voice or equipment. Never run in a straight line — always corner or break LoS.",
        tags: ['fast'],
        speedStates: [{"label": "Searching", "speed": 1.0}, {"label": "Chasing (LoS)", "speed": 3.0}]
    },
    { 
        name: "Shade", ev: ['emf','writing','freezing'], danger: "Low", hunt: "35%", speed: "1.7 m/s", blink: "Normal", forced: null,
        traits: ["Very Shy", "Low Activity", "Won't Hunt in Groups"],
        desc: "The shyest ghost. Very low activity. Cannot initiate a hunt OR produce an EMF reading while any player is in the same room as it — this checks the Shade’s current room, not necessarily its favourite room. Groups are safer, but note it can still reach into an occupied room to interact with objects from an adjacent room.",
        ability: "Cannot initiate a hunt if any player is in the same room as it — even a single player prevents it from hunting. Hunts at only 35% sanity (lower than normal 50%). Generally very passive with low activity levels.",
        weakness:"Group Test: Stay in the active area as a team with a crucifix placed. Let sanity drop below 35%. If the ghost refuses to hunt while any player is in the room despite very low sanity, it's very likely a Shade. You can also try placing a Ghost Writing book alone — the Shade won't write in it if a player is in the room. Send one person in solo to trigger activity.",
        zeroEv: "Extremely passive — very low ghost activity, rare interactions, barely any events. Will not hunt OR produce EMF readings while any player is in the same room (not just the favourite room). It can still reach into the room from an adjacent one to interact with objects. If activity is near-zero while players are present but picks up when the room is empty, suspect Shade.",
        tags: [],
        speedStates: [{"label": "Normal", "speed": 1.7}]
    },
    { 
        name: "Demon", ev: ['uv','writing','freezing'], danger: "Extreme", hunt: "70%", speed: "1.7 m/s", blink: "Normal", forced: null,
        traits: ["Very Aggressive", "Hunts Early", "Short Cooldown"],
        desc: "The most aggressive ghost. Hunts very early (70% sanity) and very frequently. Can rarely hunt at ANY sanity level! Use crucifixes early.",
        ability: "Hunts at 70% sanity (vs normal 50%). Only 20-second cooldown between hunts (vs normal 25s). Has a rare ability to hunt at 100% sanity (very rare). Smudging only prevents hunts for 60s (vs 90s). Crucifix range is 50% larger against Demon: T1 4.5m, T2 6m, T3 7.5m",
        weakness:"Smudge Timing Test: Smudge the ghost when it's NOT hunting and start a timer. If it initiates a hunt <span class='hl-red'>between 60–90 seconds</span> after being smudged (vs Spirit's 180s or standard 90s), it's likely a Demon. Also watch for hunts at high sanity (70%+) and very short gaps between consecutive hunts (20s cooldown vs 25s normally).",
        zeroEv: "Frequent hunts starting at 60–70% sanity — you'll be hunted way earlier than expected. Very short cooldown between hunts. Smudge blocks hunting for only 60 seconds. Crucifix range is 50% larger against Demon: T1 4.5m, T2 6m, T3 7.5m. Rare chance to hunt at ANY sanity, even 100%.",
        tags: ['early'],
        speedStates: [{"label": "Normal", "speed": 1.7}]
    },
    { 
        name: "Yurei", ev: ['orb','freezing','dots'], danger: "Med", hunt: "50%", speed: "1.7 m/s", blink: "Normal", forced: null,
        traits: ["Slams Doors Shut", "Heavy Sanity Drain"],
        desc: "Drains sanity by fully slamming doors shut. Each full door slam drains 15% sanity from nearby players.",
        ability: "Can smoothly close a door fully (without creaking) and drain 15% sanity from nearby players — this is its unique ability. Only ghost that can close EXIT doors outside of hunts. When smudged, trapped in its room for ~90 seconds. Bug: can partially open locker doors.",
        weakness:"Door Slam Test: Leave doors in the active area propped open at 45°. A Yurei can <span class='hl-green'>fully close a door in one smooth motion</span> (no creaking) while draining 15% sanity from nearby players — this is its unique ability. Critically, if a door leading OUTSIDE the building fully closes without a hunt or event, it's <span class='hl-green'>100% a Yurei</span> (only ghost that can do this). Smudge it and place motion sensors at doorways — if it doesn't leave for 90s, supports Yurei.",
        zeroEv: "A door closing fully and smoothly (not slamming during a hunt/event) with a sudden 15% sanity drop is the clearest tell. Watch exit/building doors especially — only Yurei closes those outside of hunts. After smudging, the Yurei gets temporarily confined to its room (use motion sensors to verify it hasn't left).",
        tags: [],
        speedStates: [{"label": "Normal", "speed": 1.7}]
    },
    { 
        name: "Oni", ev: ['emf','freezing','dots'], danger: "Med", hunt: "50%", speed: "1.7 m/s", blink: "Solid", forced: null,
        traits: ["Very Active", "More Visible", "No Airball Event"],
        desc: "Very active and physical ghost. More visible during hunts. Cannot do the 'airball' ghost event - seeing an airball proves it's NOT an Oni!",
        ability: "Cannot perform the 'airball' mist event (floating ball of mist). Drains 20% sanity during WALKING manifestation event collisions (vs 10% normal). Note: singing events only drain 10% due to a known bug. More visible during hunts — stays visible longer between flickers.",
        weakness:"Airball Elimination Test: Watch ghost events carefully. If you visually see the 'airball' event — a small ball of mist/smoke floating towards you — it is <span class='hl-red'>100% NOT an Oni</span>. Important: a walking ghost manifestation can also produce the same hiss sound as an airball event. You must actually <strong>see</strong> the floating mist ball, not just hear the hiss, before ruling out Oni. During hunts, the Oni stays visible longer between flickers — more visible than other ghosts. Very high object interaction rate is also a strong indicator.",
        zeroEv: "Very high activity level — lots of physical interactions and events. Cannot be an Oni if you visually see the airball mist event (the hiss sound alone is not enough — walking manifestation events make the same hiss). During hunts, the ghost stays visible longer than normal. Sanity drain: Oni drains 20% on WALKING manifestation collisions, but only 10% on SINGING events (a known in-game bug).",
        tags: ['vis'],
        speedStates: [{"label": "Normal", "speed": 1.7}]
    },
    { 
        name: "Yokai", ev: ['box','orb','dots'], danger: "Med", hunt: "80% (talking) / 50%", speed: "1.7 m/s", blink: "Normal", forced: null,
        traits: ["Triggered by Talking", "Deaf During Hunts"],
        desc: "Attracted to player voices. Talking near it can trigger hunts at 80% sanity! But during hunts, it's nearly deaf - only hears within 2.5m.",
        ability: "If players talk within 2m of the Yokai, it can hunt at 80% sanity instead of 50%. Silence = 50% threshold. During hunts, can only detect voice and electronics within 2.5m (vs 12m normal) — very easy to hide from if quiet. Bug: Music Box triggers Yokai event at standard 5m range instead of its 2.5m reduced range.",
        weakness:"Voice Detection Test: During a hunt, hide in a nearby room and talk loudly or use your microphone. A normal ghost can detect voices from <span class='hl-green'>12m away</span>. If the ghost completely ignores your talking from more than 2.5m, it's a Yokai. Also: if hunts start very early (80% sanity) when players are talking near the active area, that confirms it.",
        zeroEv: "Hunts at 80% sanity if players are talking within 2m of the ghost — stop talking near the active area! During hunts, Yokai can only hear voices and detect electronics within 2.5m (vs 12m normally), making it very easy to hide from if you stay quiet and keep distance. Both early hunts AND 'deaf' hunting behavior together strongly suggest Yokai.",
        tags: ['early'],
        speedStates: [{"label": "Normal", "speed": 1.7}]
    },
    { 
        name: "Hantu", ev: ['freezing','orb','uv'], danger: "Med", hunt: "50%", speed: "1.4-2.7 m/s", blink: "Normal", forced: "freezing",
        traits: ["Faster in Cold", "Visible Breath", "Never Turns Power ON"],
        desc: "Moves faster in cold rooms and slower in warm rooms. Shows visible freezing breath during hunts. Cannot turn the breaker ON.",
        ability: "Speed scales with temperature: 1.4 m/s in warm → 2.7 m/s in freezing. No LOS speed-up — Hantu moves at a fixed speed based on room temperature only. Shows visible frosty breath during hunts even in warm areas. Will never turn breaker ON (but can turn it OFF). Has double the normal chance to turn breaker off.",
        weakness:"Temperature Speed Test: Keep the breaker ON to warm rooms. During a hunt in a warm area, a Hantu slows to 1.4 m/s. In a freezing room it hits 2.7 m/s. Look for <span class='hl-green'>visible frosty breath clouds</span> emanating from the ghost during hunts — this is unique to Hantu and appears even in warm rooms. Hantu also has a doubled chance to turn the breaker OFF, but will NEVER turn it ON.",
        zeroEv: "Visible freezing breath clouds from the ghost during a hunt, even in warm areas — this is Hantu's most reliable visual tell. Speed varies dramatically between rooms: very fast in cold rooms, noticeably sluggish in warm ones. The breaker frequently goes off, but never gets turned back on by the ghost.",
        tags: ['fast'],
        speedStates: [{"label": "Warm room", "speed": 1.4}, {"label": "Freezing room", "speed": 2.7}]
    },
    { 
        name: "Goryo", ev: ['emf','uv','dots'], danger: "Low", hunt: "50%", speed: "1.7 m/s", blink: "Normal", forced: "dots",
        traits: ["D.O.T.S Camera Only", "Never Roams Far"],
        desc: "D.O.T.S evidence ONLY shows on video camera, never with naked eye. Very territorial - doesn't roam far from active area.",
        ability: "D.O.T.S silhouette is only visible through a video camera (not with your eyes directly). The effect only shows when no players are in the room. Goryo will not roam far from its favorite room.",
        weakness:"Camera-Only D.O.T.S Test (Nightmare/Insanity only): Set up a video camera pointing at the D.O.T.S projector and leave the room. If you see the D.O.T.S silhouette <span class='hl-green'>ONLY through the camera feed</span> and NEVER with your naked eyes, it's a Goryo. The D.O.T.S also only appears when NO players are in the room. <span class='hl-red'>IMPORTANT: On 0-evidence custom difficulty, Goryo shows NO D.O.T.S at all</span> — the only tell is that it never changes favourite room and only performs short roams.",
        zeroEv: "<span class='hl-red'>On 0 evidence: Goryo is nearly impossible to confirm.</span> D.O.T.S does not appear at all. Your only tells are behavioural: it will never change its active area, only performs short roams (use salt/motion sensors to observe), and has the highest interaction rate of any ghost. On Nightmare/Insanity (1–2 ev), if D.O.T.S is one of the shown evidences, it will ONLY appear via video camera — never to the naked eye.",
        tags: ['guarantee'],
        speedStates: [{"label": "Normal", "speed": 1.7}]
    },
    { 
        name: "Myling", ev: ['emf','writing','uv'], danger: "Med", hunt: "50%", speed: "1.7 m/s", blink: "Normal", forced: null,
        traits: ["Silent Footsteps", "More Vocal"],
        desc: "Has very short-range footsteps and vocals during hunts — only audible within 12m instead of the normal 20m. Can still make vocal sounds during hunts, they're just quieter at the same distance. Very vocal on parabolic mic outside of hunts.",
        ability: "Footsteps during hunts are only audible within 12 meters instead of the normal 20 meters. This makes it much harder to hear approaching. More vocal on the parabolic microphone.",
        weakness:"Flashlight Floor Test: Drop your flashlight on the floor during a hunt (it won't attract the ghost while on the floor). Watch for the flashlight flickering — the ghost is within 10m. If the flashlight IS flickering but you <span class='hl-green'>cannot hear footsteps yet</span>, it's a Myling (footsteps only audible within 12m vs 20m normally). Other ghosts: you'd hear footsteps well before seeing flickering.",
        zeroEv: "Both footsteps AND vocals during hunts are only audible within 12m instead of 20m — the ghost seems near-silent until it is already very close. Note: Myling CAN make vocal sounds during hunts like any other ghost, they're just shorter-ranged. Outside hunts, Mylings make paranormal sounds more frequently than average on the Parabolic Mic. The surprise close approach is the danger.",
        tags: ['quiet'],
        speedStates: [{"label": "Normal", "speed": 1.7}]
    },
    { 
        name: "Onryo", ev: ['box','orb','freezing'], danger: "High", hunt: "60% / 40% near flame", speed: "1.7 m/s", blink: "Normal", forced: null,
        traits: ["Fears Fire", "Flame-Triggered Hunts"],
        desc: "Fears fire - lit flames block hunts like crucifixes. But blowing out 3 flames triggers a hunt at ANY sanity level! Keep flames lit!",
        ability: "Lit flames within 4m block the Onryo's hunt attempts (like a crucifix — and the flame takes priority if both are in range). While within 4m of a flame its hunt threshold actually drops to 40%, but every blocked attempt blows the flame out. After 3 total blow-outs (tracked all game), it hunts at ANY sanity level. It can never light fires itself.",
        weakness:"Firelight Test: Light a Firelight near the active area. The Onryo treats flames like crucifixes — it <span class='hl-green'>cannot hunt while a flame is within 4m</span> of it. Instead, it blows the flame out. Every time it blows out a flame to stop a hunt, that counts toward a tally. On the <span class='hl-red'>3rd blow-out</span>, it hunts regardless of sanity. To confirm: place a crucifix AND a Firelight. If the flame blows out first instead of the crucifix burning, it's an Onryo.",
        zeroEv: "Flames being blown out regularly — each blow-out is a blocked hunt attempt. Keep 2 Firelights active so blow-out of one is blocked by the other. After 3 total blow-outs it can hunt at any sanity. Tier II Firelights (3 candles) are much more likely to be blown out (~96% combined chance) — but still count as 1 flame for Onryo mechanics. Onryo cannot light any fire sources.",
        tags: ['early'],
        speedStates: [{"label": "Normal", "speed": 1.7}]
    },
    { 
        name: "The Twins", ev: ['emf','box','freezing'], danger: "Med", hunt: "50%", speed: "1.53 / 1.87 m/s", blink: "Normal", forced: null,
        traits: ["Two Entities", "Alternating Speeds"],
        desc: "Actually a single ghost with two interaction ranges. Can interact in two places at once. When hunting, one twin is slower (1.53 m/s) and the other faster (1.87 m/s) — they alternate who hunts.",
        ability: "Two ghosts: Main entity (1.53 m/s, −10%) and Decoy entity (1.87 m/s, +10%). They alternate which one initiates hunts. Can interact with the environment in two different locations simultaneously.",
        weakness:"Dual Interaction Test: Watch for interactions happening in <span class='hl-green'>two different rooms simultaneously</span> — this is only possible with the Twins. You may see EMF readings or object interactions in different locations at once. During hunts, listen for speed variation across different hunts: one hunt may feel slower (~1.53 m/s) and the next faster (~1.87 m/s) — this is the two twins alternating who initiates.",
        zeroEv: "Simultaneous interactions in separate rooms are the clearest tell — e.g. a door in one room and an object in another moving at the same time. Hunt speeds will feel inconsistent across hunts (one is 10% slower, one is 10% faster than normal 1.7 m/s). The ghost may also start a hunt from an unexpected location far from the active area.",
        tags: ['fast'],
        speedStates: [{"label": "Slow twin", "speed": 1.5}, {"label": "Fast twin", "speed": 1.9}]
    },
    { 
        name: "Raiju", ev: ['emf','orb','dots'], danger: "High", hunt: "65% (electronics)", speed: "1.7-2.5 m/s", blink: "Normal", forced: null,
        traits: ["Powered by Electronics", "Early Hunter"],
        desc: "Powered by electronics! Moves faster near active equipment and can hunt earlier (65% vs 50%) when near electronics. Turn equipment OFF!",
        ability: "Near active electronics, moves at 2.5 m/s and can hunt at 65% sanity instead of 50%. Disrupts electronics from 15m away (vs normal 10m). Note: only held/carried electronics trigger the early hunt threshold — placed DOTS T2/T3, motion sensors, and sound sensors do not count.",
        weakness:"Electronics Speed Test: Leave active equipment (flashlights, D.O.T.S, EMF readers) on the floor in/near the active area. During a hunt, if the ghost moves at <span class='hl-green'>2.5 m/s near your gear</span> and slows to 1.7 m/s away from it, it's a Raiju. Also: you'll hear your heartbeat from 15m away (vs 10m for other ghosts) and electronics flicker from further away (15m vs 10m). Note: Most active electronics count. Exceptions include motion sensors, sound sensors, and DOTS projectors when thrown/held; don’t rely on those for a Raiju test.",
        zeroEv: "Very fast movement during hunts specifically near active electronics — slows noticeably when away from gear. Electronics flickering from unusually long range (15m). Can hunt at 65% sanity if active equipment is nearby. To slow it down, turn off flashlights and pick up any active equipment during a hunt.",
        tags: ['fast', 'early'],
        speedStates: [{"label": "Normal", "speed": 1.7}, {"label": "Near electronics", "speed": 2.5}]
    },
    { 
        name: "Obake", ev: ['emf','orb','uv'], danger: "Med", hunt: "50%", speed: "1.7 m/s", blink: "Shifting", forced: "uv",
        traits: ["Shapeshifter", "6-Finger Prints", "75% UV Chance"],
        desc: "A shapeshifter that can leave 6-finger handprints! Only has 75% chance to leave UV evidence (vs 100% normal). Changes appearance during hunts.",
        ability: "Can leave 6-finger handprints instead of normal 5-finger (rare but confirms it). Only 75% chance to leave UV evidence at all (vs 100% for others). Changes ghost model/appearance during hunts. UV evidence disappears faster (half the normal time).",
        weakness:"Fingerprint Test: Check all doors and surfaces the ghost touches for UV fingerprints. Obake has a <span class='hl-red'>75% chance to leave fingerprints</span> (not 100% like other ghosts), and those prints fade in ~30s instead of 60s. If you find a <span class='hl-green'>6-finger handprint</span> on a door, it's 100% confirmed Obake. During hunts, watch for the ghost's model briefly changing to a different ghost — this happens at least once per hunt.",
        zeroEv: "In 0EV, fingerprints and UV footprints do not appear. Watch the ghost during hunts: Obake can briefly blink/model-shift into a different ghost model. That visual tell is the useful no-evidence check.",
        tags: ['guarantee'],
        speedStates: [{"label": "Normal", "speed": 1.7}]
    },
    { 
        name: "The Mimic", ev: ['box','freezing','uv'], danger: "Low", hunt: "Variable", speed: "Variable", blink: "Variable", forced: "orb",
        traits: ["Copies Other Ghosts", "ALWAYS Has Ghost Orbs"],
        desc: "Copies/mimics other ghost types every 30s-2min. ALWAYS shows Ghost Orbs as a 4th evidence - if you have 3 evidence + Orbs, it's a Mimic!",
        ability: "Mimics the traits, abilities, speeds, and hunt patterns of other ghost types, changing which ghost it copies every 30 seconds to 2 minutes. ALWAYS has Ghost Orbs as forced 4th evidence.",
        weakness:"Fourth Evidence Test: The Mimic <span class='hl-green'>ALWAYS produces Ghost Orbs</span> as a fake 4th piece of evidence — even on 0-evidence custom runs. If you see Ghost Orbs AND collect 2 other evidence on Nightmare, suspect Mimic strongly. Watch for wildly inconsistent behavior across different hunts: speed, hunt threshold, and abilities all changing every 30s–2min as it mimics a new ghost type.",
        zeroEv: "Behaviour that dramatically shifts — one hunt it's slow, then fast, then it can't be hidden from, then hunts at high sanity. Mimic Orbs can still appear even when normal evidence is disabled, because they behave like part of The Mimic's ability rather than standard evidence. The mimic changes which ghost it copies every 30 seconds to 2 minutes (never mid-hunt). Cannot copy Goryo's camera-only D.O.T.S behaviour.",
        tags: ['fast', 'guarantee'],
        speedStates: [{"label": "Copies host ghost", "speed": 0}]
    },
    { 
        name: "Moroi", ev: ['box','writing','freezing'], danger: "High", hunt: "50%", speed: "1.5-2.25 m/s", blink: "Normal", forced: "box",
        traits: ["Curses Players", "Gets Faster at Low Sanity"],
        desc: "Getting a Spirit Box response CURSES you, doubling your sanity drain! Moves faster as sanity drops (1.5 → 2.25 m/s). Sanity pills slow it down!",
        ability: "Spirit Box response or parabolic microphone sounds curse the player, causing 2x passive sanity drain (lights won't stop it). Speed increases from 1.5 m/s at high sanity to 2.25 m/s at low sanity (up to 3.71 m/s with LOS at 0% sanity). Smudge blind during hunts lasts ~7 seconds (vs ~5s for other ghosts — a known bug vs intended 7.5s).",
        weakness:"Curse & Pill Test: Get a Spirit Box response (this curses the respondent). If that player's sanity drops even while standing in lit areas — which normally stops drain — they're cursed by a Moroi. <span class='hl-green'>Taking Sanity Pills removes the curse</span>. During a hunt, smudge it and count: Moroi is blinded for ~7 seconds (vs 5s for other ghosts). Also watch ghost speed across multiple hunts — it gets progressively faster as average sanity drops.",
        zeroEv: "Gets noticeably faster in later hunts as team sanity drops — can become one of the fastest ghosts in the game near 0% sanity (up to ~3.71 m/s). Spirit Box is forced evidence on Nightmare. If a cursed player's sanity drains in the light and pills fix it, that strongly points to Moroi.",
        tags: ['fast'],
        speedStates: [{"label": "High sanity", "speed": 1.5}, {"label": "Low sanity (base)", "speed": 2.25}, {"label": "0% sanity + LoS max", "speed": 3.71}]
    },
    { 
        name: "Deogen", ev: ['box','writing','dots'], danger: "High", hunt: "40%", speed: "0.4-3.0 m/s", blink: "Normal", forced: "box",
        traits: ["Always Knows Location", "Slow When Close"],
        desc: "Always knows exactly where you are - you CANNOT hide from it! Very fast from distance (3.0 m/s) but super slow up close (0.4 m/s). Loop it!",
        ability: "Always knows player locations - hiding in lockers/closets doesn't work! Moves at 3.0 m/s when far away but slows to 0.4 m/s when within a few meters. Spirit Box can be used anywhere (vs requiring dark).",
        weakness:"Hiding Test: Try to hide in a closet or locker. <span class='hl-red'>Deogen always knows where you are</span> — it will walk directly to your hiding spot every single time. Your only survival option is to loop it around furniture, as it slows to 0.4 m/s when within ~2.5m of a player. Spirit Box is forced evidence on Nightmare, and Deogen gives a <span class='hl-green'>unique heavy breathing/bull-like response</span> that sounds different from normal spirit box answers.",
        zeroEv: "Ghost immediately walking to exactly where every player is hiding — no hesitation, never searches. Very fast from distance (3 m/s) then dramatically slows to a crawl up close (0.4 m/s). Spirit Box gives a unique heavy breathing sound. Loop it around furniture to survive — never hide in enclosed spots.",
        tags: ['fast', 'guarantee'],
        speedStates: [{"label": "From distance", "speed": 3.0}, {"label": "Up close", "speed": 0.4}]
    },
    { 
        name: "Thaye", ev: ['orb','writing','dots'], danger: "High → Low", hunt: "75% → 15%", speed: "2.75 → 1.0 m/s", blink: "Normal", forced: null,
        traits: ["Ages Over Time", "Fast Early, Slow Late"],
        desc: "Ages every 1-2 minutes, becoming slower and less active over time. Starts VERY aggressive (75%, 2.75 m/s) but becomes weakest ghost! Wait it out!",
        ability: "Starts extremely active and dangerous: 75% hunt threshold and 2.75 m/s speed. Ages down every 1-2 minutes spent near players, eventually reaching 15% threshold and 1.0 m/s (slowest ghost). Can ask age on Ouija Board.",
        weakness:"Age Progression Test: Thaye starts young (75% hunt threshold, 2.75 m/s) and ages every 1–2 minutes <span class='hl-green'>only while players are nearby</span>. If the ghost was terrifyingly aggressive at the start but noticeably slowed and became passive over time, it's a Thaye. You can also ask its age on the Ouija Board — it will answer with a number. Older = slower and less active.",
        zeroEv: "Very high activity and aggression early on — hunts at 75% sanity and moves faster than almost any ghost. Activity and speed wind down progressively as time passes with players nearby. Late-game it may barely hunt at all (15% threshold, 1 m/s). Note: if no players are near the active area, it won't age — it stays young and dangerous.",
        tags: ['fast', 'early'],
        speedStates: [{"label": "Young (start)", "speed": 2.75}, {"label": "Aged (end)", "speed": 1.0}]
    }
    ,
    { 
        name: "Dayan", ev: ['emf','orb','box'], danger: "Med", hunt: "45/50/65%", speed: "1.2-2.25 m/s", blink: "Normal", forced: null,
        traits: ["Reacts to Movement", "Female Only", "Proximity Sensitive"],
        desc: "A hyper-vigilant spirit that reacts to player movement. Speeds up dramatically when players move near her (10m), but slows way down when standing still!",
        ability: "When >10m from all players: behaves like a normal ghost (1.7 m/s with standard LOS speed-up). Within 10m: speeds up to 2.25 m/s if any player moves, or slows to 1.2 m/s if everyone stands still. Hunt threshold changes by proximity/movement: 65% if a nearby player is moving, 45% if nearby players are standing still, and 50% when no players are within range. Always female model.",
        weakness:"Stand Still Test: During a hunt, when the ghost is within 10m, <span class='hl-green'>stop moving completely</span>. Dayan slows dramatically to 1.2 m/s when players stand still, and speeds back up to 2.25 m/s the instant you move. This speed swing is very noticeable. Also: if hunts start early while players are moving nearby (65% threshold while moving) but stop when you freeze, that's a strong tell. Dayan is always a female ghost model — check the name/gender in the journal.",
        zeroEv: "The most reliable test: freeze completely during a hunt. If the ghost abruptly slows to barely moving and then rockets forward again the instant you step, it's Dayan. Early hunts are more likely when players are moving near her, safer when standing still (45% vs 65% threshold). Always female gender — easy to check in journal.",
        tags: ['fast'],
        speedStates: [{"label": "Player still", "speed": 1.2}, {"label": "Player moving", "speed": 2.25}]
    }
    ,
    { 
        name: "Gallu", ev: ['emf','uv','box'], danger: "High", hunt: "40-60%", speed: "1.36-1.96 m/s", blink: "Normal", forced: null,
        traits: ["Hates Protective Equipment", "Three States", "Demon-Like"],
        desc: "Another form of demon that gets ENRAGED when you use protective equipment! Crucifixes and smudge sticks provoke it, making them less effective over time.",
        ability: "Cycles through three states. Normal (1.7 m/s, 50% threshold): triggered into Enraged by salt (2s delay), incense, or crucifix. Enraged (1.96 m/s, 60% threshold, only 4s incense blind, -2m crucifix range): does NOT disturb salt. Stays enraged until the hunt ends, then goes to Weakened. Weakened (1.36 m/s, 40% threshold, 6s incense blind, +1m crucifix range): DOES disturb salt. Returns to Normal via salt (3s delay), incense, or crucifix.",
        weakness:"Provocation Test: Use a crucifix or smudge sticks deliberately. A Gallu enters an <span class='hl-red'>Enraged state</span> (60% threshold, 1.96 m/s, only 4s incense blind) when protective gear is used — or when it steps in salt. After the enraged hunt ends it drops to a <span class='hl-green'>Weakened state</span> (40% threshold, 1.36 m/s, 6s incense blind). Key tell: in Enraged state the Gallu does NOT disturb salt. If it walks through a pile and leaves no impression, it is Enraged.",
        zeroEv: "Ghost becoming more aggressive after you use defensive equipment. Three-phase cycle: Normal → Enraged (after salt/smudge/crucifix) → Weakened (after enraged hunt ends). Key tells: Enraged = won't disturb salt + 4s incense blind; Weakened = disturbs salt + 6s incense blind. Multiplayer note: only the HOST reliably sees Gallu disturb salt — non-host players may see it walk through without disturbing it.",
        tags: ['early', 'fast'],
        speedStates: [{"label": "Normal", "speed": 1.7}, {"label": "Enraged", "speed": 1.96}, {"label": "Weakened", "speed": 1.36}]
    }
    ,
    { 
        name: "Obambo", ev: ['uv','writing','dots'], danger: "Med", hunt: "10% / 65%", speed: "1.45 / 1.96 m/s", blink: "Normal", forced: null,
        traits: ["Dual States", "Mood Swings", "Unpredictable"],
        desc: "Switches between calm and aggressive states on a timer. Calm: very chatty and easy to track, but barely hunts (10%, 1.45 m/s). Aggressive: much quieter ambient activity, but hunts early and fast (65%, 1.96 m/s)!",
        ability: "Always starts CALM, first switches 1 minute after an exit door is first opened, then flips every 2 minutes (it can even switch mid-hunt). Calm state: 10% hunt threshold, 1.45 m/s, and counter-intuitively <span class='hl-green'>very HIGH activity</span> — lots of interactions, easy to track. Aggressive state: 65% threshold, 1.96 m/s, but <span class='hl-red'>LOW ambient activity</span> — it goes quiet right when it's most dangerous. Hunts that start while aggressive are 20% shorter than normal.",
        weakness:"Phase Watch Test: Track the clock from when the front door first opens — 1 minute to the first flip, then every 2 minutes. An Obambo alternates between a <span class='hl-green'>Calm phase</span> (interaction-heavy, easy evidence, 10% threshold, 1.45 m/s) and an <span class='hl-red'>Aggressive phase</span> (eerily quiet but hunting at 65%, 1.96 m/s). Do NOT use 'it's quiet so we're safe' logic — quiet is the dangerous phase. A mid-hunt speed snap (slow to fast or back, for no visible reason) is a strong confirm, as is timing a fast-start hunt that ends ~20% early.",
        zeroEv: "Behaviour that cycles in waves on a repeating ~2-minute timer: an activity-heavy phase where it barely hunts, then a quiet phase where hunts start at surprisingly high sanity. Its speeds can be mistaken for The Twins (similar 1.45/1.96 split) — but if the ghost consistently starts hunts at the FAST speed while sanity is above ~50%, it's far more likely Obambo (Twins alternate randomly). A fast-start hunt that ends noticeably early (20% shorter) or a mid-hunt speed change with no cause is near-conclusive.",
        tags: ['fast', 'early'],
        speedStates: [{"label": "Calm phase", "speed": 1.45}, {"label": "Aggressive phase", "speed": 1.96}]
    }
        ,
    { 
        name: "Aswang", ev: ['freezing','writing','dots'], danger: "Med", hunt: "50%", speed: "1.53 → 2.53 m/s", blink: "Normal", forced: null,
        traits: ["Faster LoS Acceleration", "Cannot Kill Hidden Players", "Chase-Focused"],
        desc: "A chase-focused predator with the fastest line-of-sight acceleration in the game — but it physically cannot kill a player who is correctly hidden in an official hiding spot. Reaching one ends the hunt instantly.",
        ability: "Base hunt speed of 1.53 m/s (slightly slower than normal), ramping to a max LoS speed of ~2.53 m/s. Its acceleration rate is 1.5x the standard (0.075x base/s vs 0.05x), so it hits max speed in about <span class='hl-red'>8.7 seconds</span> of continuous line-of-sight instead of the usual ~13. Signature weakness: if it detects and reaches a player correctly hidden inside an OFFICIAL hiding spot (closet, locker, blockable spot), the hunt <span class='hl-green'>ends instantly</span> — it cannot kill hidden players. Caution: if a hunt ends this way, it starts its NEXT hunt by walking straight to that player's last hiding location.",
        weakness:"Hiding Spot Test: During a hunt, get its attention (incense helps) and duck into an official hiding spot like a closet or locker while it can see you. If the hunt <span class='hl-green'>ends the moment it reaches you</span>, it's 100% an Aswang — no other ghost does this. Unofficial spots (behind doors, dark corners) do NOT trigger this. Secondary tell: it builds to max chase speed noticeably faster than any other ghost (~8.7s of line-of-sight vs ~13s standard), so don't loop it for long.",
        zeroEv: "The hiding spot test works with zero evidence and is conclusive: a hunt that cancels itself the instant the ghost reaches your closet/locker is an Aswang. Speed profile: starts slightly slow (1.53 m/s, same base as Twins/Obambo) but accelerates on sight much faster than normal. Note: it CAN still kill you in unofficial hiding spots, and its weakness is disabled if custom difficulty sets hiding places to 0. After a cancelled hunt, expect it to check your old hiding spot first next hunt — hide somewhere new.",
        tags: ['fast'],
        speedStates: [{"label": "Base speed", "speed": 1.53}, {"label": "Max LoS (~8.7s)", "speed": 2.53}]
    }
    ,
    { 
        name: "Kormos", ev: ['orb','box','uv'], danger: "High", hunt: "50% / 70% if sprinting", speed: "1.7 / 2.21 m/s", blink: "Normal", forced: null,
        traits: ["Strong Hearing", "Nearly Blind", "Kills Through Walls"],
        desc: "A blind ghost that hunts entirely by sound. It cannot see still, silent players — but it kills anyone within 1.5m on the same floor, even through furniture and walls, so standing in its path is fatal.",
        ability: "The Kormos is blind: it can only gain line-of-sight if a player is within 5m with nothing in the way. Instead it hears footsteps — crouch-walking is detectable from 10m, walking from 15m, sprinting from 30m (same floor only) — plus voices and active electronics at normal ranges. When it hears something it moves to that sound at <span class='hl-red'>2.21 m/s</span> (1.3x its 1.7 m/s base) and can re-target to newer sounds every 5–10 seconds. Danger: with no line-of-sight it kills any player within <span class='hl-red'>1.5m on the same floor, ignoring walls and furniture</span>. Sprinting in the same room as it raises its hunt threshold from 50% to 70%. It cannot perform the mist-orb or chasing ghost events.",
        weakness:"Stand-Still Test: During a hunt, in an open area with an escape route, go completely still and silent with electronics off. A Kormos will walk straight past a player any other ghost would chase on sight. Confirm it's not a Banshee ignoring non-targets — in multiplayer, have everyone freeze at once, or make a deliberate sound and watch it beeline to that spot at increased speed. Don't do this test in a narrow corridor: it kills within 1.5m even without detecting you.",
        zeroEv: "Zero-evidence tells: hunts that ignore still, silent players entirely; the ghost visibly walking to where sounds were made rather than where players are; sudden speed-up (2.21 m/s) after any footstep, voice, or electronic noise. Hiding spots are unnecessary against a Kormos — standing still away from its route is safer, since it can kill through a closet wall if it wanders within 1.5m. Evidence trap: Kormos (Orbs + Spirit Box + UV) is one of three ghosts — with Hantu and Onryo — whose full evidence set does NOT rule out The Mimic (fake Orbs + Box + UV). Check for Freezing: if the room freezes, it's The Mimic.",
        tags: ['fast'],
        speedStates: [{"label": "No sound detected", "speed": 1.7}, {"label": "Moving to a sound", "speed": 2.21}]
    }
    ,
    { 
        name: "Deildegast", ev: ['emf','writing','dots'], danger: "High", hunt: "50%", speed: "3.0 → 0.4 m/s", blink: "Normal", forced: null,
        traits: ["Fastest Base Speed", "Slowed By Moved Items", "No LoS Acceleration"],
        desc: "A Norwegian boundary-stone ghost that starts every hunt at the fastest base speed in the game — but every unique item players move before a hunt slows it, all the way down to a crawl.",
        ability: "Starts each hunt at <span class='hl-red'>3.0 m/s</span> — the fastest base speed of any ghost — with NO line-of-sight acceleration, so it never speeds up on seeing you. Every unique prop moved or interacted with by players (<span class='hl-green'>including dead players</span>) outside of hunts cuts its next hunt speed by 0.1 m/s: throwables, light switches, the fuse box, taps — but NOT doors, cursed possessions, or your own equipment, and each item only counts once. 13 items brings it to standard speed (1.7 m/s); 26 items hits its floor of <span class='hl-green'>0.4 m/s</span>. The counter <span class='hl-red'>resets to 3.0 m/s after every hunt</span> (and when a crucifix burns), so keep moving items between hunts. It is also shier than most: only a 10% chance to touch doors and light switches (vs the usual 25%), and it can stay quiet and hidden longer than other ghosts.",
        weakness:"Litter Test: Between hunts, have the team pick up or throw 10–15 unique house items (dead teammates can help — their interactions count). If the next hunt is noticeably slow, then snaps back to a flat-out sprint the hunt after you stop littering, it's a Deildegast. Reverse check: touch nothing after a hunt — a ghost hunting at a constant, blistering 3.0 m/s with zero line-of-sight speed-up, even while staring right at you, is near-conclusive.",
        zeroEv: "A flat 3.0 m/s with no LoS acceleration is the giveaway: a Revenant only hits 3.0 m/s AFTER detecting someone (very slow otherwise), while a fresh Deildegast is 3.0 m/s constantly. Confirm by moving unique items between hunts and listening for the next hunt to slow — the effect resets after every hunt and every burned crucifix, so re-litter each time. At full speed it is faster than you: rely on crucifixes, incense, and tight loops early, and keep ~15 items moved between hunts to make it manageable. If activity goes dead quiet, reposition objects around the area to provoke it.",
        tags: ['fast'],
        speedStates: [{"label": "No items moved", "speed": 3.0}, {"label": "13 items moved (standard)", "speed": 1.7}, {"label": "26+ items moved (floor)", "speed": 0.4}]
    }
];

// --- 2. STATE ---
let app = {
    evidence: { emf:0, box:0, uv:0, orb:0, writing:0, freezing:0, dots:0 },
    activeFilters: new Set(),
    timer: { int: null, dur: 90 },
    search: { ghosts: '', equipment: '', equipmentTab: 'detection' }
};

const ui = {
    evBar: document.getElementById('evBar'),
    filterRow: document.getElementById('filterRow'),
    ghostGrid: document.getElementById('ghostGrid'),
    count: document.getElementById('matchCount'),
    ghostModal: document.getElementById('ghostModal'),
    manualModal: document.getElementById('manualModal'),
    timerDisplay: document.getElementById('timerDisplay'),
    timerFill: document.getElementById('timerFill'),
    timerBtn: document.getElementById('timerBtn')
};


// ─── FOOTSTEP TEMPO ENGINE ────────────────────────────────────────────────
const TempoEngine = (() => {
    let ctx = null;
    let tickTimer = null;
    let autoStopTimer = null;
    let activeButton = null;
    let beatIndicator = null;
    let running = false;

    // BPM formula from reference cheat sheet (default surface, 1.0 multiplier):
    // BPM = 60 / ((1/speed) - 0.075)
    function speedToBpm(speed) {
        if (!speed || speed <= 0) return null;
        const inv = (1 / speed) - 0.075;
        if (inv <= 0) return null;
        return 60 / inv;
    }

    function getIntervalMs(speed) {
        const bpm = speedToBpm(speed);
        if (!bpm) return null;
        return (60 / bpm) * 1000;
    }

    function ensureCtx() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
    }

    function playClick() {
        ensureCtx();
        const t = ctx.currentTime;

        // Two-layer synthetic footstep click
        const osc1 = ctx.createOscillator();
        const g1   = ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(900, t);
        osc1.frequency.exponentialRampToValueAtTime(180, t + 0.045);
        g1.gain.setValueAtTime(0.16, t);
        g1.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        osc1.connect(g1).connect(ctx.destination);
        osc1.start(t); osc1.stop(t + 0.07);

        const osc2 = ctx.createOscillator();
        const g2   = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(100, t);
        g2.gain.setValueAtTime(0.22, t);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        osc2.connect(g2).connect(ctx.destination);
        osc2.start(t); osc2.stop(t + 0.09);

        // Flash beat indicator
        if (beatIndicator) {
            beatIndicator.classList.add('beat-flash');
            setTimeout(() => beatIndicator && beatIndicator.classList.remove('beat-flash'), 80);
        }
    }

    // Recursive setTimeout for drift-corrected timing
    // Measures actual elapsed time and compensates on the next beat
    function scheduleTick(intervalMs, expectedAt) {
        if (!running) return;
        playClick();
        const now = performance.now();
        const nextExpected = expectedAt + intervalMs;
        const delay = Math.max(10, nextExpected - now);
        tickTimer = setTimeout(() => scheduleTick(intervalMs, nextExpected), delay);
    }

    function start(speed, btn) {
        stop();
        const ms = getIntervalMs(speed);
        if (!ms) return; // Variable speed ghost — nothing to play

        running = true;
        activeButton = btn;
        if (btn) {
            btn.classList.add('tempo-btn-active');
            btn.querySelector('.tempo-btn-icon').textContent = '■';
        }

        scheduleTick(ms, performance.now());

        // Auto-stop after 12 seconds
        autoStopTimer = setTimeout(() => stop(), 12000);
    }

    function stop() {
        running = false;
        if (tickTimer) { clearTimeout(tickTimer); tickTimer = null; }
        if (autoStopTimer) { clearTimeout(autoStopTimer); autoStopTimer = null; }
        if (activeButton) {
            activeButton.classList.remove('tempo-btn-active');
            const icon = activeButton.querySelector('.tempo-btn-icon');
            if (icon) icon.textContent = '▶';
            activeButton = null;
        }
    }

    function toggle(speed, btn) {
        if (activeButton === btn && running) {
            stop();
        } else {
            start(speed, btn);
        }
    }

    function setBeatIndicator(el) { beatIndicator = el; }
    function isActive() { return running; }
    function speedToBpmRounded(speed) {
        const bpm = speedToBpm(speed);
        return bpm ? Math.round(bpm) : null;
    }

    return { toggle, stop, speedToBpm, speedToBpmRounded, setBeatIndicator, isActive };
})();

// Stop tempo when modal closes
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('ghostModal');
    if (modal) {
        modal.addEventListener('close', () => TempoEngine.stop());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) TempoEngine.stop();
        });
    }
});
// ─────────────────────────────────────────────────────────────────────────

// --- 3. INIT ---
function init() {
    renderEvidence();
    renderFilters();
    updateBoard();

    document.getElementById('btnReset').addEventListener('click', () => {
        Object.keys(app.evidence).forEach(k => app.evidence[k] = 0);
        app.activeFilters.clear();
        renderFilters();
        updateBoard();
    });

    document.getElementById('btnManual').addEventListener('click', () => {
        showManualTab('ev', document.querySelector('.manual-nav .nav-btn'));
        ui.manualModal.showModal();
    });

    document.getElementById('closeGhost').addEventListener('click', () => ui.ghostModal.close());
    document.getElementById('closeManual').addEventListener('click', () => ui.manualModal.close());

    document.querySelectorAll('.t-opt').forEach(b => {
        b.addEventListener('click', () => {
            document.querySelectorAll('.t-opt').forEach(x => x.classList.remove('active'));
            b.classList.add('active');
            app.timer.dur = parseInt(b.dataset.time);
            resetTimer();
        });
    });

    // Timer button
    ui.timerBtn.addEventListener('click', () => {
        if(app.timer.int) {
            clearInterval(app.timer.int);
            app.timer.int = null;
            ui.timerBtn.innerHTML = "▶";
            ui.timerBtn.classList.remove('active');
            return;
        }
        ui.timerBtn.innerHTML = "⏹";
        ui.timerBtn.classList.add('active');
        ui.timerFill.style.width = "0%";
        ui.timerFill.style.background = "var(--acc-cyan)";
        const start = Date.now();
        const end = start + (app.timer.dur * 1000);
        app.timer.int = setInterval(() => {
            const left = Math.ceil((end - Date.now())/1000);
            if(left <= 0) {
                ui.timerDisplay.textContent = "0";
                ui.timerFill.style.width = "100%";
                ui.timerFill.style.background = "var(--acc-red)";
                clearInterval(app.timer.int);
                app.timer.int = null;
                ui.timerBtn.innerHTML = "▶";
                ui.timerBtn.classList.remove('active');
            } else {
                ui.timerDisplay.textContent = left;
                ui.timerFill.style.width = (((app.timer.dur - left) / app.timer.dur)*100) + "%";
            }
        }, 100);
    });

    // WIP banner close + remember dismissal
    const banner = document.getElementById('wipBanner');
    const bannerClose = document.getElementById('wipClose');

    if (banner && bannerClose) {
        if (localStorage.getItem('phasmo_wip_dismissed_v26') === '1') {
            banner.style.display = 'none';
        }

        bannerClose.addEventListener('click', () => {
            banner.style.display = 'none';
            localStorage.setItem('phasmo_wip_dismissed_v26', '1');
        });
    }

    // Search boxes
    const ghostSearchInput = document.getElementById('ghostSearchInput');
    const ghostSearchClear = document.getElementById('ghostSearchClear');
    if (ghostSearchInput) {
        ghostSearchInput.addEventListener('input', () => {
            app.search.ghosts = ghostSearchInput.value.trim().toLowerCase();
            updateBoard();
        });
    }
    if (ghostSearchClear) {
        ghostSearchClear.addEventListener('click', () => {
            app.search.ghosts = '';
            if (ghostSearchInput) ghostSearchInput.value = '';
            updateBoard();
            ghostSearchInput?.focus();
        });
    }

    const equipmentSearchInput = document.getElementById('equipmentSearchInput');
    const equipmentSearchClear = document.getElementById('equipmentSearchClear');
    if (equipmentSearchInput) {
        equipmentSearchInput.addEventListener('input', () => {
            app.search.equipment = equipmentSearchInput.value.trim().toLowerCase();
            if (window.showEquipTab) window.showEquipTab(app.search.equipmentTab || 'detection');
        });
    }
    if (equipmentSearchClear) {
        equipmentSearchClear.addEventListener('click', () => {
            app.search.equipment = '';
            if (equipmentSearchInput) equipmentSearchInput.value = '';
            if (window.showEquipTab) window.showEquipTab(app.search.equipmentTab || 'detection');
            equipmentSearchInput?.focus();
        });
    }

    // Initial manual content
    document.getElementById('manualContent').innerHTML = MANUAL_DB.ev;
}

// --- 4. RENDERING ---
function renderEvidence() {
    ui.evBar.innerHTML = '';
    EVIDENCE.forEach(ev => {
        const btn = document.createElement('div');
        btn.className = 'ev-btn';
        btn.dataset.id = ev.id;
        btn.innerHTML = `<div class="ev-icon">${ev.icon}</div><div class="ev-label">${ev.label}</div>`;
        btn.addEventListener('click', (e) => toggleEv(ev.id, 1, e));
        btn.addEventListener('contextmenu', (e) => toggleEv(ev.id, 2, e));
        ui.evBar.appendChild(btn);
    });
}

function renderFilters() {
    ui.filterRow.innerHTML = '';
    FILTERS.forEach(f => {
        const chip = document.createElement('div');
        chip.className = `filter-chip ${app.activeFilters.has(f.id) ? 'active' : ''}`;
        chip.textContent = f.label;
        chip.addEventListener('click', () => {
            if(app.activeFilters.has(f.id)) app.activeFilters.delete(f.id);
            else app.activeFilters.add(f.id);
            renderFilters();
            updateBoard();
        });
        ui.filterRow.appendChild(chip);
    });
}

// --- 5. LOGIC ---
function stripHtml(text) {
    return String(text || '').replace(/<[^>]*>/g, ' ');
}

function normaliseSearchText(text) {
    return stripHtml(text).toLowerCase().replace(/\s+/g, ' ').trim();
}

function ghostMatchesSearch(g, query) {
    if (!query) return true;

    // Search only the ghost card name.
    // This prevents searches like "Spirit" from matching every ghost with Spirit Box evidence.
    const searchable = normaliseSearchText(g.name);
    return query.split(/\s+/).every(term => searchable.includes(term));
}

function equipmentMatchesSearch(item, category, query) {
    if (!query) return true;

    // Search only the equipment card name.
    // This prevents searches like "Read" from matching card body text/mechanics.
    const searchable = normaliseSearchText(item.name);
    return query.split(/\s+/).every(term => searchable.includes(term));
}

function toggleEv(id, val, e) {
    e.preventDefault();
    app.evidence[id] = (app.evidence[id] === val) ? 0 : val;
    updateBoard();
}

function updateBoard() {
    const matches = [];
    const possibleEv = new Set();

    GHOSTS.forEach(g => {
        let possible = true;
        for(const [id, val] of Object.entries(app.evidence)) {
            if(val === 0) continue;
            const has = g.ev.includes(id) || (g.name === 'The Mimic' && id === 'orb');
            if(val === 1 && !has) possible = false;
            if(val === 2 && has) possible = false;
        }
        if(possible && app.activeFilters.size > 0) {
            app.activeFilters.forEach(fid => {
                if(!g.tags.includes(fid)) possible = false;
            });
        }

        if(possible && !ghostMatchesSearch(g, app.search.ghosts)) {
            possible = false;
        }

        if(possible) {
            matches.push(g);
            g.ev.forEach(e => possibleEv.add(e));
            if(g.name === 'The Mimic') possibleEv.add('orb');
        }
    });

    ui.count.textContent = matches.length;

    const ghostSearchMeta = document.getElementById('ghostSearchMeta');
    if (ghostSearchMeta) {
        if (app.search.ghosts) {
            ghostSearchMeta.style.display = 'block';
            ghostSearchMeta.textContent = `Showing ${matches.length} ghost${matches.length === 1 ? '' : 's'} with name matching “${app.search.ghosts}”`;
        } else {
            ghostSearchMeta.style.display = 'none';
            ghostSearchMeta.textContent = '';
        }
    }

    // Update evidence counter
    const selectedEvidence = Object.values(app.evidence).filter(v => v === 1).length;
    const evCountEl = document.getElementById('evCount');
    if (evCountEl) evCountEl.textContent = selectedEvidence;

    // Update filter counter
    const filterCountEl = document.getElementById('filterCount');
    if (filterCountEl) filterCountEl.textContent = app.activeFilters.size;

    document.querySelectorAll('.ev-btn').forEach(btn => {
        const id = btn.dataset.id;
        btn.dataset.state = app.evidence[id];
        if(app.evidence[id] === 0 && matches.length < GHOSTS.length && !possibleEv.has(id)) {
            btn.classList.add('dimmed');
        } else {
            btn.classList.remove('dimmed');
        }
    });

    ui.ghostGrid.innerHTML = '';
    if (matches.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'search-empty-state';
        empty.innerHTML = `<strong>No ghosts found</strong><span>Search now only checks ghost names. Try a ghost name, clear ruled-out evidence, or remove an active filter.</span>`;
        ui.ghostGrid.appendChild(empty);
        return;
    }

    matches.forEach(g => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.danger = g.danger;

        let dots = '';
        EVIDENCE.forEach(e => {
            let cls = 'ev-tag';
            if(app.evidence[e.id] === 1) cls += ' match';
            if(g.forced === e.id) cls += ' forced';
            
            if(g.ev.includes(e.id)) {
                let label = e.id === 'writing' ? 'BOOK' : 
                            e.id === 'freezing' ? 'FRZ' : 
                            e.id === 'box' ? 'BOX' : 
                            e.label.replace('EMF 5','EMF').replace('Orbs','ORB');
                dots += `<div class="${cls}">${label}</div>`;
            }
        });
        if(g.name === 'The Mimic') {
            let cls = 'ev-tag mimic';
            if(app.evidence.orb === 1) cls += ' match';
            dots += `<div class="${cls}">+ORBS</div>`;
        }

        let traitsHtml = '';
        if(g.traits) g.traits.forEach(t => traitsHtml += `<div class="trait-badge">${t}</div>`);

        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-name">${g.name}</h3>
                <div class="pill-container"><div class="stat-pill danger"><span>Hunt: ${g.hunt}</span></div></div>
            </div>
            <div class="trait-row">${traitsHtml}</div>
            <div class="card-desc">${g.desc}</div>
            <div class="card-bot">${dots}</div>
        `;
        
        card.addEventListener('click', () => openGhostModal(g));
        ui.ghostGrid.appendChild(card);
    });
}

function openGhostModal(g) {
    TempoEngine.stop();
    document.getElementById('mName').textContent = g.name;
    const forcedNote = g.forced ? `<div style="margin-top:8px; padding:6px 10px; background:rgba(6,182,212,0.1); border:1px solid rgba(6,182,212,0.3); border-radius:6px; font-size:0.82rem; color:var(--acc-cyan);">⚡ <strong>Guaranteed Evidence:</strong> This ghost <em>always</em> shows <strong>${g.forced.toUpperCase()}</strong> even on Nightmare/Insanity.</div>` : '';

    // Build speed buttons for each state
    const states = g.speedStates || [{ label: 'Normal', speed: 1.7 }];
    const tempoButtons = states.map((s, i) => {
        const bpm = TempoEngine.speedToBpmRounded(s.speed);
        const isVariable = !bpm;
        return `<button class="tempo-btn${isVariable ? ' tempo-btn-variable' : ''}"
            data-speed="${s.speed}" data-idx="${i}"
            onclick="${isVariable ? '' : `handleTempoBtn(this, ${s.speed})`}"
            ${isVariable ? 'disabled style="cursor:default;opacity:0.6;"' : ''}
            title="${isVariable ? 'Speed varies — copies the ghost being mimicked' : `Tap to hear ${s.label} footstep tempo`}">
            <span class="tempo-btn-label">${s.label}</span>
            <span class="tempo-btn-speed">${s.speed} m/s</span>
            <span class="tempo-btn-bpm">${isVariable ? '— BPM' : bpm + ' BPM'}</span>
            <span class="tempo-btn-icon">${isVariable ? '~' : '▶'}</span>
        </button>`;
    }).join('');

    document.getElementById('mContent').innerHTML = `
        <div class="stat-grid">
            <div class="stat-box"><span class="stat-label">Hunt Threshold</span><span class="stat-val" style="color:var(--acc-red)">${g.hunt}</span></div>
            <div class="stat-box"><span class="stat-label">Speed</span><span class="stat-val" style="color:var(--acc-orange)">${g.speed}</span></div>
            <div class="stat-box"><span class="stat-label">Blink Rate</span><span class="stat-val">${g.blink}</span></div>
            <div class="stat-box"><span class="stat-label">Difficulty</span><span class="stat-val">${g.danger}</span></div>
        </div>

        <div class="tempo-section">
            <div class="tempo-header">
                <span class="tempo-title">👟 FOOTSTEP TEMPO</span>
                <div class="beat-indicator" id="beatIndicator"></div>
                <span class="tempo-hint">Click a speed to hear it</span>
            </div>
            <div class="tempo-buttons">${tempoButtons}</div>
        </div>

        <div class="section-header">Behavior</div>
        <div class="detail-text">${g.ability}</div>
        ${forcedNote}
        <div class="section-header" style="color:#a78bfa; border-color:rgba(139,92,246,0.4);">🎲 Zero Evidence Tell</div>
        <div class="detail-text" style="color:#c4b5fd; background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25); border-radius:8px; padding:12px 14px; margin-bottom:8px;">${g.zeroEv}</div>
        <div class="section-header">🔬 Confirmation Test</div>
        <div class="confirm-box detail-text">${g.weakness}</div>
    `;

    // Register the beat indicator with the engine
    TempoEngine.setBeatIndicator(document.getElementById('beatIndicator'));
    ui.ghostModal.showModal();
}

function handleTempoBtn(btn, speed) {
    // Reset all other buttons before toggling
    document.querySelectorAll('.tempo-btn').forEach(b => {
        if (b !== btn) {
            b.classList.remove('tempo-btn-active');
            const icon = b.querySelector('.tempo-btn-icon');
            if (icon) icon.textContent = '▶';
        }
    });
    TempoEngine.toggle(speed, btn);
}

// --- 6. MANUAL CONTENT ---
const MANUAL_DB = {
    ev: `
        <div class="manual-entry">
            <h4>EMF Level 5</h4>
            <p class="detail-text">
                Reader must hit the red LED (5). Level 2–4 is normal interaction or events.
                <br><span class="hl-blue">Tip:</span> Place EMF on doors, windows, or objects the ghost touches to catch EMF 5.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Spirit Box</h4>
            <p class="detail-text">
                Lights OFF in the ghost's room. Must be <strong>in the same room</strong> as the ghost (most ghosts). Some ghosts respond to 'everyone' regardless of room; some only respond when you are alone.
                Look for the <span class="hl-green">ghost icon</span> on the box UI — that's evidence. <span class="hl-red">Deogen</span> is unique: responds in any lighting, no dark needed.
                <br><span class="hl-blue">Tip:</span> Ask location or aggression questions. Check the box UI carefully — a red LED with no ghost icon means it heard you but no response.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Ultraviolet (UV)</h4>
            <p class="detail-text">
                Green handprints on doors, windows, light switches, and keyboards.
                Footprints from salt are <span class="hl-red">NOT</span> evidence, even though they show up with UV.
                <br><span class="hl-blue">Tip:</span> Check doors right after they move &mdash; prints fade in ~60 seconds, some ghosts shorten this.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Ghost Orbs</h4>
            <p class="detail-text">
                Small floating spheres seen only on video cameras with Night Vision.
                Orbs spawn in or near the <span class="hl-green">current active area.</span>
                <br><span class="hl-blue">Tip:</span> Place camera at head height pointing into the room, then check from the truck or a monitor.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Ghost Writing</h4>
            <p class="detail-text">
                Ghost writes in the book. A book being thrown or moved is <span class="hl-red">not</span> evidence — only actual writing counts.
                <br><span class="hl-blue">Tip:</span> Use two books in the active area to speed this up, especially for shy ghosts.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Freezing Temperatures</h4>
            <p class="detail-text">
                Must read <span class="hl-red">below 0°C/32°F</span> on a thermometer. <span class="hl-red">Visible breath is NOT evidence</span> — since v0.9.0, player breath appears below 5°C regardless of ghost type. Do not rely on breath alone.
                <br><span class="hl-blue">Tip:</span> Check multiple rooms. The active area is usually the coldest. Breaker ON warms rooms over time, making freezing temps harder to find if left on too long.
            </p>
        </div>
        <div class="manual-entry">
            <h4>D.O.T.S Projector</h4>
            <p class="detail-text">
                Green silhouette running through the projector area.
                Some ghosts are more visible on camera than to the naked eye.
                <br><span class="hl-blue">Tip:</span> Place DOTS in the center of the active area and watch from camera for a while.
            </p>
        </div>
    `,
    sanity: `
        <div class="manual-entry">
            <h4>Sanity Basics</h4>
            <p class="detail-text">
                Sanity drains passively while you are inside the investigation area in the dark.
                <br>&bull; Rooms with their <span class="hl-green">main lights on</span> stop passive drain (flashlights, lamps and TVs don't count).
                <br>&bull; In darkness, drain is roughly <span class="hl-red">0.09–0.12%/sec on small maps</span> (lower on bigger maps), then multiplied by difficulty. Playing solo halves it.
                <br>&bull; Ghost events, some abilities, deaths, and cursed possessions drain extra sanity on top.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Average vs Individual Sanity</h4>
            <p class="detail-text">
                Hunt checks use the <span class="hl-blue">average team sanity</span>, not just yours.
                <br>&bull; One low-sanity player can drag the whole team’s average down.
                <br>&bull; Exception: <span class="hl-red">Banshee</span> hunts based on its chosen <em>target's</em> individual sanity — not the team average. Keep the target's sanity high to suppress hunts.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Hunt Thresholds</h4>
            <p class="detail-text">
                Approximate thresholds (average sanity):
                <br><span class="hl-red">80%</span> Yokai (if talking a lot)
                <br><span class="hl-red">75%</span> Thaye (young)
                <br><span class="hl-red">70%</span> Demon &middot; Kormos (if you sprint near it)
                <br><span class="hl-red">65%</span> Raiju (near electronics) &middot; Dayan (moving player nearby) &middot; Obambo (aggressive)
                <br><span class="hl-red">60%</span> Mare (in the dark) &middot; Onryo &middot; Gallu (enraged)
                <br><span class="hl-red">50%</span> Standard ghosts, incl. Aswang &amp; Kormos
                <br><span class="hl-blue">40%</span> Mare (in light) &middot; Deogen &middot; Gallu (weakened) &middot; Onryo (near flame)
                <br><span class="hl-green">35%</span> Shade &middot; <span class="hl-green">10%</span> Obambo (calm)
                <br><span class="hl-blue">Special:</span> Some abilities allow hunts above usual values (e.g. Demon, Onryo's 3rd flame blow-out, cursed hunts).
            </p>
        </div>
        <div class="manual-entry">
            <h4>Sanity Pills</h4>
            <p class="detail-text">
                Pills restore a chunk of sanity depending on difficulty, not tier.
                <br>&bull; Amateur 40% &middot; Intermediate 35% &middot; Professional 30% &middot; Nightmare 25% &middot; <span class="hl-red">Insanity 20%</span>.
                <br>&bull; Higher tiers restore the same amount but faster (T1 20s, T2/T3 10s); T3 adds a 10s infinite-sprint boost.
                <br>&bull; Max 4 in the team loadout per contract; can't be used above 95% sanity.
                <br><span class="hl-blue">Tip:</span> Use pills after early evidence but before hitting dangerous hunt ranges to stabilize the game.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Sanity & Specific Ghosts</h4>
            <p class="detail-text">
                Some ghosts interact heavily with sanity:
                <br>&bull; <span class="hl-red">Yurei:</span> Door slam that drains ~15%.
                <br>&bull; <span class="hl-red">Phantom:</span> Looking at it drains sanity faster during events.
                <br>&bull; <span class="hl-red">Moroi:</span> Curses you via Spirit Box/Paramic and speeds up the lower your sanity gets.
                <br>&bull; <span class="hl-red">Demon:</span> Can hunt very early and has a shorter hunt cooldown.
            </p>
        </div>
    `,
    cursed: `
        <div class="manual-entry">
            <h4>Ouija Board</h4>
            <p class="detail-text">
                Asks questions directly to the ghost.
                <br>&bull; Each question drains sanity, more for certain questions.
                <br>&bull; Saying "Goodbye" correctly ends the session safely.
                <br><span class="hl-red">Hide and Seek</span> will trigger an instant hunt. <span class="hl-red">Walking away from the board while active also breaks it and starts a cursed hunt.</span> Always say "Goodbye" to close it safely.
                <br><span class="hl-blue">Tip:</span> Use deliberately when near a hiding spot — great for forcing ghost events and gathering evidence quickly.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Tarot Cards</h4>
            <p class="detail-text">
                Draw cards for random effects:
                <br>&bull; <span class="hl-red">Death:</span> Triggers a hunt.
                <br>&bull; <span class="hl-green">Sun:</span> Restores sanity to 100%.
                <br>&bull; <span class="hl-red">Moon:</span> Drops sanity to 0%.
                <br>&bull; <span class="hl-red">Hanged Man:</span> Instant death.
                <br><span class="hl-blue">Tip:</span> Always be near a hiding spot when drawing cards, in case you pull Death.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Music Box</h4>
            <p class="detail-text">
                Plays a lullaby, revealing the ghost’s location.
                <br>&bull; Brings the ghost within 5m causing it to manifest and walk toward the box. If it reaches the box or player, or the event lasts >5 seconds, a cursed hunt starts.
                <br>&bull; <span class="hl-red">Do NOT throw it</span> — throwing (slamming shut) immediately starts a cursed hunt. Always place it gently.
                <br>&bull; Being at 0% sanity while the box plays also triggers a cursed hunt.
                <br><span class="hl-blue">Tip:</span> Use to pinpoint the active area, but make sure your hiding route is planned first.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Haunted Mirror</h4>
            <p class="detail-text">
                Shows the active area through the mirror.
                <br>&bull; Using it drains sanity rapidly while held up.
                <br>&bull; If sanity gets too low or used too long, it will shatter and trigger a hunt.
                <br><span class="hl-blue">Tip:</span> Peek briefly to learn the room, then stop before it cracks.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Voodoo Doll</h4>
            <p class="detail-text">
                Interacting pushes random pins.
                <br>&bull; Each pin causes a ghost interaction and sanity drain.
                <br>&bull; The heart pin forces a hunt.
                <br><span class="hl-blue">Tip:</span> Use for extra interactions when you need evidence, but be ready for an immediate hunt.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Summoning Circle</h4>
            <p class="detail-text">
                Lights candles to summon a full ghost apparition.
                <br>&bull; Light all 5 candles to summon the ghost — it teleports to the circle and manifests. After the event there is a ~5 second grace period before the cursed hunt begins.
                <br>&bull; <span class="hl-red">Low sanity edge case:</span> If you light the final candle with less than 16% sanity, the event is skipped entirely and a hunt starts immediately (not cursed, but nearly impossible to stop without a tier 3 crucifix).
                <br><span class="hl-blue">Tip:</span> Great for ghost photos, but only use if your hiding spot is close and safe.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Monkey Paw</h4>
            <p class="detail-text">
                Grants limited wishes with trade-offs.
                <br>&bull; Wishes can change weather, sanity, revive, lock doors, and more, but each has a curse.
                <br>&bull; Many wishes force cursed hunts, disable hiding spots, or distort vision.
                <br><span class="hl-blue">Tip:</span> Treat it as a late-game tool when you understand the downside of each wish.
            </p>
        </div>
    `,
    equip: `
        <div class="manual-entry">
            <h4>Crucifix</h4>
            <p class="detail-text">
                Prevents hunts from starting within range.
                <br>&bull; Range by tier: <span class="hl-green">T1 3m &middot; T2 4m &middot; T3 5m</span> &mdash; <span class="hl-red">+50% against a Demon</span> (4.5m / 6m / 7.5m).
                <br>&bull; Charges: T1 blocks 1 hunt; T2 and T3 block 2. A blocked ghost waits 25s (20s for Demon) before trying again.
                <br>&bull; T3 with both charges remaining can block one <span class="hl-red">cursed hunt</span>, consuming both charges.
                <br><span class="hl-blue">Tip:</span> Works held or placed, and its range ignores walls &mdash; but placing it on the floor where the ghost stands most keeps your hands free.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Smudge Sticks</h4>
            <p class="detail-text">
                Burn to repel or blind the ghost.
                <br>&bull; During a hunt, blinds and slows the ghost for a few seconds.
                <br>&bull; Outside hunts, prevents hunts for 90s (<span class="hl-green">180s for Spirit</span>, 60s for Demon). During a hunt, blinds ghost for ~5s (~7s for Moroi).
                <br><span class="hl-blue">Tip:</span> Use on the active area to buy investigation time, or as an escape tool while looping during hunts.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Sanity Pills</h4>
            <p class="detail-text">
                Restores sanity depending on difficulty (40% Amateur down to 20% Insanity).
                <br>&bull; All tiers restore the same amount; higher tiers act faster, and T3 adds a 10s sprint boost.
                <br>&bull; Max 4 in the loadout per contract.
                <br><span class="hl-blue">Tip:</span> Save pills until after you’ve gathered some evidence, then stabilize before pushing late game.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Candles & Lighters</h4>
            <p class="detail-text">
                Firelights slow passive sanity drain while nearby (exact amount depends on Firelight tier — they reduce it, but may not stop it entirely at all tiers).
                <br>&bull; The ghost can blow them out.
                <br>&bull; <span class="hl-red">Onryo:</span> Flames act as crucifixes — blocks hunt attempts within 4m. After the 3rd flame blow-out, Onryo can hunt at any sanity.
                <br><span class="hl-blue">Tip:</span> Use Firelights in investigation areas to slow sanity drain. Keep a lighter ready to relight immediately.
            </p>
        </div>
        <div class="manual-entry">
            <h4>EMF Reader</h4>
            <p class="detail-text">
                Detects ghost interactions and certain abilities.
                <br>&bull; EMF 5 is evidence, lower levels are still useful for tracking interactions.
                <br><span class="hl-blue">Tip:</span> Drop EMF in the active area and check it after noises, door moves, or thrown items.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Thermometer</h4>
            <p class="detail-text">
                Helps find the coldest room.
                <br>&bull; Rooms cool over time, especially with the breaker off.
                <br>&bull; Freezing temps still show even if the room warms slightly.
                <br><span class="hl-blue">Tip:</span> Sweep early to locate the ghost, then confirm with breath or more precise readings.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Video Camera</h4>
            <p class="detail-text">
                Used for Ghost Orbs and DOTS (via monitor).
                <br>&bull; Place on tripods or surfaces looking across the room.
                <br>&bull; Night Vision mode is required to see Orbs clearly.
                <br><span class="hl-blue">Tip:</span> Try multiple angles if you suspect Orbs but haven’t seen any yet.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Photo Camera</h4>
            <p class="detail-text">
                Earns money and evidence photos.
                <br>&bull; Dead bodies, interactions, fingerprints, footprints, and the ghost all give photo rewards.
                <br><span class="hl-blue">Tip:</span> Keep it ready during ghost events &mdash; some ghosts (Phantom) behave differently in photos.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Parabolic Microphone</h4>
            <p class="detail-text">
                Listens for distant sounds through walls.
                <br>&bull; Some ghosts have special parabolic sounds (e.g. Banshee scream, Moroi breath).
                <br><span class="hl-blue">Tip:</span> Use on large maps to locate the ghost wing before moving gear in.
            </p>
        </div>
        <div class="manual-entry">
            <h4>DOTS Projector</h4>
            <p class="detail-text">
                Projects a green grid to reveal DOTS evidence.
                <br>&bull; Some ghosts (Goryo) only show DOTS on camera, not to the naked eye.
                <br><span class="hl-blue">Tip:</span> Combine DOTS + video camera to cover both normal and Goryo-style DOTS.
            </p>
        </div>
        <div class="manual-entry">
            <h4>Motion & Sound Sensors</h4>
            <p class="detail-text">
                Area control tools for larger maps.
                <br>&bull; Motion triggers when anything passes through the beam.
                <br>&bull; Sound sensors report activity in a wide cone on the truck monitor.
                <br><span class="hl-blue">Tip:</span> Great for tracking roaming ghosts when you are unsure of the exact room.
            </p>
        </div>
        <div class="manual-entry">
            <h4>UV Light & Glowstick</h4>
            <p class="detail-text">
                Both reveal fingerprints and footprints.
                <br>&bull; Glowsticks can be dropped and left in the room for constant coverage.
                <br><span class="hl-blue">Tip:</span> Use glowsticks around salt piles to catch footprints quickly.
            </p>
        </div>
    `
};

// --- EQUIPMENT DATABASE ---
const EQUIPMENT = {
    detection: [
        { name: "EMF Reader", tier: "Starter", cost: "$45", usage: "Detects ghost interactions and EMF Level 5 evidence", mechanics: "EMF 2: Interaction, EMF 3: Thrown object, EMF 5: EVIDENCE (ghost ability)", tips: "Drop in active area. Check after every interaction. Level 5 is rare but unmistakable.", range: "~5m detection radius" },
        { name: "Spirit Box", tier: "Starter", cost: "$50", usage: "Ask questions. Ghost may respond verbally. Evidence = any response.", mechanics: "Works in dark + alone (most ghosts) or anywhere (Deogen, Moroi). Must say trigger words.", tips: "Common questions: 'Where are you?', 'How old?', 'Give us a sign'. Be in dark, alone.", range: "Must be in same room as ghost" },
        { name: "UV Flashlight", tier: "Starter", cost: "$40", usage: "Reveals fingerprints on doors/windows. Evidence = ANY UV print.", mechanics: "Prints appear after ghost touches surface. Last 60s (30s Nightmare). Check doors/light switches.", tips: "Combine with glowsticks for constant coverage. Obake = 6 fingers.", range: "Shine directly on surface" },
        { name: "Photo Camera", tier: "Starter", cost: "$40", usage: "Take photos for money. Ghost photo, interactions, fingerprints, dead bodies.", mechanics: "Shots per camera depend on tier; the journal stores up to 10 photos. Ghost photo = high reward. Phantom vanishes from sight when photographed.", tips: "Save photos for ghost events/hunts. Bone photos = easy money.", range: "Must have subject in frame" },
        { name: "Sound Recorder", tier: "Media", cost: "$30", usage: "Records paranormal audio for the Media tab and extra rewards.", mechanics: "Hold USE while aiming at/near valid sounds. Higher tiers make it easier to confirm successful recordings.", tips: "Use it for paranormal voices, Spirit Box responses, EMF 5 sounds, airball events, ghost writing, crucifix burns, and cursed item audio.", range: "Sound-based capture range" },
        { name: "Video Camera", tier: "Starter", cost: "$50", usage: "Monitor remotely for Ghost Orbs. Required for Goryo D.O.T.S", mechanics: "Place on tripod. Enable Night Vision. Check monitor in truck. Orbs = small white dots.", tips: "Cover multiple angles. Goryo DOTS only shows on camera, not naked eye.", range: "Based on camera view angle" },
        { name: "Thermometer", tier: "Starter", cost: "$30", usage: "Find cold rooms. Freezing Temps = below 0°C/32°F evidence.", mechanics: "Rooms cool over time. Breaker OFF = faster cooling. Yellow/Orange = room temp, Blue/Purple = active area", tips: "Sweep building early. Ghost room always coldest. Helps locate ghost quickly.", range: "Point and shoot - instant reading" },
        { name: "D.O.T.S Projector", tier: "Upgraded", cost: "$65", usage: "Projects green laser grid. Ghost silhouette = evidence.", mechanics: "Must be placed on wall/floor. Ghost walks through occasionally. Goryo = camera-only visibility.", tips: "Place facing open areas. Combine with video camera. May take time to show.", range: "~5m projection cone" },
        { name: "Ghost Writing Book", tier: "Starter", cost: "$40", usage: "Ghost writes/draws in book = evidence. Place in active area.", mechanics: "Ghost must be nearby. Can write full sentences, draw symbols, or scribble. Check periodically.", tips: "Place in center of suspected room. Ghost won't always write immediately. Be patient.", range: "Must be in ghost's presence" },
        { name: "Sound Sensor", tier: "Optional", cost: "$80", usage: "Detects sounds in area. Shows on truck monitor. Great for large maps.", mechanics: "Place in hallways/key rooms. Monitor shows activity level (bars). Tracks roaming.", tips: "Use multiple to triangulate ghost location. Essential on large maps.", range: "Wide cone detection (~10m)" },
        { name: "Motion Sensor", tier: "Optional", cost: "$100", usage: "Detects movement through laser beam. Lights up green on truck.", mechanics: "Place in doorways/hallways. Triggers when anything crosses beam. Tracks roaming patterns.", tips: "Place at exits of suspected rooms. See if ghost roams or stays put.", range: "Laser beam line-of-sight" },
        { name: "Parabolic Microphone", tier: "Upgraded", cost: "$50", usage: "Listen to distant sounds through walls. Special ghost sounds detectable.", mechanics: "Point at walls/doors. Picks up ghost vocals, footsteps, special sounds (Banshee scream, Moroi breathing)", tips: "Excellent for location finding on big maps. Can identify Banshee/Moroi instantly.", range: "30m+ through walls" },
        { name: "Head Mounted Camera", tier: "Optional", cost: "$60", usage: "Player-worn camera visible on truck monitor. Team coordination.", mechanics: "Worn by player. Team watches on monitor. Can spot Ghost Orbs from player POV.", tips: "Useful for solo players or teams wanting extra eyes. Can catch evidence remotely.", range: "Player's field of view" }
    ],
    protection: [
        { name: "Crucifix", tier: "Essential", cost: "$30", usage: "Prevents hunts from starting within range. T1 blocks 1 hunt; T2/T3 block 2.", mechanics: "Range by tier: T1 3m / T2 4m / T3 5m (+50% vs Demon: 4.5/6/7.5m). Works held, thrown, or placed. After a block the ghost waits 25s (20s Demon) before trying again. T3 with both charges left can block a cursed hunt (uses both charges).", tips: "Placing it on the floor in the centre of the active area frees your hands — but it does work while held. Both the ghost's feet AND head (1.5m up) must be in range, so T1 range is effectively tight. Range ignores walls.", range: "T1 3m / T2 4m / T3 5m (+50% vs Demon)", uses: "T1: 1 · T2/T3: 2" },
        { name: "Smudge Sticks", tier: "Essential", cost: "$15", usage: "Burn to repel/blind ghost. Prevents hunts or creates escape.", mechanics: "Outside hunt: Prevents hunts for 90s (180s Spirit, 60s Demon). During hunt: Blinds ghost ~5s (~7s Moroi)", tips: "Light with lighter. Use in active area to prevent hunts or while running from hunts.", range: "~6m effect radius", uses: "1 per stick" },
        { name: "Sanity Pills", tier: "Essential", cost: "$20", usage: "Restores sanity. Amount depends on difficulty, not tier.", mechanics: "Restores: Amateur 40% / Intermediate 35% / Professional 30% / Nightmare 25% / Insanity 20%. Tier changes speed: T1 over 20s, T2/T3 over 10s. T3 also grants a 10s infinite-sprint boost. Can't be taken above 95% sanity.", tips: "Max 4 in the team loadout. Save for after early evidence, before dangerous hunt ranges. Cures the Moroi curse. T3's sprint boost can even be used mid-hunt to escape.", range: "N/A (consumable)", uses: "Max 4 per contract" },
        { name: "Candle", tier: "Starter", cost: "$15", usage: "Prevents sanity drain when near lit candle. Onryo interaction.", mechanics: "Firelights slow passive sanity drain (amount depends on tier) while you are nearby. Ghost can blow them out. Onryo treats flames as crucifixes — blocks its hunt attempts within 4m.", tips: "Light in safe rooms. Keep lighter ready to relight. Multiple candles = large safe zone.", range: "~3m sanity protection", uses: "Unlimited (can be blown out)" },
        { name: "Lighter", tier: "Starter", cost: "$15", usage: "Lights candles and smudge sticks. No battery.", mechanics: "Infinite uses. Required for smudging. Lights candles for sanity protection.", tips: "Always have one. Essential for smudge sticks and candles.", range: "Touch-based", uses: "Infinite" }
    ],
    utility: [
        { name: "Flashlight", tier: "Starter", cost: "$30", usage: "Basic handheld light. Essential for dark areas.", mechanics: "Will flicker near ghost when hunting. Provides basic illumination.", tips: "Default light source. Infinite use.", range: "Medium cone" },
        { name: "Strong Flashlight", tier: "Upgraded", cost: "$50", usage: "Brighter, wider beam flashlight. Better coverage.", mechanics: "Brighter and wider than normal flashlight but still flickers when ghost hunts. Premium light source.", tips: "Worth the upgrade for large dark maps (Prison, Asylum). Much better visibility.", range: "Wide cone (brighter)" },
        { name: "Glowstick", tier: "Utility", cost: "$20", usage: "Drop for persistent UV light. Reveals fingerprints constantly.", mechanics: "Drop and leave. Doesn't require holding. Reveals UV evidence while you work elsewhere.", tips: "Place near doors/light switches. Frees hands. Great for salt piles too.", battery: "Infinite (no battery)", range: "~2m UV radius" },
        { name: "Salt", tier: "Detection", cost: "$15", usage: "Place in doorways. Tracks movement and enables Wraith checks.", mechanics: "Ghosts can disturb salt when they step in it. Wraith will not disturb salt. Tier III salt can slow some ghosts temporarily.", tips: "Place in doorways and hallways. Tracks roaming. Wraith test = salt not disturbed after repeated passes.", range: "Pile covers ~0.5m", uses: "1 per pile" },
        { name: "Incense", tier: "Alternative", cost: "$15", usage: "Same as smudge sticks. Ceremonial version.", mechanics: "Identical mechanics to smudge sticks. Same timers, same effect.", tips: "No functional difference from smudge sticks. Use interchangeably.", range: "~6m effect radius", uses: "1 per stick" },
        { name: "Tripod", tier: "Optional", cost: "$20", usage: "Holds video cameras at fixed angles. Expands monitoring coverage.", mechanics: "Place anywhere. Mount video camera. Stable coverage of room/hallway.", tips: "Essential for multi-camera setups. Cover active area + nearby areas.", range: "N/A (mounting tool)" }
    ]
};

// Equipment unlock levels based on the current Chronicle-era progression table.
// Use aliases so the older labels in this site still show the correct modern item unlocks.
const EQUIPMENT_UNLOCKS = {
    "D.O.T.S Projector": { t1: "Starter", t2: 27, t3: 49, upgrade2: "$3,000", upgrade3: "$3,000" },
    "EMF Reader": { t1: "Starter", t2: 18, t3: 46, upgrade2: "$3,000", upgrade3: "$4,500" },
    "Ghost Writing Book": { t1: "Starter", t2: 23, t3: 55, upgrade2: "$3,000", upgrade3: "$3,000" },
    "Spirit Box": { t1: "Starter", t2: 23, t3: 46, upgrade2: "$3,000", upgrade3: "$3,000" },
    "Thermometer": { t1: "Starter", t2: 27, t3: 65, upgrade2: "$3,000", upgrade3: "$3,000" },
    "UV Flashlight": { t1: "Starter", t2: 18, t3: 46, upgrade2: "$3,000", upgrade3: "$2,000", alias: "UV Light" },
    "Glowstick": { t1: "Starter", t2: 18, t3: 46, upgrade2: "$3,000", upgrade3: "$2,000", alias: "UV Light" },
    "Video Camera": { t1: "Starter", t2: 27, t3: 49, upgrade2: "$3,000", upgrade3: "$3,000" },
    "Flashlight": { t1: "Starter", t2: 18, t3: 34, upgrade2: "$3,000", upgrade3: "$3,000" },
    "Strong Flashlight": { t1: "Starter", t2: 18, t3: 34, upgrade2: "$3,000", upgrade3: "$3,000", alias: "Flashlight" },
    "Crucifix": { t1: 7, t2: 34, t3: 80, upgrade2: "$4,000", upgrade3: "$20,000" },
    "Candle": { t1: 12, t2: 37, t3: 75, upgrade2: "$3,000", upgrade3: "$10,000", alias: "Firelight" },
    "Lighter": { t1: 12, t2: 37, t3: 52, upgrade2: "$500", upgrade3: "$750", alias: "Igniter" },
    "Smudge Sticks": { t1: 14, t2: 37, t3: 80, upgrade2: "$3,500", upgrade3: "$15,000", alias: "Incense" },
    "Incense": { t1: 14, t2: 37, t3: 80, upgrade2: "$3,500", upgrade3: "$15,000" },
    "Motion Sensor": { t1: 3, t2: 42, t3: 70, upgrade2: "$2,500", upgrade3: "$8,000" },
    "Parabolic Microphone": { t1: 5, t2: 32, t3: 70, upgrade2: "$3,000", upgrade3: "$5,000" },
    "Photo Camera": { t1: 2, t2: 23, t3: 55, upgrade2: "$3,000", upgrade3: "$5,000" },
    "Salt": { t1: 8, t2: 39, t3: 65, upgrade2: "$2,500", upgrade3: "$5,000" },
    "Sanity Pills": { t1: 14, t2: 39, t3: 75, upgrade2: "$2,000", upgrade3: "$5,000", alias: "Sanity Medication" },
    "Sound Recorder": { t1: 4, t2: 39, t3: 60, upgrade2: "$3,000", upgrade3: "$5,000" },
    "Sound Sensor": { t1: 10, t2: 32, t3: 52, upgrade2: "$3,000", upgrade3: "$1,500" },
    "Tripod": { t1: 9, t2: 34, t3: 60, upgrade2: "$5,000", upgrade3: "$3,000" },
    "Head Mounted Camera": { t1: 13, t2: 42, t3: 80, upgrade2: "$10,000", upgrade3: "$10,000", alias: "Head Gear" }
};

function formatUnlockLevel(value) {
    return value === "Starter" ? "Default" : `Lvl ${value}`;
}

function renderUnlocks(item) {
    const unlock = EQUIPMENT_UNLOCKS[item.name];
    if (!unlock) return '';

    const aliasNote = unlock.alias ? `<div class="unlock-alias">Modern name: ${unlock.alias}</div>` : '';

    return `
        <div class="unlock-panel">
            <div class="unlock-title">Unlock Levels</div>
            <div class="unlock-row">
                <div class="unlock-tier"><span>T1</span><strong>${formatUnlockLevel(unlock.t1)}</strong></div>
                <div class="unlock-tier"><span>T2</span><strong>${formatUnlockLevel(unlock.t2)}</strong><small>${unlock.upgrade2 || ''}</small></div>
                <div class="unlock-tier"><span>T3</span><strong>${formatUnlockLevel(unlock.t3)}</strong><small>${unlock.upgrade3 || ''}</small></div>
            </div>
            ${aliasNote}
        </div>
    `;
}

// Equipment Tab Rendering
window.showEquipTab = function(category) {
    const content = document.getElementById('equip-content');
    if (!content) return;

    app.search.equipmentTab = category;
    const query = app.search.equipment || '';

    let itemsWithCategory = [];
    if (query) {
        Object.entries(EQUIPMENT).forEach(([cat, items]) => {
            items.forEach(item => {
                if (equipmentMatchesSearch(item, cat, query)) {
                    itemsWithCategory.push({ item, category: cat });
                }
            });
        });
    } else {
        itemsWithCategory = (EQUIPMENT[category] || []).map(item => ({ item, category }));
    }

    const meta = document.getElementById('equipmentSearchMeta');
    if (meta) {
        if (query) {
            meta.style.display = 'block';
            meta.textContent = `Showing ${itemsWithCategory.length} equipment item${itemsWithCategory.length === 1 ? '' : 's'} with name matching “${query}” across all tabs`;
        } else {
            meta.style.display = 'none';
            meta.textContent = '';
        }
    }

    if (itemsWithCategory.length === 0) {
        content.innerHTML = `<div class="search-empty-state"><strong>No equipment found</strong><span>Search now only checks equipment names. Try the card name, e.g. EMF, Reader, Crucifix, or Flashlight.</span></div>`;
        return;
    }

    let html = '<div class="equipment-list">';

    itemsWithCategory.forEach(({ item, category: itemCategory }) => {
        const categoryLabel = itemCategory.charAt(0).toUpperCase() + itemCategory.slice(1);
        html += `
            <div class="equipment-card">
                <div class="equip-header">
                    <h3 class="equip-name">${item.name}</h3>
                    <div class="equip-badges">
                        ${query ? `<span class="category-badge">${categoryLabel}</span>` : ''}
                        <span class="tier-badge">${item.tier}</span>
                        <span class="cost-badge">${item.cost}</span>
                        ${EQUIPMENT_UNLOCKS[item.name] ? `<span class="unlock-badge">${formatUnlockLevel(EQUIPMENT_UNLOCKS[item.name].t1)}</span>` : ''}
                    </div>
                </div>
                <p class="equip-usage"><strong>Usage:</strong> ${item.usage}</p>
                ${renderUnlocks(item)}
                <p class="equip-mechanics"><strong>Mechanics:</strong> ${item.mechanics}</p>
                ${item.range ? `<p class="equip-detail"><strong>Range:</strong> ${item.range}</p>` : ''}
                ${item.battery ? `<p class="equip-detail"><strong>Battery:</strong> ${item.battery}</p>` : ''}
                ${item.uses ? `<p class="equip-detail"><strong>Uses:</strong> ${item.uses}</p>` : ''}
                <div class="equip-tips">
                    <span class="tip-icon">💡</span>
                    <span class="tip-text">${item.tips}</span>
                </div>
            </div>
        `;
    });

    html += '</div>';
    content.innerHTML = html;
};
// exposed for HTML onclick
// exposed for HTML onclick
window.showManualTab = (key, btn) => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.getElementById('manualContent').innerHTML = MANUAL_DB[key];
};

function resetTimer() {
    if(app.timer.int) clearInterval(app.timer.int);
    app.timer.int = null;
    ui.timerBtn.innerHTML = "▶";
    ui.timerBtn.classList.remove('active');
    ui.timerDisplay.textContent = app.timer.dur;
    ui.timerFill.style.width = "0%";
    ui.timerFill.style.background = "var(--acc-cyan)";
}

// Sort ghosts alphabetically
GHOSTS.sort((a, b) => a.name.localeCompare(b.name));

// kick off
init();
// Initialize Group Journal
initGroupJournal();

// Initialize equipment when page loads
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.showEquipTab && document.getElementById('equip-content')) {
            window.showEquipTab('detection');
        }
    }, 200);
});


// ═══════════════════════════════════════════════════════════════
// STAGGERED XP LEVELING SYSTEM
// ═══════════════════════════════════════════════════════════════
// Level 1-10:  100 XP per level (10 correct = 1 level)
// Level 11-25: 200 XP per level (20 correct = 1 level)
// Level 26-50: 400 XP per level (40 correct = 1 level)
// Level 51+:   800 XP per level (80 correct = 1 level)

function getXPForLevel(level) {
    if (level <= 10) return 100;
    if (level <= 25) return 200;
    if (level <= 50) return 400;
    return 800;
}

function getLevelFromXP(xp) {
    let level = 1;
    let xpRemaining = xp;
    
    while (xpRemaining >= getXPForLevel(level)) {
        xpRemaining -= getXPForLevel(level);
        level++;
    }
    
    return {
        level: level,
        xpInCurrentLevel: xpRemaining,
        xpForNextLevel: getXPForLevel(level)
    };
}

// ═══════════════════════════════════════════════════════════════
// GROUP JOURNAL - MULTIPLAYER SYNC
// ═══════════════════════════════════════════════════════════════

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCBe2DLH2DnFucxKEp_tMfdsTV3dr8K-Qw",
    authDomain: "phasmo-group-journal.firebaseapp.com",
    databaseURL: "https://phasmo-group-journal-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "phasmo-group-journal",
    storageBucket: "phasmo-group-journal.firebasestorage.app",
    messagingSenderId: "224238426204",
    appId: "1:224238426204:web:b20b8db2f80981d2f02e99"
};

// Initialize Firebase App immediately
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase App initialized");
}

// Group Journal State
let groupJournal = {
    sessionId: null,
    isHost: false,
    userId: null,
    syncEnabled: false,
    lastSync: 0,
    syncTimeout: null
};

// Initialize Firebase (check if already initialized)
function initFirebase() {
    if (firebaseConfig.apiKey === "YOUR-API-KEY-HERE") {
        console.log("Firebase not configured. Group Journal disabled.");
        return false;
    }
    
    try {
        // App is already initialized globally, just generate user ID
        groupJournal.userId = generateUserId();
        return true;
    } catch (error) {
        console.error("Firebase initialization error:", error);
        return false;
    }
}

// Generate unique user ID
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
}

// Generate unique session ID
function generateSessionId() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Create new group session
function createGroupSession() {
    if (!initFirebase()) {
        alert("Firebase not configured. Please add your Firebase credentials to script.js");
        return;
    }
    
    try {
        groupJournal.sessionId = generateSessionId();
        groupJournal.isHost = true;
        groupJournal.syncEnabled = true;
        
        // Initialize session in Firebase
        const sessionRef = firebase.database().ref(`sessions/${groupJournal.sessionId}`);
        sessionRef.set({
            createdAt: Date.now(),
            host: groupJournal.userId,
            evidence: app.evidence,
            filters: Array.from(app.activeFilters),
            timer: { dur: app.timer.dur }, // Only sync duration
            lastUpdate: Date.now()
        }).then(() => {
            console.log("Session created:", groupJournal.sessionId);
            
            // Show active session UI
            showActiveSession();
            
            // Start listening for updates from others
            listenToSession();
            
            // Start heartbeat
            startHeartbeat();
        }).catch(error => {
            console.error("Error creating session:", error);
            alert("Failed to create session. Please check your internet connection.");
            groupJournal.syncEnabled = false;
        });
    } catch (error) {
        console.error("Error in createGroupSession:", error);
        alert("Failed to create session. Please try again.");
    }
}

// Join existing session
function joinGroupSession(sessionId) {
    if (!sessionId || sessionId.trim() === '') {
        alert("Please enter a session ID");
        return;
    }
    
    if (!initFirebase()) {
        alert("Firebase not configured. Please add your Firebase credentials to script.js");
        return;
    }
    
    sessionId = sessionId.trim().toUpperCase();
    
    // Check if session exists
    const sessionRef = firebase.database().ref(`sessions/${sessionId}`);
    sessionRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
            groupJournal.sessionId = sessionId;
            groupJournal.isHost = false;
            groupJournal.syncEnabled = true;
            
            console.log("Joined session:", sessionId);
            
            // Load current state from session - use spread to ensure deep copy
            const data = snapshot.val();
            app.evidence = {...data.evidence} || app.evidence;
            app.activeFilters = new Set(data.filters || []);
            if (data.timer && data.timer.dur) {
                app.timer.dur = data.timer.dur; // Only update duration
            }
            
            console.log("Loaded evidence state:", app.evidence);
            
            // Update UI
            renderFilters();
            updateBoard();
            // Update timer display
            if (ui.timerDisplay) {
                ui.timerDisplay.textContent = app.timer.dur;
            }
            
            // Show active session UI
            showActiveSession();
            
            // Start listening
            listenToSession();
            
            // Start heartbeat
            startHeartbeat();
            
            // Close modal
            ui.groupModal.close();
        } else {
            alert("Session not found. Please check the session ID.");
        }
    }).catch(error => {
        console.error("Error joining session:", error);
        alert("Failed to join session. Please check your internet connection.");
    });
}

// Join session from URL parameter
function checkUrlForSession() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionParam = urlParams.get('session');
    
    if (sessionParam) {
        // Auto-join session from URL
        setTimeout(() => {
            joinGroupSession(sessionParam);
        }, 500);
    }
}

// Listen for session updates
function listenToSession() {
    if (!groupJournal.sessionId) return;
    
    const sessionRef = firebase.database().ref(`sessions/${groupJournal.sessionId}`);
    
    sessionRef.on('value', (snapshot) => {
        try {
            const data = snapshot.val();
            if (!data) return;
            
            // Prevent sync loops - but allow the first sync (when lastSync is 0)
            const timeSinceLastSync = Date.now() - groupJournal.lastSync;
            if (groupJournal.lastSync > 0 && timeSinceLastSync < 500) {
                console.log("Skipping sync to prevent loop");
                return;
            }
            
            console.log("Applying synced state:", data);
            
            // Update local state - use spread to ensure deep copy
            app.evidence = {...data.evidence};
            app.activeFilters = new Set(data.filters || []);
            if (data.timer && data.timer.dur) {
                app.timer.dur = data.timer.dur;
            }
            
            // Update UI - renderFilters will update the filter chips
            renderFilters();
            
            // updateBoard will update the evidence buttons and ghost list
            updateBoard();
            
            // Update timer display
            if (ui.timerDisplay) {
                ui.timerDisplay.textContent = app.timer.dur;
            }
            
            // Update user count
            updateUserCount();
        } catch (error) {
            console.error("Error processing session update:", error);
        }
    }, (error) => {
        console.error("Error listening to session:", error);
    });
}

// Sync local state to Firebase
function syncToFirebase() {
    if (!groupJournal.syncEnabled || !groupJournal.sessionId) return;
    
    // Debounce - wait 300ms before syncing to batch rapid changes
    if (groupJournal.syncTimeout) {
        clearTimeout(groupJournal.syncTimeout);
    }
    
    groupJournal.syncTimeout = setTimeout(() => {
        groupJournal.lastSync = Date.now();
        
        // Create a clean copy of evidence to send
        const evidenceToSync = {...app.evidence};
        
        console.log("Syncing to Firebase:", evidenceToSync);
        
        const sessionRef = firebase.database().ref(`sessions/${groupJournal.sessionId}`);
        sessionRef.update({
            evidence: evidenceToSync,
            filters: Array.from(app.activeFilters),
            timer: { dur: app.timer.dur },
            lastUpdate: Date.now()
        }).catch(error => {
            console.error("Sync error:", error);
        });
    }, 300);
}

// User heartbeat (track active users)
function startHeartbeat() {
    if (!groupJournal.sessionId || !groupJournal.userId) return;
    
    const userRef = firebase.database().ref(`sessions/${groupJournal.sessionId}/users/${groupJournal.userId}`);
    
    // Set initial presence
    userRef.set({
        lastSeen: Date.now()
    });
    
    // Update every 5 seconds
    setInterval(() => {
        if (groupJournal.syncEnabled) {
            userRef.update({ lastSeen: Date.now() });
        }
    }, 5000);
    
    // Clean up on disconnect
    userRef.onDisconnect().remove();
}

// Update user count display
function updateUserCount() {
    if (!groupJournal.sessionId) return;
    
    const usersRef = firebase.database().ref(`sessions/${groupJournal.sessionId}/users`);
    usersRef.once('value', (snapshot) => {
        const users = snapshot.val();
        if (!users) {
            document.getElementById('userCount').textContent = '1';
            return;
        }
        
        // Count active users (seen in last 15 seconds)
        const now = Date.now();
        const activeUsers = Object.values(users).filter(u => now - u.lastSeen < 15000);
        document.getElementById('userCount').textContent = activeUsers.length;
    });
}

// Show active session UI
function showActiveSession() {
    document.getElementById('groupContent').style.display = 'none';
    document.getElementById('activeSession').style.display = 'block';
    
    // Set session ID
    document.getElementById('currentSessionId').textContent = groupJournal.sessionId;
    
    // Set share link
    const shareUrl = `${window.location.origin}${window.location.pathname}?session=${groupJournal.sessionId}`;
    document.getElementById('shareLink').value = shareUrl;
    
    // Update user count
    updateUserCount();
    setInterval(updateUserCount, 5000);
    
    // Add active class to button
    document.getElementById('btnGroupJournal').classList.add('active');
}

// Leave session
function leaveGroupSession() {
    if (!groupJournal.sessionId) return;
    
    console.log("Leaving session:", groupJournal.sessionId);
    
    // Stop listening to Firebase updates
    const sessionRef = firebase.database().ref(`sessions/${groupJournal.sessionId}`);
    sessionRef.off(); // Remove all listeners
    
    // Remove user presence
    if (groupJournal.userId) {
        firebase.database().ref(`sessions/${groupJournal.sessionId}/users/${groupJournal.userId}`).remove();
    }
    
    // Clear any pending sync
    if (groupJournal.syncTimeout) {
        clearTimeout(groupJournal.syncTimeout);
        groupJournal.syncTimeout = null;
    }
    
    // Reset state
    groupJournal.sessionId = null;
    groupJournal.isHost = false;
    groupJournal.syncEnabled = false;
    
    // Reset UI
    document.getElementById('groupContent').style.display = 'block';
    document.getElementById('activeSession').style.display = 'none';
    document.getElementById('btnGroupJournal').classList.remove('active');
    
    // Remove session parameter from URL
    const url = new URL(window.location);
    url.searchParams.delete('session');
    window.history.replaceState({}, document.title, url);
    
    ui.groupModal.close();
}

// Copy share link to clipboard
function copyShareLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    shareLink.setSelectionRange(0, 99999); // For mobile
    
    navigator.clipboard.writeText(shareLink.value).then(() => {
        const btn = document.getElementById('btnCopyLink');
        btn.classList.add('copied');
        btn.textContent = 'Copied!';
        
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.textContent = 'Copy';
        }, 2000);
    });
}

// Initialize Group Journal UI
function initGroupJournal() {
    console.log("Initializing Group Journal...");
    
    try {
        // Get UI elements
        ui.groupModal = document.getElementById('groupModal');
        
        if (!ui.groupModal) {
            console.error("Group modal not found!");
            return;
        }
        
        // Button to open modal
        const btnGroupJournal = document.getElementById('btnGroupJournal');
        if (btnGroupJournal) {
            btnGroupJournal.addEventListener('click', () => {
                console.log("Group Journal button clicked!");
                if (groupJournal.syncEnabled) {
                    // Already in session, show active session view
                    showActiveSession();
                }
                ui.groupModal.showModal();
            });
        } else {
            console.error("btnGroupJournal not found!");
        }
        
        // Close button
        const closeGroup = document.getElementById('closeGroup');
        if (closeGroup) {
            closeGroup.addEventListener('click', () => {
                ui.groupModal.close();
            });
        }
        
        // Create session button
        const btnCreateSession = document.getElementById('btnCreateSession');
        if (btnCreateSession) {
            btnCreateSession.addEventListener('click', createGroupSession);
        }
        
        // Join session button
        const btnJoinSession = document.getElementById('btnJoinSession');
        if (btnJoinSession) {
            btnJoinSession.addEventListener('click', () => {
                const sessionId = document.getElementById('joinSessionInput').value;
                joinGroupSession(sessionId);
            });
        }
        
        // Leave session button
        const btnLeaveSession = document.getElementById('btnLeaveSession');
        if (btnLeaveSession) {
            btnLeaveSession.addEventListener('click', () => {
                if (confirm('Are you sure you want to leave this group session?')) {
                    leaveGroupSession();
                }
            });
        }
        
        // Copy link button
        const btnCopyLink = document.getElementById('btnCopyLink');
        if (btnCopyLink) {
            btnCopyLink.addEventListener('click', copyShareLink);
        }
        
        // Join session on Enter key
        const joinSessionInput = document.getElementById('joinSessionInput');
        if (joinSessionInput) {
            joinSessionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const sessionId = joinSessionInput.value;
                    joinGroupSession(sessionId);
                }
            });
        }
        
        // Check if URL has session parameter
        checkUrlForSession();
        
        console.log("Group Journal initialized successfully!");
    } catch (error) {
        console.error("Error initializing Group Journal:", error);
    }
}

// Modify the original updateBoard to sync
const originalUpdateBoard = updateBoard;
updateBoard = function() {
    originalUpdateBoard();
    if (groupJournal.syncEnabled) {
        syncToFirebase();
    }
};


// ═══════════════════════════════════════════════════════════════
// GOOGLE AUTHENTICATION + NICKNAMES + STATS TRACKING
// ═══════════════════════════════════════════════════════════════

let currentUser = null;
let currentUserNickname = null;
let currentInvestigation = null;

// Initialize Firebase Auth - wait for it to be available
let auth;

function initializeFirebaseAuth() {
    if (typeof firebase === 'undefined' || !firebase.auth) {
        console.error("Firebase not loaded yet, retrying...");
        setTimeout(initializeFirebaseAuth, 100);
        return;
    }
    
    try {
        auth = firebase.auth();
        console.log("Firebase Auth initialized successfully");
        
        // Now initialize the auth system
        initGoogleAuth();
    } catch (error) {
        console.error("Firebase Auth initialization error:", error);
    }
}

// Start initialization when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebaseAuth);
} else {
    initializeFirebaseAuth();
}

// ═══════════════════════════════════════════════════════════════
// AUTH INITIALIZATION
// ═══════════════════════════════════════════════════════════════

function initGoogleAuth() {
    console.log("Initializing Google authentication...");
    
    // Google login button
    document.getElementById('btnGoogleLogin').addEventListener('click', handleGoogleLogin);
    
    // User menu button (toggle dropdown)
    document.getElementById('btnUserMenu').addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('userDropdown');
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('userDropdown');
        const oldUserMenu = document.getElementById('btnUserMenu');
        const newUserMenu = document.getElementById('btnUserMenuNew');
        
        // Check if click is outside dropdown and not on either user button
        if (dropdown && !dropdown.contains(e.target) && 
            e.target !== oldUserMenu && 
            e.target !== newUserMenu &&
            !e.target.closest('#btnUserMenuNew')) {
            dropdown.style.display = 'none';
        }
    });
    
    // Dropdown menu items
    document.getElementById('btnViewStatsDropdown').addEventListener('click', () => {
        document.getElementById('userDropdown').style.display = 'none';
        loadStats();
        document.getElementById('statsModal').showModal();
    });
    
    document.getElementById('btnLogoutDropdown').addEventListener('click', () => {
        document.getElementById('userDropdown').style.display = 'none';
        handleLogout();
    });
    
    // Nickname form
    document.getElementById('nicknameForm').addEventListener('submit', handleNicknameSubmit);
    
    // Share stats button
    const shareStatsBtn = document.getElementById('btnShareStats');
    if (shareStatsBtn) {
        shareStatsBtn.addEventListener('click', openShareStatsCard);
    }

    // Change nickname button
    document.getElementById('btnChangeNickname').addEventListener('click', () => {
        document.getElementById('statsModal').close();
        document.getElementById('nicknameModal').showModal();
    });
    
    // Reset stats button
    document.getElementById('btnResetStats').addEventListener('click', async () => {
        if (!currentUser) return;
        
        const confirmed = confirm('⚠️ Are you sure you want to reset ALL your stats?\n\nThis will delete:\n- All investigation history\n- Win/loss records\n- XP and level\n- Everything!\n\nThis CANNOT be undone!');
        
        if (!confirmed) return;
        
        // Double confirmation
        const doubleConfirm = confirm('Really reset? This is your last chance!\n\nType YES in the next prompt to confirm.');
        
        if (!doubleConfirm) return;
        
        const finalConfirm = prompt('Type YES to reset all stats:');
        
        if (finalConfirm === 'YES') {
            try {
                // Reset stats
                await firebase.database().ref(`users/${currentUser.uid}/stats`).set({
                    total: 0,
                    wins: 0,
                    losses: 0,
                    xp: 0,
                    level: 1
                });
                
                // Delete history
                await firebase.database().ref(`users/${currentUser.uid}/history`).remove();
                
                alert('✅ Stats reset successfully!');
                
                // Reload stats display
                loadStats();
                loadUserStatsDisplay();
                
            } catch (error) {
                console.error('Error resetting stats:', error);
                alert('❌ Failed to reset stats. Please try again.');
            }
        } else {
            alert('Reset cancelled.');
        }
    });
    
    // View stats
    
    // Close stats
    document.getElementById('closeStats').addEventListener('click', () => {
        document.getElementById('statsModal').close();
    });
    
    // Close guess
    document.getElementById('closeGuess').addEventListener('click', () => {
        document.getElementById('guessModal').close();
    });
    
    // Start investigation
    document.getElementById('btnNewInvestigation').addEventListener('click', () => {

        const mode =
            document.getElementById('investigationDifficulty').value;

        startNewInvestigation(mode);

        document.getElementById('statsModal').close();

    });
    
    // Listen for auth state changes
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            await onUserLoggedIn(user);
        } else {
            onUserLoggedOut();
        }
    });
    
    console.log("Google authentication initialized!");
}

// ═══════════════════════════════════════════════════════════════
// GOOGLE AUTH HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleGoogleLogin() {
    if (!auth) {
        alert("⚠️ Firebase Auth not ready yet.\n\nPlease wait a moment and try again.");
        console.error("Auth not initialized");
        return;
    }
    
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
        console.log("Google sign-in successful");
    } catch (error) {
        console.error("Google sign-in error:", error);
        
        if (error.code === 'auth/popup-closed-by-user') {
            return;
        }
        
        if (error.code === 'auth/unauthorized-domain') {
            alert("⚠️ Domain Not Authorized\n\nThis domain needs to be added to Firebase:\n\n1. Go to Firebase Console\n2. Authentication → Settings → Authorized domains\n3. Add: " + window.location.hostname + "\n\nOr test on your production domain instead!");
            return;
        }
        
        if (error.code === 'auth/popup-blocked') {
            alert("⚠️ Popup Blocked\n\nYour browser blocked the sign-in popup.\n\nPlease allow popups for this site and try again.");
            return;
        }
        
        alert("Failed to sign in with Google.\n\nError: " + (error.message || "Unknown error") + "\n\nPlease try again.");
    }
}

async function handleLogout() {
    try {
        // Leave group session if in one
        if (groupJournal && groupJournal.sessionId) {
            leaveGroupSession();
        }
        
        await auth.signOut();
        console.log("User logged out");
    } catch (error) {
        console.error("Logout error:", error);
    }
}

async function onUserLoggedIn(user) {
    console.log("User logged in:", user.email);
    currentUser = user;
    
    // Check if user has a nickname
    const userRef = firebase.database().ref(`users/${user.uid}`);
    const snapshot = await userRef.once('value');
    const userData = snapshot.val();
    
    if (!userData || !userData.nickname) {
        // First time login - prompt for nickname
        document.getElementById('nicknameModal').showModal();
        return;
    }
    
    // User has nickname, load it
    currentUserNickname = userData.nickname;
    showUserView();
}

function onUserLoggedOut() {
    console.log("User logged out");
    currentUser = null;
    currentUserNickname = null;
    currentInvestigation = null;
    
    // Update UI
    document.getElementById('authView').style.display = 'flex';
    document.getElementById('userView').style.display = 'none';
    
    // Hide investigation banner
    const banner = document.getElementById('investigationBanner');
    if (banner) banner.remove();
}

function showUserView() {
    // Update UI
    document.getElementById('authView').style.display = 'none';
    document.getElementById('userView').style.display = 'inline-flex';
    
    // Set user info in button
    document.getElementById('userNickname').textContent = currentUserNickname;
    document.getElementById('userAvatar').src = currentUser.photoURL || 'https://via.placeholder.com/40';
    
    // Set user info in dropdown
    document.getElementById('dropdownNickname').textContent = currentUserNickname;
    document.getElementById('dropdownAvatar').src = currentUser.photoURL || 'https://via.placeholder.com/40';
    
    // Load stats
    loadUserStatsDisplay();
    
    // Initialize friends system for this user
    initializeFriendCode();
    loadFriends();
    listenToFriendRequests();
}

// ═══════════════════════════════════════════════════════════════
// NICKNAME MANAGEMENT
// ═══════════════════════════════════════════════════════════════

async function handleNicknameSubmit(e) {
    e.preventDefault();
    
    const nickname = document.getElementById('nicknameInput').value.trim();
    const errorEl = document.getElementById('nicknameError');
    const submitBtn = e.submitter || document.querySelector('#nicknameForm button[type="submit"]');
    
    // Clear error
    errorEl.classList.remove('show');
    errorEl.textContent = '';
    
    // Validate
    if (nickname.length < 3 || nickname.length > 20) {
        errorEl.textContent = "Nickname must be 3-20 characters";
        errorEl.classList.add('show');
        return;
    }
    
    if (!/^[A-Za-z0-9 _-]+$/.test(nickname)) {
        errorEl.textContent = "Only letters, numbers, spaces, - and _ allowed";
        errorEl.classList.add('show');
        return;
    }

    if (!currentUser || !currentUser.uid) {
        errorEl.textContent = "Login is still loading. Please wait a second and try again.";
        errorEl.classList.add('show');
        return;
    }
    
    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
        }

        const userRef = firebase.database().ref(`users/${currentUser.uid}`);

        // Save the required field first, on its own. This avoids a full-profile update failing
        // because of stricter Firebase rules around optional fields like email/photoURL/stats.
        await userRef.child('nickname').set(nickname);

        // Optional profile metadata. These are nice to have, but nickname save should not fail
        // just because rules reject one of these fields.
        const optionalProfile = {
            updatedAt: Date.now()
        };
        if (currentUser.photoURL) optionalProfile.photoURL = currentUser.photoURL;
        if (currentUser.email) optionalProfile.email = currentUser.email;

        try {
            await userRef.update(optionalProfile);
        } catch (profileError) {
            console.warn('Nickname saved, but optional profile metadata was not saved:', profileError);
        }

        // Create starter stats only if the user does not already have any. Failure here should
        // not block login/nickname creation.
        try {
            const statsRef = userRef.child('stats');
            const statsSnapshot = await statsRef.once('value');
            if (!statsSnapshot.exists()) {
                await statsRef.set({ total: 0, wins: 0, losses: 0, xp: 0, level: 1 });
            }
        } catch (statsError) {
            console.warn('Nickname saved, but starter stats were not saved:', statsError);
        }
        
        currentUserNickname = nickname;
        
        // Close modal
        document.getElementById('nicknameModal').close();
        
        // Show user view
        showUserView();
        
        console.log("Nickname saved:", nickname);
        
    } catch (error) {
        console.error("Error saving nickname:", error);
        const message = error && (error.message || error.code) ? `Failed to save nickname: ${error.message || error.code}` : "Failed to save nickname";
        errorEl.textContent = message;
        errorEl.classList.add('show');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'SET NICKNAME';
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// STATS MANAGEMENT
// ═══════════════════════════════════════════════════════════════

async function loadStats() {
    if (!currentUser) return;
    
    try {
        // Load stats
        const statsSnapshot = await firebase.database().ref(`users/${currentUser.uid}/stats`).once('value');
        const stats = statsSnapshot.val() || { total: 0, wins: 0, losses: 0, xp: 0, level: 1 };
        
        const winRate = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0;
        
        // Update title with nickname
        document.getElementById('statsNickname').textContent = currentUserNickname + "'s";
        
        // Update stats display
        document.getElementById('statTotal').textContent = stats.total;
        document.getElementById('statWins').textContent = stats.wins;
        document.getElementById('statLosses').textContent = stats.losses;
        document.getElementById('statWinRate').textContent = winRate + '%';
        
        // Update level/XP display
        const level = stats.level || 1;
        const xp = stats.xp || 0;
        const levelInfo = getLevelFromXP(xp);
        const xpInLevel = levelInfo.xpInCurrentLevel;
        const xpForNextLevel = levelInfo.xpForNextLevel;
        const xpPercent = (xpInLevel / xpForNextLevel) * 100;
        
        document.getElementById('statLevel').textContent = level;
        document.getElementById('statXP').textContent = xpInLevel;
        document.getElementById('statXPNext').textContent = xpForNextLevel;
        document.getElementById('xpBarFill').style.width = xpPercent + '%';
        
        // Load history
        const historySnapshot = await firebase.database().ref(`users/${currentUser.uid}/history`)
            .orderByChild('timestamp')
            .limitToLast(10)
            .once('value');
        
        const historyList = document.getElementById('historyList');
        
        if (historySnapshot.exists()) {
            historyList.innerHTML = '';
            const historyItems = [];
            
            historySnapshot.forEach((child) => {
                historyItems.unshift(child.val());
            });
            
            historyItems.forEach((item) => {
                const historyItem = document.createElement('div');
                historyItem.className = `history-item ${item.correct ? 'correct' : 'incorrect'}`;
                
                const timeAgo = formatTimeAgo(item.timestamp);
                const xpGained = item.xpGained || 0;
                
                historyItem.innerHTML = `
                    <div class="history-info">
                        <div class="history-guess">
                            ${item.correct ? '✅' : '❌'} ${item.actualGhost || item.actual}
                            ${xpGained > 0 ? `<span style="color: var(--acc-green)">+${xpGained} XP</span>` : ''}
                        </div>
                        <div class="history-result">
                            ${item.possibleGhosts ? `Evidence showed: ${item.possibleGhosts.join(', ')}` : item.correct ? 'Correct match!' : 'Evidence mismatch'}
                        </div>
                    </div>
                    <div class="history-time">${timeAgo}</div>
                `;
                
                historyList.appendChild(historyItem);
            });
        } else {
            historyList.innerHTML = '<div class="empty-state">No investigations yet. Start hunting ghosts!</div>';
        }
        
    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

async function loadUserStatsDisplay() {
    if (!currentUser) return;
    
    try {
        const snapshot = await firebase.database().ref(`users/${currentUser.uid}/stats`).once('value');
        const stats = snapshot.val() || { total: 0, wins: 0, losses: 0, xp: 0, level: 1 };
        
        const winRate = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0;
        
        // Update button display
        document.getElementById('userLevel').textContent = stats.level || 1;
        
        // Update dropdown
        document.getElementById('dropdownWins').textContent = stats.wins;
        document.getElementById('dropdownWinRate').textContent = winRate;
        
    } catch (error) {
        console.error("Error loading stats:", error);
    }
}


function buildShareStatsURL(shareData) {
    const url = new URL('share-stats.html', window.location.href);
    Object.entries(shareData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, String(value));
        }
    });
    return url.toString();
}

async function openShareStatsCard() {
    if (!currentUser) {
        alert('Please log in first.');
        return;
    }

    try {
        const statsSnapshot = await firebase.database().ref(`users/${currentUser.uid}/stats`).once('value');
        const stats = statsSnapshot.val() || { total: 0, wins: 0, losses: 0, xp: 0, level: 1 };
        const total = Number(stats.total || 0);
        const wins = Number(stats.wins || 0);
        const losses = Number(stats.losses || 0);
        const xp = Number(stats.xp || 0);
        const levelInfo = getLevelFromXP(xp);
        const level = Number(stats.level || levelInfo.level || 1);
        const xpCurrent = Number(levelInfo.xpInCurrentLevel || 0);
        const xpNext = Number(levelInfo.xpForNextLevel || 100);
        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

        const shareData = {
            name: currentUserNickname || currentUser.displayName || 'Hunter',
            avatar: currentUser.photoURL || '',
            level,
            total,
            wins,
            losses,
            rate: winRate,
            xpCurrent,
            xpNext,
            version: '2.5'
        };

        const shareURL = buildShareStatsURL(shareData);
        const shareWindow = window.open(shareURL, '_blank', 'noopener,noreferrer');
        if (!shareWindow) {
            alert('The share card was blocked by your browser. Please allow pop-ups for this site and try again.');
        }
    } catch (error) {
        console.error('Error generating share stats card:', error);
        alert('Could not generate your share card right now.');
    }
}

function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    return Math.floor(seconds / 86400) + 'd ago';
}

// ═══════════════════════════════════════════════════════════════
// INVESTIGATION MANAGEMENT
// ═══════════════════════════════════════════════════════════════

function startNewInvestigation(mode = 'all') {
    if (!currentUser) {
        alert('Please log in to track your investigations!');
        return;
    }
    
    // Randomly select a ghost
    const randomGhost = GHOSTS[Math.floor(Math.random() * GHOSTS.length)];
    
    currentInvestigation = {
        actualGhost: randomGhost.name,
        startTime: Date.now(),
        mode: mode
    };
    
    console.log('Investigation started - Ghost:', currentInvestigation.actualGhost);
    
    // Show investigation banner
    showInvestigationBanner();
    
    // Reset evidence
    Object.keys(app.evidence).forEach(k => app.evidence[k] = 0);
    app.activeFilters.clear();
    renderFilters();
    updateBoard();
}

function showInvestigationBanner() {
    // Remove existing banner if any
    const existingBanner = document.getElementById('investigationBanner');
    if (existingBanner) existingBanner.remove();
    
    // Create new banner
    const banner = document.createElement('div');
    banner.id = 'investigationBanner';
    banner.className = 'investigation-banner';
    banner.innerHTML = `
        <div class="investigation-info">
            🔍 Investigation in progress (${currentInvestigation.mode.toUpperCase()} EVI)
            <span class="timer" id="investigationTimer">0:00</span>
        </div>
        <button class="btn-submit-guess" id="btnOpenGuess">Submit Result</button>
    `;
    
    // Insert after header
    const header = document.querySelector('header');
    if (header) {
        header.after(banner);
    } else {
        document.body.insertBefore(banner, document.body.firstChild);
    }
    
    // Start timer
    updateInvestigationTimer();
    
    // Add button handler
    document.getElementById('btnOpenGuess').addEventListener('click', openGuessModal);
}

function updateInvestigationTimer() {
    if (!currentInvestigation) return;
    
    const timerEl = document.getElementById('investigationTimer');
    if (!timerEl) return;
    
    const elapsed = Math.floor((Date.now() - currentInvestigation.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    setTimeout(updateInvestigationTimer, 1000);
}

function openGuessModal() {
    if (!currentInvestigation) {
        alert('Start a new investigation first!');
        return;
    }
    
    // Show ALL ghosts for selection (not filtered)
    const ghostOptions = document.getElementById('ghostOptions');
    ghostOptions.innerHTML = '';
    
    // Add instruction text
    const instruction = document.createElement('p');
    instruction.style.cssText = 'grid-column: 1/-1; text-align: center; color: var(--text-muted); margin-bottom: 8px;';
    instruction.textContent = 'What ghost was it in the game?';
    ghostOptions.appendChild(instruction);
    
    // Show all ghosts
    GHOSTS.forEach(ghost => {
        const option = document.createElement('div');
        option.className = 'ghost-option';
        option.textContent = ghost.name;
        option.addEventListener('click', () => submitActualGhost(ghost.name));
        ghostOptions.appendChild(option);
    });
    
    document.getElementById('guessModal').showModal();
}

async function submitActualGhost(actualGhost) {
    if (!currentInvestigation || !currentUser) return;
    
    // Get what the user's evidence narrowed it down to
    const matches = [];
    GHOSTS.forEach(g => {
        let possible = true;
        for(const [id, val] of Object.entries(app.evidence)) {
            if(val === 0) continue;
            const has = g.ev.includes(id) || (g.name === 'The Mimic' && id === 'orb');
            if(val === 1 && !has) possible = false;
            if(val === 2 && has) possible = false;
        }
        if(possible && app.activeFilters.size > 0) {
            app.activeFilters.forEach(fid => {
                if(!g.tags.includes(fid)) possible = false;
            });
        }
        if(possible) matches.push(g.name);
    });
    
    // Check if their evidence correctly narrowed it down
    const correct = matches.includes(actualGhost) && matches.length > 0;
    const timeTaken = Math.floor((Date.now() - currentInvestigation.startTime) / 1000);
    
    console.log('Investigation complete:', {
        actualGhost,
        possibleFromEvidence: matches,
        correct: correct
    });
    
    try {
        // Get current stats
        const statsRef = firebase.database().ref(`users/${currentUser.uid}/stats`);
        const snapshot = await statsRef.once('value');
        const currentStats = snapshot.val() || { total: 0, wins: 0, losses: 0, xp: 0, level: 1 };
        
        // Calculate XP gain
        const xpGain = correct ? 10 : 0;
        const newXP = (currentStats.xp || 0) + xpGain;
        
        // Calculate new level using staggered system
        const levelInfo = getLevelFromXP(newXP);
        const newLevel = levelInfo.level;
        const leveledUp = newLevel > (currentStats.level || 1);
        
        // Update stats
        const newStats = {
            total: currentStats.total + 1,
            wins: currentStats.wins + (correct ? 1 : 0),
            losses: currentStats.losses + (correct ? 0 : 1),
            xp: newXP,
            level: newLevel
        };
        
        await statsRef.set(newStats);
        
        // Save to history
        await firebase.database().ref(`users/${currentUser.uid}/history`).push({
            actualGhost: actualGhost,
            possibleGhosts: matches,
            correct: correct,
            timeTaken: timeTaken,
            xpGained: xpGain,
            timestamp: Date.now()
        });
        
        // Show result
        const winRate = Math.round((newStats.wins / newStats.total) * 100);
        
        let resultMessage = '';
        if (correct) {
            resultMessage = `✅ CORRECT!\n\nIt was ${actualGhost} and your evidence matched!\n\n`;
            if (leveledUp) {
                resultMessage += `🎉 LEVEL UP! You're now Level ${newLevel}!\n\n`;
            }
            resultMessage += `+${xpGain} XP (${levelInfo.xpInCurrentLevel}/${levelInfo.xpForNextLevel} to Level ${newLevel + 1})\n\n`;
        } else {
            if (matches.length === 0) {
                resultMessage = `❌ INCORRECT\n\nIt was ${actualGhost} but your evidence ruled it out.\n\n`;
            } else {
                resultMessage = `❌ INCORRECT\n\nIt was ${actualGhost} but your evidence showed: ${matches.join(', ')}\n\n`;
            }
            resultMessage += `No XP gained\n\n`;
        }
        
        resultMessage += `Your stats:\n🏆 ${newStats.wins} wins out of ${newStats.total} total\n📊 ${winRate}% accuracy\n⭐ Level ${newStats.level} (${newStats.xp} XP)`;
        
        alert(resultMessage);
        
        // Update display
        loadUserStatsDisplay();
        
        // End investigation
        endInvestigation();
        
    } catch (error) {
        console.error('Error submitting investigation:', error);
        alert('Failed to save investigation. Please try again.');
    }
    
    // Close modal
    document.getElementById('guessModal').close();
}

function endInvestigation() {
    currentInvestigation = null;
    
    // Remove banner
    const banner = document.getElementById('investigationBanner');
    if (banner) banner.remove();
}

// ═══════════════════════════════════════════════════════════════
// GROUP JOURNAL INTEGRATION - UPDATE EXISTING FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Override startHeartbeat to include nickname
const originalStartHeartbeat = startHeartbeat;
startHeartbeat = function() {
    if (!groupJournal.sessionId || !groupJournal.userId) return;
    
    const userRef = firebase.database().ref(`sessions/${groupJournal.sessionId}/users/${groupJournal.userId}`);
    
    // Set initial presence with nickname
    userRef.set({
        lastSeen: Date.now(),
        nickname: currentUserNickname || 'Anonymous',
        photoURL: currentUser?.photoURL || null
    });
    
    // Update every 5 seconds
    const interval = setInterval(() => {
        if (groupJournal.syncEnabled) {
            userRef.update({ 
                lastSeen: Date.now(),
                nickname: currentUserNickname || 'Anonymous'
            });
        } else {
            clearInterval(interval);
        }
    }, 5000);
    
    // Clean up on disconnect
    userRef.onDisconnect().remove();
};

// Override updateUserCount to show nicknames
const originalUpdateUserCount = updateUserCount;
updateUserCount = function() {
    if (!groupJournal.sessionId) return;
    
    const usersRef = firebase.database().ref(`sessions/${groupJournal.sessionId}/users`);
    usersRef.once('value', (snapshot) => {
        const users = snapshot.val();
        if (!users) {
            document.getElementById('userCount').textContent = '1';
            const usersList = document.getElementById('usersList');
            if (usersList) {
                usersList.innerHTML = '<div class="user-chip you">👤 You</div>';
            }
            return;
        }
        
        // Count active users (seen in last 15 seconds)
        const now = Date.now();
        const activeUsers = [];
        
        Object.entries(users).forEach(([uid, data]) => {
            if (now - data.lastSeen < 15000) {
                activeUsers.push({
                    uid,
                    nickname: data.nickname || 'Anonymous',
                    photoURL: data.photoURL,
                    isYou: uid === groupJournal.userId
                });
            }
        });
        
        // Update count
        document.getElementById('userCount').textContent = activeUsers.length;
        
        // Update users list
        const usersList = document.getElementById('usersList');
        if (usersList) {
            usersList.innerHTML = '';
            
            activeUsers.forEach(user => {
                const chip = document.createElement('div');
                chip.className = `user-chip ${user.isYou ? 'you' : ''}`;
                
                if (user.photoURL) {
                    chip.innerHTML = `
                        <img src="${user.photoURL}" alt="">
                        <span>${user.nickname}${user.isYou ? ' (You)' : ''}</span>
                    `;
                } else {
                    chip.innerHTML = `
                        <span>👤 ${user.nickname}${user.isYou ? ' (You)' : ''}</span>
                    `;
                }
                
                usersList.appendChild(chip);
            });
        }
    });
};

// ═══════════════════════════════════════════════════════════════
// INITIALIZE AUTH
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// FRIENDS SYSTEM WITH FRIEND CODES
// ═══════════════════════════════════════════════════════════════

// FRIENDS SYSTEM WITH FRIEND CODES
// Uses a small /friendCodes lookup index plus per-user notification inboxes.

let currentFriends = [];
let pendingRequests = { incoming: [], outgoing: [] };
let friendsSystemBound = false;
let friendListenersBoundFor = null;

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function normaliseFriendCode(code) {
    const cleaned = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length === 8) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    return String(code || '').toUpperCase().trim();
}

function generateFriendCode() {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
    code += '-';
    for (let i = 0; i < 4; i++) code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    return code;
}

async function getPublicUserProfile(uid) {
    const snapshot = await firebase.database().ref(`users/${uid}`).once('value');
    const data = snapshot.val() || {};
    return {
        uid,
        nickname: data.nickname || 'Unknown Hunter',
        photoURL: data.photoURL || '',
        friendCode: data.friendCode || ''
    };
}

async function claimFriendCodeIndex(code, uid) {
    const codeRef = firebase.database().ref(`friendCodes/${code}`);
    const snapshot = await codeRef.once('value');
    if (snapshot.exists() && snapshot.val() !== uid) return false;
    await codeRef.set(uid);
    return true;
}

async function lookupFriendCode(code) {
    const normalised = normaliseFriendCode(code);
    const snapshot = await firebase.database().ref(`friendCodes/${normalised}`).once('value');
    const uid = snapshot.val();
    if (!uid) return null;
    const profile = await getPublicUserProfile(uid);
    return { uid, ...profile };
}

async function initializeFriendCode() {
    if (!currentUser) return null;

    const codeEl = document.getElementById('yourFriendCode');
    if (codeEl) codeEl.textContent = 'Loading...';

    try {
        const userRef = firebase.database().ref(`users/${currentUser.uid}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val() || {};

        if (userData.friendCode) {
            const existingCode = normaliseFriendCode(userData.friendCode);
            const claimedExisting = await claimFriendCodeIndex(existingCode, currentUser.uid);
            if (claimedExisting) {
                if (existingCode !== userData.friendCode) {
                    await userRef.child('friendCode').set(existingCode);
                }
                if (codeEl) codeEl.textContent = existingCode;
                return existingCode;
            }
        }

        let code = generateFriendCode();
        let claimed = false;
        for (let attempts = 0; attempts < 20; attempts++) {
            claimed = await claimFriendCodeIndex(code, currentUser.uid);
            if (claimed) break;
            code = generateFriendCode();
        }

        if (!claimed) throw new Error('Could not create a unique friend code.');

        await userRef.child('friendCode').set(code);
        if (codeEl) codeEl.textContent = code;
        return code;
    } catch (error) {
        console.error('Error initialising friend code:', error);
        if (codeEl) codeEl.textContent = 'Unavailable';
        return null;
    }
}

function initFriendsSystem() {
    if (friendsSystemBound) return;
    friendsSystemBound = true;

    const friendsBtn = document.getElementById('btnFriends');
    if (friendsBtn) friendsBtn.addEventListener('click', openFriendsModal);

    const closeFriends = document.getElementById('closeFriends');
    if (closeFriends) closeFriends.addEventListener('click', () => document.getElementById('friendsModal')?.close());

    const addFriendBtn = document.getElementById('btnAddFriend');
    if (addFriendBtn) {
        addFriendBtn.addEventListener('click', () => {
            document.getElementById('friendsModal')?.close();
            const err = document.getElementById('addFriendError');
            if (err) err.textContent = '';
            const input = document.getElementById('friendCodeInput');
            if (input) input.value = '';
            document.getElementById('addFriendModal')?.showModal();
        });
    }

    const closeAddFriend = document.getElementById('closeAddFriend');
    if (closeAddFriend) closeAddFriend.addEventListener('click', () => document.getElementById('addFriendModal')?.close());

    const copyBtn = document.getElementById('btnCopyFriendCode');
    if (copyBtn) copyBtn.addEventListener('click', copyFriendCode);

    const addFriendForm = document.getElementById('addFriendForm');
    if (addFriendForm) addFriendForm.addEventListener('submit', sendFriendRequest);
}

async function openFriendsModal() {
    if (!currentUser) {
        alert('Please log in to use friends.');
        return;
    }

    document.getElementById('friendsModal')?.showModal();
    await initializeFriendCode();
    await loadFriends();
}

async function copyFriendCode() {
    if (!currentUser) return;

    try {
        let code = document.getElementById('yourFriendCode')?.textContent;
        if (!code || ['Loading...', 'Generating...', 'Unavailable'].includes(code)) {
            code = await initializeFriendCode();
        }
        if (!code) throw new Error('No friend code available');

        await navigator.clipboard.writeText(code);
        const btn = document.getElementById('btnCopyFriendCode');
        if (btn) {
            const original = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = original; }, 1500);
        }
    } catch (error) {
        console.error('Error copying friend code:', error);
        alert('Could not copy the friend code. You can copy it manually instead.');
    }
}

async function sendFriendRequest(e) {
    e.preventDefault();
    if (!currentUser) return;

    const codeInput = document.getElementById('friendCodeInput');
    const errorEl = document.getElementById('addFriendError');
    const submitBtn = e.submitter || document.querySelector('#addFriendForm button[type="submit"]');
    const code = normaliseFriendCode(codeInput?.value || '');

    if (errorEl) errorEl.textContent = '';

    if (!/^[A-Z]{4}-[0-9]{4}$/.test(code)) {
        if (errorEl) errorEl.textContent = 'Friend code must look like ABCD-1234.';
        return;
    }

    if (submitBtn) submitBtn.disabled = true;

    try {
        const friend = await lookupFriendCode(code);
        if (!friend) {
            if (errorEl) errorEl.textContent = 'No hunter found with that friend code.';
            return;
        }

        if (friend.uid === currentUser.uid) {
            if (errorEl) errorEl.textContent = 'That is your own friend code.';
            return;
        }

        const alreadyFriends = await firebase.database().ref(`users/${currentUser.uid}/friends/${friend.uid}`).once('value');
        if (alreadyFriends.exists()) {
            if (errorEl) errorEl.textContent = 'You are already friends with this hunter.';
            return;
        }

        const incoming = await firebase.database().ref(`users/${currentUser.uid}/friendRequests/incoming/${friend.uid}`).once('value');
        if (incoming.exists()) {
            await acceptFriendRequest(friend.uid);
            document.getElementById('addFriendModal')?.close();
            await loadFriends();
            return;
        }

        const outgoing = await firebase.database().ref(`users/${currentUser.uid}/friendRequests/outgoing/${friend.uid}`).once('value');
        if (outgoing.exists()) {
            if (errorEl) errorEl.textContent = 'You have already sent this hunter a request.';
            return;
        }

        const myProfile = await getPublicUserProfile(currentUser.uid);
        const now = Date.now();
        const updates = {};
        updates[`users/${currentUser.uid}/friendRequests/outgoing/${friend.uid}`] = {
            toUid: friend.uid,
            toNickname: friend.nickname || 'Unknown Hunter',
            toPhotoURL: friend.photoURL || '',
            timestamp: now
        };
        updates[`users/${friend.uid}/friendRequestReceived/${currentUser.uid}`] = {
            fromUid: currentUser.uid,
            fromNickname: myProfile.nickname || currentUserNickname || 'Unknown Hunter',
            fromPhotoURL: myProfile.photoURL || currentUser.photoURL || '',
            timestamp: now
        };
        await firebase.database().ref().update(updates);

        alert(`Friend request sent to ${friend.nickname || 'that hunter'}!`);
        if (codeInput) codeInput.value = '';
        document.getElementById('addFriendModal')?.close();
        await loadFriends();
    } catch (error) {
        console.error('Error sending friend request:', error);
        if (errorEl) errorEl.textContent = 'Could not send the request. Please check the friend-system database rules.';
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

async function acceptFriendRequest(friendUid) {
    if (!currentUser || !friendUid) return;

    try {
        const [friendProfile, myProfile] = await Promise.all([
            getPublicUserProfile(friendUid),
            getPublicUserProfile(currentUser.uid)
        ]);
        const since = Date.now();
        const updates = {};
        updates[`users/${currentUser.uid}/friends/${friendUid}`] = {
            nickname: friendProfile.nickname,
            photoURL: friendProfile.photoURL || '',
            since
        };
        updates[`users/${currentUser.uid}/friendRequests/incoming/${friendUid}`] = null;
        updates[`users/${currentUser.uid}/friendRequestReceived/${friendUid}`] = null;
        updates[`users/${friendUid}/friendAccepted/${currentUser.uid}`] = {
            uid: currentUser.uid,
            nickname: myProfile.nickname || currentUserNickname || 'Unknown Hunter',
            photoURL: myProfile.photoURL || currentUser.photoURL || '',
            since
        };
        await firebase.database().ref().update(updates);
        await loadFriends();
        alert(`You and ${friendProfile.nickname} are now friends!`);
    } catch (error) {
        console.error('Error accepting friend request:', error);
        alert('Could not accept the friend request. Please check the friend-system database rules.');
    }
}

async function declineFriendRequest(friendUid) {
    if (!currentUser || !friendUid) return;

    try {
        const incomingSnapshot = await firebase.database().ref(`users/${currentUser.uid}/friendRequests/incoming/${friendUid}`).once('value');
        const outgoingSnapshot = await firebase.database().ref(`users/${currentUser.uid}/friendRequests/outgoing/${friendUid}`).once('value');
        const updates = {};

        if (incomingSnapshot.exists()) {
            updates[`users/${currentUser.uid}/friendRequests/incoming/${friendUid}`] = null;
            updates[`users/${currentUser.uid}/friendRequestReceived/${friendUid}`] = null;
            updates[`users/${friendUid}/friendRequestDeclined/${currentUser.uid}`] = { timestamp: Date.now() };
        }

        if (outgoingSnapshot.exists()) {
            updates[`users/${currentUser.uid}/friendRequests/outgoing/${friendUid}`] = null;
            updates[`users/${friendUid}/friendRequestCancelled/${currentUser.uid}`] = { timestamp: Date.now() };
        }

        await firebase.database().ref().update(updates);
        await loadFriends();
    } catch (error) {
        console.error('Error declining/cancelling friend request:', error);
        alert('Could not update the friend request.');
    }
}

async function removeFriend(friendUid, friendNickname) {
    if (!currentUser || !friendUid) return;
    const confirmed = confirm(`Remove ${friendNickname || 'this hunter'} from your friends list?`);
    if (!confirmed) return;

    try {
        const updates = {};
        updates[`users/${currentUser.uid}/friends/${friendUid}`] = null;
        updates[`users/${friendUid}/friendRemoved/${currentUser.uid}`] = { timestamp: Date.now() };
        await firebase.database().ref().update(updates);
        await loadFriends();
    } catch (error) {
        console.error('Error removing friend:', error);
        alert('Could not remove this friend.');
    }
}

async function loadFriends() {
    if (!currentUser) return;

    try {
        let codeSnapshot = await firebase.database().ref(`users/${currentUser.uid}/friendCode`).once('value');
        let yourCode = codeSnapshot.val();
        if (!yourCode) yourCode = await initializeFriendCode();

        const codeEl = document.getElementById('yourFriendCode');
        if (codeEl) codeEl.textContent = yourCode || 'Unavailable';

        const [friendsSnapshot, incomingSnapshot, outgoingSnapshot] = await Promise.all([
            firebase.database().ref(`users/${currentUser.uid}/friends`).once('value'),
            firebase.database().ref(`users/${currentUser.uid}/friendRequests/incoming`).once('value'),
            firebase.database().ref(`users/${currentUser.uid}/friendRequests/outgoing`).once('value')
        ]);

        currentFriends = Object.entries(friendsSnapshot.val() || {});
        pendingRequests.incoming = Object.entries(incomingSnapshot.val() || {});
        pendingRequests.outgoing = Object.entries(outgoingSnapshot.val() || {});

        renderFriendsList();
        renderFriendRequests();
        updateFriendsBadge();
        updateFriendsCount();
    } catch (error) {
        console.error('Error loading friends:', error);
    }
}

function renderFriendsList() {
    const container = document.getElementById('friendsList');
    if (!container) return;

    if (currentFriends.length === 0) {
        container.innerHTML = '<div class="empty-state">No friends yet. Share your friend code!</div>';
        return;
    }

    container.innerHTML = '';
    currentFriends.forEach(([uid, friend]) => {
        const item = document.createElement('div');
        item.className = 'friend-item';
        item.innerHTML = `
            <img src="${escapeHTML(friend.photoURL || 'https://via.placeholder.com/40')}" class="friend-avatar" alt="">
            <div class="friend-info">
                <div class="friend-name">${escapeHTML(friend.nickname || 'Unknown Hunter')}</div>
                <div class="friend-since">Friends since ${formatDate(friend.since)}</div>
            </div>
            <button class="btn-friend-view" type="button">View Stats</button>
            <button class="btn-friend-remove" type="button">Remove</button>
        `;
        item.querySelector('.btn-friend-view').addEventListener('click', () => viewFriendStats(uid, friend.nickname || 'Unknown Hunter'));
        item.querySelector('.btn-friend-remove').addEventListener('click', () => removeFriend(uid, friend.nickname || 'Unknown Hunter'));
        container.appendChild(item);
    });
}

function renderFriendRequests() {
    const container = document.getElementById('friendRequestsList');
    if (!container) return;

    if (pendingRequests.incoming.length === 0 && pendingRequests.outgoing.length === 0) {
        container.innerHTML = '<div class="empty-state">No pending requests</div>';
        return;
    }

    container.innerHTML = '';

    pendingRequests.incoming.forEach(([uid, request]) => {
        const item = document.createElement('div');
        item.className = 'request-item';
        item.innerHTML = `
            <img src="${escapeHTML(request.fromPhotoURL || 'https://via.placeholder.com/40')}" class="request-avatar" alt="">
            <div class="request-info">
                <div class="request-name">${escapeHTML(request.fromNickname || 'Unknown Hunter')}</div>
                <div class="request-time">${formatTimeAgo(request.timestamp)}</div>
            </div>
            <button class="btn-request-accept" type="button">✓</button>
            <button class="btn-request-decline" type="button">✗</button>
        `;
        item.querySelector('.btn-request-accept').addEventListener('click', () => acceptFriendRequest(uid));
        item.querySelector('.btn-request-decline').addEventListener('click', () => declineFriendRequest(uid));
        container.appendChild(item);
    });

    pendingRequests.outgoing.forEach(([uid, request]) => {
        const item = document.createElement('div');
        item.className = 'request-item outgoing';
        item.innerHTML = `
            <div class="request-info">
                <div class="request-name">Request sent to ${escapeHTML(request.toNickname || 'hunter')}</div>
                <div class="request-time">${formatTimeAgo(request.timestamp)}</div>
            </div>
            <button class="btn-request-cancel" type="button">Cancel</button>
        `;
        item.querySelector('.btn-request-cancel').addEventListener('click', () => declineFriendRequest(uid));
        container.appendChild(item);
    });
}

function updateFriendsBadge() {
    const badge = document.getElementById('friendsBadge');
    if (!badge) return;

    const count = pendingRequests.incoming.length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
    badge.classList.add('notification-badge');
}

function updateFriendsCount() {
    const friendsCountEl = document.getElementById('friendsCount');
    const requestsCountEl = document.getElementById('requestsCount');
    if (friendsCountEl) friendsCountEl.textContent = currentFriends.length;
    if (requestsCountEl) requestsCountEl.textContent = pendingRequests.incoming.length + pendingRequests.outgoing.length;
}

function listenToFriendRequests() {
    if (!currentUser || friendListenersBoundFor === currentUser.uid) return;

    if (friendListenersBoundFor) {
        firebase.database().ref(`users/${friendListenersBoundFor}/friendRequests/incoming`).off();
        firebase.database().ref(`users/${friendListenersBoundFor}/friendRequests/outgoing`).off();
        firebase.database().ref(`users/${friendListenersBoundFor}/friends`).off();
        firebase.database().ref(`users/${friendListenersBoundFor}/friendRequestReceived`).off();
        firebase.database().ref(`users/${friendListenersBoundFor}/friendAccepted`).off();
        firebase.database().ref(`users/${friendListenersBoundFor}/friendRequestDeclined`).off();
        firebase.database().ref(`users/${friendListenersBoundFor}/friendRequestCancelled`).off();
        firebase.database().ref(`users/${friendListenersBoundFor}/friendRemoved`).off();
    }

    friendListenersBoundFor = currentUser.uid;
    const uid = currentUser.uid;

    firebase.database().ref(`users/${uid}/friendRequests/incoming`).on('value', loadFriends);
    firebase.database().ref(`users/${uid}/friendRequests/outgoing`).on('value', loadFriends);
    firebase.database().ref(`users/${uid}/friends`).on('value', loadFriends);

    firebase.database().ref(`users/${uid}/friendRequestReceived`).on('child_added', async (snapshot) => {
        const senderUid = snapshot.key;
        const requestData = snapshot.val();
        if (!senderUid || !requestData) return;
        try {
            const updates = {};
            updates[`users/${uid}/friendRequests/incoming/${senderUid}`] = requestData;
            updates[`users/${uid}/friendRequestReceived/${senderUid}`] = null;
            await firebase.database().ref().update(updates);
        } catch (error) {
            console.error('Error processing received friend request:', error);
        }
    });

    firebase.database().ref(`users/${uid}/friendAccepted`).on('child_added', async (snapshot) => {
        const friendUid = snapshot.key;
        const friendData = snapshot.val();
        if (!friendUid || !friendData) return;
        try {
            const updates = {};
            updates[`users/${uid}/friends/${friendUid}`] = {
                nickname: friendData.nickname || 'Unknown Hunter',
                photoURL: friendData.photoURL || '',
                since: friendData.since || Date.now()
            };
            updates[`users/${uid}/friendRequests/outgoing/${friendUid}`] = null;
            updates[`users/${uid}/friendAccepted/${friendUid}`] = null;
            await firebase.database().ref().update(updates);
        } catch (error) {
            console.error('Error processing accepted friend request:', error);
        }
    });

    firebase.database().ref(`users/${uid}/friendRequestDeclined`).on('child_added', async (snapshot) => {
        const friendUid = snapshot.key;
        if (!friendUid) return;
        const updates = {};
        updates[`users/${uid}/friendRequests/outgoing/${friendUid}`] = null;
        updates[`users/${uid}/friendRequestDeclined/${friendUid}`] = null;
        await firebase.database().ref().update(updates);
    });

    firebase.database().ref(`users/${uid}/friendRequestCancelled`).on('child_added', async (snapshot) => {
        const friendUid = snapshot.key;
        if (!friendUid) return;
        const updates = {};
        updates[`users/${uid}/friendRequests/incoming/${friendUid}`] = null;
        updates[`users/${uid}/friendRequestCancelled/${friendUid}`] = null;
        await firebase.database().ref().update(updates);
    });

    firebase.database().ref(`users/${uid}/friendRemoved`).on('child_added', async (snapshot) => {
        const friendUid = snapshot.key;
        if (!friendUid) return;
        const updates = {};
        updates[`users/${uid}/friends/${friendUid}`] = null;
        updates[`users/${uid}/friendRemoved/${friendUid}`] = null;
        await firebase.database().ref().update(updates);
    });
}

// Format date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Initialize when page loads
setTimeout(() => {
    initFriendsSystem();
}, 300);



// View friend stats
async function viewFriendStats(friendUid, friendNickname) {
    try {
        // Load friend's data
        const friendSnapshot = await firebase.database().ref(`users/${friendUid}`).once('value');
        const friendData = friendSnapshot.val();
        
        if (!friendData) {
            alert('Could not load friend data');
            return;
        }
        
        const stats = friendData.stats || { total: 0, wins: 0, losses: 0, xp: 0, level: 1 };
        const winRate = stats.total > 0 ? Math.round((stats.wins / stats.total) * 100) : 0;
        const level = stats.level || 1;
        const xp = stats.xp || 0;
        const levelInfo = getLevelFromXP(xp);
        const xpInLevel = levelInfo.xpInCurrentLevel;
        const xpForNextLevel = levelInfo.xpForNextLevel;
        
        // Update modal content
        document.getElementById('friendStatsNickname').textContent = friendNickname;
        document.getElementById('friendStatsAvatar').src = friendData.photoURL || 'https://via.placeholder.com/80';
        document.getElementById('friendStatLevel').textContent = level;
        document.getElementById('friendStatTotal').textContent = stats.total;
        document.getElementById('friendStatWins').textContent = stats.wins;
        document.getElementById('friendStatLosses').textContent = stats.losses;
        document.getElementById('friendStatWinRate').textContent = winRate + '%';
        document.getElementById('friendStatXP').textContent = xpInLevel + ' / ' + xpForNextLevel + ' XP';
        
        // Open modal
        document.getElementById('friendStatsModal').showModal();
        
    } catch (error) {
        console.error('Error loading friend stats:', error);
        alert('Failed to load friend stats');
    }
}


// ═══════════════════════════════════════════════════════════════
// COMPLETE NEW TOP BAR INTEGRATION
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing new top bar...');
    
    // ============================================================
    // 1. SHARE/GROUP JOURNAL BUTTON
    // ============================================================
    const newShareBtn = document.getElementById('btnShare');
    const oldGroupBtn = document.getElementById('btnGroupJournal');
    
    if (newShareBtn && oldGroupBtn) {
        // Click handler
        newShareBtn.addEventListener('click', function() {
            console.log('Share button clicked');
            oldGroupBtn.click();
        });
        
        // Sync active pulsing state every 500ms
        setInterval(function() {
            if (oldGroupBtn.classList.contains('active')) {
                newShareBtn.classList.add('active');
                newShareBtn.style.animation = 'pulse-cyan 2s infinite';
                newShareBtn.style.background = 'var(--acc-cyan)';
                newShareBtn.style.color = '#000';
                newShareBtn.style.borderColor = 'var(--acc-cyan)';
            } else {
                newShareBtn.classList.remove('active');
                newShareBtn.style.animation = '';
                newShareBtn.style.background = 'var(--bg-card)';
                newShareBtn.style.color = 'var(--text-muted)';
                newShareBtn.style.borderColor = 'var(--border)';
            }
        }, 500);
    }
    
    // ============================================================
    // 2. FRIENDS BUTTON
    // ============================================================
    setTimeout(function() {
        const newFriendsBtn = document.getElementById('btnFriends');
        
        if (newFriendsBtn && typeof openFriendsModal === 'function') {
            // Remove existing listeners
            const cleanBtn = newFriendsBtn.cloneNode(true);
            newFriendsBtn.parentNode.replaceChild(cleanBtn, newFriendsBtn);
            
            // Add click handler
            cleanBtn.addEventListener('click', function() {
                console.log('Friends button clicked');
                openFriendsModal();
            });
            
            // Sync badge
            setInterval(function() {
                const oldBadge = document.querySelector('.header-tools #friendsBadge');
                const newBadge = document.getElementById('friendsBadge');
                if (oldBadge && newBadge) {
                    newBadge.style.display = oldBadge.style.display;
                    newBadge.textContent = oldBadge.textContent;
                }
            }, 1000);
        }
    }, 1000);
    
    // ============================================================
    // 3. AUTHENTICATION SYNC
    // ============================================================
    const newLoginBtn = document.getElementById('btnGoogleLoginNew');
    const oldLoginBtn = document.getElementById('btnGoogleLogin');
    
    if (newLoginBtn && oldLoginBtn) {
        newLoginBtn.addEventListener('click', function() {
            console.log('Login button clicked');
            oldLoginBtn.click();
        });
    }
    
    // Sync auth display
    let lastUserState = null;
    setInterval(function() {
        const oldAuthView = document.getElementById('authView');
        const oldUserView = document.getElementById('userView');
        const newAuthView = document.getElementById('authViewNew');
        const newUserView = document.getElementById('userViewNew');
        
        if (!oldAuthView || !oldUserView || !newAuthView || !newUserView) return;
        
        // Check if user is logged in
        const isLoggedIn = oldUserView.style.display !== 'none';
        
        if (isLoggedIn) {
            // Hide login, show user
            newAuthView.style.display = 'none';
            newUserView.style.display = 'flex';
            
            // Get user data
            const avatar = oldUserView.querySelector('#userAvatar');
            const nickname = oldUserView.querySelector('#userNickname');
            const level = oldUserView.querySelector('#userLevel');
            
            if (avatar && nickname && level) {
                const avatarSrc = avatar.src || avatar.getAttribute('src') || '';
                console.log('📸 Avatar URL:', avatarSrc);
                
                const userState = `${avatarSrc}|${nickname.textContent}|${level.textContent}`;
                
                // Only update if user data changed
                if (userState !== lastUserState) {
                    lastUserState = userState;
                    
                    // Use avatar URL or fallback to generic icon
                    const avatarHTML = avatarSrc && avatarSrc !== '' 
                        ? `<img src="${avatarSrc}" alt="" style="width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--acc-cyan);">`
                        : `<div style="width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--acc-cyan); background: var(--acc-cyan); display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">👤</div>`;
                    
                    newUserView.innerHTML = `
                        <button class="btn-user-new" id="btnUserMenuNew" onclick="openNewUserMenu()" style="background: rgba(6, 182, 212, 0.1); border: 1px solid var(--acc-cyan); padding: 4px 8px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: var(--font-hud); transition: all 0.2s;">
                            ${avatarHTML}
                            <span style="color: var(--text-main); font-weight: 700; font-size: 0.75rem; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${nickname.textContent}</span>
                            <span style="background: var(--acc-cyan); color: #000; padding: 2px 5px; border-radius: 8px; font-size: 0.65rem; font-weight: 900;">Lvl ${level.textContent}</span>
                        </button>
                    `;
                }
            }
        } else {
            // User is logged out
            newAuthView.style.display = 'flex';
            newUserView.style.display = 'none';
            lastUserState = null;
        }
    }, 1000);
    
    // ============================================================
    // 4. NAVIGATION HIGHLIGHTING
    // ============================================================
    function highlightActiveSection() {
        const sections = ['ghosts', 'maps', 'equipment', 'mechanics', 'strategy', 'zeroev', 'updates'];
        
        sections.forEach(sectionId => {
            const section = document.getElementById(`section-${sectionId}`);
            const navBtn = document.querySelector(`button[onclick="showSection('${sectionId}')"]`);
            
            if (section && navBtn) {
                if (section.style.display !== 'none') {
                    navBtn.style.borderColor = 'var(--acc-cyan)';
                    navBtn.style.background = 'rgba(6, 182, 212, 0.1)';
                    navBtn.style.color = '#fff';
                } else {
                    navBtn.style.borderColor = 'transparent';
                    navBtn.style.background = 'transparent';
                    navBtn.style.color = 'var(--text-muted)';
                }
            }
        });
    }
    
    const _origShowSection = showSection;
    window.showSection = function(sectionId) {
        _origShowSection(sectionId);
        highlightActiveSection();
    };
    
    setTimeout(highlightActiveSection, 200);
    
    // ============================================================
    // 5. SIDEBAR POPULATION
    // ============================================================
    const evidenceContainer = document.getElementById('sidebarEvidence');
    if (evidenceContainer) {
        evidenceContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <button onclick="cycleEvidence('emf')" oncontextmenu="ruleOutEvidence('emf', event)" data-ev="emf" class="sidebar-btn">
                    <span style="font-size: 1rem;">📶</span>
                    <span style="font-family: var(--font-hud); font-size: 0.75rem; font-weight: 600; color: var(--text-main); flex: 1;">EMF 5</span>
                </button>
                <button onclick="cycleEvidence('box')" oncontextmenu="ruleOutEvidence('box', event)" data-ev="box" class="sidebar-btn">
                    <span style="font-size: 1rem;">📦</span>
                    <span style="font-family: var(--font-hud); font-size: 0.75rem; font-weight: 600; color: var(--text-main); flex: 1;">BOX</span>
                </button>
                <button onclick="cycleEvidence('uv')" oncontextmenu="ruleOutEvidence('uv', event)" data-ev="uv" class="sidebar-btn">
                    <span style="font-size: 1rem;">💡</span>
                    <span style="font-family: var(--font-hud); font-size: 0.75rem; font-weight: 600; color: var(--text-main); flex: 1;">UV</span>
                </button>
                <button onclick="cycleEvidence('orb')" oncontextmenu="ruleOutEvidence('orb', event)" data-ev="orb" class="sidebar-btn">
                    <span style="font-size: 1rem;">🔮</span>
                    <span style="font-family: var(--font-hud); font-size: 0.75rem; font-weight: 600; color: var(--text-main); flex: 1;">ORBS</span>
                </button>
                <button onclick="cycleEvidence('writing')" oncontextmenu="ruleOutEvidence('writing', event)" data-ev="writing" class="sidebar-btn">
                    <span style="font-size: 1rem;">✍️</span>
                    <span style="font-family: var(--font-hud); font-size: 0.75rem; font-weight: 600; color: var(--text-main); flex: 1;">WRITING</span>
                </button>
                <button onclick="cycleEvidence('freezing')" oncontextmenu="ruleOutEvidence('freezing', event)" data-ev="freezing" class="sidebar-btn">
                    <span style="font-size: 1rem;">❄️</span>
                    <span style="font-family: var(--font-hud); font-size: 0.75rem; font-weight: 600; color: var(--text-main); flex: 1;">FREEZE</span>
                </button>
                <button onclick="cycleEvidence('dots')" oncontextmenu="ruleOutEvidence('dots', event)" data-ev="dots" class="sidebar-btn">
                    <span style="font-size: 1rem;">🎯</span>
                    <span style="font-family: var(--font-hud); font-size: 0.75rem; font-weight: 600; color: var(--text-main); flex: 1;">D.O.T.S</span>
                </button>
            </div>
        `;
    }
    
    const filtersContainer = document.getElementById('sidebarFilters');
    if (filtersContainer) {
        filtersContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 6px;">
                <button onclick="toggleFilter('fast')" data-filter="fast" class="sidebar-btn">
                    <span style="font-size: 1rem;">⚡</span>
                    <span style="font-family: var(--font-hud); font-size: 0.75rem; font-weight: 600; color: var(--text-main);">Speed Change</span>
                </button>
                <button onclick="toggleFilter('early')" data-filter="early" class="sidebar-btn">
                    <span style="font-size: 1rem;">⚠️</span>
                    <span style="font-family: var(--font-hud); font-size: 0.75rem; font-weight: 600; color: var(--text-main);">Early Hunter</span>
                </button>
                <button onclick="toggleFilter('quiet')" data-filter="quiet" class="sidebar-btn">
                    <span style="font-size: 1rem;">🟡</span>
                    <span style="font-family: var(--font-hud); font-size: 0.75rem; font-weight: 600; color: var(--text-main);">Quiet Steps</span>
                </button>
                <button onclick="toggleFilter('guarantee')" data-filter="guarantee" class="sidebar-btn">
                    <span style="font-size: 1rem;">✨</span>
                    <span style="font-family: var(--font-hud); font-size: 0.75rem; font-weight: 600; color: var(--text-main);">Guaranteed Ev</span>
                </button>
            </div>
        `;
    }
    
    // Hook submit button
    const btnSubmit = document.getElementById('btnSubmitSidebar');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', openGuessModal);
    }
    
    // Timer sync
    setInterval(function() {
        const sidebarInv = document.getElementById('sidebarInvestigation');
        const timerEl = document.getElementById('sidebarTimer');
        
        if (!currentInvestigation) {
            if (sidebarInv) sidebarInv.style.display = 'none';
            return;
        }
        
        if (sidebarInv) sidebarInv.style.display = 'block';
        
        const elapsed = Math.floor((Date.now() - currentInvestigation.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        if (timerEl) {
            timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
    
    setTimeout(syncSidebar, 100);
});


// ═══════════════════════════════════════════════════════════════
// GAME UPDATE LOG DATA
// Add new game updates here. Newest update should be first.
// Only the newest update needs open: true.
// ═══════════════════════════════════════════════════════════════
const GAME_UPDATES = [
    {
    version: "v0.18.0.0 - Major Update",
    title: "13 Willow Street Rework & Quality of Life #1",
    logAdded: "25 July 2026",
    gameRelease: "21 July 2026",
    open: true,
    sections: [
        {
            heading: "New",
            items: [
                "13 Willow Street Rework: full visual overhaul. The original layout remains, but rooms have been repurposed (second bedroom is now an art studio, the garage a gym, and the basement an open-plan den) and the flow of several rooms edited.",
                "New ghost: The Deildegast. Starts every hunt at 3.0 m/s and is slowed by players moving unique items between hunts. (Site note: full verified data is on the ghost card.)",
                "Artist's Retreat challenge: complete 50 contracts at 13 Willow Street, correctly identifying the ghost and surviving, to earn the Sun Seeker ID Card and Badge.",
                "Equipment keybinds: PC players can now switch Equipment with the 1, 2, 3 and 4 keys (rebindable)."
            ]
        },
        {
            heading: "Changes",
            items: [
                "All seven Cursed Possession spawn locations on 13 Willow Street have moved.",
                "The truck map screen for 13 Willow Street has been redrawn in full colour with room details.",
                "Quality of Life pass #1: faster speed-of-play (first-person hand animations removed, 'Use' animations cancellable) and photo evidence now prioritises unique captures over duplicates."
            ]
        }
      ]
    },
    {
    version: "Hotfix v0.17.1.5",
    title: "Voice Recognition Hotfix",
    logAdded: "03 June 2026",
    gameRelease: "03 June 2026",
    open: false,
    sections: [
        {
            heading: "Fixes",
            items: [
                "Fixed an issue that caused players to become softlocked when using the Spirit Box while using a controller.",
                "Fixed an issue for Steam players that caused Voice Recognition to not work."
            ]
        },
        {
            heading: "Important Information",
            items: [
                "If you are encountering issues with Voice Recognition on the 'Voice' setting on PC, please ensure that the default microphone assigned on your PC is the microphone specified in your Windows settings."
            ]
        }
      ]
    },
    {
    version: "v0.17.1.4 - Patch",
    title: "VR Belt Update",
    logAdded: "02 June 2026",
    gameRelease: "02 June 2026",
    open: false,
    sections: [
        {
            heading: "New",
            items: [
                "The VR belt has been reimplemented following player feedback.",
                "Players can now switch between having their Journal and Walkie Talkie on the belt or their shoulder.",
                "The VR belt will only be visible locally. Other players will see equipment attached to the VR player's body."
            ]
        },
        {
            heading: "Changes",
            items: [
                "The line of sight ghost speed accelerations implemented in the Player Character Update have been reverted to their original state."
            ]
        },
        {
            heading: "Fixes",
            items: [
                "Fixed an issue that caused players to become softlocked when using the Spirit Box before interacting with the Truck's CCTV.",
                "Fixed an issue that allowed the Kormos to kill players through floors.",
                "Fixed an issue that allowed the Kormos to kill players outside.",
                "Fixed an issue that caused the Tier 3 Firelight to not work correctly if placed while lit.",
                "Fixed an issue where player jackets would appear incorrectly when loading into a Multiplayer lobby.",
                "Fixed an issue where pressing 'Join' in Multiplayer without having a code entered would cause issues creating lobbies and remove audio from the game.",
                "Fixed an issue where VR players were unable to use Text Input for the Spirit Box, Monkey Paw and Ouija Board."
            ]
        },
        {
            heading: "Known Issues",
            items: [
                "Players across all platforms are experiencing issues with voice recognition and voice chat. A fix is being investigated."
            ]
        }
      ]
    }, 
    {
        version: "Hotfix v0.17.1.3",
        title: "Phasmophobia - Hotfix v0.17.1.3",
        logAdded: "19 May 2026",
        gameRelease: "19 May 2026",
        open: false,
        sections: [
            {
                heading: "Fixes",
                items: [
                    "Fixed an issue that was causing a crash for players loading in to event maps."
                ]
            }
        ]
    },
    {
        version: "Hotfix v0.17.1.2",
        title: "Phasmophobia - Hotfix v0.17.1.2",
        logAdded: "15 May 2026",
        gameRelease: "15 May 2026",
        open: false,
        sections: [
            {
                heading: "Fixes",
                items: [
                    "Fixed an issue that was causing a crash across all platforms."
                ]
            }
        ]
    },
    {
        version: "Hotfix v0.17.1.1",
        title: "Phasmophobia - Hotfix v0.17.1.1",
        logAdded: "13 May 2026",
        gameRelease: "13 May 2026",
        open: false,
        sections: [
            {
                heading: "Fixes",
                items: [
                    "Fixed an issue that caused held equipment/items to visually stutter when moving.",
                    "Fixed several issues that could lead to game crashes.",
                    "Fixed an issue that caused the Kormos to detect dead players and attempt to kill them.",
                    "Fixed an issue where the Kormos could detect sound from dead players.",
                    "Fixed an issue where the Coffee World tent names were incorrect.",
                    "Other fixes and improvements."
                ]
            }
        ]
    },
    {
        version: "v0.17.1.0",
        title: "Player Character Update - Fixes & Changes",
        logAdded: "12 May 2026",
        gameRelease: "12 May 2026",
        open: false,
        sections: [
            {
                heading: "New",
                items: [
                    "Added a 5 second delay after you die to allow you to select a ghost in the journal."
                ]
            },
            {
                heading: "Changes",
                items: [
                    "Salt will now get instantly placed at the start of the animation instead of the end.",
                    "Most equipment hold poses have been changed to fix several visual issues including wrists, elbows, arms and the equipment's position on the screen.",
                    "The T3 Sanity Medication animation will no longer play in Multiplayer.",
                    "The Tier 1 Igniter is now open so you can see how many matches are left.",
                    "Removed the inventory swapping animation to allow for instant swapping of held equipment.",
                    "Prestige cosmetics are now free after they are unlocked based on your Prestige level."
                ]
            },
            {
                heading: "Character Model Fixes",
                items: [
                    "Fixed an issue that caused the heads of character models to look incorrect when the player looks up and down.",
                    "Fixed an issue that caused problems with the character rig upon being revived while crouched.",
                    "Fixed an issue that caused character models to fall down incorrectly upon death.",
                    "Fixed an issue that caused Non-VR player character's feet to clip below the ground when standing still.",
                    "The player characters feet will no longer float in some areas.",
                    "Fixed the characters walking animation when below 50% player speed.",
                    "Fixed an issue that caused character model mouths to be open when the player moves to the right."
                ]
            },
            {
                heading: "Ghost Fixes",
                items: [
                    "Fixed an issue that prevented the Yurei from fully closing doors.",
                    "Fixed an issue that caused the Raiju to flicker lights outside of Hunts.",
                    "Fixed an issue on 42 Edgefield Road that caused the Ghost to get stuck in multiple rooms and not be able to reach players in the garage lockers.",
                    "Fixed an issue where Ghosts in the Grafton Farmhouse Attic would wander too often outside their room."
                ]
            },
            {
                heading: "Environment Fixes",
                items: [
                    "Fixed an issue that caused doors to move incorrectly when holding the Tarot Cards.",
                    "Fixed an issue that caused doors to be blocked by other players.",
                    "Fixed an issue that prevented some doors on Bleasdale Farmhouse from opening correctly.",
                    "Fixed an issue that caused doors to become detached from their hinges.",
                    "Fixed an issue that caused Sunny Meadows Restricted to load into the full Sunny Meadows location.",
                    "Fixed an issue that caused two boomboxes to be displayed in the lobby.",
                    "Fixed several issues that caused inconsistencies with the animations when grabbing objects."
                ]
            },
            {
                heading: "Equipment Fixes",
                items: [
                    "Fixed an issue that caused held equipment to stutter when turning.",
                    "Fixed an issue that caused Head Gear to be misaligned while crouching.",
                    "Fixed an issue that prevented players from being seen on the CCTV through Tier 1 Head Gear.",
                    "Fixed an issue that caused the Tier 1 Firelight being blown out to be heard throughout the map.",
                    "Fixed an issue that caused the Tier 2 Photo Camera audio to play when using other equipment.",
                    "Fixed several issues that prevented the Tier 2 and 3 Firelight from working correctly.",
                    "Fixed an issue that caused the CCTV screen to be displayed on a Video Camera when first grabbed.",
                    "Fixed an issue that caused usability issues with the Head Gear after toggling night vision on/off on a Video Camera.",
                    "Fixed an issue related to the above that caused the Tripod to become invisible.",
                    "Fixed an issue that caused the Ouija Board planchette to float.",
                    "Fixed an issue that caused the watch's timer to desync upon death and revival.",
                    "Fixed an issue that caused the Ouija Board and Haunted Mirror to drop on their sides.",
                    "Fixed an issue that caused the wrong Tarot Card to be seen by other players when drawn by the player using them.",
                    "Fixed several visual issues when grabbing an Igniter while holding a Flashlight.",
                    "Fixed an issue that caused Flashlights to become invisible when being dropped to pick up another item.",
                    "Fixed an issue that caused the Flashlight to appear when holding the Journal and pressing using the Flashlight.",
                    "Fixed an issue that caused Spirit Box responses to be heard incorrectly.",
                    "Fixed an issue that caused a still image to be displayed on the Tier 3 Video Camera when leaving the Van.",
                    "Fixed an issue that caused the wrong exterior doors to lock on Bleasdale Farmhouse."
                ]
            },
            {
                heading: "VR Fixes",
                items: [
                    "Fixed an issue that prevented VR players from opening the upstairs hallway left side closet door.",
                    "Fixed an issue where VR Players had to grab objects twice to pick them up.",
                    "Fixed an issue that caused Head Gear to disappear from the player's hands when grabbed.",
                    "Fixed an issue that caused a VR player's screen to spin when dying or reviving if immersive animations are enabled.",
                    "Fixed an issue where the audio of a VR player dying could be heard across the map.",
                    "Fixed an issue that caused objects to appear incorrect in a player's hand.",
                    "Fixed an issue that caused items dropped by a VR player after they die to not appear for other players."
                ]
            },
            {
                heading: "Other Fixes",
                items: [
                    "Fixed an issue that prevented Voice Chat from working when the player was Dead.",
                    "Fixed an issue that would cause the Journal to remain in the player's hand while Dead, if it was opened while dying.",
                    "Fixed an issue that caused misaligned text with photo names in the Journal.",
                    "Fixed an issue that caused the light from a Dead player's Journal from being visible to players that are alive.",
                    "Fixed an issue with the Journal that made it difficult to navigate between pages and tabs.",
                    "Fixed an issue that prevented the Welcome Back audio from playing.",
                    "Fixed an issue that prevented the Doors Starting Open custom difficulty setting from working correctly.",
                    "Fixed an issue that caused players to hear Dead players opening and closing their Journals.",
                    "Fixed an issue that caused a soft lock if Alt + Tab was used during the death animation.",
                    "Fixed an issue that prevented the Legacy Badge menu options from being selected.",
                    "Fixed an issue that caused the journal objectives tick colour to be incorrect.",
                    "Fixed an issue that caused door sounds to play when not moving and be heard across the map.",
                    "Fixed an issue that caused the ID Card foil animation to not render correctly."
                ]
            },
            {
                heading: "Developer Roadmap Notes",
                text: [
                    "The developers noted that the update contains more than these fixes and changes, but wanted to share what has been worked on while feedback has been coming in.",
                    "They have reviewed the roadmap and plan to release a second Player Character Update with additional content and changes."
                ],
                items: [
                    "Additional cosmetic options to allow you to further personalize your characters.",
                    "Improved character animations, aimed at quality and speeding up the gameplay.",
                    "Adding the legacy badge customisation to the shop customisation screen.",
                    "Improving equipment usability and speed.",
                    "Various quality of life improvements to the player character and overall gameplay.",
                    "Many other new features, fixes and improvements."
                ]
            }
        ]
    },
    {
        version: "v0.17.1.0",
        title: "Phasmophobia by Alan Wake",
        logAdded: "12 May 2026",
        gameRelease: "12 May 2026",
        open: false,
        sections: [
            {
                heading: "Summary",
                items: [
                    "Alan Wake themed event/update released.",
                    "Ghost fixes included Yurei door closing, Raiju light flicker behaviour, and several room/pathing fixes.",
                    "Equipment fixes included Firelight, Head Gear, Video Camera, Flashlight, Tripod, Igniter, and Spirit Box related issues.",
                    "Kormos and Aswang added as surprise new ghosts. (Site note: their data has since been verified against wiki datamines — see the ghost cards.)"
                ]
            }
        ]
    }
];

function escapeUpdateHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Live updates loaded from updates.json (kept fresh by the GitHub Action in
// .github/workflows/fetch-updates.yml). Falls back to the built-in
// GAME_UPDATES array when the fetch fails (e.g. opening index.html from disk).
let GAME_UPDATES_LIVE = null;

async function loadGameUpdates() {
    try {
        const res = await fetch("updates.json", { cache: "no-store" });
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.updates) && data.updates.length) {
                GAME_UPDATES_LIVE = data.updates;
            }
        }
    } catch (err) {
        // Offline / file:// usage — the baked-in GAME_UPDATES covers us.
    }
    renderGameUpdates();
}

function renderGameUpdates() {
    const container = document.getElementById("updatesList");
    if (!container) return;

    container.innerHTML = "";

    (GAME_UPDATES_LIVE || GAME_UPDATES).forEach((update, index) => {
        const card = document.createElement("details");
        card.className = "update-card";
        card.open = update.open === true || index === 0;

        const sectionsHtml = (update.sections || []).map(section => {
            const paragraphsHtml = (section.text || [])
                .map(paragraph => `<p>${escapeUpdateHtml(paragraph)}</p>`)
                .join("");
            const itemsHtml = (section.items || [])
                .map(item => `<li>${escapeUpdateHtml(item)}</li>`)
                .join("");

            return `
                <div class="update-section-block">
                    <h4>${escapeUpdateHtml(section.heading)}</h4>
                    ${paragraphsHtml}
                    ${itemsHtml ? `<ul>${itemsHtml}</ul>` : ""}
                </div>
            `;
        }).join("");

        card.innerHTML = `
            <summary>
                <div class="update-summary-main">
                    <span class="update-version">${escapeUpdateHtml(update.version)}</span>
                    <span class="update-title">${escapeUpdateHtml(update.title)}</span>
                </div>
                <div class="update-date-stack">
                    <span><strong>Log Added:</strong> ${escapeUpdateHtml(update.logAdded)}</span>
                    <span><strong>Game Release:</strong> ${escapeUpdateHtml(update.gameRelease)}</span>
                </div>
            </summary>
            <div class="update-body">
                ${sectionsHtml}
                ${update.url ? `<p class="update-source-link"><a href="${escapeUpdateHtml(update.url)}" target="_blank" rel="noopener noreferrer">View full notes on Steam ↗</a></p>` : ""}
            </div>
        `;

        container.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", loadGameUpdates);

// ============================================================
// SIDEBAR SYNC FUNCTION
// ============================================================
function syncSidebar() {
    const matches = [];
    const possibleEv = new Set();
    
    GHOSTS.forEach(g => {
        let possible = true;
        for(const [id, val] of Object.entries(app.evidence)) {
            if(val === 0) continue;
            const has = g.ev.includes(id) || (g.name === 'The Mimic' && id === 'orb');
            if(val === 1 && !has) possible = false;
            if(val === 2 && has) possible = false;
        }
        if(possible && app.activeFilters.size > 0) {
            app.activeFilters.forEach(fid => {
                if(!g.tags.includes(fid)) possible = false;
            });
        }
        
        if(possible) {
            matches.push(g);
            g.ev.forEach(e => possibleEv.add(e));
            if(g.name === 'The Mimic') possibleEv.add('orb');
        }
    });
    
    Object.keys(app.evidence).forEach(evId => {
        const btn = document.querySelector(`#sidebarEvidence button[data-ev="${evId}"]`);
        if (btn) {
            btn.style.borderColor = 'var(--border)';
            btn.style.background = 'var(--bg-card)';
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
            
            if (app.evidence[evId] === 1) {
                btn.style.borderColor = 'var(--acc-green)';
                btn.style.background = 'rgba(16, 185, 129, 0.1)';
            } else if (app.evidence[evId] === 2) {
                btn.style.borderColor = 'var(--acc-red)';
                btn.style.background = 'rgba(239, 68, 68, 0.1)';
                btn.style.opacity = '0.6';
            } else if (app.evidence[evId] === 0 && matches.length < GHOSTS.length && !possibleEv.has(evId)) {
                btn.style.opacity = '0.3';
                btn.style.pointerEvents = 'none';
            }
        }
    });
    
    document.querySelectorAll('#sidebarFilters button').forEach(btn => {
        const filterId = btn.dataset.filter;
        btn.style.borderColor = 'var(--border)';
        btn.style.background = 'var(--bg-card)';
        
        if (app.activeFilters.has(filterId)) {
            btn.style.borderColor = 'var(--acc-purple)';
            btn.style.background = 'rgba(139, 92, 246, 0.1)';
        }
    });
    
    const sidebarCount = document.getElementById('sidebarCount');
    const mainCount = document.getElementById('matchCount');
    if (sidebarCount && mainCount) {
        sidebarCount.textContent = mainCount.textContent;
    }
}

// ============================================================
// EVIDENCE FUNCTIONS
// ============================================================
function cycleEvidence(evId) {
    if (app.evidence[evId] === 0) {
        app.evidence[evId] = 1;
    } else {
        app.evidence[evId] = 0;
    }
    renderEvidence();
    updateBoard();
}

function ruleOutEvidence(evId, event) {
    event.preventDefault();
    if (app.evidence[evId] === 0) {
        app.evidence[evId] = 2;
    } else {
        app.evidence[evId] = 0;
    }
    renderEvidence();
    updateBoard();
}

// ============================================================
// FILTER FUNCTION
// ============================================================
function toggleFilter(filterId) {
    if (app.activeFilters.has(filterId)) {
        app.activeFilters.delete(filterId);
    } else {
        app.activeFilters.add(filterId);
    }
    renderFilters();
    updateBoard();
}

// ============================================================
// HOOK INTO UPDATEBOARD
// ============================================================
const _origUpdateBoard = updateBoard;
updateBoard = function() {
    _origUpdateBoard();
    
    // Highlight final ghost
    const matches = document.querySelectorAll('.card');
    if (matches.length === 1) {
        matches[0].style.border = '2px solid var(--acc-green)';
        matches[0].style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
        matches[0].style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, var(--bg-card) 100%)';
    }
    
    syncSidebar();
};

// Add sidebar button styling
const sidebarCSS = document.createElement('style');
sidebarCSS.textContent = `
    .sidebar-btn {
        background: var(--bg-card);
        border: 1px solid var(--border);
        padding: 8px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        transition: 0.2s;
    }
    .sidebar-btn:hover {
        border-color: var(--acc-cyan);
        background: rgba(6, 182, 212, 0.05);
    }
`;
document.head.appendChild(sidebarCSS);


// ============================================================
// GLOBAL USER MENU FUNCTION
// ============================================================
window.openNewUserMenu = function() {
    console.log('🔵 New user menu button clicked!');
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        console.log('🔵 Toggling dropdown, current display:', dropdown.style.display);
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        console.log('🔵 New display:', dropdown.style.display);
    } else {
        console.error('❌ User dropdown not found!');
    }
};



// ═══════════════════════════════════════════════════════════════
// ONLINE HUNTERS COUNTER
// Counts active browser sessions that currently have the site open.
// ═══════════════════════════════════════════════════════════════
let onlineHunterId = null;
let onlineHunterHeartbeat = null;
let onlineHuntersCleanupInterval = null;

function initOnlineHuntersCounter() {
    const countEl = document.getElementById("onlineHuntersCount");
    if (!countEl) return;

    if (typeof firebase === "undefined" || !firebase.database) {
        console.warn("Firebase not available. Online Hunters counter disabled.");
        return;
    }

    try {
        onlineHunterId = getOrCreateOnlineHunterId();
        const hunterRef = firebase.database().ref(`onlineHunters/${onlineHunterId}`);

        hunterRef.set({
            lastSeen: Date.now(),
            page: window.location.pathname || "/"
        }).catch((error) => {
            console.warn("Online Hunters write failed. Check Firebase rules.", error);
        });

        hunterRef.onDisconnect().remove();

        if (onlineHunterHeartbeat) clearInterval(onlineHunterHeartbeat);
        onlineHunterHeartbeat = setInterval(() => {
            hunterRef.update({
                lastSeen: Date.now(),
                page: window.location.pathname || "/"
            }).catch((error) => {
                console.warn("Online Hunters heartbeat failed.", error);
            });
        }, 10000);

        listenForOnlineHunters();
        cleanupOldOnlineHunters();

        if (onlineHuntersCleanupInterval) clearInterval(onlineHuntersCleanupInterval);
        onlineHuntersCleanupInterval = setInterval(cleanupOldOnlineHunters, 30000);
    } catch (error) {
        console.error("Failed to initialize Online Hunters counter:", error);
    }
}

function getOrCreateOnlineHunterId() {
    const storageKey = "phasmo_online_hunter_id";
    let id = sessionStorage.getItem(storageKey);

    if (!id) {
        id = "hunter_" + Math.random().toString(36).slice(2, 11) + "_" + Date.now();
        sessionStorage.setItem(storageKey, id);
    }

    return id;
}

function listenForOnlineHunters() {
    const onlineRef = firebase.database().ref("onlineHunters");

    onlineRef.on("value", (snapshot) => {
        const data = snapshot.val() || {};
        const now = Date.now();

        const activeHunters = Object.values(data).filter((hunter) => {
            return hunter && hunter.lastSeen && now - hunter.lastSeen < 30000;
        });

        const countEl = document.getElementById("onlineHuntersCount");
        if (countEl) countEl.textContent = activeHunters.length;
    }, (error) => {
        console.warn("Online Hunters listener failed. Check Firebase rules.", error);
    });
}

function cleanupOldOnlineHunters() {
    if (typeof firebase === "undefined" || !firebase.database) return;

    const onlineRef = firebase.database().ref("onlineHunters");
    const cutoff = Date.now() - 60000;

    onlineRef.once("value", (snapshot) => {
        const updates = {};

        snapshot.forEach((child) => {
            const data = child.val();
            if (!data || !data.lastSeen || data.lastSeen < cutoff) {
                updates[child.key] = null;
            }
        });

        if (Object.keys(updates).length > 0) {
            onlineRef.update(updates).catch((error) => {
                console.warn("Could not clean old online hunters:", error);
            });
        }
    }).catch((error) => {
        console.warn("Could not read online hunters for cleanup:", error);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initOnlineHuntersCounter);
} else {
    initOnlineHuntersCounter();
}


/* Event Popup Config */
const EVENT_POPUP = {
    enabled: false,
    title: "Double XP",
    message: "The Double XP event will be live between 22nd - 25th May 2026.",
    showOncePerSession: false
};

function initEventPopup() {
    if (!EVENT_POPUP.enabled) return;

    const overlay = document.getElementById("event-popup-overlay");
    const title = document.getElementById("event-popup-title");
    const message = document.getElementById("event-popup-message");
    const closeBtn = document.getElementById("close-event-popup");

    if (!overlay || !title || !message || !closeBtn) return;

    if (
        EVENT_POPUP.showOncePerSession &&
        sessionStorage.getItem("eventPopupDismissed") === "true"
    ) {
        return;
    }

    title.textContent = EVENT_POPUP.title;
    message.textContent = EVENT_POPUP.message;

    setTimeout(() => {
        overlay.classList.remove("hidden");
    }, 3000);

    function closePopup() {
        overlay.classList.add("hidden");

        if (EVENT_POPUP.showOncePerSession) {
            sessionStorage.setItem("eventPopupDismissed", "true");
        }
    }

    closeBtn.addEventListener("click", closePopup);

    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            closePopup();
        }
    });
}


window.addEventListener("load", () => {
    const loadingScreen =
        document.querySelector(".loading-screen") ||
        document.querySelector("#loading-screen") ||
        document.querySelector(".loader") ||
        document.querySelector("#loader");

    if (!loadingScreen) {
        setTimeout(initEventPopup, 1200);
        return;
    }

    const waitForLoader = setInterval(() => {
        const hidden =
            loadingScreen.classList.contains("hidden") ||
            loadingScreen.style.display === "none" ||
            loadingScreen.style.opacity === "0";

        if (hidden) {
            clearInterval(waitForLoader);

            setTimeout(() => {
                initEventPopup();
            }, 700);
        }
    }, 300);
});



// ======================================================
// INVESTIGATION MODE OVERRIDE
// ======================================================

function openGuessModal() {

    if (!currentInvestigation) return;

    const modal = document.getElementById('guessModal');
    const container = document.getElementById('ghostOptions');

    container.innerHTML = '';

    const userSelect = document.createElement('select');

    userSelect.id = 'playerGhostGuess';

    userSelect.style.width = '100%';
    userSelect.style.marginBottom = '16px';

    const actualSelect = document.createElement('select');

    actualSelect.id = 'actualGhostSelect';

    actualSelect.style.width = '100%';
    actualSelect.style.marginBottom = '16px';

    GHOSTS.forEach(ghost => {

        const option1 = document.createElement('option');
        option1.value = ghost.name;
        option1.textContent = ghost.name;

        const option2 = document.createElement('option');
        option2.value = ghost.name;
        option2.textContent = ghost.name;

        userSelect.appendChild(option1);
        actualSelect.appendChild(option2);

    });

    const completeBtn = document.createElement('button');

    completeBtn.className = 'btn-primary';
    completeBtn.style.width = '100%';
    completeBtn.textContent = 'Complete Investigation';

    completeBtn.addEventListener('click', () => {

        const guess = userSelect.value;
        const actual = actualSelect.value;

        let xp = 50;

        switch(currentInvestigation.mode){

            case '2':
                xp = 100;
                break;

            case '1':
                xp = 150;
                break;

            case '0':
                xp = 250;
                break;

        }

        const correct = guess === actual;

        saveInvestigationResult(
            correct,
            actual,
            xp
        );

        modal.close();

    });

    container.innerHTML = `
        <p style="margin-bottom:12px;">
            Select the ghost you thought it was, then the actual ghost afterwards.
        </p>
    `;

    container.appendChild(userSelect);
    container.appendChild(actualSelect);
    container.appendChild(completeBtn);

    modal.showModal();

}



// ======================================================
// SAFE INVESTIGATION RESULT HANDLER
// ======================================================



async function saveInvestigationResult(correct, actualGhost, xp){

    try{

        if(!currentUser){

            alert("You must be logged in.");

            return;

        }

        // LOAD EXISTING FIREBASE STATS

        const statsRef =
            firebase.database().ref(
                `users/${currentUser.uid}/stats`
            );

        const snapshot =
            await statsRef.once('value');

        const stats =
            snapshot.val() || {
                total: 0,
                wins: 0,
                losses: 0,
                xp: 0,
                level: 1,
                recentInvestigations: []
            };

        // UPDATE STATS

        stats.total =
            Number(stats.total || 0) + 1;

        if(correct){

            stats.wins =
                Number(stats.wins || 0) + 1;

            stats.xp =
                Number(stats.xp || 0) + xp;

        }else{

            stats.losses =
                Number(stats.losses || 0) + 1;

        }

        // RECALCULATE LEVEL USING EXISTING SYSTEM

        const levelInfo =
            getLevelFromXP(
                Number(stats.xp || 0)
            );

        stats.level =
            levelInfo.level;

        // RECENT INVESTIGATION

        if(!Array.isArray(stats.recentInvestigations)){

            stats.recentInvestigations = [];

        }

        stats.recentInvestigations.unshift({

    actualGhost: actualGhost,

    correct: correct,

    xpGained: correct ? xp : 0,

    possibleGhosts:
        currentInvestigation?.possibleGhosts || [],

    mode:
        currentInvestigation?.mode || "all",

    timestamp: Date.now()

});

        if(stats.recentInvestigations.length > 10){

            stats.recentInvestigations.length = 10;

        }

        // SAVE BACK TO FIREBASE

        await statsRef.set(stats);

        // SAVE TO HISTORY PANEL

        await firebase.database()
            .ref(`users/${currentUser.uid}/history`)
            .push({

                actualGhost: actualGhost,

                possibleGhosts:
                    currentInvestigation?.possibleGhosts || [],

                correct: correct,

                xpGained:
                    correct ? xp : 0,

                timestamp: Date.now()

            });

        // UPDATE UI

        loadUserStatsDisplay();

        alert(
            correct
            ? `Correct! +${xp} XP`
            : `Incorrect! The ghost was ${actualGhost}`
        );

        endInvestigation();

    }catch(error){

        console.error(
            "Failed to save investigation:",
            error
        );

        alert(
            "Failed to save investigation."
        );

    }

}



