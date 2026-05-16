import { useMemo, useState } from "react";
import { useDashboardContext } from "../../context/dashboardContext";
import { CourtGridCell } from "./CourtGridCell";
import type {
    CourtZone,
    BasicShootingMetrics,
} from "../../types/shootingTypes";
import courtImage from "../../assets/basketballCourtBlank.JPG";
import {
    COLS,
    ROWS,
    CELL_X_START,
    CELL_Y_START,
} from "../../utils/constants/courtConstants";

type GridCell = {
    zone: CourtZone | undefined;
    baseline: number;
    key: string;
};

type GridRow = GridCell[];

// Helpers for the Grid Generation

// Get Max shots used for relative intensity of the grid cells
function getMaxShots(courtMap: Record<string, CourtZone>): {
    maxShots: number;
} {
    const maxShots = Object.values(courtMap).reduce(
        (max, z) => Math.max(max, z.total_shots),
        0,
    );
    return { maxShots };
}

// Generate the grid rows and cells
function buildCourtGridRows(
    activeMap: Record<string, CourtZone>,
    teamCourtMap: Record<string, CourtZone> | null,
    selectedPlayerId: string | null,
    teamStats: BasicShootingMetrics | null,
): GridRow[] {
    const teamOverall = teamStats?.overall_shooting_average ?? 0;
    const rows: GridRow[] = [];
    for (let row = 0; row < ROWS; row++) {
        const cellY = CELL_Y_START + row;
        const cols: GridCell[] = [];
        for (let col = 0; col < COLS; col++) {
            const cellX = CELL_X_START + col;
            const key = `${cellX}_${cellY}`;
            const zone = activeMap[key];
            //select the correct baseline value to compare against
            const baseline = selectedPlayerId
                ? (teamCourtMap?.[key]?.overall_shooting_average ?? teamOverall)
                : teamOverall;
            cols.push({ zone, baseline, key });
        }
        rows.push(cols);
    }
    return rows;
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

    // maxShots is used to determine the color of the grid cells based on volume
    // it is the highest total_shots value of any zone in the courtMap
    const { maxShots } = useMemo(
        () => (activeMap ? getMaxShots(activeMap) : { maxShots: 1 }),
        [activeMap],
    );

    const rows = useMemo(() => {
        if (!activeMap) return [] as GridRow[];
        return buildCourtGridRows(
            activeMap,
            teamCourtMap,
            selectedPlayerId,
            teamStats,
        );
    }, [activeMap, teamCourtMap, selectedPlayerId, teamStats]);

    if (!activeMap) return null;

    // +/- only makes sense when comparing a player against the team. Fall back to FG% in team view
    const effectiveMode: ViewMode = selectedPlayerId
        ? viewMode
        : "fgpercentage";

    return (
        <div className="flex flex-row gap-4">
            <div className="relative flex shrink-0 flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                {/* court grid title and buttons */}
                <div className="flex items-center gap-4 ">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {title}
                    </h2>

                    <div className="view-mode-buttons flex overflow-hidden rounded border border-gray-200 text-xs dark:border-gray-700">
                        <button
                            onClick={() => setViewMode("fgpercentage")}
                            className={`px-3 py-1 transition-colors ${
                                effectiveMode === "fgpercentage"
                                    ? "bg-[#5a2d81] text-white"
                                    : "bg-white text-gray-600 cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                            }`}
                        >
                            FG%
                        </button>
                        {selectedPlayerId && (
                            <button
                                onClick={() => setViewMode("plusminus")}
                                className={`border-l border-gray-200 px-3 py-1 transition-colors dark:border-gray-700 ${
                                    effectiveMode === "plusminus"
                                        ? "bg-[#5a2d81] text-white"
                                        : "bg-white text-gray-600 cursor-pointer hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                                }`}
                            >
                                +/-
                            </button>
                        )}
                    </div>
                    {selectedCellKey && (
                        <button
                            onClick={() => setSelectedCellKey(null)}
                            className="text-xs bg-gray-200 px-2 py-1 rounded-md text-gray-400 hover:text-gray-800 dark:bg-gray-900 dark:hover:text-gray-300"
                        >
                            Clear ✕
                        </button>
                    )}
                </div>

                {/* Court grid region */}
                <div
                    className="relative w-full shadow-lg shao rounded-lg"
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
                                        onGridCellClick={() =>
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
                                        "linear-gradient(to right, hsl(271,20%,75%), hsl(271,60%,45%), hsl(271,100%,35%))",
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
        </div>
    );
}
