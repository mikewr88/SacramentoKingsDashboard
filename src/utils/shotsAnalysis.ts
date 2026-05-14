import type {
    ShotRowType,
    ShotRates,
    ContestLevel,
    ShotType,
    ComplexShotType,
} from "../types/shotsTypes";
import type { TeamType, CourtZone } from "../types/teamType";
import type { PlayerType } from "../types/playerType";
import { safeDivide } from "./mathUtils";

const CONTEST_LEVELS: ContestLevel[] = [
    "uncontested",
    "lightly_contested",
    "heavily_contested",
];

const SHOT_TYPES: ShotType[] = ["heave", "jumper", "post", "floater", "layup"];

const COMPLEX_SHOT_TYPES: ComplexShotType[] = [
    "heave",
    "catchAndShoot",
    "catchAndShootRelocating",
    "catchAndShootOnMoveLeft",
    "catchAndShootOnMoveRight",
    "pullupJumper",
    "stepback",
    "shakeAndRaise",
    "overScreen",
    "drivingFloater",
    "cutFloater",
    "postLeft",
    "postRight",
    "drivingLayup",
    "cutLayup",
    "standstillLayup",
    "lob",
    "tip",
];

const DEFAULT_CELL_SIZE = 5; // feet

// Origin is midcourt (0,0). Left basket is attacked by offense; most x values negative.
// X axis: -47 (left baseline) to +47 (right baseline)
// Y axis: -25 (top sideline) to +25 (bottom sideline)
const HALF_COURT = 47;

// Backboard is 4ft from baseline; hoop extends 1.25ft in front of backboard
const BASELINE_TO_BACKBOARD = 4;
const BACKBOARD_TO_HOOP = 1.25;
const BASKET_X = -(HALF_COURT - BASELINE_TO_BACKBOARD - BACKBOARD_TO_HOOP); // -41.75

// NBA 3pt arc: 23.75ft from hoop center; corner straight segments at |y| >= 22ft
const THREE_POINT_ARC_DISTANCE = 23.75;
const THREE_POINT_CORNER_Y = 22;

// Paint: 16ft wide (±8ft in y); 19ft deep from baseline (15ft from backboard + 4ft backboard offset)
const PAINT_HALF_WIDTH = 8;
const PAINT_LENGTH = BASELINE_TO_BACKBOARD + 15; // 19ft from baseline to free throw line
const LEFT_BASELINE = -HALF_COURT; // -47

// Late shot clock under 5 seconds remaining on the shot clock
const LATE_SHOT_CLOCK_THRESHOLD = 5;

// Late game clock under 2 minutes
const LATE_GAME_CLOCK_THRESHOLD = 120;

// ─── Court geometry helpers ───────────────────────────────────────────────────

function distanceFromBasket(x: number, y: number): number {
    return Math.sqrt((x - BASKET_X) ** 2 + y ** 2);
}

function is3Point(x: number, y: number): boolean {
    // Corner 3: any shot beyond the sideline edge of the 3pt line
    if (Math.abs(y) >= THREE_POINT_CORNER_Y) return true;
    // Arc: beyond 23.75ft from hoop center
    return distanceFromBasket(x, y) >= THREE_POINT_ARC_DISTANCE;
}

function isPaint(x: number, y: number): boolean {
    return (
        Math.abs(y) <= PAINT_HALF_WIDTH &&
        x >= LEFT_BASELINE &&
        x <= LEFT_BASELINE + PAINT_LENGTH
    );
}

function isLateShotClock(shotClock: number): boolean {
    return shotClock <= LATE_SHOT_CLOCK_THRESHOLD;
}

function isLateGameClock(gameClock: number): boolean {
    return gameClock <= LATE_GAME_CLOCK_THRESHOLD;
}

// Excludes fouled misses — shooter was impeded and sent to the line, not a
// true miss reflecting shot quality
function calcSuccessRate(shots: ShotRowType[]): number {
    const cleanShots = shots.filter((s) => !(s.fouled && !s.outcome));
    return safeDivide(
        cleanShots.filter((s) => s.outcome).length,
        cleanShots.length,
    );
}

function calcSimpleRate(
    shots: ShotRowType[],
    filterFn: (s: ShotRowType) => boolean,
): number {
    return safeDivide(shots.filter(filterFn).length, shots.length);
}

// Computes all ShotRates fields for a subset relative to a total pool
function calcShotRates(subset: ShotRowType[], total: ShotRowType[]): ShotRates {
    return {
        success_rate: calcSuccessRate(subset),
        usage_rate: safeDivide(subset.length, total.length),
        assisted_rate: calcSimpleRate(subset, (s) => s.assisted),
        fouled_rate: calcSimpleRate(subset, (s) => s.fouled),
        blocked_rate: calcSimpleRate(subset, (s) => s.blocked),
    };
}

// Builds a Record of ShotRates for each value in a known key set
function calcRecordRates<K extends string>(
    shots: ShotRowType[],
    getKey: (s: ShotRowType) => K,
    keys: K[],
): Record<K, ShotRates> {
    return Object.fromEntries(
        keys.map((key) => [
            key,
            calcShotRates(
                shots.filter((s) => getKey(s) === key),
                shots,
            ),
        ]),
    ) as Record<K, ShotRates>;
    // as 'Record<K, ShotRates>' to ensure the correct type is returned since fromEntries returns <string, V>
    // the calc function expects Record<K, ShotRates>
}

