import type {
    ComplexShotType,
    ContestLevel,
    ShotRates,
    ShotType,
} from "./shotsTypes";

export type TeamType = {
    // Overall breakdown for at a glance analytics and player comparison
    total_shots: number;
    overall_shooting_average: number;
    overall_assist_rate: number;
    overall_fouled_rate: number;
    overall_contested_rate: number;
    overall_blocked_rate: number;
    // Shot Rates for different shot scenarios
    two_point_rates: ShotRates;
    three_point_rates: ShotRates;
    paint_rates: ShotRates;
    catch_and_shoot_rates: ShotRates;
    late_shot_clock_rates: ShotRates;
    late_game_clock_rates: ShotRates;
    contest_level_rates: Record<ContestLevel, ShotRates>;
    shot_type_rates: Record<ShotType, ShotRates>;
    complex_shot_type_rates: Record<ComplexShotType, ShotRates>;
    dribbles_before_rates: Record<number, ShotRates>;
};

export type CourtZone = TeamType & {
    cell_x: number;
    cell_y: number;
};
