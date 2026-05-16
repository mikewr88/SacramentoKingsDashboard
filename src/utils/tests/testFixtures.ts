import type { ShotRowType, ContestLevel, ShotType, ComplexShotType } from "../../types/shotsTypes";

export function makeShot(overrides: Partial<ShotRowType> = {}): ShotRowType {
    return {
        shooter_id: "p1",
        shooter_name: "Player One",
        year: 2024,
        month: 1,
        day: 1,
        period: 1,
        start_game_clock: 600,
        end_game_clock: 595,
        shot_clock: 20,
        x: -40,
        y: 0,
        outcome: true,
        passer_x: 0,
        passer_y: 0,
        assisted: false,
        ast_opp: false,
        blocked: false,
        fouled: false,
        shot_type: "jumper" as ShotType,
        complex_shot_type: "pullupJumper" as ComplexShotType,
        contested: false,
        contest_level: "uncontested" as ContestLevel,
        catch_and_shoot: false,
        dribbles_before: 1,
        ...overrides,
    };
}
