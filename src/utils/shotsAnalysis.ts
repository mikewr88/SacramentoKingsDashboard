import type { ShotRowType, ShotRates } from "../types/shotsTypes";
import type { BasicShootingMetrics, CourtZone } from "../types/shootingTypes";
import type { PlayerShootingMetrics } from "../types/playerShootingType";
import { safeDivide } from "./mathUtils";
import {
    CELL_SIZE,
    BASKET_X,
    THREE_POINT_ARC_DISTANCE,
    THREE_POINT_CORNER_Y,
    PAINT_HALF_WIDTH,
    PAINT_LENGTH,
    LEFT_BASELINE,
    LATE_SHOT_CLOCK_THRESHOLD,
    LATE_GAME_CLOCK_THRESHOLD,
} from "./constants/courtConstants";

import {
    CONTEST_LEVELS,
    SHOT_TYPES,
    COMPLEX_SHOT_TYPES,
} from "./constants/shotConstants";

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
        occurrence_rate: safeDivide(subset.length, total.length),
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

export function aggregateShots(shots: ShotRowType[]): BasicShootingMetrics {
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
    const cellMap = new Map<string, ShotRowType[]>();
    for (const shot of shots) {
        const key = getCellKey(shot.x, shot.y, cellSize); //Ex: '1_2'
        if (!cellMap.has(key)) {
            cellMap.set(key, []);
        }
        cellMap.get(key)!.push(shot);
    }
    return cellMap;
}

// Data aggregation for team court map. returns a record of cell key to court zone Stats
export function buildTeamCourtMap(
    shots: ShotRowType[],
    cellSize = CELL_SIZE,
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

// Helper function to group shots by player id
function groupByPlayerId(shots: ShotRowType[]): Map<string, ShotRowType[]> {
    const playerMap = new Map<string, ShotRowType[]>();
    for (const shot of shots) {
        if (!playerMap.has(shot.shooter_id)) playerMap.set(shot.shooter_id, []);
        playerMap.get(shot.shooter_id)!.push(shot);
    }
    return playerMap;
}

// Data aggregation for players. returns a record of player id to player type
export function buildPlayerStats(
    shots: ShotRowType[],
): Record<string, PlayerShootingMetrics> {
    const playerEntries = [...groupByPlayerId(shots).entries()];
    const playerStats = playerEntries.map(([id, playerShots]) => {
        const player: PlayerShootingMetrics = {
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
    cellSize = CELL_SIZE,
): Record<string, Record<string, CourtZone>> {
    // playerEntries is an array of [player id, shots[]] pairs ex: [['123', [shot1, shot2]], ['456', [shot3]]]
    const playerEntries = [...groupByPlayerId(shots).entries()];
    const playerCourtMaps = playerEntries.map(([id, playerShots]) => {
        const courtMap = buildTeamCourtMap(playerShots, cellSize);
        return [id, courtMap] as const; // as const ensures [string, Record<string, CourtZone>]
    });
    // playerCourtMaps is [[player id, court map], ...], converts to { player id: court map, ... }
    return Object.fromEntries(playerCourtMaps);
}
