import { describe, it, expect } from "vitest";
import {
    aggregateShots,
    buildTeamCourtMap,
    buildPlayerStats,
    buildPlayerCourtMaps,
} from "../shotsAnalysis";
import { makeShot } from "./testFixtures";


// ─── aggregateShots ───────────────────────────────────────────────────────────

describe("aggregateShots", () => {
    it("counts total shots", () => {
        const shots = [makeShot(), makeShot(), makeShot()];
        expect(aggregateShots(shots).total_shots).toBe(3);
    });

    it("returns zero stats for an empty array", () => {
        const result = aggregateShots([]);
        expect(result.total_shots).toBe(0);
        expect(result.overall_shooting_average).toBe(0);
    });

    describe("success rate", () => {
        it("calculates basic field goal percentage", () => {
            const shots = [
                makeShot({ outcome: true }),
                makeShot({ outcome: true }),
                makeShot({ outcome: false }),
            ];
            expect(aggregateShots(shots).overall_shooting_average).toBeCloseTo(2 / 3);
        });

        it("excludes fouled misses from success rate", () => {
            // 2 makes, 1 clean miss, 1 fouled miss — fouled miss excluded from denominator
            const shots = [
                makeShot({ outcome: true }),
                makeShot({ outcome: true }),
                makeShot({ outcome: false, fouled: false }),
                makeShot({ outcome: false, fouled: true }),
            ];
            // 2 makes / 3 clean shots (fouled miss excluded) = 0.667
            expect(aggregateShots(shots).overall_shooting_average).toBeCloseTo(2 / 3);
        });

        it("counts a fouled make normally", () => {
            // fouled AND outcome=true is a made shot, not excluded
            const shots = [
                makeShot({ outcome: true, fouled: true }),
                makeShot({ outcome: false }),
            ];
            expect(aggregateShots(shots).overall_shooting_average).toBeCloseTo(0.5);
        });
    });

    describe("overall rates", () => {
        it("calculates assist rate", () => {
            const shots = [
                makeShot({ assisted: true }),
                makeShot({ assisted: true }),
                makeShot({ assisted: false }),
                makeShot({ assisted: false }),
            ];
            expect(aggregateShots(shots).overall_assist_rate).toBeCloseTo(0.5);
        });

        it("calculates contested rate", () => {
            const shots = [
                makeShot({ contested: true }),
                makeShot({ contested: false }),
                makeShot({ contested: false }),
            ];
            expect(aggregateShots(shots).overall_contested_rate).toBeCloseTo(1 / 3);
        });
    });

    describe("shot zone classification", () => {
        it("classifies a mid-range shot as 2PT", () => {
            // x=-35, y=0: distance from basket(-41.75) = 6.75ft — well inside arc
            const shots = [makeShot({ x: -35, y: 0, outcome: true })];
            const result = aggregateShots(shots);
            expect(result.two_point_rates.occurrence_rate).toBe(1);
            expect(result.three_point_rates.occurrence_rate).toBe(0);
        });

        it("classifies a shot beyond the arc as 3PT", () => {
            // x=-17, y=0: distance from basket = 24.75ft > 23.75ft
            const shots = [makeShot({ x: -17, y: 0, outcome: true })];
            const result = aggregateShots(shots);
            expect(result.three_point_rates.occurrence_rate).toBe(1);
            expect(result.two_point_rates.occurrence_rate).toBe(0);
        });

        it("classifies a corner 3 by y-coordinate", () => {
            // |y| >= 22 is always a corner 3 regardless of distance
            const shots = [makeShot({ x: -45, y: 23, outcome: true })];
            const result = aggregateShots(shots);
            expect(result.three_point_rates.occurrence_rate).toBe(1);
        });

        it("classifies a paint shot", () => {
            // x=-44, y=5: inside paint boundaries
            const shots = [makeShot({ x: -44, y: 5, outcome: true })];
            const result = aggregateShots(shots);
            expect(result.paint_rates.occurrence_rate).toBe(1);
        });

        it("does not classify a shot outside the paint as paint", () => {
            // x=-25, y=3: x is beyond the paint's far edge (-28)
            const shots = [makeShot({ x: -25, y: 3, outcome: true })];
            const result = aggregateShots(shots);
            expect(result.paint_rates.occurrence_rate).toBe(0);
        });
    });

    describe("situational rates", () => {
        it("identifies late shot clock shots", () => {
            const shots = [
                makeShot({ shot_clock: 4 }),
                makeShot({ shot_clock: 5 }),
                makeShot({ shot_clock: 10 }),
            ];
            // shot_clock <= 5 → 2 of 3
            expect(aggregateShots(shots).late_shot_clock_rates.occurrence_rate).toBeCloseTo(2 / 3);
        });

        it("identifies late game clock shots", () => {
            const shots = [
                makeShot({ start_game_clock: 60 }),
                makeShot({ start_game_clock: 120 }),
                makeShot({ start_game_clock: 300 }),
            ];
            // start_game_clock <= 120 → 2 of 3
            expect(aggregateShots(shots).late_game_clock_rates.occurrence_rate).toBeCloseTo(2 / 3);
        });

        it("identifies catch and shoot attempts", () => {
            const shots = [
                makeShot({ catch_and_shoot: true }),
                makeShot({ catch_and_shoot: false }),
            ];
            expect(aggregateShots(shots).catch_and_shoot_rates.occurrence_rate).toBeCloseTo(0.5);
        });
    });

    describe("dribble breakdown", () => {
        it("builds a rate entry for each unique dribble count", () => {
            const shots = [
                makeShot({ dribbles_before: 0 }),
                makeShot({ dribbles_before: 0 }),
                makeShot({ dribbles_before: 3 }),
            ];
            const rates = aggregateShots(shots).dribbles_before_rates;
            expect(Object.keys(rates).map(Number).sort()).toEqual([0, 3]);
            expect(rates[0].occurrence_rate).toBeCloseTo(2 / 3);
            expect(rates[3].occurrence_rate).toBeCloseTo(1 / 3);
        });
    });
});

