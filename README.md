# Sacramento Kings Offensive Stats Dashboard

An interactive basketball analytics dashboard for exploring the Sacramento Kings' offensive shot data. Built with React 19, TypeScript, Tailwind CSS v4, and Vite.

---

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. No backend required — all data is processed client-side from a bundled CSV.

**Other scripts**

| `npm run test` | Run Vitest once (`shotsAnalysis`, `mathUtils`) |
| `npm run lint` | ESLint |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the production build locally |

---

## Tech Stack

| Framework | React 19 |
| Language | TypeScript 6 |
| Styling | Tailwind CSS v4 |
| Build | Vite 8 |
| CSV Parsing | PapaParse 5 |
| State | React Context + useMemo |
| Tests | Vitest |

---

## Features

### Team & Player Statistics

The top section displays a full statistical breakdown for either the team or a selected player. Stats are grouped into sections: Overview, Shot Zones (2PT / 3PT / Paint), Situational (catch-and-shoot, late shot clock, late game clock), Contest Level, and Shot Type.

Each stat card expands on hover to reveal secondary metrics like assist rate, foul rate, and block rate.

A purple gradient bar at the bottom of the card shows the frequency of that statistic relative to its category.

Statistics in the Shot Zones section were not included in the raw data so they were calculated based on the shot position data given.

### Interactive Court Heat Map

A 10×10 grid overlaid on a half-court image. Each cell represents a 5×5 ft zone. The heat map has two visualization modes:

- **FG%** - cell color indicates field goal percentage using a purple scale. Opacity indicates shot volume relative to the highest-volume zone.
- **+/−** - only available when a player is selected. Cell color encodes how the player's FG% in that zone compares to the whole team's average in the same zone. Blue = below team average, red = above team average.

### Zone Detail Panel

When a zone cell is selected, the right panel switches from general detailed stats to those related to the selected zone. The detailed stats section includes the complex shot categories and a dribble-count distribution graph. Shot categories are ordered by FG% and those with 0 attempts are not shown.

### Player Selection

The player list sidebar sorts all players by total shot attempts. Selecting a player switches the overview, heat map, and zone detail panel to that player's data only. Deselecting a player returns to team view.

---

## Architecture

### Data Pipeline

```
shots.csv
  └─ useShotsData (PapaParse, dynamic typing)
       └─ ShotRowType[]
            └─ DashboardProvider (memoized on mount)
                 ├─ aggregateShots()      → teamStats
                 ├─ buildPlayerStats()   → playerStats (per player)
                 ├─ buildTeamCourtMap()  → teamCourtMap (per zone)
                 └─ buildPlayerCourtMaps() → playerCourtMaps (per player per zone)
                      └─ DashboardContext
                           └─ Components consume via useDashboardContext()
```

All aggregation runs once on load inside `DashboardProvider` and is memoized. Components never compute stats and only read from context.

### Context and Derived State

`DashboardContext` centralizes all data aggregations and Dashboard selection states:

- `selectedPlayerId` and `selectedCellKey` - the two values selected by the user
- `selectedPlayerStats`, `selectedPlayerCourtMap` - derived from the selection
- `activeStats` - prioritized in order: **zone stats → player stats → team stats**. The above state parameters determine the correct data to send to `StatsBox` and down through the other components for rendering.

### Shot Aggregation

`shotsAnalysis.ts` contains the core data processing functions. `aggregateShots(shots[])` accepts any subset of shot rows fed to it and returns fully populated data in the form of type `BasicShootingMetrics`. The same function transforms the team stats, player stats, and zone stats by filtering the input.

Key decisions in data transformation process:

- **Fouled misses are excluded from `success_rate`**. A shot where the shooter was fouled but missed is not a true indicator of shot quality. These possessions result in free throws.
- **`calcRecordRates<K>()`** is a versatile generic function that maps over a fixed key list, filters the shot subset for each value, and computes a record of `ShotRates` values. This prevents repeating filtering and aggregation code for each type (contest level, shot type, complex shot type).
- **`occurrence_rate` is relative to the player context**. A zone's occurrence_rate means "what fraction of this player's total shots came from here," not "what fraction of the team's shots in this zone are this player's."

