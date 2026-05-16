import { useDashboardContext } from "../../context/dashboardContext";
import { formatNumber } from "../../utils/mathUtils";

export function PlayersList() {
    const {
        playerStats,
        selectedPlayerId,
        setSelectedPlayerId,
        setSelectedCellKey,
    } = useDashboardContext();

    if (!playerStats) return null;

    const players = Object.values(playerStats).sort(
        (a, b) => b.total_shots - a.total_shots,
    );

    return (
        <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 px-3 py-2 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Players
                </h3>
            </div>
            <ul className="flex flex-col overflow-y-auto">
                {players.map((player) => {
                    const isSelected = player.player_id === selectedPlayerId;
                    return (
                        <li key={player.player_id}>
                            <button
                                onClick={() => {
                                    setSelectedPlayerId(
                                        isSelected ? null : player.player_id,
                                    );
                                    setSelectedCellKey(null);
                                }}
                                className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-gray-200 dark:hover:bg-gray-700/50 cursor-pointer ${
                                    isSelected
                                        ? "bg-violet-100 font-medium text-violet-700 dark:bg-violet-900/20 dark:text-violet-300"
                                        : "text-gray-700 dark:text-gray-300"
                                }`}
                            >
                                <span className="truncate">
                                    {player.player_name}
                                </span>
                                <span className="ml-2 shrink-0 text-xs text-gray-400 dark:text-gray-500">
                                    {formatNumber(player.total_shots)} |{" "}
                                    {formatNumber(
                                        player.overall_shooting_average,
                                        true,
                                    )}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