// ─── buildTeamCourtMap ────────────────────────────────────────────────────────

describe("buildTeamCourtMap", () => {
    it("groups shots in the same cell into one zone", () => {
        // x=-40 and x=-38 both floor to cellX=-8; y=0 and y=1 both floor to cellY=0
        const shots = [
            makeShot({ x: -40, y: 0 }),
            makeShot({ x: -38, y: 1 }),
        ];
        const map = buildTeamCourtMap(shots);
        expect(Object.keys(map)).toHaveLength(1);
    });

    it("creates separate zones for shots in different cells", () => {
        // x=-40 → cellX=-8; x=-20 → cellX=-4
        const shots = [
            makeShot({ x: -40, y: 0 }),
            makeShot({ x: -20, y: 0 }),
        ];
        const map = buildTeamCourtMap(shots);
        expect(Object.keys(map)).toHaveLength(2);
    });

    it("attaches cell_x and cell_y to each zone", () => {
        const shots = [makeShot({ x: -40, y: 0 })];
        const map = buildTeamCourtMap(shots);
        const zone = Object.values(map)[0];
        expect(zone.cell_x).toBe(-8);
        expect(zone.cell_y).toBe(0);
    });

    it("stores the correct shot count per zone", () => {
        const shots = [
            makeShot({ x: -40, y: 0 }),
            makeShot({ x: -40, y: 0 }),
            makeShot({ x: -40, y: 0 }),
        ];
        const map = buildTeamCourtMap(shots);
        expect(Object.values(map)[0].total_shots).toBe(3);
    });
});

// ─── buildPlayerStats ─────────────────────────────────────────────────────────

describe("buildPlayerStats", () => {
    it("creates one entry per player", () => {
        const shots = [
            makeShot({ shooter_id: "p1", shooter_name: "Alice" }),
            makeShot({ shooter_id: "p2", shooter_name: "Bob" }),
            makeShot({ shooter_id: "p1", shooter_name: "Alice" }),
        ];
        const stats = buildPlayerStats(shots);
        expect(Object.keys(stats)).toHaveLength(2);
    });

    it("assigns player_id and player_name", () => {
        const shots = [makeShot({ shooter_id: "p1", shooter_name: "Alice" })];
        const stats = buildPlayerStats(shots);
        expect(stats["p1"].player_id).toBe("p1");
        expect(stats["p1"].player_name).toBe("Alice");
    });

    it("counts only that player's shots", () => {
        const shots = [
            makeShot({ shooter_id: "p1" }),
            makeShot({ shooter_id: "p1" }),
            makeShot({ shooter_id: "p2" }),
        ];
        const stats = buildPlayerStats(shots);
        expect(stats["p1"].total_shots).toBe(2);
        expect(stats["p2"].total_shots).toBe(1);
    });

    it("returns an empty object for no shots", () => {
        expect(buildPlayerStats([])).toEqual({});
    });
});

// ─── buildPlayerCourtMaps ─────────────────────────────────────────────────────

describe("buildPlayerCourtMaps", () => {
    it("creates a court map for each player", () => {
        const shots = [
            makeShot({ shooter_id: "p1", x: -40, y: 0 }),
            makeShot({ shooter_id: "p2", x: -40, y: 0 }),
        ];
        const maps = buildPlayerCourtMaps(shots);
        expect(Object.keys(maps)).toHaveLength(2);
    });

    it("each player map only contains that player's shots", () => {
        const shots = [
            makeShot({ shooter_id: "p1", x: -40, y: 0 }),
            makeShot({ shooter_id: "p1", x: -40, y: 0 }),
            makeShot({ shooter_id: "p2", x: -40, y: 0 }),
        ];
        const maps = buildPlayerCourtMaps(shots);
        const p1Zone = Object.values(maps["p1"])[0];
        const p2Zone = Object.values(maps["p2"])[0];
        expect(p1Zone.total_shots).toBe(2);
        expect(p2Zone.total_shots).toBe(1);
    });

    it("creates separate zones for a player with shots in different cells", () => {
        const shots = [
            makeShot({ shooter_id: "p1", x: -40, y: 0 }),
            makeShot({ shooter_id: "p1", x: -20, y: 0 }),
        ];
        const maps = buildPlayerCourtMaps(shots);
        expect(Object.keys(maps["p1"])).toHaveLength(2);
    });
});
