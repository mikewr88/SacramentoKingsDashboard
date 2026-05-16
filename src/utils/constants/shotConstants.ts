import type {
    ComplexShotType,
    ContestLevel,
    ShotType,
} from "../../types/shotsTypes";

// Constants to loop through in stats boxes
export const CONTEST_LEVELS: ContestLevel[] = [
    "uncontested",
    "lightly_contested",
    "heavily_contested",
];

export const SHOT_TYPES: ShotType[] = [
    "heave",
    "jumper",
    "post",
    "floater",
    "layup",
];

export const COMPLEX_SHOT_TYPES: ComplexShotType[] = [
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
