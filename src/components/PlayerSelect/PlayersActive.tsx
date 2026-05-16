import { useDashboardContext } from "../../context/dashboardContext";
import { formatNumber } from "../../utils/mathUtils";

export function PlayersActive() {
    const { selectedPlayerStats, setSelectedPlayerId, setSelectedCellKey } =
        useDashboardContext();

    if (!selectedPlayerStats) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 p-5 text-center text-xs text-gray-400 dark:border-gray-600 dark:text-gray-500 h-14">
                No player selected
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 dark:border-violet-800 dark:bg-violet-900/20 h-14">
            <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-violet-800 dark:text-violet-200">
                    {selectedPlayerStats.player_name}
                </span>
                <span className="text-xs text-violet-500 dark:text-violet-400">
                    {formatNumber(selectedPlayerStats.total_shots)} shots |{" "}
                    {formatNumber(
                        selectedPlayerStats.overall_shooting_average,
                        true,
                    )}
                </span>
            </div>
            <button
                onClick={() => {
                    setSelectedPlayerId(null);
                    setSelectedCellKey(null);
                }}
                className="ml-2 shrink-0 text-violet-400 transition-colors hover:text-violet-700 dark:text-violet-500 dark:hover:text-violet-300"
                aria-label="Deselect player"
            >
                ✕
            </button>
        </div>
    );
}
