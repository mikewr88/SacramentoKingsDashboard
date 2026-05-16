// ─── Court dimensions ─────────────────────────────────────────────────────────
// Origin at midcourt (0,0). Offense attacks LEFT basket; most shot x values negative.
// X axis: -47 (left baseline) to +47 (right baseline)
// Y axis: -25 (top sideline, -y = up) to +25 (bottom sideline, +y = down)

export const HALF_COURT = 47;

// Backboard is 4ft from baseline; hoop extends 1.25ft in front of backboard
export const BASELINE_TO_BACKBOARD = 4;
export const BACKBOARD_TO_HOOP = 1.25;
export const BASKET_X = -(
    HALF_COURT -
    BASELINE_TO_BACKBOARD -
    BACKBOARD_TO_HOOP
); // -41.75

// NBA 3pt arc: 23.75ft from hoop center; corner straight segments at |y| >= 22ft
export const THREE_POINT_ARC_DISTANCE = 23.75;
export const THREE_POINT_CORNER_Y = 22;

// Paint: 16ft wide (±8ft in y); 19ft deep from baseline (15ft from backboard + 4ft backboard offset)
export const PAINT_HALF_WIDTH = 8;
export const PAINT_LENGTH = BASELINE_TO_BACKBOARD + 15; // 19ft from baseline to free throw line
export const LEFT_BASELINE = -HALF_COURT; // -47

export const LATE_SHOT_CLOCK_THRESHOLD = 5; // seconds remaining on shot clock
export const LATE_GAME_CLOCK_THRESHOLD = 120; // seconds remaining in period

// Court Grid Constants

export const CELL_SIZE = 5; // ~5 feet per cell

const X_MIN = -HALF_COURT;
const X_MAX = 0;
const Y_MIN = -25;
const Y_MAX = 25;

export const COLS = Math.ceil((X_MAX - X_MIN) / CELL_SIZE); // 10
export const ROWS = Math.ceil((Y_MAX - Y_MIN) / CELL_SIZE); // 10

export const CELL_X_START = Math.floor(X_MIN / CELL_SIZE); // -10
export const CELL_Y_START = Math.floor(Y_MIN / CELL_SIZE); // -5