// Data aggregation for team

export function aggregateShots(shots: ShotRowType[]): TeamType {
    // get all dribble values then add to a set to get unique values. Then sort
    const dribblesValues = shots.map((s) => s.dribbles_before);
    const dribblesKeys = [...new Set(dribblesValues)].sort((a, b) => a - b);

    // each stat field calculated by filtering using correct helpers and properies
    return {
        total_shots: shots.length,
        overall_shooting_average: calcSuccessRate(shots),
        overall_assist_rate: calcSimpleRate(shots, (s) => s.assisted),
        overall_fouled_rate: calcSimpleRate(shots, (s) => s.fouled),
        overall_contested_rate: calcSimpleRate(shots, (s) => s.contested),
        overall_blocked_rate: calcSimpleRate(shots, (s) => s.blocked),
        two_point_rates: calcShotRates(
            shots.filter((s) => !is3Point(s.x, s.y)),
            shots,
        ),
        three_point_rates: calcShotRates(
            shots.filter((s) => is3Point(s.x, s.y)),
            shots,
        ),
        paint_rates: calcShotRates(
            shots.filter((s) => isPaint(s.x, s.y)),
            shots,
        ),
        catch_and_shoot_rates: calcShotRates(
            shots.filter((s) => s.catch_and_shoot),
            shots,
        ),
        late_shot_clock_rates: calcShotRates(
            shots.filter((s) => isLateShotClock(s.shot_clock)),
            shots,
        ),
        late_game_clock_rates: calcShotRates(
            shots.filter((s) => isLateGameClock(s.start_game_clock)),
            shots,
        ),
        contest_level_rates: calcRecordRates(
            shots,
            (s) => s.contest_level,
            CONTEST_LEVELS,
        ),
        shot_type_rates: calcRecordRates(shots, (s) => s.shot_type, SHOT_TYPES),
        complex_shot_type_rates: calcRecordRates(
            shots,
            (s) => s.complex_shot_type,
            COMPLEX_SHOT_TYPES,
        ),
        dribbles_before_rates: Object.fromEntries(
            dribblesKeys.map((k) => [
                k,
                calcShotRates(
                    shots.filter((s) => s.dribbles_before === k),
                    shots,
                ),
            ]),
        ) as Record<number, ShotRates>, // as 'Record<number, ShotRates>' to ensure the correct type is returned since fromEntries returns <string, V>
    };
}

// Data aggregation for court zones

function getCellKey(x: number, y: number, cellSize: number): string {
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    return `${cellX}_${cellY}`;
}

function groupByCell(
    shots: ShotRowType[],
    cellSize: number,
): Map<string, ShotRowType[]> {
    // group shots by cell key. cell key is of the form 'cellX_cellY'
    // cell has a value of an array of shots
    const map = new Map<string, ShotRowType[]>();
    for (const shot of shots) {
        const key = getCellKey(shot.x, shot.y, cellSize); //Ex: '1_2'
        if (!map.has(key)) {
            map.set(key, []);
        }
        map.get(key)!.push(shot);
    }
    return map;
}

// Data aggregation for team court map. returns a record of cell key to court zone Stats
export function buildTeamCourtMap(
    shots: ShotRowType[],
    cellSize = DEFAULT_CELL_SIZE,
): Record<string, CourtZone> {
    const result: Record<string, CourtZone> = {};
    for (const [key, cellShots] of groupByCell(shots, cellSize)) {
        const [cellX, cellY] = key.split("_").map(Number);
        result[key] = {
            ...aggregateShots(cellShots),
            cell_x: cellX,
            cell_y: cellY,
        };
    }
    return result;
}

function groupByPlayer(shots: ShotRowType[]): Map<string, ShotRowType[]> {
    const map = new Map<string, ShotRowType[]>();
    for (const shot of shots) {
        if (!map.has(shot.shooter_id)) map.set(shot.shooter_id, []);
        map.get(shot.shooter_id)!.push(shot);
    }
    return map;
}

// Data aggregation for players. returns a record of player id to player type
export function buildPlayerStats(
    shots: ShotRowType[],
): Record<string, PlayerType> {
    const playerEntries = [...groupByPlayer(shots).entries()];
    const playerStats = playerEntries.map(([id, playerShots]) => {
        const player: PlayerType = {
            player_id: id,
            player_name: playerShots[0].shooter_name,
            ...aggregateShots(playerShots),
        };
        return [id, player] as const;
    });
    return Object.fromEntries(playerStats);
}

// Data aggregation for player court maps. returns a record of player id to court map
export function buildPlayerCourtMaps(
    shots: ShotRowType[],
    cellSize = DEFAULT_CELL_SIZE,
): Record<string, Record<string, CourtZone>> {
    // playerEntries is an array of [player id, shots[]] pairs ex: [['123', [shot1, shot2]], ['456', [shot3]]]
    const playerEntries = [...groupByPlayer(shots).entries()];
    const playerCourtMaps = playerEntries.map(([id, playerShots]) => {
        const courtMap = buildTeamCourtMap(playerShots, cellSize);
        return [id, courtMap] as const; // as const ensures [string, Record<string, CourtZone>]
    });
    // playerCourtMaps is [[player id, court map], ...], converts to { player id: court map, ... }
    return Object.fromEntries(playerCourtMaps);
}
