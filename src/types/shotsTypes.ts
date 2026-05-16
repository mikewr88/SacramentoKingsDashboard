export type ContestLevel =
    | "uncontested"
    | "lightly_contested"
    | "heavily_contested";

export type ShotType = "heave" | "jumper" | "post" | "floater" | "layup";

export type ComplexShotType =
    | "heave"
    | "catchAndShoot"
    | "catchAndShootRelocating"
    | "catchAndShootOnMoveLeft"
    | "catchAndShootOnMoveRight"
    | "pullupJumper"
    | "stepback"
    | "shakeAndRaise"
    | "overScreen"
    | "drivingFloater"
    | "cutFloater"
    | "postLeft"
    | "postRight"
    | "drivingLayup"
    | "cutLayup"
    | "standstillLayup"
    | "lob"
    | "tip";

export type ShotRates = {
    success_rate: number;
    occurrence_rate: number;
    assisted_rate: number;
    fouled_rate: number;
    blocked_rate: number;
};

export type ShotRowType = {
    shooter_id: string;
    shooter_name: string;
    year: number;
    month: number;
    day: number;
    period: number;
    start_game_clock: number;
    end_game_clock: number;
    shot_clock: number;
    x: number;
    y: number;
    outcome: boolean;
    passer_x: number;
    passer_y: number;
    assisted: boolean;
    ast_opp: boolean;
    blocked: boolean;
    fouled: boolean;
    shot_type: ShotType;
    complex_shot_type: ComplexShotType;
    contested: boolean;
    contest_level: ContestLevel;
    catch_and_shoot: boolean;
    dribbles_before: number;
};
