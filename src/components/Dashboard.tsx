import { DashboardProvider } from "../context/DashboardProvider";
import { useDashboardContext } from "../context/dashboardContext";
import { Error } from "./UI/Error";
import { PlayerSelectBox } from "./PlayerSelect/PlayerSelectBox";
import { StatsBox } from "./Stats/StatsBox";
import { CourtBox } from "./Court/CourtBox";

function DashboardContent() {
    const { shotsDataLoading, shotsDataError, selectedPlayerId } =
        useDashboardContext();

    return (
        <div className="flex h-full gap-4 p-4">
            {shotsDataLoading && (
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                    <p className="p-4 text-gray-500 text-2xl text-center">
                        Dashboard Loading...
                    </p>
                </div>
            )}
            {shotsDataError && <Error error={shotsDataError} />}
            {!shotsDataLoading && !shotsDataError && (
                <>
                    {/* Left: sidebar stays fixed while right side scrolls */}
                    <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto">
                        <PlayerSelectBox />
                    </aside>

                    {/* Right: Main stats above court and Detailed Stats */}
                    <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
                        {selectedPlayerId ? (
                            <StatsBox boxType="player" />
                        ) : (
                            <StatsBox boxType="team" />
                        )}

                        <div className="flex flex-row gap-2 width-full">
                            <CourtBox />
                            <StatsBox boxType="zoneDetails" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export function Dashboard() {
    return (
        <DashboardProvider>
            <DashboardContent />
        </DashboardProvider>
    );
}