### Court Coordinates For Deeper Shot Insight

Coordinates were used to infer more meaningful shot insight than was immediately apparent from the provided raw data file. Shot Zone data for 2PT, 3PT, and Paint shote were added to the Dashboard data.
The following the NBA court dimensions were used to achieve this:

- Origin at center court
- Offensive half: x from −47 (left baseline) to 0 (half-court)
- y: −25 (top sideline) to +25 (bottom sideline), positive = downward
- Basket at x = −41.75 (backboard at −43, hoop 1.25 ft in front)
- 3PT: >23.75 ft from basket or corner (|y| ≥ 22)
- Paint: |y| ≤ 8 and x ≤ −28 (19 ft from baseline)

The 5 ft grid cells also map directly onto these coordinates. Each cell key is `"${cellX}_${cellY}"` where cellX and cellY are integers after dividing by cell size and flooring the result.

### Component Structure

```
Dashboard
├── PlayerSelectBox (fixed sidebar)
│   ├── PlayersActive     - selected player indicated and remove player button
│   └── PlayersList       - list sorted by shot volume
└── Main stat content section
    ├── StatsBox (dynamic for boxType of "team" | "player")   - overview stats
    └── CourtBox
        ├── Court grid (100 total CourtGridCells) - shot visualization with view toggle
        └── StatsBox (boxType of "zoneDetails")   - zone/detail panel
```

`StatsBox` handles three modes via a `boxType` prop. In `zoneDetails` mode it reads `activeStats` from context and displays complex shot type and dribble before shot breakdowns rather than the overview layout stats.

### Styling

Tailwind CSS v4 is used throughout with consideration for dark mode support. Tailwind was chosen for rapid development.
The purple color scheme based around `#5a2d81` reflects the Kings brand.
Minimal UI 'Ink' and animations to keep focus on viewing data comfortably.

---

## Tradeoff Considerations

- **React.js vs NEXT.js** - NEXT would likely be a solid choice for a larger application with a backend. This is a frontend only single page site and wouldn't utilize NEXT's SSR and file-system based router. Vite and React were chosen for rapid development with sufficient features.
- **React Context vs State Management Libraries** - Minimal state management was needed relative to more robust applications. Zustand or TanStack Query would be considered in a real world application to keep state management maintainable, scalable, and optimize workflows for APIs and backends.
  Additional note: state could have been split into multiple contexts intead of it all 'living under one roof'
- **Tailwind/CSS Libraries** - Tailwind was used for rapid development and prototyping. I would prefer to use SCSS with modular styling in a larger application and collaborative team environment. Style guide and naming conventions required.
- **Client-side Data Processing** - Parsing larger CSV datasets on load could eventually become expensive and not ideal. A pre-aggregation step to ingest frequently updating CSV game data would be a future consideration. Time to parse in this case has a negligible effect on page start up but could be a concern at scale.

## What I'd Add Next And With More Data

- **Shot filtering** - filter by game date, opponent, clock situations, or score margin to reveal situational trends.
- **Percentile rankings** - show where a player's zone efficiency ranks among the team and league-wide rather than just raw values.
- **Stat visualization diversity** - coalesce related data into meaningful and inventive charts with diverse views. Multiple formats for presenting data is vital.
- **Comparison mode** - compare two players' court maps side-by-side.
- **Archetypes** - create algorithms to assign archetypal info to players for better on the floor combinations.
- **Passing data** - incorporate the unused passing location data to show where the optimal passing situations arise .
- **Multiple player select** - select and place multiple players on the shot chart to find optimal configurations.
- **Play creater/tester** - in addition to multiple player selection, adding functionality to allow for coaches to draw up and optimize plays based on the position of players over the play's lifecycle. Could be used as a brainstorming and ideation tool.
- **Importing data** - import files and dynamically aggregate the data for use in multiple views.

## If I Unlimited Time

- **NBA Championship** - build the best analytics tools that help bring the Kings a championship. Then immediately float into the sky.
