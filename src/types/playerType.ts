import type {
    ComplexShotType,
    ContestLevel,
    ShotRates,
    ShotType,
} from "./shotsTypes";

// consider extending the TeamType since there are a lot of similar fields
export type PlayerType = {
    total_shots: number;
    player_id: string;
    player_name: string;
    // Overall breakdown for at a glance analytics and team comparison
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
