import { useMemo, useState } from "react";
import { useDashboardContext } from "../context/dashboardContext";
import { CourtGridCell } from "./UI/CourtGridCell";
import type { CourtZone } from "../types/teamType";
import courtImage from "../assets/basketballCourtBlank.JPG";
import {
    COLS,
    ROWS,
    CELL_X_START,
    CELL_Y_START,
} from "../utils/courtConstants";
import { StatsBox } from "./StatsBox";

function buildGrid(courtMap: Record<string, CourtZone>) {
    const maxShots = Object.values(courtMap).reduce(
        (max, z) => Math.max(max, z.total_shots),
        0,
    );
    return { maxShots };
}

type ViewMode = "fgpercentage" | "plusminus";

export function CourtBox() {
    const {
        teamStats,
        teamCourtMap,
        selectedPlayerCourtMap,
        selectedPlayerId,
        selectedPlayerStats,
        selectedCellKey,
        setSelectedCellKey,
    } = useDashboardContext();

    const [viewMode, setViewMode] = useState<ViewMode>("fgpercentage");

    const activeMap = selectedPlayerId ? selectedPlayerCourtMap : teamCourtMap;
    const title = selectedPlayerId
        ? `${selectedPlayerStats?.player_name ?? "Player"} — Shot Chart`
        : "Team Shot Chart";

    const { maxShots } = useMemo(
        () => (activeMap ? buildGrid(activeMap) : { maxShots: 1 }),
        [activeMap],
    );

    if (!activeMap) return null;

    // +/- only makes sense when comparing a player against the team — fall back to FG% in team view
    const effectiveMode: ViewMode = selectedPlayerId
        ? viewMode
        : "fgpercentage";

    // Classic nested for loop to build grid: rows = Y axis, cols = X axis. left is negative x
    const rows: Array<
        Array<{ zone: CourtZone | undefined; baseline: number; key: string }>
    > = [];
    for (let row = 0; row < ROWS; row++) {
        const cellY = CELL_Y_START + row;
        const cols: Array<{
            zone: CourtZone | undefined;
            baseline: number;
            key: string;
        }> = [];
        for (let col = 0; col < COLS; col++) {
            const cellX = CELL_X_START + col;
            const key = `${cellX}_${cellY}`;
            const zone = activeMap[key];
            // +/- baseline: player view compares to team's zone FG%, team view compares to overall team FG%
            const baseline = selectedPlayerId
                ? (teamCourtMap?.[key]?.overall_shooting_average ??
                  teamStats?.overall_shooting_average ??
                  0)
                : (teamStats?.overall_shooting_average ?? 0);
            cols.push({ zone, baseline, key });
        }
        rows.push(cols);
    }

    return (
        <div className="flex flex-row gap-4">
            <div className="relative flex shrink-0 flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-4 ">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    {selectedCellKey && (
                        <button
                            onClick={() => setSelectedCellKey(null)}
                            className="text-xs bg-gray-200 px-2 py-1 rounded-md text-gray-400 hover:text-gray-800 dark:bg-gray-900 dark:hover:text-gray-300"
                        >
                            Clear ✕
                        </button>
                    )}
                    <div className="view-mode-buttons flex overflow-hidden rounded border border-gray-200 text-xs dark:border-gray-700">
                        <button
                            onClick={() => setViewMode("fgpercentage")}
                            className={`px-3 py-1 transition-colors ${
                                effectiveMode === "fgpercentage"
                                    ? "bg-violet-600 text-white"
                                    : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                            }`}
                        >
                            FG%
                        </button>
                        {selectedPlayerId && (
                            <button
                                onClick={() => setViewMode("plusminus")}
                                className={`border-l border-gray-200 px-3 py-1 transition-colors dark:border-gray-700 ${
                                    effectiveMode === "plusminus"
                                        ? "bg-violet-600 text-white"
                                        : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                                }`}
                            >
                                +/-
                            </button>
                        )}
                    </div>
                </div>

                {/* Court grid region */}
                <div
                    className="relative w-full rounded-lg"
                    style={{ width: `${COLS * 40}px` }}
                >
                    <img
                        src={courtImage}
                        className="absolute inset-0 z-0 top-0 left-0 h-full w-full object-cover"
                    />
                    <div
                        className="relative"
                        style={{ paddingTop: `${(ROWS / COLS) * 100}%` }}
                    >
                        <div
                            className="absolute inset-0 grid gap-px"
                            style={{
                                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                                gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                            }}
                        >
                            {rows.map((row) =>
                                row.map(({ zone, baseline, key }) => (
                                    <CourtGridCell
                                        key={key}
                                        zone={zone}
                                        maxShots={maxShots}
                                        mode={effectiveMode}
                                        baseline={baseline}
                                        isSelected={selectedCellKey === key}
                                        onClick={() =>
                                            setSelectedCellKey(
                                                selectedCellKey === key
                                                    ? null
                                                    : key,
                                            )
                                        }
                                    />
                                )),
                            )}
                        </div>
                    </div>
                </div>

                {/* Legend region below the court grid */}
                <div className="flex items-center gap-8 text-xs text-gray-500 dark:text-gray-400">
                    {effectiveMode === "fgpercentage" ? (
                        <div className="flex items-center gap-2">
                            <span>Low</span>
                            <div
                                className="h-3 w-24 rounded"
                                style={{
                                    background:
                                        "linear-gradient(to right, hsl(285,20%,75%), hsl(285,60%,45%), hsl(285,100%,35%))",
                                }}
                            />
                            <span>High FG%</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span>Below</span>
                            <div
                                className="h-3 w-24 rounded"
                                style={{
                                    background:
                                        "linear-gradient(to right, hsl(220,80%,35%), hsl(0,0%,80%), hsl(0,80%,35%))",
                                }}
                            />
                            <span>Above +/-</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span>Volume</span>
                        <div className="flex gap-1">
                            <div className="h-3 w-3 rounded-sm bg-gray-400 opacity-30" />
                            <div className="h-3 w-3 rounded-sm bg-gray-400 opacity-65" />
                            <div className="h-3 w-3 rounded-sm bg-gray-400 opacity-100" />
                        </div>
                        <span>High</span>
                    </div>
                </div>
            </div>

            <div className="flex ">
                <StatsBox boxType="playerLocation" />
            </div>
        </div>
    );
}
